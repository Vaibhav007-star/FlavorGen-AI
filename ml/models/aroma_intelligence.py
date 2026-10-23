"""
Stage 5: Aroma Intelligence Engine
High-level analytical service for aroma prediction, radar profile generation,
aroma family classification, chemical attribution, and exemplar neighbor retrieval.
"""

from typing import Dict, List, Tuple, Any, Optional
import numpy as np

from backend.app.core.constants import AROMA_DESCRIPTORS
from backend.app.models.database import SessionLocal
from backend.app.models.domain import CompoundModel, IngredientModel
from ml.chemistry.smiles_parser import SMILESParser
from ml.chemistry.descriptors import MolecularDescriptorCalculator
from ml.features.vectorizers import ChemicalFeatureExtractor, IngredientCompositionVectorizer
from ml.models.aroma_model import AromaPredictionEngine

# Canonical Aroma Families mapped to dominant descriptors
AROMA_FAMILIES = {
    "Fruity & Ester": ["fruity", "caramel_sweet"],
    "Floral & Terpenic": ["floral", "citrus"],
    "Citrus & Fresh": ["citrus", "fresh_cooling"],
    "Woody & Resinous": ["woody", "earthy"],
    "Spicy & Phenylpropanoid": ["spicy", "caramel_sweet"],
    "Earthy & Pyrazinic": ["earthy", "green_herbal"],
    "Creamy & Lactonic": ["creamy_vanilla", "caramel_sweet"],
    "Roasted & Maillard": ["roasted_nutty", "caramel_sweet"],
    "Green & Aldehydic": ["green_herbal", "fresh_cooling"],
    "Sulfuric & Savory": ["sulfuric_pungent", "earthy"],
}


class AromaIntelligenceService:
    """Provides high-level aroma profiling, radar payloads, and chemical attribution."""

    def __init__(self, model_engine: Optional[AromaPredictionEngine] = None):
        self.extractor = ChemicalFeatureExtractor()
        self.parser = SMILESParser()
        self.desc_calc = MolecularDescriptorCalculator()
        self.pooler = IngredientCompositionVectorizer(self.extractor)
        
        if model_engine is not None:
            self.model = model_engine
        else:
            try:
                self.model = AromaPredictionEngine.load()
            except Exception:
                self.model = None

    def _classify_family(self, aroma_vector: Dict[str, float]) -> Tuple[str, float]:
        """Identifies primary aroma family based on dominant descriptor cluster."""
        best_family = "Balanced Complex"
        best_score = 0.0

        for family_name, descriptors in AROMA_FAMILIES.items():
            cluster_score = sum(aroma_vector.get(d, 0.0) for d in descriptors) / len(descriptors)
            if cluster_score > best_score:
                best_score = cluster_score
                best_family = family_name

        return best_family, round(best_score, 3)

    def _find_similar_known_profiles(
        self,
        predicted_aroma: Dict[str, float],
        top_k: int = 3
    ) -> List[Dict[str, Any]]:
        """Finds closest known benchmark compounds in 12-dimensional aroma space."""
        db = SessionLocal()
        compounds = db.query(CompoundModel).all()
        target_vec = np.array([predicted_aroma.get(d, 0.0) for d in AROMA_DESCRIPTORS])
        norm_target = np.linalg.norm(target_vec)

        matches = []
        for c in compounds:
            c_vec = np.array([c.aroma_vector.get(d, 0.0) for d in AROMA_DESCRIPTORS])
            norm_c = np.linalg.norm(c_vec)
            if norm_target > 0 and norm_c > 0:
                cos_sim = float(np.dot(target_vec, c_vec) / (norm_target * norm_c))
            else:
                cos_sim = 0.0

            matches.append({
                "name": c.name,
                "chemical_class": c.chemical_class,
                "similarity": round(cos_sim, 3),
                "dominant_notes": [
                    k for k, v in sorted(c.aroma_vector.items(), key=lambda x: x[1], reverse=True) if v >= 0.25
                ][:3]
            })

        db.close()
        matches.sort(key=lambda x: x["similarity"], reverse=True)
        return matches[:top_k]

    def _generate_radar_payload(
        self,
        aroma_vector: Dict[str, float],
        uncertainty: Dict[str, float]
    ) -> Dict[str, Any]:
        """Constructs polar radar chart dataset for interactive visualization."""
        axes = []
        n_axes = len(AROMA_DESCRIPTORS)

        for i, d in enumerate(AROMA_DESCRIPTORS):
            angle_deg = round((360.0 / n_axes) * i, 1)
            val = aroma_vector.get(d, 0.0)
            err = uncertainty.get(d, 0.05)
            axes.append({
                "descriptor": d,
                "angle_degrees": angle_deg,
                "intensity": val,
                "lower_bound": round(max(0.0, val - err), 3),
                "upper_bound": round(min(1.0, val + err), 3),
                "confidence_width": round(err * 2.0, 3)
            })

        return {
            "axes": axes,
            "polygon_data": [{"descriptor": d, "value": aroma_vector.get(d, 0.0)} for d in AROMA_DESCRIPTORS],
            "max_scale": 1.0
        }

    def analyze_smiles(self, smiles: str) -> Dict[str, Any]:
        """Analyzes single chemical entity by SMILES."""
        if not self.parser.is_valid(smiles):
            raise ValueError(f"Invalid SMILES string: '{smiles}'")

        if self.model is None:
            self.model = AromaPredictionEngine.load()

        # 1. Chemical featurization
        x = self.extractor.featurize_smiles(smiles)
        props = self.desc_calc.calculate(smiles)
        groups = self.parser.detect_functional_groups(smiles)

        # 2. Check for known reference compound or run model inference
        db = SessionLocal()
        canon = self.parser.canonicalize(smiles)
        known = db.query(CompoundModel).filter(
            (CompoundModel.smiles == smiles) | 
            (CompoundModel.canonical_smiles == smiles) |
            (CompoundModel.smiles == canon) |
            (CompoundModel.canonical_smiles == canon)
        ).first()

        if known:
            aroma_vec = dict(known.aroma_vector)
            uncertainty_vec = {d: 0.03 for d in AROMA_DESCRIPTORS}
            confidence = 0.95
            dominant = sorted(
                [(k, v) for k, v in aroma_vec.items() if v >= 0.25],
                key=lambda item: item[1],
                reverse=True
            )
            dominant_descriptors = dominant[:4]
            db.close()
        else:
            db.close()
            profile_res = self.model.predict_single_profile(x)
            aroma_vec = profile_res["aroma_vector"]
            uncertainty_vec = profile_res["uncertainty_vector"]
            confidence = profile_res["confidence"]
            dominant_descriptors = profile_res["dominant_descriptors"]

        # 3. Family classification & similarity
        family, family_score = self._classify_family(aroma_vec)
        similar_known = self._find_similar_known_profiles(aroma_vec, top_k=3)
        radar_payload = self._generate_radar_payload(aroma_vec, uncertainty_vec)

        # 4. Chemical feature insights
        contributing_features = []
        if groups.get("ester"):
            contributing_features.append("Ester motif: Drives fruity top-note volatile perception.")
        if groups.get("aldehyde"):
            contributing_features.append("Aldehydic carbonyl: Imparts green, crisp, or citrus freshness.")
        if groups.get("pyrazine"):
            contributing_features.append("Alkylpyrazine ring: Potent contributor to roasted/earthy sensory notes.")
        if groups.get("lactone"):
            contributing_features.append("Lactone ring: Imparts creamy, peachy, and milky nuances.")
        if groups.get("thiol"):
            contributing_features.append("Thiol/sulfide: High-potency pungent or savory impact.")
        if props.get("volatility_index", 0.0) > 3.0:
            contributing_features.append(f"High Volatility Index ({props['volatility_index']:.2f}): Rapid headspace release.")

        return {
            "input_type": "chemical_compound",
            "smiles": self.parser.canonicalize(smiles),
            "aroma_vector": aroma_vec,
            "uncertainty_vector": uncertainty_vec,
            "confidence": confidence,
            "aroma_family": family,
            "family_affinity": family_score,
            "dominant_descriptors": dominant_descriptors,
            "contributing_features": contributing_features,
            "similar_known_compounds": similar_known,
            "radar_visualization": radar_payload,
            "physicochemical_summary": props
        }

    def analyze_ingredient(self, ingredient_name: str) -> Dict[str, Any]:
        """Retrieves and analyzes an ingredient from the knowledge base."""
        db = SessionLocal()
        ing = db.query(IngredientModel).filter(IngredientModel.name.ilike(f"%{ingredient_name}%")).first()
        if not ing:
            db.close()
            raise ValueError(f"Ingredient '{ingredient_name}' not found in database.")

        aroma_vec = ing.aroma_profile
        # Epistemic uncertainty is lower for calibrated knowledge base entries
        uncertainty_vec = {d: 0.04 for d in AROMA_DESCRIPTORS}
        confidence = 0.92

        family, family_score = self._classify_family(aroma_vec)
        similar_known = self._find_similar_known_profiles(aroma_vec, top_k=3)
        radar_payload = self._generate_radar_payload(aroma_vec, uncertainty_vec)

        dominant = sorted(
            [(k, v) for k, v in aroma_vec.items() if v >= 0.20],
            key=lambda item: item[1],
            reverse=True
        )

        constituents_summary = [
            {
                "compound_name": assoc.compound.name,
                "concentration_mg_kg": assoc.concentration_mg_kg,
                "role": assoc.role,
                "odor_threshold_ug_l": assoc.compound.odor_threshold_ug_l
            }
            for assoc in ing.compounds
        ]

        db.close()
        return {
            "input_type": "ingredient",
            "name": ing.name,
            "category": ing.category,
            "botanical_name": ing.botanical_name,
            "aroma_vector": aroma_vec,
            "uncertainty_vector": uncertainty_vec,
            "confidence": confidence,
            "aroma_family": family,
            "family_affinity": family_score,
            "dominant_descriptors": dominant[:4],
            "constituent_volatiles": constituents_summary,
            "similar_known_compounds": similar_known,
            "radar_visualization": radar_payload
        }

