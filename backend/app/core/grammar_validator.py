"""Grammar validation and analysis engine.

Computes:
- Nullable non-terminals (fixed-point iteration)
- Generating symbols
- Reachable symbols
- Unit productions
- Duplicate productions
- Structural warnings & fatal errors
"""

from __future__ import annotations
from dataclasses import dataclass, field
from typing import Set, List, Dict, Any, Tuple
from .grammar_model import Grammar, Production


@dataclass
class GrammarAnalysisResult:
    is_valid: bool
    errors: List[str] = field(default_factory=list)
    warnings: List[str] = field(default_factory=list)
    nullable_symbols: Set[str] = field(default_factory=set)
    generating_symbols: Set[str] = field(default_factory=set)
    non_generating_symbols: Set[str] = field(default_factory=set)
    reachable_symbols: Set[str] = field(default_factory=set)
    unreachable_symbols: Set[str] = field(default_factory=set)
    unit_productions: List[Tuple[str, str]] = field(default_factory=list)
    epsilon_productions: List[str] = field(default_factory=list)
    stats: Dict[str, Any] = field(default_factory=dict)

    def to_dict(self) -> Dict[str, Any]:
        return {
            "is_valid": self.is_valid,
            "errors": self.errors,
            "warnings": self.warnings,
            "nullable_symbols": sorted(list(self.nullable_symbols)),
            "generating_symbols": sorted(list(self.generating_symbols)),
            "non_generating_symbols": sorted(list(self.non_generating_symbols)),
            "reachable_symbols": sorted(list(self.reachable_symbols)),
            "unreachable_symbols": sorted(list(self.unreachable_symbols)),
            "unit_productions": [{"lhs": u[0], "rhs": u[1]} for u in self.unit_productions],
            "epsilon_productions": self.epsilon_productions,
            "stats": self.stats,
        }


def compute_nullable_symbols(grammar: Grammar) -> Set[str]:
    """Compute the set of nullable non-terminals using fixed-point iteration."""
    nullable: Set[str] = set()

    # Base: A -> ε
    for p in grammar.productions:
        if p.is_epsilon:
            nullable.add(p.lhs)

    # Iteration: A -> Y1 ... Yk where all Yi are nullable
    changed = True
    while changed:
        changed = False
        for p in grammar.productions:
            if p.lhs not in nullable and not p.is_epsilon:
                if all(sym in nullable for sym in p.rhs):
                    nullable.add(p.lhs)
                    changed = True

    return nullable


def compute_generating_symbols(grammar: Grammar) -> Set[str]:
    """Compute the set of generating symbols (can derive a string of terminals)."""
    generating: Set[str] = set(grammar.terminals)

    changed = True
    while changed:
        changed = False
        for p in grammar.productions:
            if p.lhs not in generating:
                # If production is A -> ε or all symbols on RHS are in generating set
                if p.is_epsilon or all(sym in generating for sym in p.rhs):
                    generating.add(p.lhs)
                    changed = True

    return generating


def compute_reachable_symbols(grammar: Grammar) -> Set[str]:
    """Compute the set of reachable symbols starting from start symbol."""
    if grammar.start_symbol not in grammar.non_terminals:
        return set()

    reachable: Set[str] = {grammar.start_symbol}
    changed = True
    while changed:
        changed = False
        for p in grammar.productions:
            if p.lhs in reachable:
                for sym in p.rhs:
                    if sym not in reachable:
                        reachable.add(sym)
                        changed = True

    return reachable


def validate_and_analyze_grammar(grammar: Grammar) -> GrammarAnalysisResult:
    """Perform thorough validation and structural analysis of a CFG."""
    errors: List[str] = []
    warnings: List[str] = []

    # 1. Start symbol check
    if not grammar.start_symbol:
        errors.append("The start symbol is not specified.")
    elif grammar.start_symbol not in grammar.non_terminals:
        errors.append(f"Start symbol '{grammar.start_symbol}' is not defined as a non-terminal.")

    # 2. Check for empty productions list
    if not grammar.productions:
        errors.append("The grammar has no production rules.")

    # 3. Disjoint check between V and Σ
    overlap = grammar.non_terminals.intersection(grammar.terminals)
    if overlap:
        errors.append(f"Symbols cannot be both terminal and non-terminal: {sorted(list(overlap))}")

    # 4. Check that every production LHS is in non_terminals
    for p in grammar.productions:
        if p.lhs not in grammar.non_terminals:
            errors.append(f"Production left-hand side '{p.lhs}' is not in non-terminals set.")

    # 5. Check duplicate productions
    seen_prods: Set[Tuple[str, Tuple[str, ...]]] = set()
    duplicates: List[str] = []
    for p in grammar.productions:
        sig = (p.lhs, p.rhs)
        if sig in seen_prods:
            duplicates.append(p.to_string())
        else:
            seen_prods.add(sig)
    if duplicates:
        warnings.append(f"Duplicate production rules detected: {', '.join(duplicates)}")

    # 6. Nullable computation
    nullable = compute_nullable_symbols(grammar)

    # 7. Unit productions check (A -> B where B is a non-terminal)
    unit_prods: List[Tuple[str, str]] = []
    for p in grammar.productions:
        if len(p.rhs) == 1 and p.rhs[0] in grammar.non_terminals:
            unit_prods.append((p.lhs, p.rhs[0]))
    if unit_prods:
        warnings.append(f"Grammar contains {len(unit_prods)} unit production(s).")

    # 8. Epsilon productions check
    epsilon_prods = [p.to_string() for p in grammar.productions if p.is_epsilon]

    # 9. Generating symbols computation
    generating = compute_generating_symbols(grammar)
    non_generating = grammar.non_terminals - generating
    if non_generating:
        warnings.append(
            f"Non-generating symbols found (cannot derive terminal strings): {sorted(list(non_generating))}"
        )

    # 10. Reachable symbols computation
    reachable = compute_reachable_symbols(grammar)
    unreachable_nt = grammar.non_terminals - reachable
    unreachable_t = grammar.terminals - reachable
    all_unreachable = unreachable_nt.union(unreachable_t)
    if all_unreachable:
        warnings.append(
            f"Unreachable symbols from start symbol '{grammar.start_symbol}': {sorted(list(all_unreachable))}"
        )

    # 11. Can start symbol derive anything?
    if grammar.start_symbol in non_generating:
        warnings.append(f"Start symbol '{grammar.start_symbol}' is non-generating; the language is empty.")

    stats = {
        "non_terminal_count": len(grammar.non_terminals),
        "terminal_count": len(grammar.terminals),
        "production_count": len(grammar.productions),
        "has_epsilon": len(epsilon_prods) > 0,
        "has_unit": len(unit_prods) > 0,
        "is_start_nullable": grammar.start_symbol in nullable,
    }

    is_valid = len(errors) == 0

    return GrammarAnalysisResult(
        is_valid=is_valid,
        errors=errors,
        warnings=warnings,
        nullable_symbols=nullable,
        generating_symbols=generating,
        non_generating_symbols=non_generating,
        reachable_symbols=all_unreachable,
        unreachable_symbols=all_unreachable,
        unit_productions=unit_prods,
        epsilon_productions=epsilon_prods,
        stats=stats,
    )
