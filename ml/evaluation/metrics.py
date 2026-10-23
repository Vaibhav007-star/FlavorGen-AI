"""
Sensory Evaluation Metrics:
Computes continuous regression metrics (MAE, RMSE, R², Pearson correlation)
and uncertainty calibration metrics across multi-output sensory spaces.
"""

from typing import Dict, List, Any
import numpy as np
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score


class SensoryMetricsEvaluator:
    """Evaluates multi-target continuous sensory regression performance."""

    @staticmethod
    def evaluate_multioutput(
        y_true: np.ndarray,
        y_pred: np.ndarray,
        descriptor_names: List[str]
    ) -> Dict[str, Any]:
        """
        Computes overall and per-descriptor metrics:
        - MAE (Mean Absolute Error)
        - RMSE (Root Mean Squared Error)
        - R² (Coefficient of Determination)
        - Pearson r (Correlation)
        """
        n_targets = y_true.shape[1]
        overall_mae = float(mean_absolute_error(y_true, y_pred))
        overall_rmse = float(np.sqrt(mean_squared_error(y_true, y_pred)))
        overall_r2 = float(r2_score(y_true, y_pred))

        per_descriptor = {}
        for i, name in enumerate(descriptor_names):
            t = y_true[:, i]
            p = y_pred[:, i]
            d_mae = float(mean_absolute_error(t, p))
            d_rmse = float(np.sqrt(mean_squared_error(t, p)))
            
            # Avoid nan on zero variance targets
            if np.std(t) > 1e-6:
                d_r2 = float(r2_score(t, p))
                r = float(np.corrcoef(t, p)[0, 1])
                if np.isnan(r):
                    r = 0.0
            else:
                d_r2 = 1.0 if d_mae < 0.01 else 0.0
                r = 1.0 if d_mae < 0.01 else 0.0

            per_descriptor[name] = {
                "mae": round(d_mae, 4),
                "rmse": round(d_rmse, 4),
                "r2": round(d_r2, 4),
                "pearson_r": round(r, 4)
            }

        return {
            "overall_mae": round(overall_mae, 4),
            "overall_rmse": round(overall_rmse, 4),
            "overall_r2": round(overall_r2, 4),
            "per_descriptor": per_descriptor
        }

    @staticmethod
    def evaluate_uncertainty_calibration(
        y_true: np.ndarray,
        y_pred: np.ndarray,
        y_std: np.ndarray,
        z_score: float = 1.645  # 90% confidence interval
    ) -> Dict[str, float]:
        """
        Evaluates prediction interval coverage and sharpness.
        Nominal 90% coverage interval should contain ~90% of empirical points.
        """
        lower = y_pred - z_score * y_std
        upper = y_pred + z_score * y_std
        in_bounds = (y_true >= lower) & (y_true <= upper)
        empirical_coverage = float(np.mean(in_bounds))
        mean_interval_width = float(np.mean(upper - lower))

        return {
            "nominal_coverage": 0.90,
            "empirical_coverage": round(empirical_coverage, 4),
            "mean_interval_width": round(mean_interval_width, 4),
            "calibration_error": round(abs(empirical_coverage - 0.90), 4)
        }

