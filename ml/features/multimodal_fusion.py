"""
Stage 7: Multimodal Fusion Engine
Aligns disparate modalities (Chemical SMILES/Fingerprints, Ingredient Compositions,
Sensory Descriptors, and Text Requirements) into a normalized 64-dimensional Joint Latent Embedding Space.
Includes 2D/3D PCA projection for Flavor Space visualization.
"""

from typing import Dict, List, Tuple, Any, Optional
from pathlib import Path
import numpy as np
import joblib
from sklearn.decomposition import PCA

from backend.app.core.constants import AROMA_DESCRIPTORS, FLAVOR_DESCRIPTORS
from backend.app.core.config import MODELS_DIR
from backend.app.models.database import SessionLocal
from backend.app.models.domain import CompoundModel, IngredientModel
from ml.chemistry.smiles_parser import SMILESParser
from ml.features.vectorizers import (
    ChemicalFeatureExtractor, IngredientCompositionVectorizer, SensoryTargetVectorizer
)


class MultimodalFusionEngine:
    """Projects chemical, compositional, and sensory modalities into an aligned 64-dim latent space."""

    def __init__(self, latent_dim: int = 64):
        self.latent_dim = latent_dim
        self.extractor = ChemicalFeatureExtractor()
        self.parser = SMILESParser()
        self.pooler = IngredientCompositionVectorizer(self.extractor)

        self.chem_dim = self.extractor.feature_dimension  # 265
        self.sensory_dim = len(AROMA_DESCRIPTORS) + len(FLAVOR_DESCRIPTORS)  # 22

        # Projection matrices
        self.w_chem: Optional[np.ndarray] = None  # (265, 64)
        self.w_sensory: Optional[np.ndarray] = None  # (22, 64)
        self.pca_2d: Optional[PCA] = None
        self.pca_3d: Optional[PCA] = None
        self.is_calibrated = False

    def calibrate(self):
        """
        Calibrates cross-modal projection heads using Singular Value Decomposition (SVD)
        and joint covariance over all compounds in the database.
        """
        db = SessionLocal()
        compounds = db.query(CompoundModel).all()
        if not compounds:
            db.close()
            raise RuntimeError("Database empty. Seed database before calibrating fusion engine.")

        X_chem_list = []
        X_sens_list = []

        for c in compounds:
            chem_vec = self.extractor.featurize_compound_dict({
                "fingerprint": c.fingerprint,
                "molecular_weight": c.molecular_weight,
                "logp": c.logp,
                "tpsa": c.tpsa,
                "h_bond_donors": c.h_bond_donors,
                "h_bond_acceptors": c.h_bond_acceptors,
                "rotatable_bonds": c.rotatable_bonds,
                "aromatic_rings": c.aromatic_rings,
                "heavy_atom_count": c.heavy_atom_count,
                "volatility_index": c.volatility_index,
            })
            sens_vec = [c.aroma_vector.get(d, 0.0) for d in AROMA_DESCRIPTORS] + \
                       [c.flavor_vector.get(d, 0.0) for d in FLAVOR_DESCRIPTORS]
            X_chem_list.append(chem_vec)
            X_sens_list.append(sens_vec)

        db.close()

        X_chem = np.array(X_chem_list, dtype=np.float32)  # (N, 265)
        X_sens = np.array(X_sens_list, dtype=np.float32)  # (N, 22)

        # Compute cross-covariance SVD for cross-modal alignment
        # SVD on centered matrices:
        chem_mean = np.mean(X_chem, axis=0)
        sens_mean = np.mean(X_sens, axis=0)
        self.chem_mean = chem_mean
        self.sens_mean = sens_mean

        C_chem = X_chem - chem_mean
        C_sens = X_sens - sens_mean

        # PCA projection of chemical space to latent_dim
        pca_chem = PCA(n_components=min(self.latent_dim, C_chem.shape[0] - 1), random_state=42)
        Z_chem = pca_chem.fit_transform(C_chem)

        # Pad to latent_dim if needed
        if Z_chem.shape[1] < self.latent_dim:
            pad = np.zeros((Z_chem.shape[0], self.latent_dim - Z_chem.shape[1]), dtype=np.float32)
            Z_chem = np.hstack([Z_chem, pad])

        # Learn least-squares alignment: W_sens maps centered sensory vectors to Z_chem
        # W_sens = (C_sens^T C_sens + lambda I)^-1 C_sens^T Z_chem
        ridge_lambda = 0.1
        reg_i = np.eye(self.sensory_dim) * ridge_lambda
        self.w_sensory = np.linalg.solve(C_sens.T @ C_sens + reg_i, C_sens.T @ Z_chem)

        # Chemical projection matrix
        self.w_chem = pca_chem.components_.T
        if self.w_chem.shape[1] < self.latent_dim:
            pad_w = np.zeros((self.chem_dim, self.latent_dim - self.w_chem.shape[1]), dtype=np.float32)
            self.w_chem = np.hstack([self.w_chem, pad_w])

        self.is_calibrated = True

        # Fit 2D and 3D PCA on latent embeddings for flavor space maps
        all_embeddings = []
        for i in range(len(compounds)):
            z_c = self.project_chemical(X_chem[i])
            all_embeddings.append(z_c)

        all_embeddings = np.array(all_embeddings, dtype=np.float32)
        self.pca_2d = PCA(n_components=2, random_state=42).fit(all_embeddings)
        self.pca_3d = PCA(n_components=3, random_state=42).fit(all_embeddings)

    def project_chemical(self, x_chem: np.ndarray) -> np.ndarray:
        """Projects a 265-dim chemical feature vector into the 64-dim latent space."""
        if not self.is_calibrated:
            self.calibrate()
        centered = x_chem - self.chem_mean
        z = centered @ self.w_chem
        norm = np.linalg.norm(z)
        return (z / norm) if norm > 0 else z

    def project_sensory(self, x_sens: np.ndarray) -> np.ndarray:
        """Projects a 22-dim sensory profile into the 64-dim latent space."""
        if not self.is_calibrated:
            self.calibrate()
        centered = x_sens - self.sens_mean
        z = centered @ self.w_sensory
        norm = np.linalg.norm(z)
        return (z / norm) if norm > 0 else z

    def project_text_query(self, prompt: str) -> np.ndarray:
        """Parses natural language sensory requirements and projects into the latent space."""
        aroma_target, flavor_target = SensoryTargetVectorizer.parse_text_query(prompt)
        combined_sensory = [aroma_target.get(d, 0.0) for d in AROMA_DESCRIPTORS] + \
                           [flavor_target.get(d, 0.0) for d in FLAVOR_DESCRIPTORS]
        return self.project_sensory(np.array(combined_sensory, dtype=np.float32))

    def project_to_2d_3d(self, z: np.ndarray) -> Tuple[List[float], List[float]]:
        """Maps 64-dim embedding to 2D and 3D coordinates for interactive scatter plots."""
        if not self.is_calibrated:
            self.calibrate()
        z_2d = self.pca_2d.transform(z.reshape(1, -1))[0]
        z_3d = self.pca_3d.transform(z.reshape(1, -1))[0]
        return [round(float(v), 3) for v in z_2d], [round(float(v), 3) for v in z_3d]

    def save(self, filepath: Optional[Path] = None):
        path = filepath or (MODELS_DIR / "fusion_engine.joblib")
        joblib.dump(self, path)

    @classmethod
    def load(cls, filepath: Optional[Path] = None) -> "MultimodalFusionEngine":
        path = filepath or (MODELS_DIR / "fusion_engine.joblib")
        if not path.exists():
            engine = cls()
            engine.calibrate()
            engine.save(path)
            return engine
        return joblib.load(path)
