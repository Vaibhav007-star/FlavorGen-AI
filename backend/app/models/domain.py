"""
Domain Relational Models for Chemical Compounds, Ingredients, Sensory Profiles, and Formulations.
"""

from datetime import datetime
from sqlalchemy import (
    Column, Integer, String, Float, Text, ForeignKey, DateTime, JSON
)
from sqlalchemy.orm import relationship
from backend.app.models.database import Base


class CompoundModel(Base):
    """Chemical compound with SMILES, molecular descriptors, and calibrated sensory ratings."""
    __tablename__ = "compounds"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(120), unique=True, nullable=False, index=True)
    smiles = Column(String(500), nullable=False)
    canonical_smiles = Column(String(500), nullable=True)
    cas = Column(String(50), nullable=True, index=True)
    pubchem_cid = Column(Integer, nullable=True)
    chemical_class = Column(String(80), nullable=True)
    odor_threshold_ug_l = Column(Float, nullable=True)

    # Physicochemical descriptors
    molecular_weight = Column(Float, nullable=False, default=0.0)
    logp = Column(Float, nullable=False, default=0.0)
    tpsa = Column(Float, nullable=False, default=0.0)
    h_bond_donors = Column(Float, nullable=False, default=0.0)
    h_bond_acceptors = Column(Float, nullable=False, default=0.0)
    rotatable_bonds = Column(Float, nullable=False, default=0.0)
    aromatic_rings = Column(Float, nullable=False, default=0.0)
    heavy_atom_count = Column(Float, nullable=False, default=0.0)
    volatility_index = Column(Float, nullable=False, default=0.0)

    # Fingerprint and vectors stored as JSON
    fingerprint = Column(JSON, nullable=False)
    raw_descriptors = Column(JSON, nullable=True)
    aroma_vector = Column(JSON, nullable=False)
    flavor_vector = Column(JSON, nullable=False)
    provenance = Column(String(50), nullable=False)

    ingredient_associations = relationship("IngredientCompoundModel", back_populates="compound", cascade="all, delete-orphan")


class IngredientModel(Base):
    """Food ingredient containing complex mixtures of volatile and taste-active molecules."""
    __tablename__ = "ingredients"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(120), unique=True, nullable=False, index=True)
    category = Column(String(60), nullable=False, index=True)
    botanical_name = Column(String(120), nullable=True)
    description = Column(Text, nullable=True)

    # Aggregated sensory profile computed from OAV and chemistry
    aroma_profile = Column(JSON, nullable=False)
    flavor_profile = Column(JSON, nullable=False)

    compounds = relationship("IngredientCompoundModel", back_populates="ingredient", cascade="all, delete-orphan")


class IngredientCompoundModel(Base):
    """Association table linking ingredients to constituent molecules with concentrations."""
    __tablename__ = "ingredient_compounds"

    id = Column(Integer, primary_key=True, index=True)
    ingredient_id = Column(Integer, ForeignKey("ingredients.id", ondelete="CASCADE"), nullable=False)
    compound_id = Column(Integer, ForeignKey("compounds.id", ondelete="CASCADE"), nullable=False)
    concentration_mg_kg = Column(Float, nullable=False)
    role = Column(String(200), nullable=True)

    ingredient = relationship("IngredientModel", back_populates="compounds")
    compound = relationship("CompoundModel", back_populates="ingredient_associations")


class FormulationRecordModel(Base):
    """Saved formulation with recipe ratios and predicted sensory outcomes."""
    __tablename__ = "formulation_records"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(150), nullable=False)
    target_description = Column(Text, nullable=True)
    proportions = Column(JSON, nullable=False)  # Dict[ingredient_name, percentage]
    predicted_aroma = Column(JSON, nullable=False)
    predicted_flavor = Column(JSON, nullable=False)
    confidence_score = Column(Float, nullable=False, default=1.0)
    created_at = Column(DateTime, default=datetime.utcnow)


class ModelBenchmarkModel(Base):
    """Model evaluation metrics and validation results."""
    __tablename__ = "model_benchmarks"

    id = Column(Integer, primary_key=True, index=True)
    model_name = Column(String(100), nullable=False)
    target_type = Column(String(50), nullable=False)  # "aroma" or "flavor"
    metric_name = Column(String(50), nullable=False)  # "mae", "rmse", "r2"
    metric_value = Column(Float, nullable=False)
    evaluated_at = Column(DateTime, default=datetime.utcnow)

