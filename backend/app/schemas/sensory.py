"""
Pydantic Schemas for Sensory Vectors, Chemical Data, Formulations, and API Responses.
"""

from typing import List, Dict, Optional, Any
from pydantic import BaseModel, Field, ConfigDict, model_validator
from backend.app.core.constants import AROMA_DESCRIPTORS, FLAVOR_DESCRIPTORS, SCIENTIFIC_DISCLAIMER


class AromaVector(BaseModel):
    """12-dimensional normalized aroma profile."""
    fruity: float = Field(default=0.0, ge=0.0, le=1.0)
    floral: float = Field(default=0.0, ge=0.0, le=1.0)
    citrus: float = Field(default=0.0, ge=0.0, le=1.0)
    woody: float = Field(default=0.0, ge=0.0, le=1.0)
    spicy: float = Field(default=0.0, ge=0.0, le=1.0)
    earthy: float = Field(default=0.0, ge=0.0, le=1.0)
    creamy_vanilla: float = Field(default=0.0, ge=0.0, le=1.0)
    roasted_nutty: float = Field(default=0.0, ge=0.0, le=1.0)
    green_herbal: float = Field(default=0.0, ge=0.0, le=1.0)
    caramel_sweet: float = Field(default=0.0, ge=0.0, le=1.0)
    sulfuric_pungent: float = Field(default=0.0, ge=0.0, le=1.0)
    fresh_cooling: float = Field(default=0.0, ge=0.0, le=1.0)

    def to_dict(self) -> Dict[str, float]:
        return self.model_dump()


class FlavorVector(BaseModel):
    """10-dimensional normalized flavor, taste, and chemesthesis profile."""
    sweet: float = Field(default=0.0, ge=0.0, le=1.0)
    sour: float = Field(default=0.0, ge=0.0, le=1.0)
    bitter: float = Field(default=0.0, ge=0.0, le=1.0)
    salty: float = Field(default=0.0, ge=0.0, le=1.0)
    umami: float = Field(default=0.0, ge=0.0, le=1.0)
    astringent: float = Field(default=0.0, ge=0.0, le=1.0)
    pungent: float = Field(default=0.0, ge=0.0, le=1.0)
    cooling: float = Field(default=0.0, ge=0.0, le=1.0)
    creamy_mouthfeel: float = Field(default=0.0, ge=0.0, le=1.0)
    acidic_crisp: float = Field(default=0.0, ge=0.0, le=1.0)

    def to_dict(self) -> Dict[str, float]:
        return self.model_dump()


class UncertaintyVector(BaseModel):
    """Standard deviation or prediction interval bounds across dimensions."""
    aroma_std: Dict[str, float] = Field(default_factory=dict)
    flavor_std: Dict[str, float] = Field(default_factory=dict)
    overall_confidence: float = Field(default=0.85, ge=0.0, le=1.0)


class CompoundResponse(BaseModel):
    id: int
    name: str
    smiles: str
    canonical_smiles: Optional[str] = None
    cas: Optional[str] = None
    pubchem_cid: Optional[int] = None
    chemical_class: Optional[str] = None
    odor_threshold_ug_l: Optional[float] = None
    molecular_weight: float
    logp: float
    tpsa: float
    h_bond_donors: float
    h_bond_acceptors: float
    rotatable_bonds: float
    aromatic_rings: float
    volatility_index: float
    aroma_vector: Dict[str, float]
    flavor_vector: Dict[str, float]
    provenance: str

    model_config = ConfigDict(from_attributes=True)


class ConstituentCompoundDetail(BaseModel):
    compound_name: str
    concentration_mg_kg: float
    role: Optional[str] = None
    chemical_class: Optional[str] = None
    odor_threshold_ug_l: Optional[float] = None


class IngredientResponse(BaseModel):
    id: int
    name: str
    category: str
    botanical_name: Optional[str] = None
    description: Optional[str] = None
    aroma_profile: Dict[str, float]
    flavor_profile: Dict[str, float]
    constituents: List[ConstituentCompoundDetail] = Field(default_factory=list)

    model_config = ConfigDict(from_attributes=True)


class FormulationItem(BaseModel):
    ingredient_name: str = Field(default="", description="Percentage of mixture (0-100)")
    name: Optional[str] = None
    proportion: float = Field(ge=0.0, le=100.0, description="Percentage of mixture (0-100)")
    category: Optional[str] = None

    @model_validator(mode="before")
    def align_name_fields(cls, values: Any):
        if isinstance(values, dict):
            val_name = values.get("ingredient_name") or values.get("name") or ""
            values["ingredient_name"] = val_name
            values["name"] = val_name
        return values


class FormulationAnalysisRequest(BaseModel):
    items: List[FormulationItem]
    apply_interaction_effects: bool = Field(default=True, description="Enable non-linear matrix interactions (synergy/suppression)")

    @model_validator(mode="after")
    def validate_proportions(self):
        total = sum(item.proportion for item in self.items)
        if total <= 0:
            raise ValueError("Total proportion of formulation ingredients must be greater than zero.")
        return self


class InteractionInsight(BaseModel):
    type: str  # "synergy", "suppression", "matrix_partitioning", "odor_induced_taste_enhancement"
    description: str
    affected_descriptors: List[str]
    magnitude: float


class ExplanationAttribution(BaseModel):
    feature_name: str
    contribution_score: float
    impact_description: str


class SensoryProfileResponse(BaseModel):
    aroma: AromaVector
    flavor: FlavorVector
    uncertainty: UncertaintyVector
    interaction_insights: List[InteractionInsight] = Field(default_factory=list)
    explanations: List[ExplanationAttribution] = Field(default_factory=list)
    scientific_disclaimer: str = SCIENTIFIC_DISCLAIMER


class TargetSensoryRequirement(BaseModel):
    target_aroma: Optional[Dict[str, float]] = None
    target_flavor: Optional[Dict[str, float]] = None
    text_prompt: Optional[str] = None
    excluded_ingredients: List[str] = Field(default_factory=list)
    max_ingredients: int = Field(default=4, ge=1, le=10)


class CandidateFormulation(BaseModel):
    rank: int
    formulation: List[FormulationItem]
    predicted_aroma: AromaVector
    predicted_flavor: FlavorVector
    similarity_to_target: float
    confidence: float
    explanation: str
    potential_constraints: List[str] = Field(default_factory=list)


class GenerativeFormulationResponse(BaseModel):
    query_target: Dict[str, Any]
    candidates: List[CandidateFormulation]
    optimization_method: str
    scientific_disclaimer: str = SCIENTIFIC_DISCLAIMER


class SimilarityQueryRequest(BaseModel):
    target_ingredient: Optional[str] = None
    target_smiles: Optional[str] = None
    top_k: int = Field(default=5, ge=1, le=20)
    mode: str = Field(default="sensory", description="'sensory', 'chemical', or 'contrastive' (sensory similar but chemically dissimilar)")


class SimilarityMatchItem(BaseModel):
    name: str
    category: str
    overall_similarity: float
    chemical_similarity: Optional[float] = None
    sensory_similarity: float
    contrast_score: Optional[float] = None
    explanation: str


class SensoryLabSimulationRequest(BaseModel):
    initial_formulation: List[FormulationItem]
    modified_formulation: List[FormulationItem]
    apply_interactions: bool = Field(default=True)


class DeltaSensoryProfile(BaseModel):
    descriptor: str
    category: str  # "Aroma" or "Flavor"
    initial_value: float
    modified_value: float
    delta: float
    direction: str  # "increased", "decreased", "unchanged"


class SensoryLabSimulationResponse(BaseModel):
    initial_aroma: Dict[str, float]
    initial_flavor: Dict[str, float]
    modified_aroma: Dict[str, float]
    modified_flavor: Dict[str, float]
    aroma_deltas: List[DeltaSensoryProfile]
    flavor_deltas: List[DeltaSensoryProfile]
    interaction_insights: List[InteractionInsight] = Field(default_factory=list)
    simulation_notes: List[str] = Field(default_factory=list)
    scientific_disclaimer: str = SCIENTIFIC_DISCLAIMER


class AssistantQueryRequest(BaseModel):
    query: str
    conversation_history: Optional[List[Dict[str, str]]] = Field(default_factory=list)


class AssistantQueryResponse(BaseModel):
    query: str
    intent: str
    interpreted_requirements: Dict[str, Any]
    response_text: str
    structured_data: Optional[Dict[str, Any]] = None
    suggested_actions: List[str] = Field(default_factory=list)
    scientific_disclaimer: str = SCIENTIFIC_DISCLAIMER
