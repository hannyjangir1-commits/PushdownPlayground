"""Unit tests for CYK membership testing algorithm."""

import pytest
from app.core.grammar_parser import parse_grammar_text
from app.core.cnf_converter import convert_to_cnf
from app.core.cyk_parser import run_cyk


def test_cyk_cnf_ready_grammar():
    text = """
    S -> A B | B C
    A -> B A | a
    B -> C C | b
    C -> A B | a
    """
    g = parse_grammar_text(text)
    # Target "ba" should be accepted
    res_ba = run_cyk(g, "ba")
    assert res_ba.accepted
    assert len(res_ba.table) == 2

    # Target "ab" should be accepted
    res_ab = run_cyk(g, "ab")
    assert res_ab.accepted

    # Target "bba" should be rejected
    res_bba = run_cyk(g, "bba")
    assert not res_bba.accepted


def test_cyk_after_cnf_conversion_anbn():
    text = "S -> a S b | a b"
    g = parse_grammar_text(text)
    cnf_res = convert_to_cnf(g)
    assert cnf_res.success
    cnf_g = cnf_res.cnf_grammar

    # Accepted test strings
    assert run_cyk(cnf_g, "ab").accepted
    assert run_cyk(cnf_g, "aabb").accepted
    assert run_cyk(cnf_g, "aaabbb").accepted

    # Rejected test strings
    assert not run_cyk(cnf_g, "aab").accepted
    assert not run_cyk(cnf_g, "abb").accepted
    assert not run_cyk(cnf_g, "ba").accepted
