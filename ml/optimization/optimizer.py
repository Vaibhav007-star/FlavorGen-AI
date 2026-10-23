"""
Stage 10: Formulation Optimization Engine
Implements hybrid Evolutionary Optimization (Genetic Algorithm) and
Constrained Continuous Optimization (SciPy SLSQP) to find ingredient proportions
that minimize distance to a target sensory profile under physical and user constraints.
"""

from typing import Dict, List, Tuple, Any, Optional, Callable
import random
import numpy as np
from scipy.optimize import minimize

from backend.app.core.constants import AROMA_DESCRIPTORS, FLAVOR_DESCRIPTORS
from ml.models.interaction_model import SensoryInteractionEngine


class FormulationOptimizer:
    """Solves: min Distance(Target_Sensory, Predicted_Sensory(w)) s.t. sum(w) = 100, bounds & exclusions."""

    def __init__(
        self,
        interaction_engine: Optional[SensoryInteractionEngine] = None,
        random_state: int = 42
    ):
        self.interaction_engine = interaction_engine or SensoryInteractionEngine()
        self.random_state = random_state
        random.seed(random_state)
        np.random.seed(random_state)

    def _sensory_distance(
        self,
        pred_aroma: Dict[str, float],
        pred_flavor: Dict[str, float],
        target_aroma: Optional[Dict[str, float]],
        target_flavor: Optional[Dict[str, float]],
        weights_aroma: float = 0.5,
        weights_flavor: float = 0.5
    ) -> float:
        """Computes weighted Euclidean / Manhattan distance between predicted and target sensory profiles."""
        dist = 0.0
        n_terms = 0

        if target_aroma:
            for d in AROMA_DESCRIPTORS:
                if d in target_aroma and target_aroma[d] > 0.0:
                    t = target_aroma[d]
                    p = pred_aroma.get(d, 0.0)
                    dist += weights_aroma * ((t - p) ** 2)
                    n_terms += 1

        if target_flavor:
            for d in FLAVOR_DESCRIPTORS:
                if d in target_flavor and target_flavor[d] > 0.0:
                    t = target_flavor[d]
                    p = pred_flavor.get(d, 0.0)
                    dist += weights_flavor * ((t - p) ** 2)
                    n_terms += 1

        if n_terms == 0:
            return 0.0
        return float(np.sqrt(dist / n_terms))

    def continuous_fine_tune(
        self,
        selected_ingredients: List[Dict[str, Any]],
        initial_proportions: List[float],
        target_aroma: Optional[Dict[str, float]],
        target_flavor: Optional[Dict[str, float]],
        min_proportion: float = 5.0
    ) -> Tuple[List[float], float]:
        """
        Uses SciPy SLSQP (Sequential Least Squares Programming) for continuous gradient-assisted
        refinement of ingredient proportions subject to sum(w) = 100 and w_i >= min_proportion.
        """
        k = len(selected_ingredients)
        if k == 0:
            return [], 0.0
        if k == 1:
            return [100.0], 0.0

        # Objective function
        def objective(weights: np.ndarray) -> float:
            w_list = weights.tolist()
            aroma_p, flavor_p, _ = self.interaction_engine.compute_mixture_profile(
                selected_ingredients, w_list, apply_interactions=True
            )
            return self._sensory_distance(aroma_p, flavor_p, target_aroma, target_flavor)

        # Constraints & bounds
        constraints = [{"type": "eq", "fun": lambda w: np.sum(w) - 100.0}]
        bounds = [(min_proportion, 100.0) for _ in range(k)]

        # Initial guess normalized to 100
        init_arr = np.array(initial_proportions, dtype=np.float64)
        if np.sum(init_arr) > 0:
            init_arr = (init_arr / np.sum(init_arr)) * 100.0
        else:
            init_arr = np.ones(k) * (100.0 / k)

        res = minimize(
            objective,
            init_arr,
            method="SLSQP",
            bounds=bounds,
            constraints=constraints,
            options={"maxiter": 80, "ftol": 1e-4}
        )

        optimized_weights = [round(float(w), 1) for w in res.x]
        # Re-normalize to exact 100
        tot = sum(optimized_weights)
        if tot > 0:
            optimized_weights = [round((w / tot) * 100.0, 1) for w in optimized_weights]
        
        final_loss = float(res.fun)
        return optimized_weights, final_loss

    def evolutionary_search(
        self,
        candidate_pool: List[Dict[str, Any]],
        target_aroma: Optional[Dict[str, float]],
        target_flavor: Optional[Dict[str, float]],
        max_ingredients: int = 4,
        population_size: int = 40,
        generations: int = 30,
        min_proportion: float = 5.0
    ) -> List[Dict[str, Any]]:
        """
        Genetic Algorithm exploring combinatorial subsets of ingredients and initial proportions.
        Followed by SLSQP continuous fine-tuning on the top elite solutions.
        """
        n_candidates = len(candidate_pool)
        if n_candidates == 0:
            return []

        actual_k = min(max_ingredients, n_candidates)

        # 1. Initialize random population
        population = []
        for _ in range(population_size):
            k_subset = random.randint(min(2, actual_k), actual_k)
            indices = random.sample(range(n_candidates), k_subset)
            raw_weights = [random.uniform(10.0, 80.0) for _ in indices]
            tot = sum(raw_weights)
            weights = [(w / tot) * 100.0 for w in raw_weights]
            population.append({"indices": indices, "weights": weights})

        def evaluate_individual(ind: Dict[str, Any]) -> float:
            chosen = [candidate_pool[i] for i in ind["indices"]]
            aroma_p, flavor_p, _ = self.interaction_engine.compute_mixture_profile(
                chosen, ind["weights"], apply_interactions=True
            )
            return self._sensory_distance(aroma_p, flavor_p, target_aroma, target_flavor)

        # 2. Genetic Algorithm Generations
        for gen in range(generations):
            # Evaluate fitness
            for ind in population:
                ind["fitness"] = evaluate_individual(ind)

            # Sort by fitness (lower distance is better)
            population.sort(key=lambda x: x["fitness"])

            # Elitism: retain top 20%
            elites = population[:max(4, int(population_size * 0.20))]
            new_pop = list(elites)

            # Crossover and mutation to fill population
            while len(new_pop) < population_size:
                parent1 = random.choice(elites)
                parent2 = random.choice(population[:int(population_size * 0.5)])

                # Crossover ingredients
                combined_pool = list(set(parent1["indices"] + parent2["indices"]))
                if len(combined_pool) < actual_k and n_candidates >= actual_k:
                    extra = [i for i in range(n_candidates) if i not in combined_pool]
                    if extra:
                        combined_pool.extend(random.sample(extra, min(len(extra), actual_k - len(combined_pool))))

                max_k = min(actual_k, len(combined_pool))
                min_k = min(2, max_k)
                child_k = random.randint(min_k, max_k)
                child_indices = random.sample(combined_pool, child_k)

                # Crossover weights
                child_weights = []
                for idx in child_indices:
                    w1 = parent1["weights"][parent1["indices"].index(idx)] if idx in parent1["indices"] else 20.0
                    w2 = parent2["weights"][parent2["indices"].index(idx)] if idx in parent2["indices"] else 20.0
                    child_weights.append((w1 + w2) / 2.0)

                # Mutation (15% probability)
                if random.random() < 0.20 and n_candidates > actual_k:
                    # Swap an ingredient with a random one from candidate pool
                    swap_idx = random.randint(0, len(child_indices) - 1)
                    available = [i for i in range(n_candidates) if i not in child_indices]
                    if available:
                        child_indices[swap_idx] = random.choice(available)

                # Normalize weights to 100
                tot = sum(child_weights)
                child_weights = [(w / tot) * 100.0 for w in child_weights]
                new_pop.append({"indices": child_indices, "weights": child_weights})

            population = new_pop

        # Final evaluation and sorting
        for ind in population:
            ind["fitness"] = evaluate_individual(ind)
        population.sort(key=lambda x: x["fitness"])

        # 3. Fine-tune top 3 elite candidates using SLSQP
        top_candidates = []
        seen_combos = set()

        for elite in population:
            combo_key = tuple(sorted(elite["indices"]))
            if combo_key in seen_combos:
                continue
            seen_combos.add(combo_key)

            chosen_ings = [candidate_pool[i] for i in elite["indices"]]
            opt_weights, final_loss = self.continuous_fine_tune(
                chosen_ings,
                elite["weights"],
                target_aroma,
                target_flavor,
                min_proportion=min_proportion
            )

            # Predict final profile
            pred_aroma, pred_flavor, insights = self.interaction_engine.compute_mixture_profile(
                chosen_ings, opt_weights, apply_interactions=True
            )

            # Calculate cosine similarity to target
            target_vec = []
            pred_vec = []
            if target_aroma:
                for d in AROMA_DESCRIPTORS:
                    target_vec.append(target_aroma.get(d, 0.0))
                    pred_vec.append(pred_aroma.get(d, 0.0))
            if target_flavor:
                for d in FLAVOR_DESCRIPTORS:
                    target_vec.append(target_flavor.get(d, 0.0))
                    pred_vec.append(pred_flavor.get(d, 0.0))

            t_norm = np.linalg.norm(target_vec)
            p_norm = np.linalg.norm(pred_vec)
            if t_norm > 0 and p_norm > 0:
                sim = float(np.dot(target_vec, pred_vec) / (t_norm * p_norm))
            else:
                sim = max(0.0, 1.0 - final_loss)

            top_candidates.append({
                "ingredients": [
                    {
                        "name": ing["name"],
                        "ingredient_name": ing["name"],
                        "proportion": opt_weights[i],
                        "category": ing.get("category", "")
                    }
                    for i, ing in enumerate(chosen_ings)
                ],
                "predicted_aroma": pred_aroma,
                "predicted_flavor": pred_flavor,
                "similarity_to_target": round(float(np.clip(sim, 0.0, 1.0)), 3),
                "sensory_distance": round(final_loss, 4),
                "interaction_insights": insights
            })

            if len(top_candidates) >= 3:
                break

        return top_candidates
