"""Cocke-Younger-Kasami (CYK) Parsing and Membership Testing Engine.

Implements the dynamic programming CYK algorithm for grammars in Chomsky Normal Form (CNF).
Constructs:
- Triangular table T[length][start_index]
- Step-by-step execution playback
- Cell split records with productions used
- Backpointer tree reconstruction for parse-tree visualization.
"""

from __future__ import annotations
from dataclasses import dataclass, field
from typing import List, Tuple, Set, Dict, Any, Optional
from collections import defaultdict
from .grammar_model import Grammar, Production
from .cnf_converter import validate_cnf_grammar


@dataclass
class CYKSplitRecord:
    split_index: int
    left_cell: Tuple[int, int]   # (length, start)
    right_cell: Tuple[int, int]  # (length, start)
    left_symbol: str
    right_symbol: str
    resulting_symbol: str
    rule_used: str

    def to_dict(self) -> Dict[str, Any]:
        return {
            "split_index": self.split_index,
            "left_cell": list(self.left_cell),
            "right_cell": list(self.right_cell),
            "left_symbol": self.left_symbol,
            "right_symbol": self.right_symbol,
            "resulting_symbol": self.resulting_symbol,
            "rule_used": self.rule_used,
        }


@dataclass
class CYKCell:
    length: int
    start_index: int
    substring: str
    symbols: List[str] = field(default_factory=list)
    splits: List[CYKSplitRecord] = field(default_factory=list)
    is_start_present: bool = False
    is_final_cell: bool = False

    def to_dict(self) -> Dict[str, Any]:
        return {
            "length": self.length,
            "start_index": self.start_index,
            "substring": self.substring,
            "symbols": sorted(self.symbols),
            "splits": [s.to_dict() for s in self.splits],
            "is_start_present": self.is_start_present,
            "is_final_cell": self.is_final_cell,
        }


@dataclass
class CYKStepTrace:
    step_number: int
    cell_coords: Tuple[int, int]  # (length, start_index)
    substring: str
    examined_split: Optional[int]
    left_symbols: List[str]
    right_symbols: List[str]
    added_symbols: List[str]
    explanation: str

    def to_dict(self) -> Dict[str, Any]:
        return {
            "step_number": self.step_number,
            "cell_coords": list(self.cell_coords),
            "substring": self.substring,
            "examined_split": self.examined_split,
            "left_symbols": self.left_symbols,
            "right_symbols": self.right_symbols,
            "added_symbols": self.added_symbols,
            "explanation": self.explanation,
        }


@dataclass
class CYKResult:
    accepted: bool
    input_string: str
    tokens: List[str]
    table: List[List[CYKCell]]  # table[length-1][start_index]
    start_symbol: str
    steps: List[CYKStepTrace] = field(default_factory=list)
    parse_trees: List[Dict[str, Any]] = field(default_factory=list)
    message: str = ""

    def to_dict(self) -> Dict[str, Any]:
        return {
            "accepted": self.accepted,
            "input_string": self.input_string,
            "tokens": self.tokens,
            "table": [[cell.to_dict() for cell in row] for row in self.table],
            "start_symbol": self.start_symbol,
            "steps": [s.to_dict() for s in self.steps],
            "parse_trees": self.parse_trees,
            "message": self.message,
        }


def run_cyk(grammar: Grammar, input_string: str, max_parse_trees: int = 3) -> CYKResult:
    """Execute CYK dynamic programming algorithm on input string.
    
    The grammar must be in validated CNF.
    """
    is_cnf, cnf_errors = validate_cnf_grammar(grammar)
    if not is_cnf:
        raise ValueError(f"Grammar is not in valid CNF: {'; '.join(cnf_errors)}")

    start_sym = grammar.start_symbol

    # Precompute fast lookups
    # terminal_map: terminal -> list of LHS
    terminal_map: Dict[str, List[str]] = defaultdict(list)
    # pair_map: (B, C) -> list of LHS
    pair_map: Dict[Tuple[str, str], List[str]] = defaultdict(list)

    has_epsilon_rule = False
    for p in grammar.productions:
        if p.is_epsilon and p.lhs == start_sym:
            has_epsilon_rule = True
        elif len(p.rhs) == 1 and p.rhs[0] in grammar.terminals:
            terminal_map[p.rhs[0]].append(p.lhs)
        elif len(p.rhs) == 2:
            pair_map[(p.rhs[0], p.rhs[1])].append(p.lhs)

    # Empty string case
    if input_string == "" or input_string in {"ε", "epsilon"}:
        accepted = has_epsilon_rule
        msg = (
            f"The empty string ε is ACCEPTED because the grammar contains '{start_sym} -> ε'."
            if accepted else
            f"The empty string ε is REJECTED because the grammar has no rule '{start_sym} -> ε'."
        )
        return CYKResult(
            accepted=accepted,
            input_string=input_string,
            tokens=[],
            table=[],
            start_symbol=start_sym,
            message=msg,
        )

    # Tokenize input string
    if " " in input_string:
        tokens = input_string.split()
    else:
        tokens = list(input_string)

    n = len(tokens)
    # Check that all tokens belong to terminals
    for tok in tokens:
        if tok not in grammar.terminals:
            return CYKResult(
                accepted=False,
                input_string=input_string,
                tokens=tokens,
                table=[],
                start_symbol=start_sym,
                message=f"Input symbol '{tok}' is not in the grammar's terminal alphabet Σ.",
            )

    # Initialize triangular table: table[l - 1] has n - l + 1 cells for length l = 1..n
    table: List[List[CYKCell]] = []
    for l in range(1, n + 1):
        row: List[CYKCell] = []
        for s in range(n - l + 1):
            sub = " ".join(tokens[s : s + l]) if " " in input_string else "".join(tokens[s : s + l])
            row.append(CYKCell(
                length=l,
                start_index=s,
                substring=sub,
                is_final_cell=(l == n and s == 0)
            ))
        table.append(row)

    steps: List[CYKStepTrace] = []
    step_num = 1

    # Base Level: length l = 1
    for s in range(n):
        tok = tokens[s]
        producing_vars = set(terminal_map.get(tok, []))
        cell = table[0][s]
        cell.symbols = list(producing_vars)
        cell.is_start_present = start_sym in producing_vars

        exp = (
            f"Terminal '{tok}' is derived by: {', '.join(sorted(producing_vars))}"
            if producing_vars else
            f"No unit rules generate terminal '{tok}'."
        )
        steps.append(CYKStepTrace(
            step_number=step_num,
            cell_coords=(1, s),
            substring=tok,
            examined_split=None,
            left_symbols=[tok],
            right_symbols=[],
            added_symbols=sorted(list(producing_vars)),
            explanation=exp,
        ))
        step_num += 1

    # Dynamic Programming: length l = 2 .. n
    for l in range(2, n + 1):
        for s in range(n - l + 1):
            curr_cell = table[l - 1][s]
            added_to_cell: Set[str] = set()

            for k in range(1, l):
                # Left subproblem: length k, start s
                left_cell = table[k - 1][s]
                # Right subproblem: length l - k, start s + k
                right_cell = table[l - k - 1][s + k]

                split_matches: List[Tuple[str, str, str]] = []  # (A, B, C)
                for b in left_cell.symbols:
                    for c in right_cell.symbols:
                        if (b, c) in pair_map:
                            for a in pair_map[(b, c)]:
                                added_to_cell.add(a)
                                split_matches.append((a, b, c))
                                curr_cell.splits.append(CYKSplitRecord(
                                    split_index=k,
                                    left_cell=(k, s),
                                    right_cell=(l - k, s + k),
                                    left_symbol=b,
                                    right_symbol=c,
                                    resulting_symbol=a,
                                    rule_used=f"{a} -> {b} {c}",
                                ))

                # Step trace
                left_sub = left_cell.substring
                right_sub = right_cell.substring
                if split_matches:
                    rules_str = ", ".join(f"{a} -> {b} {c}" for a, b, c in split_matches)
                    exp = f"Split '{left_sub} | {right_sub}': Matched {rules_str}. Added {', '.join(sorted({a for a, _, _ in split_matches}))} to cell."
                else:
                    exp = f"Split '{left_sub} | {right_sub}': No binary productions match ({', '.join(left_cell.symbols) or '∅'}) × ({', '.join(right_cell.symbols) or '∅'})."

                steps.append(CYKStepTrace(
                    step_number=step_num,
                    cell_coords=(l, s),
                    substring=curr_cell.substring,
                    examined_split=k,
                    left_symbols=left_cell.symbols,
                    right_symbols=right_cell.symbols,
                    added_symbols=sorted(list({a for a, _, _ in split_matches})),
                    explanation=exp,
                ))
                step_num += 1

            curr_cell.symbols = sorted(list(added_to_cell))
            curr_cell.is_start_present = start_sym in added_to_cell

    # Final decision at top cell: table[n - 1][0]
    top_cell = table[n - 1][0]
    accepted = start_sym in top_cell.symbols

    # Reconstruct parse trees from backpointers
    def build_tree(sym: str, l: int, s: int, depth: int = 0) -> Optional[Dict[str, Any]]:
        if depth > 40:
            return None
        cell = table[l - 1][s]
        if l == 1:
            tok = tokens[s]
            return {
                "symbol": sym,
                "type": "non-terminal",
                "children": [{
                    "symbol": tok,
                    "type": "terminal",
                    "children": [],
                }]
            }
        # Find a split that generates sym
        for split in cell.splits:
            if split.resulting_symbol == sym:
                k = split.split_index
                left_child = build_tree(split.left_symbol, k, s, depth + 1)
                right_child = build_tree(split.right_symbol, l - k, s + k, depth + 1)
                if left_child and right_child:
                    return {
                        "symbol": sym,
                        "type": "non-terminal",
                        "production": split.rule_used,
                        "children": [left_child, right_child]
                    }
        return None

    trees: List[Dict[str, Any]] = []
    if accepted:
        t = build_tree(start_sym, n, 0)
        if t:
            trees.append(t)

    msg = (
        f"String '{input_string}' is ACCEPTED: Start symbol '{start_sym}' is in cell T[{n}, 1] covering the entire string."
        if accepted else
        f"String '{input_string}' is REJECTED: Start symbol '{start_sym}' is NOT present in cell T[{n}, 1] covering the entire string."
    )

    return CYKResult(
        accepted=accepted,
        input_string=input_string,
        tokens=tokens,
        table=table,
        start_symbol=start_sym,
        steps=steps,
        parse_trees=trees,
        message=msg,
    )
