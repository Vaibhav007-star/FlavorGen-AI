"""
Aroma Prediction Intelligence Engine:
Multi-target ensemble regressor mapping chemical space to the 12-dimensional aroma perception space.
Includes epistemic uncertainty quantification and feature attribution.
"""

from typing import Dict, List, Tuple, Any, Optional
from pathlib import Path
import numpy as np
import joblib
from sklearn.ensemble import RandomForestRegressor, GradientBoostingRegressor
from sklearn.multioutput import MultiOutputRegressor

from backend.app.core.constants import AROMA_DESCRIPTORS
from backend.app.core.config import MODELS_DIR


class AromaPredictionEngine:
    """Predicts normalized 12-dimensional aroma profiles from chemical features with uncertainty."""

    def __init__(self, n_estimators: int = 120, random_state: int = 42):
        self.n_estimators = n_estimators
        self.random_state = random_state
        self.descriptors = AROMA_DESCRIPTORS
        
        # Primary multi-output ensemble
        self.model = RandomForestRegressor(
            n_estimators=self.n_estimators,
            max_depth=10,
            min_samples_split=2,
            random_state=self.random_state,
            n_jobs=-1
        )
        self.is_fitted = False
        self.feature_importances_dict: Dict[str, np.ndarray] = {}

    def fit(self, X: np.ndarray, Y: np.ndarray):
        """
        Trains the multi-output aroma regressor.
        X: (N, n_features) - combined fingerprint and physicochemical descriptors
        Y: (N, 12) - ground-truth aroma descriptor intensities [0, 1]
        """
        self.model.fit(X, Y)
        self.is_fitted = True

        # Extract feature importances
        if hasattr(self.model, "feature_importances_"):
            self.overall_feature_importance = self.model.feature_importances_
        else:
            self.overall_feature_importance = np.zeros(X.shape[1])

    def predict(self, X: np.ndarray) -> Tuple[np.ndarray, np.ndarray, float]:
        """
        Predicts aroma profile with ensemble uncertainty bounds.
        Returns:
            mean_predictions: (N, 12) array of intensity scores in [0, 1]
            std_uncertainty: (N, 12) array of epistemic uncertainty (tree variance)
            overall_confidence: float in [0, 1]
        """
        if not self.is_fitted:
            raise RuntimeError("AromaPredictionEngine must be fitted before calling predict.")

        if X.ndim == 1:
            X = X.reshape(1, -1)

        # Calculate tree-level variance across ensemble trees for uncertainty
        all_tree_preds = np.array([tree.predict(X) for tree in self.model.estimators_])  # (n_trees, N, 12)
        mean_preds = np.mean(all_tree_preds, axis=0)
        std_uncertainty = np.std(all_tree_preds, axis=0)

        # Clip predictions to valid sensory domain [0.0, 1.0]
        mean_preds = np.clip(mean_preds, 0.0, 1.0)

        # Overall confidence decreases with higher ensemble variance
        mean_var = float(np.mean(std_uncertainty))
        confidence = float(np.clip(1.0 - (mean_var * 2.5), 0.3, 0.98))

        return mean_preds, std_uncertainty, confidence

    def predict_single_profile(self, x: np.ndarray) -> Dict[str, Any]:
        """Convenience method returning structured dictionary for a single sample."""
        means, stds, conf = self.predict(x)
        aroma_profile = {
            d: round(float(means[0, i]), 3) for i, d in enumerate(self.descriptors)
        }
        aroma_uncertainties = {
            d: round(float(stds[0, i]), 3) for i, d in enumerate(self.descriptors)
        }

        # Identify dominant notes (>= 0.25 threshold)
        dominant = sorted(
            [(k, v) for k, v in aroma_profile.items() if v >= 0.25],
            key=lambda item: item[1],
            reverse=True
        )

        return {
            "aroma_vector": aroma_profile,
            "uncertainty_vector": aroma_uncertainties,
            "confidence": round(conf, 3),
            "dominant_descriptors": dominant[:4],
        }

    def save(self, filepath: Optional[Path] = None):
        """Serializes trained model artifact."""
        path = filepath or (MODELS_DIR / "aroma_engine.joblib")
        joblib.dump(self, path)

    @classmethod
    def load(cls, filepath: Optional[Path] = None) -> "AromaPredictionEngine":
        """Loads serialized model artifact."""
        path = filepath or (MODELS_DIR / "aroma_engine.joblib")
        if not path.exists():
            raise FileNotFoundError(f"Model file {path} not found.")
        return joblib.load(path)

