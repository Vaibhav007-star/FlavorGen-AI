"""
Stage 8: Similarity Engine
Embedding-based search engine supporting:
1. Sensory Similarity (cosine distance in 22-dim perception space)
2. Chemical Similarity (Tanimoto over ECFP4 fingerprints + Physicochemical cosine)
3. Multimodal Similarity (cosine in 64-dim joint latent space)
4. Contrastive Bio-isosteric Analog Search ("Sensory similar but chemically dissimilar")
"""

from typing import Dict, List, Tuple, Any, Optional
import numpy as np

from backend.app.core.constants import AROMA_DESCRIPTORS, FLAVOR_DESCRIPTORS
from backend.app.models.database import SessionLocal
from backend.app.models.domain import CompoundModel, IngredientModel
from ml.chemistry.fingerprints import MolecularFingerprinter
from ml.features.vectorizers import ChemicalFeatureExtractor
from ml.features.multimodal_fusion import MultimodalFusionEngine
from ml.models.aroma_model import AromaPredictionEngine
from ml.models.flavor_model import FlavorPredictionEngine


class SensorySimilarityEngine:
    """Multi-mode similarity search and analog discovery engine."""

    def __init__(self):
        self.extractor = ChemicalFeatureExtractor()
        self.fingerprinter = MolecularFingerprinter()
        self.fusion = MultimodalFusionEngine.load()
        self._load_and_index_knowledge_base()

    def _load_and_index_knowledge_base(self):
        """Precomputes and caches indexed matrices for fast in-memory similarity retrieval."""
        db = SessionLocal()
        compounds = db.query(CompoundModel).all()
        ingredients = db.query(IngredientModel).all()

        self.compound_index = []
        self.ingredient_index = []

        # Index compounds
        for c in compounds:
            fp = np.array(c.fingerprint, dtype=np.float32)
            c_dict = {
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
            }
            chem_vec = self.extractor.featurize_compound_dict(c_dict)
            sens_vec = np.array(
                [c.aroma_vector.get(d, 0.0) for d in AROMA_DESCRIPTORS] +
                [c.flavor_vector.get(d, 0.0) for d in FLAVOR_DESCRIPTORS],
                dtype=np.float32
            )
            z_latent = self.fusion.project_chemical(chem_vec)
            coord_2d, coord_3d = self.fusion.project_to_2d_3d(z_latent)

            self.compound_index.append({
                "id": c.id,
                "name": c.name,
                "type": "compound",
                "smiles": c.smiles,
                "chemical_class": c.chemical_class,
                "fp": fp,
                "chem_vec": chem_vec,
                "sens_vec": sens_vec,
                "z_latent": z_latent,
                "coord_2d": coord_2d,
                "coord_3d": coord_3d,
                "aroma_vector": c.aroma_vector,
                "flavor_vector": c.flavor_vector
            })

        # Index ingredients
        for ing in ingredients:
            sens_vec = np.array(
                [ing.aroma_profile.get(d, 0.0) for d in AROMA_DESCRIPTORS] +
                [ing.flavor_profile.get(d, 0.0) for d in FLAVOR_DESCRIPTORS],
                dtype=np.float32
            )
            z_latent = self.fusion.project_sensory(sens_vec)
            coord_2d, coord_3d = self.fusion.project_to_2d_3d(z_latent)

            # Compositional chemical vector approximation
            constituents = [
                {"compound": assoc.compound, "concentration_mg_kg": assoc.concentration_mg_kg}
                for assoc in ing.compounds
            ]
            chem_vec = self.fusion.pooler.pool_constituents(constituents)
            fp_pooled = chem_vec[:256]

            self.ingredient_index.append({
                "id": ing.id,
                "name": ing.name,
                "type": "ingredient",
                "category": ing.category,
                "fp": fp_pooled,
                "chem_vec": chem_vec,
                "sens_vec": sens_vec,
                "z_latent": z_latent,
                "coord_2d": coord_2d,
                "coord_3d": coord_3d,
                "aroma_vector": ing.aroma_profile,
                "flavor_vector": ing.flavor_profile
            })

        db.close()

    def search_similar_ingredients(
        self,
        query_ingredient_name: str,
        top_k: int = 5,
        mode: str = "sensory"  # "sensory", "chemical", "multimodal", "contrastive"
    ) -> List[Dict[str, Any]]:
        """Finds candidate ingredients matching query in specified similarity mode."""
        target = next((item for item in self.ingredient_index if item["name"].lower() == query_ingredient_name.lower()), None)
        if not target:
            # Try partial matching
            target = next((item for item in self.ingredient_index if query_ingredient_name.lower() in item["name"].lower()), None)
        if not target:
            raise ValueError(f"Ingredient '{query_ingredient_name}' not found in knowledge base.")

        results = []
        for cand in self.ingredient_index:
            if cand["name"] == target["name"]:
                continue

            sens_sim = self.fingerprinter.cosine_similarity(target["sens_vec"], cand["sens_vec"])
            chem_sim = self.fingerprinter.tanimoto_similarity(target["fp"], cand["fp"])
            multi_sim = self.fingerprinter.cosine_similarity(target["z_latent"], cand["z_latent"])

            if mode == "sensory":
                score = sens_sim
                expl = f"Shares high sensory profile overlap (cos={sens_sim:.2f}) with {target['name']}."
            elif mode == "chemical":
                score = chem_sim
                expl = f"High structural/chemical similarity (Tanimoto={chem_sim:.2f}) to constituent volatiles."
            elif mode == "multimodal":
                score = multi_sim
                expl = f"Strong joint multimodal alignment (cos={multi_sim:.2f}) in sensory-chemical latent space."
            elif mode == "contrastive":
                # Bio-isosteric Analog Search: High sensory similarity, LOW chemical similarity
                score = sens_sim * (1.0 - min(0.9, chem_sim))
                expl = (
                    f"Bio-isosteric Analog: Elicits comparable sensory perception (sensory={sens_sim:.2f}), "
                    f"despite substantial chemical/structural divergence (chemical={chem_sim:.2f}). "
                    f"Ideal for clean-label or allergen reformulation."
                )
            else:
                score = sens_sim
                expl = "Sensory similarity match."

            results.append({
                "name": cand["name"],
                "category": cand["category"],
                "score": round(float(score), 3),
                "sensory_similarity": round(float(sens_sim), 3),
                "chemical_similarity": round(float(chem_sim), 3),
                "multimodal_similarity": round(float(multi_sim), 3),
                "aroma_profile": cand["aroma_vector"],
                "flavor_profile": cand["flavor_vector"],
                "coordinates_2d": cand["coord_2d"],
                "explanation": expl
            })

        results.sort(key=lambda x: x["score"], reverse=True)
        return results[:top_k]

    def search_similar_compounds(
        self,
        query_smiles: str,
        top_k: int = 5,
        mode: str = "sensory"
    ) -> List[Dict[str, Any]]:
        """Finds candidate aroma/flavor compounds matching query SMILES."""
        q_fp = self.fingerprinter.generate_fingerprint(query_smiles)
        q_chem = self.extractor.featurize_smiles(query_smiles)
        q_latent = self.fusion.project_chemical(q_chem)

        # Inferred sensory profile for query
        aroma_eng = AromaPredictionEngine.load()
        flavor_eng = FlavorPredictionEngine.load()
        q_aroma, _, _ = aroma_eng.predict(q_chem)
        q_flavor, _, _ = flavor_eng.predict(q_chem)
        q_sens = np.concatenate([q_aroma[0], q_flavor[0]])

        results = []
        for cand in self.compound_index:
            chem_sim = self.fingerprinter.tanimoto_similarity(q_fp, cand["fp"])
            sens_sim = self.fingerprinter.cosine_similarity(q_sens, cand["sens_vec"])
            multi_sim = self.fingerprinter.cosine_similarity(q_latent, cand["z_latent"])

            if mode == "sensory":
                score = sens_sim
                expl = f"Perceptual sensory match (cos={sens_sim:.2f})."
            elif mode == "chemical":
                score = chem_sim
                expl = f"Structural chemical analog (Tanimoto={chem_sim:.2f})."
            elif mode == "contrastive":
                score = sens_sim * (1.0 - min(0.9, chem_sim))
                expl = (
                    f"Scaffold-Hopping Analog: Delivers similar odor/taste (sensory={sens_sim:.2f}) "
                    f"with distinct molecular topology (chemical={chem_sim:.2f})."
                )
            else:
                score = multi_sim
                expl = f"Multimodal aligned compound (cos={multi_sim:.2f})."

            results.append({
                "name": cand["name"],
                "chemical_class": cand["chemical_class"],
                "smiles": cand["smiles"],
                "score": round(float(score), 3),
                "sensory_similarity": round(float(sens_sim), 3),
                "chemical_similarity": round(float(chem_sim), 3),
                "aroma_vector": cand["aroma_vector"],
                "flavor_vector": cand["flavor_vector"],
                "explanation": expl
            })

        results.sort(key=lambda x: x["score"], reverse=True)
        return results[:top_k]

    def get_full_flavor_space(self) -> Dict[str, Any]:
        """Returns 2D and 3D projected coordinates for all ingredients and compounds."""
        nodes = []
        for item in self.ingredient_index:
            nodes.append({
                "id": f"ing_{item['id']}",
                "name": item["name"],
                "type": "ingredient",
                "category": item["category"],
                "coord_2d": item["coord_2d"],
                "coord_3d": item["coord_3d"],
                "aroma_profile": item["aroma_vector"],
                "flavor_profile": item["flavor_vector"]
            })
        for item in self.compound_index:
            nodes.append({
                "id": f"comp_{item['id']}",
                "name": item["name"],
                "type": "compound",
                "category": item["chemical_class"] or "Volatile Molecule",
                "coord_2d": item["coord_2d"],
                "coord_3d": item["coord_3d"],
                "aroma_vector": item["aroma_vector"],
                "flavor_vector": item["flavor_vector"]
            })
        return {
            "total_entities": len(nodes),
            "nodes": nodes,
            "latent_dimensions": 64,
            "methodology": "Multimodal SVD alignment with 2D/3D PCA dimensionality reduction."
        }

