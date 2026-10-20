"""Chomsky Normal Form (CNF) Conversion Engine and Independent Validator.

A CFG is in CNF if every production is of the form:
  A -> B C   (two non-terminals)
  A -> a     (single terminal)
Optionally S0 -> ε if ε ∈ L(G) and S0 does not appear on any RHS.

Stages:
1. Introduce fresh start symbol S0 if needed.
2. Find nullable non-terminals.
3. Eliminate ε-productions (except possibly S0 -> ε).
4. Eliminate unit productions (A -> B).
5. Eliminate useless (non-generating and unreachable) symbols.
6. Replace terminals in composite productions (length >= 2).
7. Break long productions (length > 2) into binary chains.
"""

from __future__ import annotations
from dataclasses import dataclass, field
from typing import List, Tuple, Set, Dict, Any, Optional
import itertools

from .grammar_model import Grammar, Production
from .grammar_validator import (
    compute_nullable_symbols,
    compute_generating_symbols,
    compute_reachable_symbols
)


@dataclass
class CNFStageTrace:
    stage_number: int
    stage_name: str
    description: str
    grammar: Grammar
    changes_made: List[str] = field(default_factory=list)

    def to_dict(self) -> Dict[str, Any]:
        return {
            "stage_number": self.stage_number,
            "stage_name": self.stage_name,
            "description": self.description,
            "grammar": self.grammar.to_dict(),
            "changes_made": self.changes_made,
        }


@dataclass
class CNFConversionResult:
    success: bool
    original_grammar: Grammar
    cnf_grammar: Grammar
    is_valid_cnf: bool
    stages: List[CNFStageTrace] = field(default_factory=list)
    validation_errors: List[str] = field(default_factory=list)
    message: str = ""

    def to_dict(self) -> Dict[str, Any]:
        return {
            "success": self.success,
            "original_grammar": self.original_grammar.to_dict(),
            "cnf_grammar": self.cnf_grammar.to_dict(),
            "is_valid_cnf": self.is_valid_cnf,
            "stages": [s.to_dict() for s in self.stages],
            "validation_errors": self.validation_errors,
            "message": self.message,
        }


def validate_cnf_grammar(grammar: Grammar) -> Tuple[bool, List[str]]:
    """Strict independent validator for Chomsky Normal Form.
    
    Returns (is_valid, list_of_violations).
    """
    errors: List[str] = []
    start_sym = grammar.start_symbol

    # Check if start symbol appears on any RHS
    start_on_rhs = any(start_sym in p.rhs for p in grammar.productions)

    for p in grammar.productions:
        # Case 1: Epsilon
        if p.is_epsilon:
            if p.lhs != start_sym:
                errors.append(f"Illegal epsilon production: {p.to_string()} (only start symbol may derive ε).")
            elif start_on_rhs:
                errors.append(f"Start symbol '{start_sym}' derives ε but appears on the right-hand side of a production.")
        # Case 2: Single terminal A -> a
        elif len(p.rhs) == 1:
            sym = p.rhs[0]
            if sym not in grammar.terminals:
                errors.append(f"Invalid unit production in CNF: {p.to_string()} (RHS '{sym}' must be a terminal).")
        # Case 3: Exactly two non-terminals A -> B C
        elif len(p.rhs) == 2:
            b, c = p.rhs[0], p.rhs[1]
            if b not in grammar.non_terminals or c not in grammar.non_terminals:
                errors.append(f"Invalid binary production in CNF: {p.to_string()} (RHS must consist of two non-terminals).")
        # Case 4: Any length > 2 or other
        else:
            errors.append(f"Production RHS length is {len(p.rhs)} in {p.to_string()} (CNF only allows 1 terminal or 2 non-terminals).")

    return (len(errors) == 0, errors)


def _fresh_symbol(base: str, existing_symbols: Set[str]) -> str:
    """Generate a unique fresh symbol name not in existing_symbols."""
    if base not in existing_symbols:
        return base
    counter = 1
    while f"{base}_{counter}" in existing_symbols:
        counter += 1
    return f"{base}_{counter}"


def convert_to_cnf(grammar: Grammar) -> CNFConversionResult:
    """Convert an arbitrary Context-Free Grammar into Chomsky Normal Form."""
    stages: List[CNFStageTrace] = []
    current_g = grammar.copy()
    all_known_symbols = current_g.non_terminals.union(current_g.terminals)

    # Initial check
    initial_nullable = compute_nullable_symbols(current_g)
    generates_epsilon = current_g.start_symbol in initial_nullable

    # ----------------------------------------------------
    # Stage 1: Introduce New Start Symbol S0 if needed
    # ----------------------------------------------------
    stage1_changes = []
    start_in_rhs = any(current_g.start_symbol in p.rhs for p in current_g.productions)
    if start_in_rhs or generates_epsilon:
        new_start = _fresh_symbol("S0", all_known_symbols)
        all_known_symbols.add(new_start)
        new_prod = Production(lhs=new_start, rhs=(current_g.start_symbol,))
        current_g.non_terminals.add(new_start)
        current_g.productions.insert(0, new_prod)
        old_start = current_g.start_symbol
        current_g.start_symbol = new_start
        stage1_changes.append(f"Introduced fresh start symbol '{new_start}' with rule '{new_start} -> {old_start}'.")
    else:
        stage1_changes.append(f"Start symbol '{current_g.start_symbol}' does not appear on any RHS; no new start symbol required.")

    stages.append(CNFStageTrace(
        stage_number=1,
        stage_name="Start Symbol Isolation",
        description="Ensure start symbol does not appear on any right-hand side to safely allow ε-derivation if needed.",
        grammar=current_g.copy(),
        changes_made=stage1_changes,
    ))

    # ----------------------------------------------------
    # Stage 2 & 3: Find Nullable Non-terminals and Eliminate Epsilon Productions
    # ----------------------------------------------------
    nullable = compute_nullable_symbols(current_g)
    stage2_changes = [f"Identified nullable non-terminals: {sorted(list(nullable)) if nullable else 'None'}."]

    new_productions_stage3: List[Production] = []
    seen_prods: Set[Tuple[str, Tuple[str, ...]]] = set()

    for p in current_g.productions:
        if p.is_epsilon:
            continue  # Drop existing epsilon productions directly

        # Positions in p.rhs that are nullable
        nullable_positions = [i for i, sym in enumerate(p.rhs) if sym in nullable]

        if not nullable_positions:
            sig = (p.lhs, p.rhs)
            if sig not in seen_prods:
                seen_prods.add(sig)
                new_productions_stage3.append(p)
            continue

        # Generate combinations of omitting nullable symbols
        n_pos = len(nullable_positions)
        for mask in range(1 << n_pos):
            omit_indices = {nullable_positions[j] for j in range(n_pos) if (mask & (1 << j))}
            new_rhs = tuple(sym for i, sym in enumerate(p.rhs) if i not in omit_indices)

            # If all symbols omitted
            if len(new_rhs) == 0:
                # Only allowed if LHS is current start_symbol and grammar generates epsilon
                if p.lhs == current_g.start_symbol and generates_epsilon:
                    sig = (p.lhs, ())
                    if sig not in seen_prods:
                        seen_prods.add(sig)
                        new_productions_stage3.append(Production(lhs=p.lhs, rhs=()))
                        stage2_changes.append(f"Preserved '{p.lhs} -> ε' for the start symbol.")
                continue

            sig = (p.lhs, new_rhs)
            if sig not in seen_prods:
                seen_prods.add(sig)
                new_productions_stage3.append(Production(lhs=p.lhs, rhs=new_rhs))

    # If generates_epsilon and S0 -> ε not yet added
    if generates_epsilon:
        sig = (current_g.start_symbol, ())
        if sig not in seen_prods:
            seen_prods.add(sig)
            new_productions_stage3.append(Production(lhs=current_g.start_symbol, rhs=()))
            stage2_changes.append(f"Added '{current_g.start_symbol} -> ε' to preserve empty string acceptance.")

    current_g.productions = new_productions_stage3
    stage2_changes.append(f"Eliminated ε-productions, expanding combinations. Total rules: {len(current_g.productions)}.")

    stages.append(CNFStageTrace(
        stage_number=2,
        stage_name="Elimination of ε-Productions",
        description="Compute nullable variables and generate non-empty combinations, keeping ε only for S0 if ε ∈ L(G).",
        grammar=current_g.copy(),
        changes_made=stage2_changes,
    ))

    # ----------------------------------------------------
    # Stage 4: Eliminate Unit Productions (A -> B where B ∈ V)
    # ----------------------------------------------------
    stage3_changes = []
    # Compute unit pairs (A, B) such that A =>* B via unit productions
    unit_pairs: Set[Tuple[str, str]] = {(nt, nt) for nt in current_g.non_terminals}

    changed = True
    while changed:
        changed = False
        for p in current_g.productions:
            if len(p.rhs) == 1 and p.rhs[0] in current_g.non_terminals:
                b = p.rhs[0]
                for (a, x) in list(unit_pairs):
                    if x == p.lhs and (a, b) not in unit_pairs:
                        unit_pairs.add((a, b))
                        changed = True

    # Build non-unit productions of each variable
    non_unit_prods_by_lhs: Dict[str, List[Tuple[str, ...]]] = {nt: [] for nt in current_g.non_terminals}
    for p in current_g.productions:
        if not (len(p.rhs) == 1 and p.rhs[0] in current_g.non_terminals):
            non_unit_prods_by_lhs[p.lhs].append(p.rhs)

    new_productions_stage4: List[Production] = []
    seen_prods_stage4: Set[Tuple[str, Tuple[str, ...]]] = set()

    for (a, b) in unit_pairs:
        for rhs in non_unit_prods_by_lhs.get(b, []):
            sig = (a, rhs)
            if sig not in seen_prods_stage4:
                seen_prods_stage4.add(sig)
                new_productions_stage4.append(Production(lhs=a, rhs=rhs))

    current_g.productions = new_productions_stage4
    stage3_changes.append(f"Computed unit pair closures and transferred non-unit rules. Total rules: {len(current_g.productions)}.")

    stages.append(CNFStageTrace(
        stage_number=3,
        stage_name="Elimination of Unit Productions",
        description="Eliminate all productions of the form A -> B by computing reflexive transitive closures.",
        grammar=current_g.copy(),
        changes_made=stage3_changes,
    ))

    # ----------------------------------------------------
    # Stage 5: Eliminate Useless Symbols (Non-generating then Unreachable)
    # ----------------------------------------------------
    stage4_changes = []
    # 5a. Generating
    generating = compute_generating_symbols(current_g)
    # Keep productions where LHS is generating and all RHS symbols are generating
    prods_generating = [
        p for p in current_g.productions
        if p.lhs in generating and all(sym in generating for sym in p.rhs)
    ]
    dropped_non_gen = current_g.non_terminals - generating
    if dropped_non_gen:
        stage4_changes.append(f"Removed non-generating non-terminals: {sorted(list(dropped_non_gen))}.")
    current_g.non_terminals = current_g.non_terminals.intersection(generating)
    current_g.productions = prods_generating

    # 5b. Reachable
    reachable = compute_reachable_symbols(current_g)
    prods_reachable = [
        p for p in current_g.productions
        if p.lhs in reachable and all(sym in reachable for sym in p.rhs)
    ]
    dropped_unreach = current_g.non_terminals - reachable
    if dropped_unreach:
        stage4_changes.append(f"Removed unreachable non-terminals: {sorted(list(dropped_unreach))}.")
    current_g.non_terminals = current_g.non_terminals.intersection(reachable)
    current_g.terminals = current_g.terminals.intersection(reachable)
    current_g.productions = prods_reachable

    stages.append(CNFStageTrace(
        stage_number=4,
        stage_name="Elimination of Useless Symbols",
        description="Prune non-generating variables and subsequently remove variables unreachable from the start symbol.",
        grammar=current_g.copy(),
        changes_made=stage4_changes if stage4_changes else ["No useless symbols found."],
    ))

    # ----------------------------------------------------
    # Stage 6: Replace Terminals in Mixed / Long Productions (len >= 2)
    # ----------------------------------------------------
    stage5_changes = []
    terminal_helpers: Dict[str, str] = {}
    helper_productions: List[Production] = []

    # Map each terminal 'a' that appears in a production of length >= 2 to a helper Ta
    for p in current_g.productions:
        if len(p.rhs) >= 2:
            for sym in p.rhs:
                if sym in current_g.terminals and sym not in terminal_helpers:
                    helper_name = _fresh_symbol(f"T_{sym}", all_known_symbols)
                    all_known_symbols.add(helper_name)
                    terminal_helpers[sym] = helper_name
                    helper_productions.append(Production(lhs=helper_name, rhs=(sym,)))
                    stage5_changes.append(f"Created helper '{helper_name} -> {sym}'.")

    # Replace terminals in length >= 2 productions
    new_productions_stage6: List[Production] = []
    for p in current_g.productions:
        if len(p.rhs) >= 2:
            new_rhs = tuple(terminal_helpers.get(sym, sym) for sym in p.rhs)
            new_productions_stage6.append(Production(lhs=p.lhs, rhs=new_rhs))
        else:
            new_productions_stage6.append(p)

    for h_prod in helper_productions:
        current_g.non_terminals.add(h_prod.lhs)
        new_productions_stage6.append(h_prod)

    current_g.productions = new_productions_stage6
    stages.append(CNFStageTrace(
        stage_number=5,
        stage_name="Replacement of Terminals in Composite Rules",
        description="Introduce non-terminal aliases T_a -> a for terminals appearing in rules of length >= 2.",
        grammar=current_g.copy(),
        changes_made=stage5_changes if stage5_changes else ["No mixed terminal productions found."],
    ))

    # ----------------------------------------------------
    # Stage 7: Binary Decomposition (Productions with length > 2)
    # ----------------------------------------------------
    stage6_changes = []
    final_productions: List[Production] = []

    for p in current_g.productions:
        if len(p.rhs) <= 2:
            final_productions.append(p)
            continue

        # Decompose A -> B1 B2 ... Bm into binary chain
        m = len(p.rhs)
        symbols = p.rhs
        curr_lhs = p.lhs

        for i in range(m - 2):
            new_var = _fresh_symbol(f"X_{curr_lhs}_{i+1}", all_known_symbols)
            all_known_symbols.add(new_var)
            current_g.non_terminals.add(new_var)

            final_productions.append(Production(lhs=curr_lhs, rhs=(symbols[i], new_var)))
            stage6_changes.append(f"Decomposed: {curr_lhs} -> {symbols[i]} {new_var}")
            curr_lhs = new_var

        # Final binary pair: X_{m-2} -> B_{m-1} B_m
        final_productions.append(Production(lhs=curr_lhs, rhs=(symbols[m - 2], symbols[m - 1])))
        stage6_changes.append(f"Final pair: {curr_lhs} -> {symbols[m - 2]} {symbols[m - 1]}")

    current_g.productions = final_productions

    stages.append(CNFStageTrace(
        stage_number=6,
        stage_name="Binary Decomposition of Long Productions",
        description="Convert rules A -> B1 B2 ... Bm (m > 2) into cascades of binary rules.",
        grammar=current_g.copy(),
        changes_made=stage6_changes if stage6_changes else ["No long productions required decomposition."],
    ))

    # ----------------------------------------------------
    # Final Validation
    # ----------------------------------------------------
    is_valid, validation_errors = validate_cnf_grammar(current_g)

    return CNFConversionResult(
        success=is_valid,
        original_grammar=grammar,
        cnf_grammar=current_g,
        is_valid_cnf=is_valid,
        stages=stages,
        validation_errors=validation_errors,
        message="Grammar successfully transformed into Chomsky Normal Form." if is_valid else "Conversion produced invalid CNF.",
    )
