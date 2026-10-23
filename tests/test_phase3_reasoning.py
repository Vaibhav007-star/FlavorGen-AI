"""
Unit and Functional Tests for Phase 3 Generative & Reasoning Layer:
Formulation Optimizer, Generative Formulation Engine, and Explainable AI.
"""

import pytest
from ml.optimization.optimizer import FormulationOptimizer
from ml.models.generative_engine import GenerativeFormulationEngine
from ml.explainability.explainer import SensoryExplainer
from backend.app.core.constants import AROMA_DESCRIPTORS, FLAVOR_DESCRIPTORS


class TestPhase3ReasoningLayer:
    @pytest.fixture(autouse=True)
    def setup_engines(self):
        self.optimizer = FormulationOptimizer()
        self.generative_engine = GenerativeFormulationEngine()
        self.explainer = SensoryExplainer()

    def test_optimizer_continuous_fine_tune(self):
        # Two mockup ingredients: Strawberry and Vanilla
        ing1 = {
            "name": "Strawberry",
            "category": "Fruit",
            "aroma_profile": {"fruity": 0.85, "caramel_sweet": 0.30},
            "flavor_profile": {"sweet": 0.50, "sour": 0.40}
        }
        ing2 = {
            "name": "Vanilla Extract",
            "category": "Spice",
            "aroma_profile": {"creamy_vanilla": 0.90, "caramel_sweet": 0.40},
            "flavor_profile": {"sweet": 0.60, "creamy_mouthfeel": 0.50}
        }

        target_aroma = {"fruity": 0.60, "creamy_vanilla": 0.40}
        target_flavor = {"sweet": 0.55}

        weights, final_loss = self.optimizer.continuous_fine_tune(
            [ing1, ing2],
            [50.0, 50.0],
            target_aroma,
            target_flavor,
            min_proportion=5.0
        )

        assert len(weights) == 2
        assert abs(sum(weights) - 100.0) < 0.5
        assert all(w >= 4.9 for w in weights)
        assert final_loss >= 0.0

    def test_generative_formulation_from_text(self):
        prompt = "I want a tropical fruity drink with moderate sweetness and a touch of vanilla"
        result = self.generative_engine.generate_formulation(
            text_prompt=prompt,
            max_ingredients=3,
            top_candidates=2
        )

        assert "candidates" in result
        assert len(result["candidates"]) >= 1
        cand = result["candidates"][0]
        assert "rank" in cand
        assert "formulation" in cand
        assert len(cand["formulation"]) <= 3
        
        # Check proportions sum to 100%
        tot_prop = sum(item["proportion"] for item in cand["formulation"])
        assert abs(tot_prop - 100.0) < 1.0

        # Check predicted profiles
        assert cand["similarity_to_target"] > 0.0
        assert "explanation" in cand
        assert len(cand["potential_constraints"]) >= 1

    def test_generative_formulation_exclusions(self):
        # Exclude strawberry and peppermint
        excluded = ["Strawberry", "Peppermint"]
        result = self.generative_engine.generate_formulation(
            target_aroma={"citrus": 0.8, "fresh_cooling": 0.5},
            target_flavor={"acidic_crisp": 0.7},
            excluded_ingredients=excluded,
            max_ingredients=3,
            top_candidates=2
        )

        for cand in result["candidates"]:
            cand_names = [item["name"] for item in cand["formulation"]]
            for exc in excluded:
                assert exc not in cand_names

    def test_sensory_explainer_chemical(self):
        # Test Ethyl butyrate (fruity ester)
        explanation = self.explainer.explain_chemical_prediction("CCCC(=O)OCC")
        assert "aroma_predictions" in explanation
        assert "flavor_predictions" in explanation
        assert "feature_attributions" in explanation
        
        # Should attribute ester functional group
        attr_text = " ".join([a["feature"] + ": " + a["impact"] for a in explanation["feature_attributions"]])
        assert "Ester" in attr_text or "Linkage" in attr_text

        # Verify 90% uncertainty intervals
        fruity_pred = explanation["aroma_predictions"]["fruity"]
        assert fruity_pred["lower_bound_90pct"] <= fruity_pred["predicted_intensity"] <= fruity_pred["upper_bound_90pct"]

    def test_sensory_explainer_mixture(self):
        ing_strawberry = {
            "name": "Strawberry",
            "compounds": [
                {"compound_name": "Furaneol", "concentration_mg_kg": 25.0, "role": "Key character impact"},
                {"compound_name": "Ethyl butyrate", "concentration_mg_kg": 8.0, "role": "Top-note fruity ester"}
            ]
        }
        res = self.explainer.explain_mixture_prediction([ing_strawberry], [100.0])
        assert "constituent_chemical_drivers" in res
        assert len(res["constituent_chemical_drivers"]) >= 1
        assert "Furaneol" in [d["compound"] for d in res["constituent_chemical_drivers"]]

