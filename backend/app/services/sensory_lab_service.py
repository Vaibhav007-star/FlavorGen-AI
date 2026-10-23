"""
Stage 14: Sensory Lab (Digital Experimentation Service)
Simulates dynamic real-time modifications in ingredient proportions,
calculates Before -> Modification -> After sensory trajectories,
and exposes non-linear matrix interaction shifts.
"""

from typing import Dict, List, Tuple, Any
import numpy as np

from backend.app.core.constants import AROMA_DESCRIPTORS, FLAVOR_DESCRIPTORS, SCIENTIFIC_DISCLAIMER
from backend.app.models.database import SessionLocal
from backend.app.models.domain import IngredientModel
from backend.app.schemas.sensory import (
    FormulationItem, DeltaSensoryProfile, SensoryLabSimulationResponse
)
from ml.models.interaction_model import SensoryInteractionEngine


class SensoryLabService:
    """Simulates interactive digital sensory experiments comparing initial vs modified mixtures."""

    def __init__(self):
        self.interaction_engine = SensoryInteractionEngine()

    def simulate_perturbation(
        self,
        initial_items: List[FormulationItem],
        modified_items: List[FormulationItem],
        apply_interactions: bool = True
    ) -> SensoryLabSimulationResponse:
        """
        Executes a dual before-and-after simulation:
        1. Evaluates initial formulation mixture profile
        2. Evaluates modified formulation mixture profile
        3. Computes delta vectors, directional shifts, and matrix interaction shifts
        """
        db = SessionLocal()
        all_ings = {ing.name.lower(): ing for ing in db.query(IngredientModel).all()}

        def resolve_profiles_and_weights(items: List[FormulationItem]):
            profiles = []
            weights = []
            for item in items:
                ing = all_ings.get(item.ingredient_name.lower())
                if not ing:
                    # Partial match
                    for k, v in all_ings.items():
                        if item.ingredient_name.lower() in k:
                            ing = v
                            break
                if not ing:
                    continue
                profiles.append({
                    "name": ing.name,
                    "category": ing.category,
                    "aroma_profile": ing.aroma_profile,
                    "flavor_profile": ing.flavor_profile,
                })
                weights.append(item.proportion)
            return profiles, weights

        init_profiles, init_weights = resolve_profiles_and_weights(initial_items)
        mod_profiles, mod_weights = resolve_profiles_and_weights(modified_items)
        db.close()

        if not init_profiles or not mod_profiles:
            raise ValueError("Invalid ingredients provided in simulation request.")

        # Compute initial state
        init_aroma, init_flavor, init_insights = self.interaction_engine.compute_mixture_profile(
            init_profiles, init_weights, apply_interactions=apply_interactions
        )

        # Compute modified state
        mod_aroma, mod_flavor, mod_insights = self.interaction_engine.compute_mixture_profile(
            mod_profiles, mod_weights, apply_interactions=apply_interactions
        )

        # Calculate Aroma Deltas
        aroma_deltas = []
        for d in AROMA_DESCRIPTORS:
            v_init = init_aroma.get(d, 0.0)
            v_mod = mod_aroma.get(d, 0.0)
            diff = round(v_mod - v_init, 3)
            if abs(diff) < 0.01:
                direction = "unchanged"
            elif diff > 0:
                direction = "increased"
            else:
                direction = "decreased"
            aroma_deltas.append(DeltaSensoryProfile(
                descriptor=d,
                category="Aroma",
                initial_value=v_init,
                modified_value=v_mod,
                delta=diff,
                direction=direction
            ))

        # Calculate Flavor Deltas
        flavor_deltas = []
        for d in FLAVOR_DESCRIPTORS:
            v_init = init_flavor.get(d, 0.0)
            v_mod = mod_flavor.get(d, 0.0)
            diff = round(v_mod - v_init, 3)
            if abs(diff) < 0.01:
                direction = "unchanged"
            elif diff > 0:
                direction = "increased"
            else:
                direction = "decreased"
            flavor_deltas.append(DeltaSensoryProfile(
                descriptor=d,
                category="Flavor",
                initial_value=v_init,
                modified_value=v_mod,
                delta=diff,
                direction=direction
            ))

        # Simulation notes summarizing significant changes
        notes = []
        sig_aroma = sorted(aroma_deltas, key=lambda x: abs(x.delta), reverse=True)[:2]
        for delta_item in sig_aroma:
            if abs(delta_item.delta) >= 0.04:
                sign = "+" if delta_item.delta > 0 else ""
                notes.append(f"Aroma shift: '{delta_item.descriptor}' {delta_item.direction} ({sign}{delta_item.delta:.2f}).")

        sig_flavor = sorted(flavor_deltas, key=lambda x: abs(x.delta), reverse=True)[:2]
        for delta_item in sig_flavor:
            if abs(delta_item.delta) >= 0.04:
                sign = "+" if delta_item.delta > 0 else ""
                notes.append(f"Flavor shift: '{delta_item.descriptor}' {delta_item.direction} ({sign}{delta_item.delta:.2f}).")

        return SensoryLabSimulationResponse(
            initial_aroma=init_aroma,
            initial_flavor=init_flavor,
            modified_aroma=mod_aroma,
            modified_flavor=mod_flavor,
            aroma_deltas=aroma_deltas,
            flavor_deltas=flavor_deltas,
            interaction_insights=mod_insights,
            simulation_notes=notes,
            scientific_disclaimer=SCIENTIFIC_DISCLAIMER
        )

