"""Greibach Normal Form (GNF) Conversion Engine and Independent Validator.

A CFG is in GNF if every production is of the form:
  A -> a A1 A2 ... Ak
where 'a' is a single terminal (a ∈ Σ) and each Ai is a non-terminal (Ai ∈ V, k >= 0).
Optionally, S0 -> ε is permitted if ε ∈ L(G) and S0 does not appear on any RHS.

Algorithm:
1. Start from simplified grammar (CNF or simplified CFG without ε/unit rules).
2. Establish strict non-terminal ordering A1, A2, ..., Am.
3. Eliminate productions A_i -> A_j γ with j < i by forward substitution.
4. Eliminate immediate left recursion on A_i by introducing helper variables B_i.
5. Back-substitution: from A_m-1 down to A_1, replace leading non-terminals with terminal-starting productions.
6. Substitute leading non-terminals in B_i helper productions.
7. Ensure all symbols after the leading terminal are non-terminals.
8. Independent GNF validation.
"""

from __future__ import annotations
from dataclasses import dataclass, field
from typing import List, Tuple, Set, Dict, Any, Optional
from .grammar_model import Grammar, Production
from .cnf_converter import convert_to_cnf


@dataclass
class GNFStageTrace:
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
class GNFConversionResult:
    success: bool
    original_grammar: Grammar
    gnf_grammar: Grammar
    is_valid_gnf: bool
    stages: List[GNFStageTrace] = field(default_factory=list)
    validation_errors: List[str] = field(default_factory=list)
    message: str = ""

    def to_dict(self) -> Dict[str, Any]:
        return {
            "success": self.success,
            "original_grammar": self.original_grammar.to_dict(),
            "gnf_grammar": self.gnf_grammar.to_dict(),
            "is_valid_gnf": self.is_valid_gnf,
            "stages": [s.to_dict() for s in self.stages],
            "validation_errors": self.validation_errors,
            "message": self.message,
        }


def validate_gnf_grammar(grammar: Grammar) -> Tuple[bool, List[str]]:
    """Strict independent validator for Greibach Normal Form.
    
    Rule requirements:
    - Every rule must be A -> a A1 A2 ... Ak where a ∈ Σ and each Ai ∈ V (k >= 0).
    - Start symbol S0 -> ε is allowed only if S0 does not appear on any RHS.
    """
    errors: List[str] = []
    start_sym = grammar.start_symbol
    start_on_rhs = any(start_sym in p.rhs for p in grammar.productions)

    for p in grammar.productions:
        if p.is_epsilon:
            if p.lhs != start_sym:
                errors.append(f"Illegal epsilon production in GNF: {p.to_string()} (only start symbol may derive ε).")
            elif start_on_rhs:
                errors.append(f"Start symbol '{start_sym}' derives ε but appears on the RHS of a production.")
            continue

        first_sym = p.rhs[0]
        # First symbol MUST be a terminal
        if first_sym not in grammar.terminals:
            errors.append(f"Production '{p.to_string()}' does not start with a terminal (got '{first_sym}').")

        # All remaining symbols MUST be non-terminals
        for i, sym in enumerate(p.rhs[1:], start=1):
            if sym not in grammar.non_terminals:
                errors.append(f"In '{p.to_string()}', symbol at position {i} ('{sym}') is not a non-terminal.")

    return (len(errors) == 0, errors)


def convert_to_gnf(grammar: Grammar) -> GNFConversionResult:
    """Convert a Context-Free Grammar into Greibach Normal Form."""
    stages: List[GNFStageTrace] = []

    # Check for empty grammar
    if not grammar.productions:
        return GNFConversionResult(
            success=False,
            original_grammar=grammar,
            gnf_grammar=grammar.copy(),
            is_valid_gnf=False,
            message="Cannot convert empty grammar to GNF.",
            validation_errors=["Empty grammar."],
        )

    # Step 0: First convert to CNF to obtain a clean, simplified base
    cnf_res = convert_to_cnf(grammar)
    if not cnf_res.success:
        return GNFConversionResult(
            success=False,
            original_grammar=grammar,
            gnf_grammar=cnf_res.cnf_grammar,
            is_valid_gnf=False,
            message=f"Pre-requisite CNF conversion failed: {'; '.join(cnf_res.validation_errors)}",
            validation_errors=cnf_res.validation_errors,
        )

    working_g = cnf_res.cnf_grammar.copy()
    start_sym = working_g.start_symbol
    all_known_symbols = working_g.non_terminals.union(working_g.terminals)

    stages.append(GNFStageTrace(
        stage_number=1,
        stage_name="Initial CNF Simplification",
        description="Grammar simplified and converted to Chomsky Normal Form as clean base.",
        grammar=working_g.copy(),
        changes_made=["Eliminated ε and unit rules; prepared binary and single-terminal productions."],
    ))

    # Identify if epsilon is generated by start symbol
    has_start_epsilon = any(p.lhs == start_sym and p.is_epsilon for p in working_g.productions)

    # Non-terminals ordering: ensure start_symbol is A_1
    other_nts = sorted([nt for nt in working_g.non_terminals if nt != start_sym])
    ordered_nts = [start_sym] + other_nts
    nt_order_map = {nt: i for i, nt in enumerate(ordered_nts)}

    stages.append(GNFStageTrace(
        stage_number=2,
        stage_name="Non-Terminal Ordering",
        description=f"Establish linear order A_1 ... A_m: {', '.join(ordered_nts)}.",
        grammar=working_g.copy(),
        changes_made=[f"Order: {ordered_nts}"],
    ))

    # Helper function to get productions for variable
    def get_rules_for(lhs: str, prods: List[Production]) -> List[Production]:
        return [p for p in prods if p.lhs == lhs]

    current_prods: List[Production] = [p for p in working_g.productions if not p.is_epsilon]
    stage3_changes = []
    b_helper_prods: List[Production] = []
    new_b_vars: Set[str] = set()

    # Step 1: Forward substitution and left recursion elimination
    for i, ai in enumerate(ordered_nts):
        # Substitute rules where first symbol is Aj with j < i
        substituted = True
        loop_guard = 0
        while substituted and loop_guard < 50:
            loop_guard += 1
            substituted = False
            new_rules_for_ai: List[Production] = []
            for p in get_rules_for(ai, current_prods):
                if p.rhs and p.rhs[0] in nt_order_map:
                    first_nt = p.rhs[0]
                    j = nt_order_map[first_nt]
                    if j < i:
                        # Substitute first_nt with its current productions
                        gamma = p.rhs[1:]
                        first_nt_rules = get_rules_for(first_nt, current_prods)
                        for r in first_nt_rules:
                            new_rhs = r.rhs + gamma
                            new_rules_for_ai.append(Production(lhs=ai, rhs=new_rhs))
                        substituted = True
                        stage3_changes.append(f"Substituted '{first_nt}' in '{p.to_string()}'.")
                        continue
                new_rules_for_ai.append(p)

            # Update current_prods with substituted rules for ai
            current_prods = [p for p in current_prods if p.lhs != ai] + new_rules_for_ai

        # Eliminate immediate left recursion on Ai: Ai -> Ai α
        left_recursive: List[Tuple[str, ...]] = []
        non_left_recursive: List[Tuple[str, ...]] = []

        for p in get_rules_for(ai, current_prods):
            if p.rhs and p.rhs[0] == ai:
                left_recursive.append(p.rhs[1:])  # alpha
            else:
                non_left_recursive.append(p.rhs)  # beta

        if left_recursive:
            b_var = f"B_{ai}"
            counter = 1
            while b_var in all_known_symbols or b_var in new_b_vars:
                b_var = f"B_{ai}_{counter}"
                counter += 1
            new_b_vars.add(b_var)
            all_known_symbols.add(b_var)

            # Ai -> beta | beta B_var
            reconstructed_ai_prods = []
            for beta in non_left_recursive:
                reconstructed_ai_prods.append(Production(lhs=ai, rhs=beta))
                reconstructed_ai_prods.append(Production(lhs=ai, rhs=beta + (b_var,)))

            # B_var -> alpha | alpha B_var
            for alpha in left_recursive:
                b_helper_prods.append(Production(lhs=b_var, rhs=alpha))
                b_helper_prods.append(Production(lhs=b_var, rhs=alpha + (b_var,)))

            current_prods = [p for p in current_prods if p.lhs != ai] + reconstructed_ai_prods
            stage3_changes.append(f"Eliminated left recursion on '{ai}', introduced helper '{b_var}'.")

    # Reconstruct grammar at end of forward pass
    working_g.non_terminals = working_g.non_terminals.union(new_b_vars)
    working_g.productions = current_prods + b_helper_prods

    stages.append(GNFStageTrace(
        stage_number=3,
        stage_name="Forward Substitution & Left Recursion Removal",
        description="For j < i, substitute A_j in A_i -> A_j γ, then eliminate immediate left recursion.",
        grammar=working_g.copy(),
        changes_made=stage3_changes if stage3_changes else ["No forward substitution was required."],
    ))

    # Step 2: Back substitution (from A_m-1 down to A_1)
    stage4_changes = []
    for i in range(len(ordered_nts) - 1, -1, -1):
        ai = ordered_nts[i]
        substituted = True
        loop_guard = 0
        while substituted and loop_guard < 50:
            loop_guard += 1
            substituted = False
            new_rules_for_ai = []
            for p in get_rules_for(ai, working_g.productions):
                if p.rhs and p.rhs[0] in working_g.non_terminals:
                    lead_nt = p.rhs[0]
                    lead_prods = get_rules_for(lead_nt, working_g.productions)
                    # If all productions of lead_nt start with terminal
                    if lead_prods and all(r.rhs and r.rhs[0] in working_g.terminals for r in lead_prods):
                        gamma = p.rhs[1:]
                        for r in lead_prods:
                            new_rules_for_ai.append(Production(lhs=ai, rhs=r.rhs + gamma))
                        substituted = True
                        stage4_changes.append(f"Back-substituted '{lead_nt}' into '{p.to_string()}'.")
                        continue
                new_rules_for_ai.append(p)

            working_g.productions = [p for p in working_g.productions if p.lhs != ai] + new_rules_for_ai

    stages.append(GNFStageTrace(
        stage_number=4,
        stage_name="Back Substitution",
        description="Substitute leading non-terminals from A_m down to A_1 so all A_i productions begin with terminals.",
        grammar=working_g.copy(),
        changes_made=stage4_changes if stage4_changes else ["All A_i productions already begin with terminals."],
    ))

    # Step 3: Substitute leading non-terminals in B_i helper productions
    stage5_changes = []
    for b_var in new_b_vars:
        substituted = True
        loop_guard = 0
        while substituted and loop_guard < 50:
            loop_guard += 1
            substituted = False
            new_rules_for_b = []
            for p in get_rules_for(b_var, working_g.productions):
                if p.rhs and p.rhs[0] in working_g.non_terminals:
                    lead_nt = p.rhs[0]
                    lead_prods = get_rules_for(lead_nt, working_g.productions)
                    if lead_prods and all(r.rhs and r.rhs[0] in working_g.terminals for r in lead_prods):
                        gamma = p.rhs[1:]
                        for r in lead_prods:
                            new_rules_for_b.append(Production(lhs=b_var, rhs=r.rhs + gamma))
                        substituted = True
                        stage5_changes.append(f"Substituted '{lead_nt}' in helper rule '{p.to_string()}'.")
                        continue
                new_rules_for_b.append(p)

            working_g.productions = [p for p in working_g.productions if p.lhs != b_var] + new_rules_for_b

    stages.append(GNFStageTrace(
        stage_number=5,
        stage_name="Helper Variables Substitution",
        description="Substitute terminal-leading rules into B_i helper productions.",
        grammar=working_g.copy(),
        changes_made=stage5_changes if stage5_changes else ["No helper variable substitutions needed."],
    ))

    # Step 4: Ensure all trailing symbols in RHS are non-terminals
    stage6_changes = []
    terminal_helpers: Dict[str, str] = {}
    new_helper_prods: List[Production] = []

    # Check for terminals appearing at index >= 1 in any RHS
    for p in working_g.productions:
        if len(p.rhs) > 1:
            for sym in p.rhs[1:]:
                if sym in working_g.terminals and sym not in terminal_helpers:
                    h_name = f"T_{sym}"
                    counter = 1
                    while h_name in all_known_symbols:
                        h_name = f"T_{sym}_{counter}"
                        counter += 1
                    all_known_symbols.add(h_name)
                    terminal_helpers[sym] = h_name
                    new_helper_prods.append(Production(lhs=h_name, rhs=(sym,)))
                    stage6_changes.append(f"Created helper '{h_name} -> {sym}' for trailing terminal.")

    if terminal_helpers:
        final_prods: List[Production] = []
        for p in working_g.productions:
            if len(p.rhs) > 1:
                new_rhs = (p.rhs[0],) + tuple(terminal_helpers.get(sym, sym) for sym in p.rhs[1:])
                final_prods.append(Production(lhs=p.lhs, rhs=new_rhs))
            else:
                final_prods.append(p)

        for hp in new_helper_prods:
            working_g.non_terminals.add(hp.lhs)
            final_prods.append(hp)

        working_g.productions = final_prods

    # Add S0 -> ε if original grammar had epsilon
    if has_start_epsilon and not any(p.lhs == start_sym and p.is_epsilon for p in working_g.productions):
        working_g.productions.insert(0, Production(lhs=start_sym, rhs=()))

    # Deduplicate productions
    dedup_prods: List[Production] = []
    seen_sigs: Set[Tuple[str, Tuple[str, ...]]] = set()
    for p in working_g.productions:
        sig = (p.lhs, p.rhs)
        if sig not in seen_sigs:
            seen_sigs.add(sig)
            dedup_prods.append(p)
    working_g.productions = dedup_prods

    stages.append(GNFStageTrace(
        stage_number=6,
        stage_name="Trailing Terminal Isolation",
        description="Replace any terminal appearing after position 0 with a non-terminal helper rule T_a -> a.",
        grammar=working_g.copy(),
        changes_made=stage6_changes if stage6_changes else ["All trailing symbols were already non-terminals."],
    ))

    # Independent GNF validation
    is_valid, validation_errors = validate_gnf_grammar(working_g)

    return GNFConversionResult(
        success=is_valid,
        original_grammar=grammar,
        gnf_grammar=working_g,
        is_valid_gnf=is_valid,
        stages=stages,
        validation_errors=validation_errors,
        message="Grammar successfully transformed into Greibach Normal Form." if is_valid else "Conversion produced invalid GNF.",
    )
