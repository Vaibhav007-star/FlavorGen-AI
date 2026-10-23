"""
Unit Tests for Database Models and Relational Integrity.
"""

import pytest
from backend.app.models.database import SessionLocal
from backend.app.models.domain import CompoundModel, IngredientModel, IngredientCompoundModel
from backend.app.core.constants import AROMA_DESCRIPTORS, FLAVOR_DESCRIPTORS


class TestDatabase:
    @pytest.fixture(autouse=True)
    def setup_db(self):
        self.db = SessionLocal()
        yield
        self.db.close()

    def test_compounds_seeded(self):
        count = self.db.query(CompoundModel).count()
        assert count >= 60, f"Expected at least 60 compounds, found {count}"

        # Test specific known compound
        vanillin = self.db.query(CompoundModel).filter(CompoundModel.name == "Vanillin").first()
        assert vanillin is not None
        assert vanillin.cas == "121-33-5"
        assert vanillin.aroma_vector["creamy_vanilla"] > 0.8
        assert vanillin.flavor_vector["sweet"] > 0.5
        assert len(vanillin.fingerprint) == 256

    def test_ingredients_and_associations(self):
        ing_count = self.db.query(IngredientModel).count()
        assert ing_count >= 10, f"Expected at least 10 ingredients, found {ing_count}"

        strawberry = self.db.query(IngredientModel).filter(IngredientModel.name == "Strawberry").first()
        assert strawberry is not None
        assert len(strawberry.compounds) >= 4

        # Check constituent compounds
        comp_names = [assoc.compound.name for assoc in strawberry.compounds]
        assert "Ethyl butyrate" in comp_names
        assert "Furaneol (Strawberry Furanone)" in comp_names

        # Check calculated empirical profiles
        assert strawberry.aroma_profile["fruity"] > 0.4
        assert strawberry.flavor_profile["sweet"] > 0.4

    def test_sensory_descriptors_completeness(self):
        compounds = self.db.query(CompoundModel).limit(10).all()
        for c in compounds:
            for d in AROMA_DESCRIPTORS:
                assert d in c.aroma_vector
                assert 0.0 <= c.aroma_vector[d] <= 1.0
            for d in FLAVOR_DESCRIPTORS:
                assert d in c.flavor_vector
                assert 0.0 <= c.flavor_vector[d] <= 1.0

