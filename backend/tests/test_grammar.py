"""Unit tests for CFG model, parser, and validator."""

import pytest
from app.core.grammar_parser import parse_grammar_text, GrammarParseError
from app.core.grammar_validator import (
    validate_and_analyze_grammar,
    compute_nullable_symbols,
    compute_generating_symbols,
    compute_reachable_symbols,
)


def test_valid_grammar_parsing():
    text = """
    S -> a S b | ε
    A -> a A | a
    """
    g = parse_grammar_text(text)
    assert g.start_symbol == "S"
    assert "S" in g.non_terminals
    assert "A" in g.non_terminals
    assert "a" in g.terminals
    assert "b" in g.terminals
    # 2 productions for S (aSb and ε), 2 for A (aA and a) -> 4 total
    assert len(g.productions) == 4


def test_epsilon_aliases():
    for alias in ["ε", "epsilon", "eps", "λ"]:
        text = f"S -> a | {alias}"
        g = parse_grammar_text(text)
        eps_prods = [p for p in g.productions if p.is_epsilon]
        assert len(eps_prods) == 1


def test_invalid_syntax_missing_arrow():
    text = "S a b c"
    with pytest.raises(GrammarParseError):
        parse_grammar_text(text)


def test_multi_char_tokens():
    text = """
    E -> E + T | T
    T -> id
    """
    g = parse_grammar_text(text)
    assert "E" in g.non_terminals
    assert "T" in g.non_terminals
    assert "+" in g.terminals
    assert "id" in g.terminals


def test_nullable_fixed_point():
    # S -> A B
    # A -> ε | a
    # B -> ε
    text = """
    S -> A B
    A -> a | ε
    B -> ε
    """
    g = parse_grammar_text(text)
    nullable = compute_nullable_symbols(g)
    assert "B" in nullable
    assert "A" in nullable
    assert "S" in nullable  # Because both A and B are nullable


def test_generating_and_unreachable_symbols():
    text = """
    S -> A
    A -> a
    B -> B b
    C -> c
    """
    g = parse_grammar_text(text)
    analysis = validate_and_analyze_grammar(g)
    assert analysis.is_valid
    # B never derives a string of terminals
    assert "B" in analysis.non_generating_symbols
    # C is never reachable from S
    assert "C" in analysis.unreachable_symbols
