"""
ML Training, Cross-Validation, and Model Benchmark Evaluation Pipeline.
Trains multi-output Aroma and Flavor models, benchmarks multiple architectures,
evaluates uncertainty calibration, and serializes artifacts.
"""

import time
import json
from pathlib import Path
from typing import Dict, Any, List
import numpy as np
from sklearn.model_selection import KFold
from sklearn.ensemble import RandomForestRegressor, GradientBoostingRegressor
from sklearn.linear_model import Ridge
from sklearn.multioutput import MultiOutputRegressor

from backend.app.core.constants import AROMA_DESCRIPTORS, FLAVOR_DESCRIPTORS
from backend.app.core.config import MODELS_DIR
from backend.app.models.database import SessionLocal
from backend.app.models.domain import CompoundModel, ModelBenchmarkModel
from ml.features.vectorizers import ChemicalFeatureExtractor
from ml.models.aroma_model import AromaPredictionEngine
from ml.models.flavor_model import FlavorPredictionEngine
from ml.evaluation.metrics import SensoryMetricsEvaluator


def run_training_pipeline() -> Dict[str, Any]:
    print("=" * 70)
    print("AI SMELL & FLAVOR SYNTHESIZER: ML TRAINING & BENCHMARK PIPELINE")
    print("=" * 70)

    db = SessionLocal()
    compounds = db.query(CompoundModel).all()
    if not compounds:
        db.close()
        raise RuntimeError("No compounds found in database. Run data.seed_database first.")

    print(f"Loaded {len(compounds)} compounds from SQLite database.")

    # 1. Prepare Feature & Target Matrices
    extractor = ChemicalFeatureExtractor()
    X_list = []
    Y_aroma_list = []
    Y_flavor_list = []

    for c in compounds:
        vec = extractor.featurize_smiles(c.smiles)
        X_list.append(vec)

        aroma_v = [c.aroma_vector.get(d, 0.0) for d in AROMA_DESCRIPTORS]
        flavor_v = [c.flavor_vector.get(d, 0.0) for d in FLAVOR_DESCRIPTORS]
        Y_aroma_list.append(aroma_v)
        Y_flavor_list.append(flavor_v)

    X = np.array(X_list, dtype=np.float32)
    Y_aroma = np.array(Y_aroma_list, dtype=np.float32)
    Y_flavor = np.array(Y_flavor_list, dtype=np.float32)

    print(f"Feature matrix shape: {X.shape} (256-bit ECFP4 + 9 Physicochemical Descriptors)")
    print(f"Aroma target shape: {Y_aroma.shape} (12 Odor Notes)")
    print(f"Flavor target shape: {Y_flavor.shape} (10 Taste/Chemesthesis Notes)")

    # 2. Model Architecture Comparison (Random Forest vs Gradient Boosting vs Ridge)
    models_to_benchmark = {
        "Random Forest Ensemble": {
            "aroma": RandomForestRegressor(n_estimators=100, max_depth=8, random_state=42, n_jobs=-1),
            "flavor": RandomForestRegressor(n_estimators=100, max_depth=8, random_state=42, n_jobs=-1)
        },
        "Gradient Boosting MultiOutput": {
            "aroma": MultiOutputRegressor(GradientBoostingRegressor(n_estimators=80, max_depth=4, random_state=42)),
            "flavor": MultiOutputRegressor(GradientBoostingRegressor(n_estimators=80, max_depth=4, random_state=42))
        },
        "Ridge Linear Baseline": {
            "aroma": Ridge(alpha=1.0),
            "flavor": Ridge(alpha=1.0)
        }
    }

    benchmark_results = {}
    kf = KFold(n_splits=5, shuffle=True, random_state=42)

    for model_name, model_pair in models_to_benchmark.items():
        print(f"\n--- Benchmarking: {model_name} (5-Fold Cross Validation) ---")
        model_results = {}

        for target_type, Y_target, descriptors in [
            ("aroma", Y_aroma, AROMA_DESCRIPTORS),
            ("flavor", Y_flavor, FLAVOR_DESCRIPTORS)
        ]:
            model = model_pair[target_type]
            cv_preds = np.zeros_like(Y_target)

            t0 = time.time()
            for train_idx, test_idx in kf.split(X):
                X_tr, X_te = X[train_idx], X[test_idx]
                Y_tr = Y_target[train_idx]
                model.fit(X_tr, Y_tr)
                preds = model.predict(X_te)
                cv_preds[test_idx] = np.clip(preds, 0.0, 1.0)
            elapsed = time.time() - t0

            metrics = SensoryMetricsEvaluator.evaluate_multioutput(Y_target, cv_preds, descriptors)
            model_results[target_type] = {
                "mae": metrics["overall_mae"],
                "rmse": metrics["overall_rmse"],
                "r2": metrics["overall_r2"],
                "cv_time_sec": round(elapsed, 3),
                "per_descriptor": metrics["per_descriptor"]
            }

            print(f"[{target_type.upper()}] MAE: {metrics['overall_mae']:.4f} | RMSE: {metrics['overall_rmse']:.4f} | R²: {metrics['overall_r2']:.4f} | Time: {elapsed:.2f}s")

        benchmark_results[model_name] = model_results

    # 3. Train and Save Production Engines
    print("\n" + "=" * 50)
    print("Fitting Production Aroma & Flavor Engines on Full Dataset...")
    MODELS_DIR.mkdir(parents=True, exist_ok=True)

    aroma_engine = AromaPredictionEngine(n_estimators=120, random_state=42)
    aroma_engine.fit(X, Y_aroma)
    aroma_engine.save()
    print(f"Aroma Engine serialized to {MODELS_DIR / 'aroma_engine.joblib'}")

    flavor_engine = FlavorPredictionEngine(n_estimators=120, random_state=42)
    flavor_engine.fit(X, Y_flavor)
    flavor_engine.save()
    print(f"Flavor Engine serialized to {MODELS_DIR / 'flavor_engine.joblib'}")

    # Evaluate uncertainty calibration on production models
    aroma_preds, aroma_std, aroma_conf = aroma_engine.predict(X)
    aroma_calib = SensoryMetricsEvaluator.evaluate_uncertainty_calibration(Y_aroma, aroma_preds, aroma_std)

    flavor_preds, flavor_std, flavor_conf = flavor_engine.predict(X)
    flavor_calib = SensoryMetricsEvaluator.evaluate_uncertainty_calibration(Y_flavor, flavor_preds, flavor_std)

    print(f"\nAroma Uncertainty 90% Interval Coverage: {aroma_calib['empirical_coverage']*100:.1f}% (Mean Width: {aroma_calib['mean_interval_width']:.3f})")
    print(f"Flavor Uncertainty 90% Interval Coverage: {flavor_calib['empirical_coverage']*100:.1f}% (Mean Width: {flavor_calib['mean_interval_width']:.3f})")

    # 4. Save Benchmark Report and Persist to DB
    final_report = {
        "benchmark_models": benchmark_results,
        "calibration": {
            "aroma": aroma_calib,
            "flavor": flavor_calib
        },
        "sample_count": len(compounds),
        "feature_count": X.shape[1],
        "generated_at": time.strftime("%Y-%m-%dT%H:%M:%SZ")
    }

    report_path = MODELS_DIR / "benchmark_report.json"
    with open(report_path, "w", encoding="utf-8") as f:
        json.dump(final_report, f, indent=2)

    # Persist metrics to database table
    db.query(ModelBenchmarkModel).delete()
    for m_name, m_data in benchmark_results.items():
        for t_type in ["aroma", "flavor"]:
            db.add(ModelBenchmarkModel(
                model_name=m_name,
                target_type=t_type,
                metric_name="mae",
                metric_value=m_data[t_type]["mae"]
            ))
            db.add(ModelBenchmarkModel(
                model_name=m_name,
                target_type=t_type,
                metric_name="rmse",
                metric_value=m_data[t_type]["rmse"]
            ))
            db.add(ModelBenchmarkModel(
                model_name=m_name,
                target_type=t_type,
                metric_name="r2",
                metric_value=m_data[t_type]["r2"]
            ))
    db.commit()
    db.close()

    print(f"Persisted benchmarks to DB and saved report to {report_path}")
    print("=" * 70)
    return final_report


if __name__ == "__main__":
    run_training_pipeline()

