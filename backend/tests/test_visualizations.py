"""Unit tests for parse tree and automata graph generators."""

import pytest
from app.core.grammar_parser import parse_grammar_text
from app.core.derivation_engine import find_derivation
from app.core.parse_tree import build_parse_tree_from_derivation, flatten_tree_to_graph
from app.core.automata_graph import generate_pda_graph
from app.core.sample_data import get_sample_pda_anbn


def test_parse_tree_construction():
    text = "S -> a S b | ε"
    g = parse_grammar_text(text)
    res = find_derivation(g, "ab", mode="LEFTMOST")
    assert res.success

    tree = build_parse_tree_from_derivation(g.start_symbol, res.steps, g.terminals)
    assert tree.symbol == "S"
    assert len(tree.children) > 0

    graph = flatten_tree_to_graph(tree)
    assert "nodes" in graph
    assert "edges" in graph
    assert len(graph["nodes"]) >= 3


def test_automata_graph_generation():
    pda = get_sample_pda_anbn()
    graph = generate_pda_graph(pda)
    assert len(graph["nodes"]) == 3
    assert len(graph["edges"]) > 0
    # Check that initial state is flagged
    init_nodes = [n for n in graph["nodes"] if n["is_initial"]]
    assert len(init_nodes) == 1
    assert init_nodes[0]["id"] == "q0"
    # Check accepting state
    acc_nodes = [n for n in graph["nodes"] if n["is_accepting"]]
    assert len(acc_nodes) == 1
    assert acc_nodes[0]["id"] == "q2"
