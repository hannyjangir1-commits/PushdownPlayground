"""Predefined, mathematically verified sample grammars and Pushdown Automata.

Used across Dashboard, Grammar Editor, PDA Simulator, and Batch Testing.
"""

from typing import List, Dict, Any
from .grammar_parser import parse_grammar_text
from .pda_model import PDA, PDATransition


SAMPLE_GRAMMARS = [
    {
        "id": "sample-anbn",
        "name": "Equal a's and b's (aⁿbⁿ)",
        "language": "L = {aⁿbⁿ | n ≥ 0}",
        "description": "Standard context-free language requiring equal counts of a and b in order.",
        "raw_text": "S -> a S b | ε",
        "start_symbol": "S",
        "test_strings": [
            {"input": "", "expected": True},
            {"input": "ab", "expected": True},
            {"input": "aabb", "expected": True},
            {"input": "aaabbb", "expected": True},
            {"input": "aab", "expected": False},
            {"input": "abb", "expected": False},
            {"input": "ba", "expected": False},
        ]
    },
    {
        "id": "sample-parens",
        "name": "Balanced Parentheses",
        "language": "Dyck language of well-nested parentheses",
        "description": "Balanced parenthesis strings including empty string and nested structures.",
        "raw_text": "S -> S S | ( S ) | ε",
        "start_symbol": "S",
        "test_strings": [
            {"input": "", "expected": True},
            {"input": "()", "expected": True},
            {"input": "(())", "expected": True},
            {"input": "()()", "expected": True},
            {"input": "(()())", "expected": True},
            {"input": "(", "expected": False},
            {"input": ")", "expected": False},
            {"input": ")(", "expected": False},
            {"input": "(()", "expected": False},
        ]
    },
    {
        "id": "sample-expr",
        "name": "Arithmetic Expressions",
        "language": "Expressions with +, *, parentheses, and 'id'",
        "description": "Classic compiler construction grammar illustrating operator precedence.",
        "raw_text": (
            "E -> E + T | T\n"
            "T -> T * F | F\n"
            "F -> ( E ) | id"
        ),
        "start_symbol": "E",
        "test_strings": [
            {"input": "id", "expected": True},
            {"input": "id + id", "expected": True},
            {"input": "id * id", "expected": True},
            {"input": "( id + id ) * id", "expected": True},
            {"input": "id +", "expected": False},
            {"input": "+ id", "expected": False},
        ]
    },
    {
        "id": "sample-simple",
        "name": "Prefix Matching Strings",
        "language": "L = {aⁿ, bᵐ | n, m ≥ 1}",
        "description": "Simple grammar with disjoint branches for a's and b's.",
        "raw_text": (
            "S -> a A | b B\n"
            "A -> a A | a\n"
            "B -> b B | b"
        ),
        "start_symbol": "S",
        "test_strings": [
            {"input": "a", "expected": True},
            {"input": "aaa", "expected": True},
            {"input": "b", "expected": True},
            {"input": "bbb", "expected": True},
            {"input": "ab", "expected": False},
            {"input": "", "expected": False},
        ]
    },
    {
        "id": "sample-cnf-ready",
        "name": "CNF-Ready Grammar",
        "language": "Chomsky Normal Form example",
        "description": "Pre-formatted Chomsky Normal Form grammar ready for instant CYK membership testing.",
        "raw_text": (
            "S -> A B | B C\n"
            "A -> B A | a\n"
            "B -> C C | b\n"
            "C -> A B | a"
        ),
        "start_symbol": "S",
        "test_strings": [
            {"input": "ba", "expected": True},
            {"input": "ab", "expected": True},
            {"input": "bba", "expected": False},
            {"input": "a", "expected": False},
        ]
    }
]


def get_sample_pda_anbn() -> PDA:
    """PDA for L = {aⁿbⁿ | n ≥ 0}."""
    transitions = [
        # In state q0 with Z0 on stack: on ε, accept if input is empty
        PDATransition(from_state="q0", input_symbol="", pop_symbol="Z0", to_state="q2", push_symbols=("Z0",)),
        # In state q0: on 'a' and Z0, push A on top of Z0 -> AZ0
        PDATransition(from_state="q0", input_symbol="a", pop_symbol="Z0", to_state="q0", push_symbols=("A", "Z0")),
        # In state q0: on 'a' and A, push another A on top -> AA
        PDATransition(from_state="q0", input_symbol="a", pop_symbol="A", to_state="q0", push_symbols=("A", "A")),
        # In state q0: on 'b' and A, pop A and move to matching state q1
        PDATransition(from_state="q0", input_symbol="b", pop_symbol="A", to_state="q1", push_symbols=()),
        # In state q1: on 'b' and A, pop A
        PDATransition(from_state="q1", input_symbol="b", pop_symbol="A", to_state="q1", push_symbols=()),
        # In state q1: on ε and Z0, all a's and b's matched, move to accepting state q2
        PDATransition(from_state="q1", input_symbol="", pop_symbol="Z0", to_state="q2", push_symbols=("Z0",)),
    ]
    return PDA(
        states={"q0", "q1", "q2"},
        input_alphabet={"a", "b"},
        stack_alphabet={"Z0", "A"},
        transitions=transitions,
        initial_state="q0",
        initial_stack_symbol="Z0",
        accepting_states={"q2"},
        acceptance_mode="FINAL_STATE",
        pda_id="pda-anbn",
        name="PDA for aⁿbⁿ",
        description="Pushes 'A' for every 'a' in q0, pops 'A' for every 'b' in q1, transitions to q2 when stack returns to Z0.",
    )


def get_sample_pda_parens() -> PDA:
    """PDA for balanced parentheses (acceptance by empty stack)."""
    transitions = [
        # On '(', push '(' onto stack
        PDATransition(from_state="q0", input_symbol="(", pop_symbol="Z0", to_state="q0", push_symbols=("(", "Z0")),
        PDATransition(from_state="q0", input_symbol="(", pop_symbol="(", to_state="q0", push_symbols=("(", "(")),
        # On ')', pop '(' from stack
        PDATransition(from_state="q0", input_symbol=")", pop_symbol="(", to_state="q0", push_symbols=()),
        # On ε with Z0, pop Z0 to empty stack and accept
        PDATransition(from_state="q0", input_symbol="", pop_symbol="Z0", to_state="q0", push_symbols=()),
    ]
    return PDA(
        states={"q0"},
        input_alphabet={"(", ")"},
        stack_alphabet={"Z0", "("},
        transitions=transitions,
        initial_state="q0",
        initial_stack_symbol="Z0",
        accepting_states=set(),
        acceptance_mode="EMPTY_STACK",
        pda_id="pda-parens",
        name="PDA for Balanced Parentheses",
        description="Pushes '(' on open parenthesis, pops on closing parenthesis. Accepts when stack is empty.",
    )


SAMPLE_PDAS = [
    {
        "id": "pda-anbn",
        "name": "PDA for aⁿbⁿ",
        "pda": get_sample_pda_anbn(),
        "test_strings": [
            {"input": "", "expected": True},
            {"input": "ab", "expected": True},
            {"input": "aabb", "expected": True},
            {"input": "aaabbb", "expected": True},
            {"input": "aab", "expected": False},
            {"input": "abb", "expected": False},
            {"input": "ba", "expected": False},
            {"input": "abab", "expected": False},
        ]
    },
    {
        "id": "pda-parens",
        "name": "PDA for Balanced Parentheses",
        "pda": get_sample_pda_parens(),
        "test_strings": [
            {"input": "", "expected": True},
            {"input": "()", "expected": True},
            {"input": "(())", "expected": True},
            {"input": "()()", "expected": True},
            {"input": "(", "expected": False},
            {"input": ")", "expected": False},
            {"input": ")(", "expected": False},
        ]
    }
]
