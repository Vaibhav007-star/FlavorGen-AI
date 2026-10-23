"""
Flavor Prediction Intelligence Engine:
Multi-target ensemble regressor mapping chemical & mixture space to the 10-dimensional taste & chemesthesis space.
Includes epistemic uncertainty estimation and taste primary breakdown.
"""

from typing import Dict, List, Tuple, Any, Optional
from pathlib import Path
import numpy as np
import joblib
from sklearn.ensemble import RandomForestRegressor

from backend.app.core.constants import FLAVOR_DESCRIPTORS
from backend.app.core.config import MODELS_DIR


class FlavorPredictionEngine:
    """Predicts normalized 10-dimensional flavor profiles from chemical features with uncertainty."""

    def __init__(self, n_estimators: int = 120, random_state: int = 42):
        self.n_estimators = n_estimators
        self.random_state = random_state
        self.descriptors = FLAVOR_DESCRIPTORS
        
        self.model = RandomForestRegressor(
            n_estimators=self.n_estimators,
            max_depth=10,
            min_samples_split=2,
            random_state=self.random_state,
            n_jobs=-1
        )
        self.is_fitted = False

    def fit(self, X: np.ndarray, Y: np.ndarray):
        """
        Trains the multi-output flavor regressor.
        X: (N, n_features) - chemical fingerprints & physicochemical features
        Y: (N, 10) - ground-truth flavor descriptor scores [0, 1]
        """
        self.model.fit(X, Y)
        self.is_fitted = True

    def predict(self, X: np.ndarray) -> Tuple[np.ndarray, np.ndarray, float]:
        """
        Predicts flavor profile with ensemble variance uncertainty bounds.
        Returns:
            mean_predictions: (N, 10) array in [0, 1]
            std_uncertainty: (N, 10) array of epistemic uncertainty
            overall_confidence: float in [0, 1]
        """
        if not self.is_fitted:
            raise RuntimeError("FlavorPredictionEngine must be fitted before calling predict.")

        if X.ndim == 1:
            X = X.reshape(1, -1)

        all_tree_preds = np.array([tree.predict(X) for tree in self.model.estimators_])  # (n_trees, N, 10)
        mean_preds = np.mean(all_tree_preds, axis=0)
        std_uncertainty = np.std(all_tree_preds, axis=0)

        mean_preds = np.clip(mean_preds, 0.0, 1.0)
        mean_var = float(np.mean(std_uncertainty))
        confidence = float(np.clip(1.0 - (mean_var * 2.5), 0.3, 0.98))

        return mean_preds, std_uncertainty, confidence

    def predict_single_profile(self, x: np.ndarray) -> Dict[str, Any]:
        """Convenience method returning structured dictionary for a single sample."""
        means, stds, conf = self.predict(x)
        flavor_profile = {
            d: round(float(means[0, i]), 3) for i, d in enumerate(self.descriptors)
        }
        flavor_uncertainties = {
            d: round(float(stds[0, i]), 3) for i, d in enumerate(self.descriptors)
        }

        dominant = sorted(
            [(k, v) for k, v in flavor_profile.items() if v >= 0.20],
            key=lambda item: item[1],
            reverse=True
        )

        return {
            "flavor_vector": flavor_profile,
            "uncertainty_vector": flavor_uncertainties,
            "confidence": round(conf, 3),
            "dominant_descriptors": dominant[:4],
        }

    def save(self, filepath: Optional[Path] = None):
        path = filepath or (MODELS_DIR / "flavor_engine.joblib")
        joblib.dump(self, path)

    @classmethod
    def load(cls, filepath: Optional[Path] = None) -> "FlavorPredictionEngine":
        path = filepath or (MODELS_DIR / "flavor_engine.joblib")
        if not path.exists():
            raise FileNotFoundError(f"Model file {path} not found.")
        return joblib.load(path)

