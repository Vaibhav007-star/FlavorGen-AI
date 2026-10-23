"""
Stage 15: AI Sensory Assistant Service
Orchestrates multi-modal sensory interpretation, requirement parsing,
knowledge base search, formulation synthesis, and scientific explanation.
"""

from typing import Dict, List, Tuple, Any, Optional
import re

from backend.app.core.constants import AROMA_DESCRIPTORS, FLAVOR_DESCRIPTORS, SCIENTIFIC_DISCLAIMER
from backend.app.models.database import SessionLocal
from backend.app.models.domain import IngredientModel, CompoundModel
from ml.features.vectorizers import SensoryTargetVectorizer
from ml.models.generative_engine import GenerativeFormulationEngine
from ml.models.similarity_engine import SensorySimilarityEngine
from ml.models.aroma_intelligence import AromaIntelligenceService
from ml.models.flavor_intelligence import FlavorIntelligenceService
from ml.explainability.explainer import SensoryExplainer


class SensoryAssistantService:
    """Conversational orchestration agent for computational sensory intelligence."""

    def __init__(self):
        self.generative_engine = GenerativeFormulationEngine()
        self.similarity_engine = SensorySimilarityEngine()
        self.aroma_intel = AromaIntelligenceService()
        self.flavor_intel = FlavorIntelligenceService()
        self.explainer = SensoryExplainer()

    def process_query(
        self,
        query: str,
        conversation_history: Optional[List[Dict[str, str]]] = None
    ) -> Dict[str, Any]:
        """
        Interprets user prompt, identifies intent, runs underlying engines,
        and returns structured multimodal sensory results with explanation.
        """
        q = query.strip()
        q_lower = q.lower()

        # 1. Intent Detection
        # A. SMILES / Chemical analysis
        if re.search(r"[CNOPSFIcnos]{3,}[(=#]", q) or "smiles" in q_lower or "chemical" in q_lower:
            smiles_match = re.search(r"[A-Za-z0-9@+\-\[\]\(\)\\\/=#$%]+", q)
            # Find probable smiles token
            candidate_tokens = [t for t in q.split() if len(t) > 3 and any(c in t for c in "=()#")]
            target_smiles = candidate_tokens[0] if candidate_tokens else (smiles_match.group(0) if smiles_match else "")
            if target_smiles and self.aroma_intel.parser.is_valid(target_smiles):
                return self._handle_chemical_analysis(target_smiles)

        # B. Similar / Analog search: "similar to X", "substitute for X", "alternative to X"
        if any(w in q_lower for w in ["similar to", "alternative to", "substitute for", "replace", "analog"]):
            return self._handle_similarity_query(q)

        # C. Default: Generative formulation request ("I want...", "Formulate...", "Recipe for...")
        return self._handle_generative_request(q)

    def _handle_similarity_query(self, query: str) -> Dict[str, Any]:
        """Handles requests like 'Find something similar to strawberry but less sweet and more floral'."""
        db = SessionLocal()
        all_ings = [ing.name for ing in db.query(IngredientModel).all()]
        db.close()

        # Find reference ingredient mentioned
        target_ing = None
        for name in all_ings:
            if name.lower() in query.lower():
                target_ing = name
                break

        if not target_ing:
            target_ing = "Strawberry"  # sensible fallback if unspecified

        mode = "contrastive" if ("different" in query.lower() or "contrast" in query.lower() or "clean-label" in query.lower()) else "sensory"
        matches = self.similarity_engine.search_similar_ingredients(target_ing, top_k=3, mode=mode)

        # Detect modifiers (e.g. "less sweet", "more floral")
        aroma_mod, flavor_mod = SensoryTargetVectorizer.parse_text_query(query)

        response_text = (
            f"Analyzed sensory request relative to '{target_ing}'. "
            f"Searched the multimodal knowledge base across {len(self.similarity_engine.ingredient_index)} ingredients "
            f"in '{mode}' mode. Retrieved {len(matches)} candidate options matching your criteria."
        )

        return {
            "query": query,
            "intent": "similarity_and_substitution",
            "interpreted_requirements": {
                "reference_ingredient": target_ing,
                "mode": mode,
                "detected_aroma_adjustments": {k: v for k, v in aroma_mod.items() if v > 0},
                "detected_flavor_adjustments": {k: v for k, v in flavor_mod.items() if v > 0}
            },
            "response_text": response_text,
            "structured_data": {
                "reference": target_ing,
                "matches": matches
            },
            "suggested_actions": [
                f"Simulate mixture with {matches[0]['name'] if matches else 'target'} in Sensory Lab",
                f"Generate a customized formulation featuring {target_ing}",
                f"Explore {target_ing} in the 2D/3D Flavor Space"
            ],
            "scientific_disclaimer": SCIENTIFIC_DISCLAIMER
        }

    def _handle_chemical_analysis(self, smiles: str) -> Dict[str, Any]:
        """Analyzes a specific chemical compound by SMILES."""
        aroma_res = self.aroma_intel.analyze_smiles(smiles)
        flavor_res = self.flavor_intel.analyze_smiles(smiles)
        expl_res = self.explainer.explain_chemical_prediction(smiles)

        dominant_aromas = [f"{d[0].replace('_', ' ')} ({d[1]:.2f})" for d in aroma_res["dominant_descriptors"][:3]]
        dominant_flavors = [f"{d[0].replace('_', ' ')} ({d[1]:.2f})" for d in flavor_res["dominant_descriptors"][:3]]

        response_text = (
            f"Chemical analysis completed for SMILES `{smiles}`. "
            f"Categorized into aroma family '{aroma_res['aroma_family']}'. "
            f"Primary olfactory notes: {', '.join(dominant_aromas) if dominant_aromas else 'Subtle'}. "
            f"Oral taste & chemesthesis: {', '.join(dominant_flavors) if dominant_flavors else 'Neutral'}. "
            f"Model confidence: {aroma_res['confidence']:.2f}."
        )

        return {
            "query": smiles,
            "intent": "chemical_structure_analysis",
            "interpreted_requirements": {
                "smiles": smiles,
                "molecular_weight": aroma_res["physicochemical_summary"].get("molecular_weight"),
                "logp": aroma_res["physicochemical_summary"].get("logp"),
                "volatility_index": aroma_res["physicochemical_summary"].get("volatility_index")
            },
            "response_text": response_text,
            "structured_data": {
                "aroma": aroma_res,
                "flavor": flavor_res,
                "explainability": expl_res
            },
            "suggested_actions": [
                "Find structurally similar flavor compounds (Tanimoto search)",
                "Find sensory bio-isosteres with different chemical backbones",
                "Integrate this molecule into a formulation simulation"
            ],
            "scientific_disclaimer": SCIENTIFIC_DISCLAIMER
        }

    def _handle_generative_request(self, query: str) -> Dict[str, Any]:
        """Generates candidate formulations from an open-ended natural language prompt."""
        gen_result = self.generative_engine.generate_formulation(
            text_prompt=query,
            max_ingredients=4,
            top_candidates=3
        )

        top_cand = gen_result["candidates"][0] if gen_result["candidates"] else None
        if top_cand:
            recipe_summary = ", ".join([f"{item['proportion']:.0f}% {item['name']}" for item in top_cand["formulation"]])
            response_text = (
                f"Generated optimized formulation candidates for your requirement. "
                f"Top recommendation (Candidate 1, Similarity: {top_cand['similarity_to_target']*100:.1f}%): {recipe_summary}. "
                f"{top_cand['explanation']}"
            )
        else:
            response_text = "Synthesized sensory targets, but could not converge on viable candidates within specified constraints."

        return {
            "query": query,
            "intent": "generative_formulation_synthesis",
            "interpreted_requirements": gen_result["query_target"],
            "response_text": response_text,
            "structured_data": gen_result,
            "suggested_actions": [
                "Fine-tune ingredient proportions in the Sensory Lab",
                "Export formulation recipe card",
                "Explore candidate flavor profiles on the 2D Sensory Map"
            ],
            "scientific_disclaimer": SCIENTIFIC_DISCLAIMER
        }

