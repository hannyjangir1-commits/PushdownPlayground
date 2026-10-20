"""Unit tests for derivation engine (leftmost and rightmost)."""

import pytest
from app.core.grammar_parser import parse_grammar_text
from app.core.derivation_engine import find_derivation


def test_leftmost_derivation_anbn():
    text = "S -> a S b | ε"
    g = parse_grammar_text(text)

    # Test "aabb"
    res = find_derivation(g, "aabb", mode="LEFTMOST")
    assert res.success
    assert res.status == "FOUND"
    assert len(res.steps) == 3
    # S -> a S b -> a a S b b -> a a b b
    assert res.sentential_forms[0] == ["S"]
    assert res.sentential_forms[-1] == ["a", "a", "b", "b"]


def test_rightmost_derivation_anbn():
    text = "S -> a S b | ε"
    g = parse_grammar_text(text)

    res = find_derivation(g, "ab", mode="RIGHTMOST")
    assert res.success
    assert res.status == "FOUND"
    assert res.sentential_forms[-1] == ["a", "b"]


def test_epsilon_derivation():
    text = "S -> a S b | ε"
    g = parse_grammar_text(text)

    res = find_derivation(g, "", mode="LEFTMOST")
    assert res.success
    assert res.status == "FOUND"
    assert res.sentential_forms[-1] == []


def test_invalid_target_derivation():
    text = "S -> a S b | ε"
    g = parse_grammar_text(text)

    # "aab" cannot be derived
    res = find_derivation(g, "aab", mode="LEFTMOST")
    assert not res.success
    assert res.status == "NOT_FOUND"
