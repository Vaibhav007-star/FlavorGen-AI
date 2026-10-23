"""
Unit and Functional Tests for Phase 2 Core Intelligence Engines:
Aroma Intelligence, Flavor Intelligence, Multimodal Fusion, and Similarity Search.
"""

import pytest
import numpy as np
from ml.models.aroma_intelligence import AromaIntelligenceService
from ml.models.flavor_intelligence import FlavorIntelligenceService
from ml.features.multimodal_fusion import MultimodalFusionEngine
from ml.models.similarity_engine import SensorySimilarityEngine


class TestPhase2CoreEngines:
    @pytest.fixture(autouse=True)
    def setup_engines(self):
        self.aroma_intel = AromaIntelligenceService()
        self.flavor_intel = FlavorIntelligenceService()
        self.fusion = MultimodalFusionEngine.load()
        self.similarity = SensorySimilarityEngine()

    def test_aroma_intelligence_smiles(self):
        # Test Vanillin
        res = self.aroma_intel.analyze_smiles("O=Cc1cc(OC)c(O)cc1")
        assert res["input_type"] == "chemical_compound"
        assert res["aroma_vector"]["creamy_vanilla"] > 0.5
        assert "Creamy & Lactonic" in res["aroma_family"] or "Spicy & Phenylpropanoid" in res["aroma_family"]
        assert len(res["dominant_descriptors"]) >= 1
        assert "radar_visualization" in res
        assert len(res["radar_visualization"]["axes"]) == 12
        assert len(res["similar_known_compounds"]) >= 1

    def test_aroma_intelligence_ingredient(self):
        res = self.aroma_intel.analyze_ingredient("Strawberry")
        assert res["name"] == "Strawberry"
        assert res["aroma_vector"]["fruity"] > 0.3
        assert "Fruity & Ester" in res["aroma_family"]
        assert len(res["constituent_volatiles"]) >= 4

    def test_flavor_intelligence_smiles(self):
        # Citric acid should activate sour / acidic crisp
        res = self.flavor_intel.analyze_smiles("OC(=O)CC(O)(CC(=O)O)C(=O)O")
        assert res["flavor_vector"]["sour"] > 0.6
        assert len(res["radar_visualization"]["axes"]) == 10
        assert "OTOP1 proton channel" in " ".join(res["receptor_attributions"])
        assert res["balance_metrics"]["sugar_acid_ratio"] < 1.0

    def test_flavor_intelligence_ingredient(self):
        res = self.flavor_intel.analyze_ingredient("Vanilla Extract")
        assert res["flavor_vector"]["sweet"] > 0.3
        assert res["balance_metrics"]["mouthfeel_fullness"] > 0.0

    def test_multimodal_fusion_projections(self):
        # Project chemical feature vector
        sample_chem = np.zeros(265, dtype=np.float32)
        sample_chem[0] = 1.0  # mock bit
        z_chem = self.fusion.project_chemical(sample_chem)
        assert z_chem.shape == (64,)
        assert np.isclose(np.linalg.norm(z_chem), 1.0, atol=1e-3)

        # Project sensory profile
        sample_sens = np.zeros(22, dtype=np.float32)
        sample_sens[0] = 0.9  # fruity
        sample_sens[12] = 0.8  # sweet
        z_sens = self.fusion.project_sensory(sample_sens)
        assert z_sens.shape == (64,)
        assert np.isclose(np.linalg.norm(z_sens), 1.0, atol=1e-3)

        # Project text requirement query
        z_text = self.fusion.project_text_query("I want a sweet fruity lemon drink")
        assert z_text.shape == (64,)
        assert np.isclose(np.linalg.norm(z_text), 1.0, atol=1e-3)

        # Test 2D/3D map projection
        c2d, c3d = self.fusion.project_to_2d_3d(z_text)
        assert len(c2d) == 2
        assert len(c3d) == 3

    def test_similarity_sensory_search(self):
        matches = self.similarity.search_similar_ingredients("Strawberry", top_k=3, mode="sensory")
        assert len(matches) > 0
        top_match = matches[0]
        assert "name" in top_match
        assert top_match["sensory_similarity"] > 0.0

    def test_similarity_contrastive_bioisostere_search(self):
        # Contrastive mode: High sensory similarity, low chemical similarity
        matches = self.similarity.search_similar_ingredients("Strawberry", top_k=3, mode="contrastive")
        assert len(matches) > 0
        top_match = matches[0]
        assert "Bio-isosteric Analog" in top_match["explanation"]
        assert top_match["score"] >= 0.0

    def test_similarity_compound_search(self):
        # Search for compounds similar to ethyl butyrate (fruity ester)
        matches = self.similarity.search_similar_compounds("CCCC(=O)OCC", top_k=3, mode="sensory")
        assert len(matches) > 0
        assert "name" in matches[0]

    def test_full_flavor_space_retrieval(self):
        space = self.similarity.get_full_flavor_space()
        assert space["total_entities"] >= 70
        assert len(space["nodes"]) >= 70
        node = space["nodes"][0]
        assert "coord_2d" in node
        assert "coord_3d" in node
        assert len(node["coord_2d"]) == 2
        assert len(node["coord_3d"]) == 3

