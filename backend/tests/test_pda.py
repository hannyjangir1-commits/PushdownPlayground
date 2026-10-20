"""Unit tests for Pushdown Automata model and simulator."""

import pytest
from app.core.pda_model import validate_pda
from app.core.pda_simulator import simulate_pda
from app.core.sample_data import get_sample_pda_anbn, get_sample_pda_parens


def test_pda_validation_anbn():
    pda = get_sample_pda_anbn()
    is_valid, errors, _ = validate_pda(pda)
    assert is_valid
    assert len(errors) == 0


def test_pda_anbn_simulation_acceptance():
    pda = get_sample_pda_anbn()

    # Empty string ε
    res_eps = simulate_pda(pda, "")
    assert res_eps.accepted
    assert res_eps.status == "ACCEPTED"

    # "ab"
    res_ab = simulate_pda(pda, "ab")
    assert res_ab.accepted
    assert res_ab.status == "ACCEPTED"
    assert len(res_ab.trace) > 1

    # "aabb"
    res_aabb = simulate_pda(pda, "aabb")
    assert res_aabb.accepted

    # "aaabbb"
    res_aaabbb = simulate_pda(pda, "aaabbb")
    assert res_aaabbb.accepted


def test_pda_anbn_simulation_rejection():
    pda = get_sample_pda_anbn()

    # More a's than b's: "aab"
    assert not simulate_pda(pda, "aab").accepted

    # More b's than a's: "abb"
    assert not simulate_pda(pda, "abb").accepted

    # Inverted order: "ba"
    assert not simulate_pda(pda, "ba").accepted

    # Alternating: "abab"
    assert not simulate_pda(pda, "abab").accepted


def test_pda_parens_empty_stack_acceptance():
    pda = get_sample_pda_parens()

    assert simulate_pda(pda, "").accepted
    assert simulate_pda(pda, "()").accepted
    assert simulate_pda(pda, "(())").accepted
    assert simulate_pda(pda, "()()").accepted

    assert not simulate_pda(pda, "(").accepted
    assert not simulate_pda(pda, ")").accepted
    assert not simulate_pda(pda, ")(").accepted
