"""
Integration Tests for FastAPI REST Endpoints.
Tests health, prediction, formulation, similarity, sensory lab, and assistant routes.
"""

import pytest
from fastapi.testclient import TestClient
from backend.app.main import app

client = TestClient(app)


def test_root_and_health():
    res = client.get("/")
    assert res.status_code == 200
    data = res.json()
    assert "project" in data
    assert "api_v1" in data

    h_res = client.get("/api/v1/health")
    assert h_res.status_code == 200
    h_data = h_res.json()
    assert h_data["status"] == "healthy"
    assert h_data["database"]["compounds_count"] >= 60
    assert h_data["database"]["ingredients_count"] >= 10


def test_get_ingredients_and_compounds():
    res_ing = client.get("/api/v1/ingredients")
    assert res_ing.status_code == 200
    ings = res_ing.json()
    assert len(ings) >= 10
    assert any(i["name"] == "Strawberry" for i in ings)

    res_comp = client.get("/api/v1/compounds?limit=10")
    assert res_comp.status_code == 200
    comps = res_comp.json()
    assert len(comps) == 10
    assert "smiles" in comps[0]


def test_predict_aroma_smiles():
    payload = {"smiles": "CCCC(=O)OCC"}  # Ethyl butyrate
    res = client.post("/api/v1/predict/aroma", json=payload)
    assert res.status_code == 200
    data = res.json()
    assert data["aroma_vector"]["fruity"] > 0.4
    assert "radar_visualization" in data
    assert len(data["radar_visualization"]["axes"]) == 12


def test_predict_flavor_ingredient():
    payload = {"ingredient_name": "Lemon Peel"}
    res = client.post("/api/v1/predict/flavor", json=payload)
    assert res.status_code == 200
    data = res.json()
    assert data["name"] == "Lemon Peel"
    assert data["flavor_vector"]["acidic_crisp"] > 0.4
    assert "balance_metrics" in data


def test_analyze_formulation():
    payload = {
        "items": [
            {"ingredient_name": "Strawberry", "proportion": 60.0},
            {"ingredient_name": "Vanilla Extract", "proportion": 40.0}
        ],
        "apply_interaction_effects": True
    }
    res = client.post("/api/v1/analyze/formulation", json=payload)
    assert res.status_code == 200
    data = res.json()
    assert "aroma_vector" in data
    assert "flavor_vector" in data
    assert "interaction_insights" in data


def test_generate_formulation_endpoint():
    payload = {
        "text_prompt": "I want a refreshing citrus mint beverage with light sweetness",
        "max_ingredients": 3
    }
    res = client.post("/api/v1/generate/formulation", json=payload)
    assert res.status_code == 200
    data = res.json()
    assert "candidates" in data
    assert len(data["candidates"]) >= 1
    assert data["candidates"][0]["similarity_to_target"] > 0.0


def test_similarity_search_endpoint():
    payload = {
        "target_ingredient": "Strawberry",
        "top_k": 3,
        "mode": "contrastive"
    }
    res = client.post("/api/v1/similarity/search", json=payload)
    assert res.status_code == 200
    data = res.json()
    assert len(data) >= 1
    assert "score" in data[0]


def test_sensory_simulate_endpoint():
    payload = {
        "initial_formulation": [
            {"ingredient_name": "Strawberry", "proportion": 80.0},
            {"ingredient_name": "Vanilla Extract", "proportion": 20.0}
        ],
        "modified_formulation": [
            {"ingredient_name": "Strawberry", "proportion": 50.0},
            {"ingredient_name": "Vanilla Extract", "proportion": 50.0}
        ],
        "apply_interactions": True
    }
    res = client.post("/api/v1/sensory/simulate", json=payload)
    assert res.status_code == 200
    data = res.json()
    assert "aroma_deltas" in data
    assert "flavor_deltas" in data
    assert "simulation_notes" in data


def test_assistant_query_endpoint():
    payload = {
        "query": "I want a tropical fruit cocktail that is very sweet with a creamy finish"
    }
    res = client.post("/api/v1/assistant/query", json=payload)
    assert res.status_code == 200
    data = res.json()
    assert data["intent"] == "generative_formulation_synthesis"
    assert "response_text" in data
    assert "structured_data" in data


def test_flavor_space_and_benchmarks():
    res_fs = client.get("/api/v1/flavor-space")
    assert res_fs.status_code == 200
    fs = res_fs.json()
    assert fs["total_entities"] >= 70
    assert len(fs["nodes"]) >= 70

    res_b = client.get("/api/v1/models/benchmarks")
    assert res_b.status_code == 200
    b = res_b.json()
    assert "models" in b

