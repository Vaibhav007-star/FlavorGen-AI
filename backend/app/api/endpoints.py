"""
FastAPI Endpoints Router for AI Smell & Flavor Synthesizer.
"""

from typing import List, Dict, Any, Optional
from fastapi import APIRouter, HTTPException, Depends, Query
from pydantic import BaseModel, Field

from backend.app.core.constants import SCIENTIFIC_DISCLAIMER
from backend.app.models.database import get_db, SessionLocal
from backend.app.models.domain import CompoundModel, IngredientModel, ModelBenchmarkModel
from backend.app.schemas.sensory import (
    AromaVector, FlavorVector, CompoundResponse, IngredientResponse,
    FormulationAnalysisRequest, SensoryProfileResponse, GenerativeFormulationResponse,
    TargetSensoryRequirement, SimilarityQueryRequest, SimilarityMatchItem,
    SensoryLabSimulationRequest, SensoryLabSimulationResponse,
    AssistantQueryRequest, AssistantQueryResponse
)
from ml.models.aroma_intelligence import AromaIntelligenceService
from ml.models.flavor_intelligence import FlavorIntelligenceService
from ml.models.generative_engine import GenerativeFormulationEngine
from ml.models.similarity_engine import SensorySimilarityEngine
from ml.models.interaction_model import SensoryInteractionEngine
from ml.explainability.explainer import SensoryExplainer
from backend.app.services.assistant_service import SensoryAssistantService
from backend.app.services.sensory_lab_service import SensoryLabService
from backend.app.services.hardware_service import HardwareIntegrationService
from backend.app.schemas.hardware import (
    ENoseSensorFrame, ENoseClassificationResponse, PhysicalSynthesisJobResponse
)

router = APIRouter()

# Instantiate singleton engine services
aroma_service = AromaIntelligenceService()
flavor_service = FlavorIntelligenceService()
generative_engine = GenerativeFormulationEngine()
similarity_engine = SensorySimilarityEngine()
interaction_engine = SensoryInteractionEngine()
explainer = SensoryExplainer()
assistant_service = SensoryAssistantService()
sensory_lab_service = SensoryLabService()
hardware_service = HardwareIntegrationService()


class PredictionInput(BaseModel):
    smiles: Optional[str] = Field(default=None, description="Chemical SMILES string (e.g. 'CCCC(=O)OCC')")
    ingredient_name: Optional[str] = Field(default=None, description="Known ingredient name (e.g. 'Strawberry')")


@router.get("/health")
def health_check():
    """System health status, database statistics, and model readiness."""
    db = SessionLocal()
    c_count = db.query(CompoundModel).count()
    i_count = db.query(IngredientModel).count()
    b_count = db.query(ModelBenchmarkModel).count()
    db.close()
    return {
        "status": "healthy",
        "database": {
            "compounds_count": c_count,
            "ingredients_count": i_count,
            "benchmarks_count": b_count
        },
        "models": {
            "aroma_engine_loaded": aroma_service.model is not None,
            "flavor_engine_loaded": flavor_service.model is not None,
            "fusion_engine_calibrated": similarity_engine.fusion.is_calibrated
        },
        "scientific_disclaimer": SCIENTIFIC_DISCLAIMER
    }


@router.get("/ingredients")
def get_ingredients(category: Optional[str] = None):
    """Lists all culinary and beverage ingredients with constituent compounds and profiles."""
    db = SessionLocal()
    query = db.query(IngredientModel)
    if category:
        query = query.filter(IngredientModel.category.ilike(f"%{category}%"))
    ings = query.all()

    results = []
    for ing in ings:
        results.append({
            "id": ing.id,
            "name": ing.name,
            "category": ing.category,
            "botanical_name": ing.botanical_name,
            "description": ing.description,
            "aroma_profile": ing.aroma_profile,
            "flavor_profile": ing.flavor_profile,
            "constituents": [
                {
                    "compound_name": assoc.compound.name,
                    "concentration_mg_kg": assoc.concentration_mg_kg,
                    "role": assoc.role,
                    "chemical_class": assoc.compound.chemical_class,
                    "odor_threshold_ug_l": assoc.compound.odor_threshold_ug_l
                }
                for assoc in ing.compounds
            ]
        })
    db.close()
    return results


@router.get("/compounds")
def get_compounds(chemical_class: Optional[str] = None, limit: int = Query(default=100, le=200)):
    """Lists verified aroma and flavor compounds with chemical descriptors and sensory notes."""
    db = SessionLocal()
    query = db.query(CompoundModel)
    if chemical_class:
        query = query.filter(CompoundModel.chemical_class.ilike(f"%{chemical_class}%"))
    comps = query.limit(limit).all()

    results = [
        {
            "id": c.id,
            "name": c.name,
            "smiles": c.smiles,
            "canonical_smiles": c.canonical_smiles,
            "cas": c.cas,
            "pubchem_cid": c.pubchem_cid,
            "chemical_class": c.chemical_class,
            "odor_threshold_ug_l": c.odor_threshold_ug_l,
            "molecular_weight": c.molecular_weight,
            "logp": c.logp,
            "tpsa": c.tpsa,
            "volatility_index": c.volatility_index,
            "aroma_vector": c.aroma_vector,
            "flavor_vector": c.flavor_vector,
            "provenance": c.provenance
        }
        for c in comps
    ]
    db.close()
    return results


@router.post("/predict/aroma")
def predict_aroma(payload: PredictionInput):
    """Predicts 12-dimensional aroma profile, family classification, radar chart, and chemical attributions."""
    try:
        if payload.smiles:
            return aroma_service.analyze_smiles(payload.smiles)
        elif payload.ingredient_name:
            return aroma_service.analyze_ingredient(payload.ingredient_name)
        else:
            raise HTTPException(status_code=400, detail="Must provide either 'smiles' or 'ingredient_name'.")
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/predict/flavor")
def predict_flavor(payload: PredictionInput):
    """Predicts 10-dimensional taste primaries, chemesthesis, sugar-acid balance, and radar payload."""
    try:
        if payload.smiles:
            return flavor_service.analyze_smiles(payload.smiles)
        elif payload.ingredient_name:
            return flavor_service.analyze_ingredient(payload.ingredient_name)
        else:
            raise HTTPException(status_code=400, detail="Must provide either 'smiles' or 'ingredient_name'.")
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/analyze/formulation")
def analyze_formulation(payload: FormulationAnalysisRequest):
    """Analyzes a multi-ingredient recipe blend with non-linear interaction modeling."""
    db = SessionLocal()
    all_ings = {ing.name.lower(): ing for ing in db.query(IngredientModel).all()}

    resolved_profiles = []
    weights = []
    for item in payload.items:
        ing = all_ings.get(item.ingredient_name.lower())
        if not ing:
            for k, v in all_ings.items():
                if item.ingredient_name.lower() in k:
                    ing = v
                    break
        if not ing:
            db.close()
            raise HTTPException(status_code=404, detail=f"Ingredient '{item.ingredient_name}' not found.")

        resolved_profiles.append({
            "name": ing.name,
            "category": ing.category,
            "aroma_profile": ing.aroma_profile,
            "flavor_profile": ing.flavor_profile,
            "compounds": [
                {"compound_name": a.compound.name, "concentration_mg_kg": a.concentration_mg_kg, "role": a.role}
                for a in ing.compounds
            ]
        })
        weights.append(item.proportion)

    db.close()

    aroma_res, flavor_res, insights = interaction_engine.compute_mixture_profile(
        resolved_profiles, weights, apply_interactions=payload.apply_interaction_effects
    )

    mixture_expl = explainer.explain_mixture_prediction(resolved_profiles, weights)

    return {
        "aroma_vector": aroma_res,
        "flavor_vector": flavor_res,
        "interaction_insights": [i.model_dump() for i in insights],
        "explanation": mixture_expl,
        "scientific_disclaimer": SCIENTIFIC_DISCLAIMER
    }


@router.post("/generate/formulation", response_model=GenerativeFormulationResponse)
def generate_formulation(payload: TargetSensoryRequirement):
    """Inverts target requirements to synthesize optimized candidate recipes."""
    try:
        return generative_engine.generate_formulation(
            text_prompt=payload.text_prompt,
            target_aroma=payload.target_aroma,
            target_flavor=payload.target_flavor,
            excluded_ingredients=payload.excluded_ingredients,
            max_ingredients=payload.max_ingredients,
            top_candidates=3
        )
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/similarity/search")
def search_similarity(payload: SimilarityQueryRequest):
    """Finds sensory, chemical, or contrastive bio-isosteric analog matches."""
    try:
        if payload.target_ingredient:
            return similarity_engine.search_similar_ingredients(
                payload.target_ingredient, top_k=payload.top_k, mode=payload.mode
            )
        elif payload.target_smiles:
            return similarity_engine.search_similar_compounds(
                payload.target_smiles, top_k=payload.top_k, mode=payload.mode
            )
        else:
            raise HTTPException(status_code=400, detail="Must provide 'target_ingredient' or 'target_smiles'.")
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/sensory/simulate", response_model=SensoryLabSimulationResponse)
def simulate_sensory_perturbation(payload: SensoryLabSimulationRequest):
    """Digital Experiment Mode: Calculates Before -> Modification -> After sensory trajectories."""
    try:
        return sensory_lab_service.simulate_perturbation(
            payload.initial_formulation,
            payload.modified_formulation,
            apply_interactions=payload.apply_interactions
        )
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/assistant/query", response_model=AssistantQueryResponse)
def assistant_query(payload: AssistantQueryRequest):
    """Conversational AI Sensory Assistant for multi-step reasoning and formulation."""
    return assistant_service.process_query(
        query=payload.query,
        conversation_history=payload.conversation_history
    )


@router.get("/flavor-space")
def get_flavor_space():
    """Returns 2D and 3D projected coordinates for sensory map visualization."""
    return similarity_engine.get_full_flavor_space()


@router.get("/models/benchmarks")
def get_model_benchmarks():
    """Returns 5-fold cross-validation metrics comparing model architectures."""
    db = SessionLocal()
    benchmarks = db.query(ModelBenchmarkModel).all()
    results = {}
    for b in benchmarks:
        if b.model_name not in results:
            results[b.model_name] = {"aroma": {}, "flavor": {}}
        results[b.model_name][b.target_type][b.metric_name] = b.metric_value
    db.close()
    return {
        "models": results,
        "selected_production_model": "Random Forest Ensemble",
        "scientific_disclaimer": SCIENTIFIC_DISCLAIMER
    }


class DispenserProgramPayload(BaseModel):
    recipe_title: str = Field(default="Custom FlavorGen Blend")
    formulation: List[Dict[str, Any]]
    total_volume_microliters: float = Field(default=1000.0)


@router.post("/hardware/enose/classify", response_model=ENoseClassificationResponse)
def classify_enose_stream(payload: ENoseSensorFrame):
    """Processes real-time or simulated Electronic Nose multi-gas sensor readings."""
    return hardware_service.process_sensor_frame(payload)


@router.get("/hardware/enose/presets")
def get_enose_presets():
    """Returns pre-calibrated sensor response centroids for hardware simulation."""
    return hardware_service.PROFILES


@router.post("/hardware/dispenser/program", response_model=PhysicalSynthesisJobResponse)
def program_dispenser(payload: DispenserProgramPayload):
    """Calculates microfluidic pump runtimes and piezo PWM duty cycles for physical synthesis."""
    return hardware_service.program_dispenser_synthesis(
        recipe_title=payload.recipe_title,
        formulation=payload.formulation,
        total_volume_ul=payload.total_volume_microliters
    )


@router.get("/hardware/firmware/arduino")
def get_arduino_firmware():
    """Returns ready-to-flash C++ sketch for Arduino Uno or ESP32."""
    return {
        "firmware_name": "FlavorGen_Hardware_Controller.ino",
        "target": "ESP32 / Arduino Mega 2560",
        "baud_rate": 115200,
        "source_code": hardware_service.get_arduino_esp32_firmware_source()
    }


