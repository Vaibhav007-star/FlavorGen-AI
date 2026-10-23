"""
Combinational Effect & Matrix Interaction Engine:
Models non-linear sensory interactions including Odor-Induced Taste Enhancement (OITE),
cross-modal taste suppression, lipid headspace volatility partitioning, and aroma synergy.
"""

from typing import Dict, List, Tuple, Any
import numpy as np
from backend.app.core.constants import AROMA_DESCRIPTORS, FLAVOR_DESCRIPTORS
from backend.app.schemas.sensory import InteractionInsight


class SensoryInteractionEngine:
    """Computes non-linear mixture interactions beyond naive linear averaging."""

    def __init__(self):
        self.aroma_descriptors = AROMA_DESCRIPTORS
        self.flavor_descriptors = FLAVOR_DESCRIPTORS

    def compute_mixture_profile(
        self,
        ingredient_profiles: List[Dict[str, Any]],
        proportions: List[float],
        apply_interactions: bool = True
    ) -> Tuple[Dict[str, float], Dict[str, float], List[InteractionInsight]]:
        """
        Combines ingredient sensory profiles with non-linear interaction modeling.
        Returns:
            blended_aroma: Dict[str, float]
            blended_flavor: Dict[str, float]
            insights: List[InteractionInsight]
        """
        total_p = sum(proportions)
        if total_p <= 0:
            norm_weights = [1.0 / len(proportions)] * len(proportions)
        else:
            norm_weights = [p / total_p for p in proportions]

        # 1. Compute baseline weighted linear profile
        base_aroma = {d: 0.0 for d in self.aroma_descriptors}
        base_flavor = {d: 0.0 for d in self.flavor_descriptors}

        fat_dairy_weight = 0.0
        ingredient_names = []

        for ing, w in zip(ingredient_profiles, norm_weights):
            name = ing.get("name", "")
            ingredient_names.append(name)
            category = ing.get("category", "")
            if category in ("Dairy", "Confectionery") or "butter" in name.lower() or "cream" in name.lower():
                fat_dairy_weight += w

            ing_aroma = ing.get("aroma_profile", {})
            ing_flavor = ing.get("flavor_profile", {})

            for d in self.aroma_descriptors:
                base_aroma[d] += ing_aroma.get(d, 0.0) * w

            for d in self.flavor_descriptors:
                base_flavor[d] += ing_flavor.get(d, 0.0) * w

        if not apply_interactions:
            # Return pure linear blend
            return (
                {k: round(float(np.clip(v, 0.0, 1.0)), 3) for k, v in base_aroma.items()},
                {k: round(float(np.clip(v, 0.0, 1.0)), 3) for k, v in base_flavor.items()},
                []
            )

        # 2. Non-linear Combinational Interactions
        mod_aroma = dict(base_aroma)
        mod_flavor = dict(base_flavor)
        insights: List[InteractionInsight] = []

        # A. Odor-Induced Taste Enhancement (OITE):
        # Volatile fruity esters and creamy vanilla aromas enhance perceived sweetness without extra sugar.
        fruity_aroma = base_aroma.get("fruity", 0.0)
        vanilla_aroma = base_aroma.get("creamy_vanilla", 0.0)
        sweet_enhancer = (fruity_aroma * 0.18) + (vanilla_aroma * 0.15)

        if sweet_enhancer > 0.05 and mod_flavor.get("sweet", 0.0) > 0.10:
            orig_sweet = mod_flavor["sweet"]
            enhanced_sweet = min(1.0, orig_sweet + sweet_enhancer * (1.0 - orig_sweet * 0.5))
            boost = round(enhanced_sweet - orig_sweet, 3)
            mod_flavor["sweet"] = enhanced_sweet
            insights.append(InteractionInsight(
                type="odor_induced_taste_enhancement",
                description=f"Odor-Induced Taste Enhancement (OITE): Volatile fruity/vanilla esters cross-modally enhance perceived sweetness by +{boost:.2f}.",
                affected_descriptors=["sweet"],
                magnitude=boost
            ))

        # B. Cross-modal Bitterness Suppression by Sweetness & Salt:
        sweetness = mod_flavor.get("sweet", 0.0)
        saltiness = mod_flavor.get("salty", 0.0)
        bitterness = mod_flavor.get("bitter", 0.0)

        if bitterness > 0.15 and (sweetness > 0.20 or saltiness > 0.15):
            suppression_factor = (sweetness * 0.35) + (saltiness * 0.40)
            orig_bitter = bitterness
            new_bitter = max(0.0, orig_bitter * (1.0 - min(0.65, suppression_factor)))
            suppressed = round(orig_bitter - new_bitter, 3)
            mod_flavor["bitter"] = new_bitter
            insights.append(InteractionInsight(
                type="suppression",
                description=f"Perceptual Masking: High sweetness/saltiness partially masks tongue TAS2R receptor bitterness by -{suppressed:.2f}.",
                affected_descriptors=["bitter"],
                magnitude=suppressed
            ))

        # C. Umami-Salt Synergistic Amplification:
        umami = mod_flavor.get("umami", 0.0)
        if umami > 0.15 and saltiness > 0.15:
            synergy_boost = round(min(0.25, umami * saltiness * 0.5), 3)
            mod_flavor["umami"] = min(1.0, umami + synergy_boost)
            insights.append(InteractionInsight(
                type="synergy",
                description=f"Savory Ion Synergy: Sodium ions amplify savory L-glutamate reception (TAS1R1/TAS1R3) by +{synergy_boost:.2f}.",
                affected_descriptors=["umami"],
                magnitude=synergy_boost
            ))

        # D. Lipid Headspace Volatility Partitioning:
        # High fat/cream content retains hydrophobic aroma molecules, smoothing sharpness and increasing creamy mouthfeel.
        if fat_dairy_weight > 0.15:
            shift = round(min(0.20, fat_dairy_weight * 0.30), 3)
            mod_flavor["creamy_mouthfeel"] = min(1.0, mod_flavor.get("creamy_mouthfeel", 0.0) + shift)
            # Volatility retention: lipophilic top notes are slightly subdued into a rounder release
            mod_aroma["citrus"] = max(0.0, mod_aroma.get("citrus", 0.0) * (1.0 - shift * 0.4))
            mod_aroma["roasted_nutty"] = min(1.0, mod_aroma.get("roasted_nutty", 0.0) * (1.0 + shift * 0.2))
            insights.append(InteractionInsight(
                type="matrix_partitioning",
                description=f"Lipid Matrix Partitioning: Emulsified fat phase alters headspace partitioning, softening citrus volatility and boosting creamy mouthfeel by +{shift:.2f}.",
                affected_descriptors=["creamy_mouthfeel", "citrus", "roasted_nutty"],
                magnitude=shift
            ))

        # E. Trigeminal-Taste Interactions (Cooling & Acidic Crisp):
        cooling = mod_flavor.get("cooling", 0.0)
        sour = mod_flavor.get("sour", 0.0)
        if cooling > 0.20 and sour > 0.15:
            crisp_boost = round(min(0.20, cooling * sour * 0.4), 3)
            mod_flavor["acidic_crisp"] = min(1.0, mod_flavor.get("acidic_crisp", 0.0) + crisp_boost)
            insights.append(InteractionInsight(
                type="synergy",
                description=f"Trigeminal Activation: TRPM8 cooling sensation interacts with organic acid tartness to elevate perceived crispness by +{crisp_boost:.2f}.",
                affected_descriptors=["acidic_crisp"],
                magnitude=crisp_boost
            ))

        # Final clipping and rounding
        final_aroma = {k: round(float(np.clip(v, 0.0, 1.0)), 3) for k, v in mod_aroma.items()}
        final_flavor = {k: round(float(np.clip(v, 0.0, 1.0)), 3) for k, v in mod_flavor.items()}

        return final_aroma, final_flavor, insights

