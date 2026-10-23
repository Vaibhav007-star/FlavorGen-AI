"""
Unit and Functional Tests for ML Feature Extractors, Interaction Engine, and Sensory Modeling.
"""

import pytest
import numpy as np
from ml.features.vectorizers import (
    ChemicalFeatureExtractor, IngredientCompositionVectorizer, SensoryTargetVectorizer
)
from ml.models.interaction_model import SensoryInteractionEngine


class TestMLPipeline:
    @pytest.fixture(autouse=True)
    def setup(self):
        self.extractor = ChemicalFeatureExtractor()
        self.pooler = IngredientCompositionVectorizer(self.extractor)
        self.interaction_engine = SensoryInteractionEngine()

    def test_feature_extractor(self):
        smiles = "CCCC(=O)OCC"
        vec = self.extractor.featurize_smiles(smiles)
        assert isinstance(vec, np.ndarray)
        assert vec.shape == (265,)  # 256 bits + 9 physicochemical properties
        assert np.any(vec != 0)

    def test_sensory_target_vectorizer_dict(self):
        target_in = {"fruity": 0.85, "citrus": 0.40, "invalid_term": 0.99}
        aroma_vec = SensoryTargetVectorizer.parse_aroma_dict(target_in)
        assert aroma_vec.shape == (12,)
        assert aroma_vec[0] == 0.85  # fruity is index 0

    def test_sensory_target_vectorizer_text_prompt(self):
        prompt = "I want a tropical drink with strong fruity aroma, moderate sweetness, low acidity and a creamy finish"
        target_aroma, target_flavor = SensoryTargetVectorizer.parse_text_query(prompt)

        assert target_aroma["fruity"] >= 0.7
        assert target_aroma["creamy_vanilla"] >= 0.5
        assert target_flavor["sweet"] >= 0.5
        assert target_flavor["sour"] > 0.0 or target_flavor["acidic_crisp"] > 0.0

    def test_interaction_engine_oite(self):
        # Strawberry has high fruity ester and sweet notes
        strawberry_profile = {
            "name": "Strawberry",
            "category": "Fruit",
            "aroma_profile": {"fruity": 0.90, "creamy_vanilla": 0.10},
            "flavor_profile": {"sweet": 0.40, "sour": 0.30, "bitter": 0.0}
        }
        water_carrier = {
            "name": "Water Base",
            "category": "Base",
            "aroma_profile": {},
            "flavor_profile": {}
        }

        aroma_res, flavor_res, insights = self.interaction_engine.compute_mixture_profile(
            [strawberry_profile, water_carrier],
            [50.0, 50.0],
            apply_interactions=True
        )

        # Perceived sweetness should experience Odor-Induced Taste Enhancement
        assert any(i.type == "odor_induced_taste_enhancement" for i in insights)
        assert flavor_res["sweet"] > 0.20  # Base linear is 0.20, with OITE it should be higher

    def test_interaction_engine_bitterness_suppression(self):
        # Sweet sugar + bitter coffee
        sweet_comp = {
            "name": "Syrup",
            "category": "Sweetener",
            "aroma_profile": {"caramel_sweet": 0.50},
            "flavor_profile": {"sweet": 0.90, "bitter": 0.0}
        }
        bitter_comp = {
            "name": "Black Coffee",
            "category": "Beverage",
            "aroma_profile": {"roasted_nutty": 0.80},
            "flavor_profile": {"sweet": 0.0, "bitter": 0.80}
        }

        # Linear blend without interactions
        _, lin_flavor, _ = self.interaction_engine.compute_mixture_profile(
            [sweet_comp, bitter_comp], [50.0, 50.0], apply_interactions=False
        )
        # Interactive blend with masking
        _, int_flavor, insights = self.interaction_engine.compute_mixture_profile(
            [sweet_comp, bitter_comp], [50.0, 50.0], apply_interactions=True
        )

        assert lin_flavor["bitter"] == 0.40
        assert int_flavor["bitter"] < 0.40  # Bitterness should be perceptually suppressed by sweetness
        assert any(i.type == "suppression" for i in insights)

    def test_interaction_engine_lipid_partitioning(self):
        butter_profile = {
            "name": "Fresh Butter",
            "category": "Dairy",
            "aroma_profile": {"creamy_vanilla": 0.85},
            "flavor_profile": {"creamy_mouthfeel": 0.80}
        }
        lemon_profile = {
            "name": "Lemon Peel",
            "category": "Citrus",
            "aroma_profile": {"citrus": 0.90},
            "flavor_profile": {"acidic_crisp": 0.80}
        }

        _, flavor_res, insights = self.interaction_engine.compute_mixture_profile(
            [butter_profile, lemon_profile], [40.0, 60.0], apply_interactions=True
        )

        assert any(i.type == "matrix_partitioning" for i in insights)
        assert flavor_res["creamy_mouthfeel"] > 0.32

