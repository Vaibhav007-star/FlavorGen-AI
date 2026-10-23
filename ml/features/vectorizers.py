"""
Multimodal Feature Vectorizers for Chemical Compounds, Food Ingredients, and Sensory Descriptors.
"""

from typing import Dict, List, Optional, Tuple, Any
import numpy as np

from backend.app.core.constants import (
    AROMA_DESCRIPTORS, FLAVOR_DESCRIPTORS, MOLECULAR_PROPERTY_KEYS
)
from ml.chemistry.smiles_parser import SMILESParser
from ml.chemistry.descriptors import MolecularDescriptorCalculator
from ml.chemistry.fingerprints import MolecularFingerprinter


class ChemicalFeatureExtractor:
    """Extracts a unified 265-dimensional chemical feature vector from SMILES or precomputed models."""

    def __init__(self, n_bits: int = 256, radius: int = 2):
        self.n_bits = n_bits
        self.radius = radius
        self.parser = SMILESParser()
        self.desc_calc = MolecularDescriptorCalculator()
        self.fingerprinter = MolecularFingerprinter(radius=radius, n_bits=n_bits)

        # Baseline descriptor normalization factors (mean and std approximations)
        self.desc_scaling = {
            "molecular_weight": (150.0, 80.0),
            "logp": (1.5, 1.8),
            "tpsa": (35.0, 30.0),
            "h_bond_donors": (1.0, 1.5),
            "h_bond_acceptors": (2.0, 2.0),
            "rotatable_bonds": (3.0, 2.5),
            "aromatic_rings": (0.5, 0.6),
            "heavy_atom_count": (10.0, 6.0),
            "volatility_index": (2.0, 1.5),
        }

    def featurize_smiles(self, smiles: str) -> np.ndarray:
        """Computes concatenated [Fingerprint (256-bit) || Normalized Descriptors (9-dim)]."""
        fp = self.fingerprinter.generate_fingerprint(smiles)
        raw_desc = self.desc_calc.calculate(smiles)
        scaled_desc = []
        for k in MOLECULAR_PROPERTY_KEYS:
            val = raw_desc.get(k, 0.0)
            mean, std = self.desc_scaling.get(k, (0.0, 1.0))
            scaled_val = (val - mean) / (std if std > 0 else 1.0)
            scaled_desc.append(scaled_val)

        desc_arr = np.array(scaled_desc, dtype=np.float32)
        return np.concatenate([fp, desc_arr])

    def featurize_compound_dict(self, comp_dict: Any) -> np.ndarray:
        """Featurizes directly from stored database dictionary or ORM model fields."""
        if hasattr(comp_dict, "fingerprint"):
            fp_raw = comp_dict.fingerprint
        elif isinstance(comp_dict, dict):
            fp_raw = comp_dict.get("fingerprint", [0.0] * self.n_bits)
        else:
            fp_raw = [0.0] * self.n_bits
            
        fp = np.array(fp_raw or ([0.0] * self.n_bits), dtype=np.float32)
        scaled_desc = []
        for k in MOLECULAR_PROPERTY_KEYS:
            if hasattr(comp_dict, k):
                val = float(getattr(comp_dict, k) or 0.0)
            elif isinstance(comp_dict, dict):
                val = float(comp_dict.get(k, 0.0) or 0.0)
            else:
                val = 0.0
            mean, std = self.desc_scaling.get(k, (0.0, 1.0))
            scaled_val = (val - mean) / (std if std > 0 else 1.0)
            scaled_desc.append(scaled_val)

        desc_arr = np.array(scaled_desc, dtype=np.float32)
        return np.concatenate([fp, desc_arr])

    @property
    def feature_dimension(self) -> int:
        return self.n_bits + len(MOLECULAR_PROPERTY_KEYS)


class IngredientCompositionVectorizer:
    """Pools constituent chemical vectors into an ingredient-level sensory representation."""

    def __init__(self, extractor: Optional[ChemicalFeatureExtractor] = None):
        self.extractor = extractor or ChemicalFeatureExtractor()

    def pool_constituents(
        self,
        constituents: List[Dict[str, Any]],
        fat_content_fraction: float = 0.0
    ) -> np.ndarray:
        """
        Pools molecular feature vectors weighted by volatile concentration and OAV.
        Applies lipid/fat matrix partitioning: lipophilic volatiles (LogP > 2) are attenuated by fat fraction.
        """
        if not constituents:
            return np.zeros(self.extractor.feature_dimension, dtype=np.float32)

        weighted_vec = np.zeros(self.extractor.feature_dimension, dtype=np.float32)
        total_weight = 0.0

        for item in constituents:
            comp = item.get("compound", {}) if isinstance(item, dict) else getattr(item, "compound", {})
            conc = float(item.get("concentration_mg_kg", 1.0) if isinstance(item, dict) else getattr(item, "concentration_mg_kg", 1.0))
            
            if hasattr(comp, "odor_threshold_ug_l"):
                ot = float(comp.odor_threshold_ug_l or 50.0)
                logp = float(comp.logp or 1.5)
            elif isinstance(comp, dict):
                ot = float(comp.get("odor_threshold_ug_l", 50.0) or 50.0)
                logp = float(comp.get("logp", 1.5) or 1.5)
            else:
                ot = 50.0
                logp = 1.5

            # Headspace release factor (hydrophobic molecules partition into lipids)
            if fat_content_fraction > 0.05 and logp > 1.5:
                partition_coef = 1.0 / (1.0 + fat_content_fraction * logp * 0.5)
            else:
                partition_coef = 1.0

            # Weight combines Odor Activity Value (OAV) and mass
            oav = (conc * 1000.0) / max(0.0001, ot)
            effective_weight = (np.log1p(oav) * 2.0 + np.log1p(conc)) * partition_coef

            vec = self.extractor.featurize_compound_dict(comp)
            weighted_vec += vec * effective_weight
            total_weight += effective_weight

        if total_weight > 0:
            return weighted_vec / total_weight
        return weighted_vec


class SensoryTargetVectorizer:
    """Maps structured dictionaries or natural language sensory requirements into numeric targets."""

    @staticmethod
    def parse_aroma_dict(aroma_dict: Optional[Dict[str, float]]) -> np.ndarray:
        vec = np.zeros(len(AROMA_DESCRIPTORS), dtype=np.float32)
        if not aroma_dict:
            return vec
        for i, d in enumerate(AROMA_DESCRIPTORS):
            vec[i] = float(np.clip(aroma_dict.get(d, 0.0), 0.0, 1.0))
        return vec

    @staticmethod
    def parse_flavor_dict(flavor_dict: Optional[Dict[str, float]]) -> np.ndarray:
        vec = np.zeros(len(FLAVOR_DESCRIPTORS), dtype=np.float32)
        if not flavor_dict:
            return vec
        for i, d in enumerate(FLAVOR_DESCRIPTORS):
            vec[i] = float(np.clip(flavor_dict.get(d, 0.0), 0.0, 1.0))
        return vec

    @staticmethod
    def parse_text_query(prompt: str) -> Tuple[Dict[str, float], Dict[str, float]]:
        """Heuristic lexicon parser converting free-text sensory prompts into structured targets."""
        prompt_lower = prompt.lower()
        target_aroma = {d: 0.0 for d in AROMA_DESCRIPTORS}
        target_flavor = {d: 0.0 for d in FLAVOR_DESCRIPTORS}

        # Aroma keyword mapping
        aroma_keywords = {
            "fruity": ["fruit", "fruity", "berry", "strawberry", "apple", "banana", "pineapple", "tropical"],
            "floral": ["floral", "flower", "rose", "lavender", "jasmine"],
            "citrus": ["citrus", "lemon", "lime", "orange", "zest", "grapefruit"],
            "woody": ["woody", "pine", "cedar", "oak"],
            "spicy": ["spicy", "cinnamon", "clove", "spice", "peppery"],
            "earthy": ["earthy", "mushroom", "soil", "vegetal", "pea"],
            "creamy_vanilla": ["vanilla", "cream", "creamy", "buttery", "dairy", "custard"],
            "roasted_nutty": ["roasted", "nutty", "coffee", "cocoa", "chocolate", "toasted", "popcorn"],
            "green_herbal": ["green", "herbal", "grassy", "herb", "tea", "fresh-cut"],
            "caramel_sweet": ["caramel", "candy", "jam", "honey", "brown sugar"],
            "sulfuric_pungent": ["sulfur", "garlic", "onion", "savory", "pungent"],
            "fresh_cooling": ["cooling", "cool", "mint", "minty", "refreshing", "crisp", "fresh"]
        }

        # Flavor keyword mapping
        flavor_keywords = {
            "sweet": ["sweet", "sugary", "honey", "sweetness"],
            "sour": ["sour", "tart", "tangy", "acidic", "acidity", "lemony"],
            "bitter": ["bitter", "tonic", "dark chocolate", "astringent coffee"],
            "salty": ["salty", "salt", "saline", "briny"],
            "umami": ["umami", "savory", "brothy", "rich"],
            "astringent": ["astringent", "dry", "tannic", "tea-like"],
            "pungent": ["hot", "spicy heat", "fiery", "peppery heat", "pungent"],
            "cooling": ["cooling sensation", "cool finish", "menthol"],
            "creamy_mouthfeel": ["creamy texture", "silky", "smooth", "coating", "velvety", "creamy finish"],
            "acidic_crisp": ["crisp", "sharp", "effervescent", "bright acidity", "crisp acidity"]
        }

        intensity_modifiers = {
            "very": 1.3, "strong": 1.3, "intense": 1.4, "high": 1.3,
            "moderate": 0.8, "medium": 0.8, "mild": 0.5, "subtle": 0.4,
            "light": 0.4, "low": 0.3, "hint": 0.25, "touch": 0.25
        }

        for desc, words in aroma_keywords.items():
            for w in words:
                if w in prompt_lower:
                    base_val = 0.70
                    # Check for preceding modifier
                    for mod, factor in intensity_modifiers.items():
                        if f"{mod} {w}" in prompt_lower:
                            base_val = min(1.0, base_val * factor)
                            break
                    target_aroma[desc] = max(target_aroma[desc], round(base_val, 2))

        for desc, words in flavor_keywords.items():
            for w in words:
                if w in prompt_lower:
                    base_val = 0.70
                    for mod, factor in intensity_modifiers.items():
                        if f"{mod} {w}" in prompt_lower:
                            base_val = min(1.0, base_val * factor)
                            break
                    target_flavor[desc] = max(target_flavor[desc], round(base_val, 2))

        return target_aroma, target_flavor
