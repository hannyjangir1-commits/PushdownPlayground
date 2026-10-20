"""Integration tests for FastAPI endpoints."""

import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)


def test_api_health():
    response = client.get("/api/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "ok"


def test_api_grammar_parse_and_validate():
    payload = {"raw_text": "S -> a S b | ε"}
    res_parse = client.post("/api/grammar/parse", json=payload)
    assert res_parse.status_code == 200
    p_data = res_parse.json()
    assert p_data["success"]
    assert p_data["data"]["start_symbol"] == "S"

    res_val = client.post("/api/grammar/validate", json=payload)
    assert res_val.status_code == 200
    v_data = res_val.json()
    assert v_data["is_valid"]
    assert "S" in v_data["nullable_symbols"]


def test_api_derivation_search():
    payload = {
        "raw_text": "S -> a S b | ε",
        "target_string": "ab",
        "mode": "LEFTMOST",
    }
    res = client.post("/api/derivations/search", json=payload)
    assert res.status_code == 200
    data = res.json()
    assert data["success"]
    assert data["status"] == "FOUND"
    assert len(data["steps"]) == 2


def test_api_cnf():
    payload = {"raw_text": "S -> a S b | ε"}
    res = client.post("/api/normal-forms/cnf", json=payload)
    assert res.status_code == 200
    data = res.json()
    assert data["success"]
    assert data["is_valid"]
    assert len(data["stages"]) >= 6


def test_api_gnf():
    payload = {"raw_text": "S -> a A | b B\nA -> a\nB -> b"}
    res = client.post("/api/normal-forms/gnf", json=payload)
    assert res.status_code == 200
    data = res.json()
    assert data["success"]
    assert data["is_valid"]


def test_api_cyk():
    payload = {
        "raw_text": "S -> A B | B C\nA -> B A | a\nB -> C C | b\nC -> A B | a",
        "input_string": "ba",
        "convert_to_cnf_first": False,
    }
    res = client.post("/api/cyk/run", json=payload)
    assert res.status_code == 200
    data = res.json()
    assert data["success"]
    assert data["accepted"]


def test_api_pda_simulate():
    payload = {
        "sample_id": "pda-anbn",
        "input_string": "aabb",
    }
    res = client.post("/api/pda/simulate", json=payload)
    assert res.status_code == 200
    data = res.json()
    assert data["success"]
    assert data["accepted"]
    assert len(data["trace"]) > 1


def test_api_batch_testing():
    payload = {
        "model_type": "PDA",
        "sample_id": "pda-anbn",
        "test_items": [
            {"input_string": "", "expected": True},
            {"input_string": "ab", "expected": True},
            {"input_string": "ba", "expected": False},
        ]
    }
    res = client.post("/api/tests/batch", json=payload)
    assert res.status_code == 200
    data = res.json()
    assert data["success"]
    assert data["passed_count"] == 3
