"""Unit tests for Greibach Normal Form (GNF) converter and validator."""

import pytest
from app.core.grammar_parser import parse_grammar_text
from app.core.gnf_converter import convert_to_gnf, validate_gnf_grammar


def test_gnf_conversion_simple():
    text = """
    S -> a A | b B
    A -> a A | a
    B -> b B | b
    """
    g = parse_grammar_text(text)
    res = convert_to_gnf(g)
    assert res.success
    assert res.is_valid_gnf
    is_valid, errors = validate_gnf_grammar(res.gnf_grammar)
    assert is_valid, f"GNF errors: {errors}"


def test_gnf_conversion_left_recursion():
    text = """
    S -> S a | b
    """
    g = parse_grammar_text(text)
    res = convert_to_gnf(g)
    assert res.success
    assert res.is_valid_gnf
    is_valid, errors = validate_gnf_grammar(res.gnf_grammar)
    assert is_valid, f"GNF errors: {errors}"


def test_gnf_validator_rejects_non_gnf():
    # Production starting with non-terminal is not GNF
    text = "S -> A B\nA -> a\nB -> b"
    g = parse_grammar_text(text)
    is_valid, errors = validate_gnf_grammar(g)
    assert not is_valid
