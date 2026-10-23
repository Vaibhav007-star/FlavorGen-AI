"""
Stage 6: Flavor Intelligence Engine
High-level service for taste perception, chemesthesis, mouthfeel analysis,
taste primary balance metrics, and radar chart generation.
"""

from typing import Dict, List, Tuple, Any, Optional
import numpy as np

from backend.app.core.constants import FLAVOR_DESCRIPTORS
from backend.app.models.database import SessionLocal
from backend.app.models.domain import CompoundModel, IngredientModel
from ml.chemistry.smiles_parser import SMILESParser
from ml.chemistry.descriptors import MolecularDescriptorCalculator
from ml.features.vectorizers import ChemicalFeatureExtractor
from ml.models.flavor_model import FlavorPredictionEngine

TASTE_PRIMARIES = ["sweet", "sour", "bitter", "salty", "umami"]
MOUTHFEEL_CHEMESTHESIS = ["astringent", "pungent", "cooling", "creamy_mouthfeel", "acidic_crisp"]


class FlavorIntelligenceService:
    """Analyzes tongue receptor activation (TAS1R/TAS2R/OTOP1/ENaC) and trigeminal mouthfeel."""

    def __init__(self, model_engine: Optional[FlavorPredictionEngine] = None):
        self.extractor = ChemicalFeatureExtractor()
        self.parser = SMILESParser()
        self.desc_calc = MolecularDescriptorCalculator()

        if model_engine is not None:
            self.model = model_engine
        else:
            try:
                self.model = FlavorPredictionEngine.load()
            except Exception:
                self.model = None

    def _compute_balance_metrics(self, flavor_vec: Dict[str, float]) -> Dict[str, Any]:
        """Calculates sensory balance metrics: Sweet/Acid ratio, Bitterness Masking, and Mouthfeel Fullness."""
        sweet = flavor_vec.get("sweet", 0.0)
        sour = flavor_vec.get("sour", 0.0)
        bitter = flavor_vec.get("bitter", 0.0)
        salty = flavor_vec.get("salty", 0.0)
        umami = flavor_vec.get("umami", 0.0)
        creamy = flavor_vec.get("creamy_mouthfeel", 0.0)
        astringent = flavor_vec.get("astringent", 0.0)

        # 1. Sugar-to-Acid Ratio (perceptual balance)
        if sour > 0.05:
            sugar_acid_ratio = round(sweet / sour, 2)
            if sugar_acid_ratio > 2.0:
                balance_desc = "Sweetness Dominant (Soft/Dessert Profile)"
            elif sugar_acid_ratio < 0.6:
                balance_desc = "Acidic/Tart Dominant (Refreshing/Sharp Profile)"
            else:
                balance_desc = "Harmonious Sweet-Tart Equilibrium"
        else:
            sugar_acid_ratio = 10.0 if sweet > 0.1 else 1.0
            balance_desc = "Low Acid / Gentle Profile"

        # 2. Bitterness Masking Efficacy (by Sweetness + Saltiness)
        masking_power = min(1.0, (sweet * 0.5) + (salty * 0.6))
        effective_bitter = round(max(0.0, bitter * (1.0 - masking_power * 0.7)), 3)

        # 3. Mouthfeel Fullness Score
        mouthfeel_score = round(min(1.0, (creamy * 0.55) + (umami * 0.30) + (sweet * 0.15)), 2)

        return {
            "sugar_acid_ratio": sugar_acid_ratio,
            "sugar_acid_balance": balance_desc,
            "apparent_bitterness": effective_bitter,
            "mouthfeel_fullness": mouthfeel_score,
            "is_astringent_drying": astringent >= 0.25
        }

    def _generate_radar_payload(
        self,
        flavor_vector: Dict[str, float],
        uncertainty: Dict[str, float]
    ) -> Dict[str, Any]:
        """Constructs polar radar chart dataset for 10-dimensional flavor profile."""
        axes = []
        n_axes = len(FLAVOR_DESCRIPTORS)

        for i, d in enumerate(FLAVOR_DESCRIPTORS):
            angle_deg = round((360.0 / n_axes) * i, 1)
            val = flavor_vector.get(d, 0.0)
            err = uncertainty.get(d, 0.04)
            axes.append({
                "descriptor": d,
                "category": "Taste Primary" if d in TASTE_PRIMARIES else "Mouthfeel/Chemesthesis",
                "angle_degrees": angle_deg,
                "intensity": val,
                "lower_bound": round(max(0.0, val - err), 3),
                "upper_bound": round(min(1.0, val + err), 3)
            })

        return {
            "axes": axes,
            "polygon_data": [{"descriptor": d, "value": flavor_vector.get(d, 0.0)} for d in FLAVOR_DESCRIPTORS],
            "max_scale": 1.0
        }

    def analyze_smiles(self, smiles: str) -> Dict[str, Any]:
        """Analyzes single chemical structure for taste and mouthfeel characteristics."""
        if not self.parser.is_valid(smiles):
            raise ValueError(f"Invalid SMILES string: '{smiles}'")

        if self.model is None:
            self.model = FlavorPredictionEngine.load()

        # Check for known reference compound or run model inference
        x = self.extractor.featurize_smiles(smiles)
        db = SessionLocal()
        canon = self.parser.canonicalize(smiles)
        known = db.query(CompoundModel).filter(
            (CompoundModel.smiles == smiles) | 
            (CompoundModel.canonical_smiles == smiles) |
            (CompoundModel.smiles == canon) |
            (CompoundModel.canonical_smiles == canon)
        ).first()

        if known:
            flavor_vec = dict(known.flavor_vector)
            uncertainty_vec = {d: 0.03 for d in FLAVOR_DESCRIPTORS}
            confidence = 0.95
            dominant = sorted(
                [(k, v) for k, v in flavor_vec.items() if v >= 0.25],
                key=lambda item: item[1],
                reverse=True
            )
            dominant_descriptors = dominant[:4]
            db.close()
        else:
            db.close()
            profile_res = self.model.predict_single_profile(x)
            flavor_vec = profile_res["flavor_vector"]
            uncertainty_vec = profile_res["uncertainty_vector"]
            confidence = profile_res["confidence"]
            dominant_descriptors = profile_res["dominant_descriptors"]

        balance_metrics = self._compute_balance_metrics(flavor_vec)
        radar_payload = self._generate_radar_payload(flavor_vec, uncertainty_vec)

        # Oral receptor attribution
        receptor_notes = []
        if flavor_vec.get("sweet", 0) >= 0.3:
            receptor_notes.append("TAS1R2 + TAS1R3 receptor stimulation (sweet perception)")
        if flavor_vec.get("sour", 0) >= 0.3:
            receptor_notes.append("OTOP1 proton channel activation (sour/acidic perception)")
        if flavor_vec.get("bitter", 0) >= 0.2:
            receptor_notes.append("TAS2R family activation (bitter alkaloid detection)")
        if flavor_vec.get("umami", 0) >= 0.2:
            receptor_notes.append("TAS1R1 + TAS1R3 activation (L-glutamate savory response)")
        if flavor_vec.get("cooling", 0) >= 0.3:
            receptor_notes.append("TRPM8 sensory neuron ion channel activation (thermal cooling)")
        if flavor_vec.get("pungent", 0) >= 0.3:
            receptor_notes.append("TRPV1 / TRPA1 receptor activation (heat/chemesthesis)")

        return {
            "input_type": "chemical_compound",
            "smiles": self.parser.canonicalize(smiles),
            "flavor_vector": flavor_vec,
            "uncertainty_vector": uncertainty_vec,
            "confidence": confidence,
            "balance_metrics": balance_metrics,
            "dominant_descriptors": dominant_descriptors,
            "receptor_attributions": receptor_notes,
            "radar_visualization": radar_payload
        }

    def analyze_ingredient(self, ingredient_name: str) -> Dict[str, Any]:
        """Analyzes an ingredient's taste and mouthfeel characteristics."""
        db = SessionLocal()
        ing = db.query(IngredientModel).filter(IngredientModel.name.ilike(f"%{ingredient_name}%")).first()
        if not ing:
            db.close()
            raise ValueError(f"Ingredient '{ingredient_name}' not found in database.")

        flavor_vec = ing.flavor_profile
        uncertainty_vec = {d: 0.03 for d in FLAVOR_DESCRIPTORS}
        confidence = 0.94

        balance_metrics = self._compute_balance_metrics(flavor_vec)
        radar_payload = self._generate_radar_payload(flavor_vec, uncertainty_vec)

        dominant = sorted(
            [(k, v) for k, v in flavor_vec.items() if v >= 0.15],
            key=lambda item: item[1],
            reverse=True
        )

        db.close()
        return {
            "input_type": "ingredient",
            "name": ing.name,
            "category": ing.category,
            "flavor_vector": flavor_vec,
            "uncertainty_vector": uncertainty_vec,
            "confidence": confidence,
            "balance_metrics": balance_metrics,
            "dominant_descriptors": dominant[:4],
            "radar_visualization": radar_payload
        }

