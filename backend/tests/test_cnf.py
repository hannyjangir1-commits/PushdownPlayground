"""Unit tests for Chomsky Normal Form (CNF) converter and validator."""

import pytest
from app.core.grammar_parser import parse_grammar_text
from app.core.cnf_converter import convert_to_cnf, validate_cnf_grammar


def test_cnf_conversion_sample_anbn():
    text = "S -> a S b | ε"
    g = parse_grammar_text(text)
    res = convert_to_cnf(g)
    assert res.success
    assert res.is_valid_cnf
    # Verify with independent validator
    is_valid, errors = validate_cnf_grammar(res.cnf_grammar)
    assert is_valid, f"CNF validator reported errors: {errors}"


def test_cnf_conversion_unit_and_long_rhs():
    text = """
    S -> A B C
    A -> a
    B -> b
    C -> c
    """
    g = parse_grammar_text(text)
    res = convert_to_cnf(g)
    assert res.success
    assert res.is_valid_cnf
    # Verify that all productions in result are length 1 terminal or length 2 non-terminals
    for p in res.cnf_grammar.productions:
        if len(p.rhs) == 1:
            assert p.rhs[0] in res.cnf_grammar.terminals
        elif len(p.rhs) == 2:
            assert p.rhs[0] in res.cnf_grammar.non_terminals
            assert p.rhs[1] in res.cnf_grammar.non_terminals
        else:
            pytest.fail(f"Invalid production in CNF: {p.to_string()}")


def test_cnf_validator_rejects_non_cnf():
    # Production with 3 non-terminals is not CNF
    text = "S -> A B C\nA -> a\nB -> b\nC -> c"
    g = parse_grammar_text(text)
    is_valid, errors = validate_cnf_grammar(g)
    assert not is_valid
    assert len(errors) > 0
