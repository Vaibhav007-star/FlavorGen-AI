"""
Stage 9: Generative Formulation Engine
Inverts user sensory targets (text descriptions or numeric profiles) to search the
ingredient/chemical knowledge space and synthesize optimized candidate formulations.
"""

from typing import Dict, List, Tuple, Any, Optional
import numpy as np

from backend.app.core.constants import (
    AROMA_DESCRIPTORS, FLAVOR_DESCRIPTORS, SCIENTIFIC_DISCLAIMER
)
from backend.app.models.database import SessionLocal
from backend.app.models.domain import IngredientModel
from ml.features.vectorizers import SensoryTargetVectorizer
from ml.optimization.optimizer import FormulationOptimizer
from ml.models.interaction_model import SensoryInteractionEngine


class GenerativeFormulationEngine:
    """Generates candidate ingredient formulations to match structured or free-text sensory targets."""

    def __init__(self, optimizer: Optional[FormulationOptimizer] = None):
        self.optimizer = optimizer or FormulationOptimizer()
        self.interaction_engine = SensoryInteractionEngine()

    def _fetch_candidate_pool(
        self,
        excluded_ingredients: List[str]
    ) -> List[Dict[str, Any]]:
        """Fetches active ingredients from the database, filtering out user exclusions."""
        db = SessionLocal()
        all_ings = db.query(IngredientModel).all()
        exclusions_lower = [e.lower().strip() for e in excluded_ingredients]

        pool = []
        for ing in all_ings:
            if ing.name.lower().strip() in exclusions_lower:
                continue

            pool.append({
                "id": ing.id,
                "name": ing.name,
                "category": ing.category,
                "botanical_name": ing.botanical_name,
                "aroma_profile": ing.aroma_profile,
                "flavor_profile": ing.flavor_profile,
                "compounds": [
                    {
                        "compound_name": assoc.compound.name,
                        "concentration_mg_kg": assoc.concentration_mg_kg,
                        "role": assoc.role
                    }
                    for assoc in ing.compounds
                ]
            })

        db.close()
        return pool

    def _generate_candidate_explanation(
        self,
        candidate_items: List[Dict[str, Any]],
        pred_aroma: Dict[str, float],
        pred_flavor: Dict[str, float],
        target_aroma: Optional[Dict[str, float]],
        target_flavor: Optional[Dict[str, float]]
    ) -> str:
        """Generates clear scientific rationale linking chosen ingredients to target perception."""
        ing_parts = [f"{item['proportion']:.1f}% {item['name']}" for item in candidate_items]
        recipe_str = ", ".join(ing_parts)

        # Highlight key sensory drivers
        top_aromas = sorted(pred_aroma.items(), key=lambda x: x[1], reverse=True)[:2]
        top_flavors = sorted(pred_flavor.items(), key=lambda x: x[1], reverse=True)[:2]

        aroma_summary = " and ".join([f"{k.replace('_', ' ')} ({v:.2f})" for k, v in top_aromas if v > 0.15])
        flavor_summary = " and ".join([f"{k.replace('_', ' ')} ({v:.2f})" for k, v in top_flavors if v > 0.15])

        explanation = (
            f"Formulation composed of {recipe_str}. "
            f"Delivers pronounced {aroma_summary} in the volatile aroma headspace, "
            f"coupled with balanced {flavor_summary} on the palate. "
            f"Combinational synergy aligns closely with user-requested sensory specifications."
        )
        return explanation

    def generate_formulation(
        self,
        text_prompt: Optional[str] = None,
        target_aroma: Optional[Dict[str, float]] = None,
        target_flavor: Optional[Dict[str, float]] = None,
        excluded_ingredients: Optional[List[str]] = None,
        max_ingredients: int = 4,
        top_candidates: int = 3
    ) -> Dict[str, Any]:
        """
        Synthesizes candidate formulations to match target aroma and flavor profiles.
        """
        excluded = excluded_ingredients or []

        # 1. Parse target requirements
        if text_prompt and (not target_aroma or not any(target_aroma.values())):
            parsed_aroma, parsed_flavor = SensoryTargetVectorizer.parse_text_query(text_prompt)
            # Merge with any explicitly provided numeric targets
            active_target_aroma = target_aroma or parsed_aroma
            active_target_flavor = target_flavor or parsed_flavor
        else:
            active_target_aroma = target_aroma or {}
            active_target_flavor = target_flavor or {}

        # 2. Retrieve candidate pool
        pool = self._fetch_candidate_pool(excluded)
        if len(pool) < 2:
            raise ValueError("Insufficient ingredients available in knowledge base to generate formulation.")

        # 3. Run evolutionary search + continuous optimization
        raw_candidates = self.optimizer.evolutionary_search(
            candidate_pool=pool,
            target_aroma=active_target_aroma,
            target_flavor=active_target_flavor,
            max_ingredients=max_ingredients,
            population_size=35,
            generations=25,
            min_proportion=5.0
        )

        # 4. Post-process and package candidates
        candidates = []
        for rank, cand in enumerate(raw_candidates[:top_candidates], 1):
            cand_items = cand["ingredients"]
            pred_aroma = cand["predicted_aroma"]
            pred_flavor = cand["predicted_flavor"]
            sim = cand["similarity_to_target"]

            # Confidence based on distance and ingredients
            confidence = round(float(np.clip(0.92 - (cand["sensory_distance"] * 0.4), 0.55, 0.96)), 2)

            expl = self._generate_candidate_explanation(
                cand_items, pred_aroma, pred_flavor, active_target_aroma, active_target_flavor
            )

            # Audit formulation constraints
            constraints_audit = []
            if len(cand_items) <= max_ingredients:
                constraints_audit.append(f"Satisfies maximum ingredient limit ({len(cand_items)}/{max_ingredients}).")
            if not any(item["name"].lower() in [e.lower() for e in excluded] for item in cand_items):
                constraints_audit.append("Complies with user allergen/exclusion parameters.")
            tot_p = sum(item["proportion"] for item in cand_items)
            if abs(tot_p - 100.0) < 0.5:
                constraints_audit.append("Proportions sum to 100.0%.")

            candidates.append({
                "rank": rank,
                "formulation": cand_items,
                "predicted_aroma": pred_aroma,
                "predicted_flavor": pred_flavor,
                "similarity_to_target": sim,
                "confidence": confidence,
                "explanation": expl,
                "potential_constraints": constraints_audit,
                "interaction_insights": [i.model_dump() for i in cand.get("interaction_insights", [])]
            })

        return {
            "query_target": {
                "text_prompt": text_prompt,
                "target_aroma": active_target_aroma,
                "target_flavor": active_target_flavor,
                "excluded_ingredients": excluded,
                "max_ingredients": max_ingredients
            },
            "candidates": candidates,
            "optimization_method": "Hybrid Genetic Evolutionary Search + Constrained SLSQP",
            "scientific_disclaimer": SCIENTIFIC_DISCLAIMER
        }

