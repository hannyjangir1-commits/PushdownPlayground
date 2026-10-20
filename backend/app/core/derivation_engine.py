"""Derivation engine for Context-Free Grammars.

Generates:
- Leftmost derivations
- Rightmost derivations
- Sentential forms step-by-step
- Bounded search with cycle detection and explicit resource limits.
"""

from __future__ import annotations
from dataclasses import dataclass, field
from typing import List, Tuple, Optional, Set, Dict, Any
from .grammar_model import Grammar, Production


@dataclass
class DerivationStep:
    step_number: int
    before_form: List[str]
    rule_applied: Dict[str, Any]
    symbol_replaced: str
    replacement_index: int
    after_form: List[str]
    explanation: str

    def to_dict(self) -> Dict[str, Any]:
        return {
            "step_number": self.step_number,
            "before_form": self.before_form,
            "rule_applied": self.rule_applied,
            "symbol_replaced": self.symbol_replaced,
            "replacement_index": self.replacement_index,
            "after_form": self.after_form,
            "explanation": self.explanation,
        }


@dataclass
class DerivationResult:
    success: bool
    status: str  # "FOUND", "NOT_FOUND", "LIMIT_EXCEEDED", "INVALID_GRAMMAR"
    target_string: str
    derivation_mode: str  # "LEFTMOST" or "RIGHTMOST"
    steps: List[DerivationStep] = field(default_factory=list)
    sentential_forms: List[List[str]] = field(default_factory=list)
    configurations_explored: int = 0
    message: str = ""

    def to_dict(self) -> Dict[str, Any]:
        return {
            "success": self.success,
            "status": self.status,
            "target_string": self.target_string,
            "derivation_mode": self.derivation_mode,
            "steps": [s.to_dict() for s in self.steps],
            "sentential_forms": self.sentential_forms,
            "configurations_explored": self.configurations_explored,
            "message": self.message,
        }


def find_derivation(
    grammar: Grammar,
    target: str,
    mode: str = "LEFTMOST",
    max_depth: int = 15,
    max_configurations: int = 4000,
) -> DerivationResult:
    """Search for a derivation of target string using BFS or bounded DFS.
    
    Target can be empty string ("" or "ε").
    Mode: "LEFTMOST" expands leftmost non-terminal, "RIGHTMOST" expands rightmost.
    """
    mode = mode.upper()
    if mode not in {"LEFTMOST", "RIGHTMOST"}:
        mode = "LEFTMOST"

    # Canonical target representation: list of terminal characters/tokens
    # If target is empty
    target_tokens: List[str] = list(target) if target else []
    if target in {"ε", "epsilon", "eps"}:
        target_tokens = []

    # Verify that all characters in target exist in grammar terminals (unless target is empty)
    # Check for multi-char tokens matching if target was given as space-separated
    if " " in target:
        target_tokens = target.split()

    for tok in target_tokens:
        if tok not in grammar.terminals:
            # Check if tok is known; if not, target cannot be generated
            return DerivationResult(
                success=False,
                status="NOT_FOUND",
                target_string=target,
                derivation_mode=mode,
                message=f"Target contains symbol '{tok}' which is not in the grammar terminals Σ.",
            )

    start_sym = grammar.start_symbol
    if not start_sym or start_sym not in grammar.non_terminals:
        return DerivationResult(
            success=False,
            status="INVALID_GRAMMAR",
            target_string=target,
            derivation_mode=mode,
            message="Start symbol is invalid or missing.",
        )

    # Initial state
    initial_form = (start_sym,)
    # Queue stores: (form, history_of_steps)
    # Each step: (before_form, rule, replaced_sym, replaced_idx, after_form)
    from collections import deque
    queue = deque([ (initial_form, []) ])
    visited: Set[Tuple[str, ...]] = {initial_form}
    configs_count = 0

    while queue:
        configs_count += 1
        if configs_count > max_configurations:
            return DerivationResult(
                success=False,
                status="LIMIT_EXCEEDED",
                target_string=target,
                derivation_mode=mode,
                configurations_explored=configs_count,
                message=f"Search limit reached ({max_configurations} configurations explored). Try increasing search limits or check grammar.",
            )

        current_form, history = queue.popleft()

        # Check if form matches target
        is_all_terminals = all(sym not in grammar.non_terminals for sym in current_form)
        if is_all_terminals and list(current_form) == target_tokens:
            # Construct DerivationResult
            steps = []
            sentential_forms = [[start_sym]]
            for i, (b_form, rule, sym, idx, a_form) in enumerate(history, 1):
                rule_str = rule.to_string()
                exp = f"Step {i}: Apply {rule_str} on non-terminal '{sym}' at position {idx}."
                steps.append(DerivationStep(
                    step_number=i,
                    before_form=list(b_form),
                    rule_applied=rule.to_dict(),
                    symbol_replaced=sym,
                    replacement_index=idx,
                    after_form=list(a_form),
                    explanation=exp,
                ))
                sentential_forms.append(list(a_form))

            return DerivationResult(
                success=True,
                status="FOUND",
                target_string=target,
                derivation_mode=mode,
                steps=steps,
                sentential_forms=sentential_forms,
                configurations_explored=configs_count,
                message=f"Successfully derived '{target}' in {len(steps)} steps.",
            )

        if len(history) >= max_depth:
            continue

        # Prune if form has more terminals than target and grammar is non-contracting (no epsilon)
        terminal_count_in_form = sum(1 for sym in current_form if sym in grammar.terminals)
        has_epsilon_in_grammar = any(p.is_epsilon for p in grammar.productions)
        if not has_epsilon_in_grammar and terminal_count_in_form > len(target_tokens):
            continue

        # Identify non-terminal to expand according to mode
        non_terminal_indices = [i for i, s in enumerate(current_form) if s in grammar.non_terminals]
        if not non_terminal_indices:
            continue

        chosen_idx = non_terminal_indices[0] if mode == "LEFTMOST" else non_terminal_indices[-1]
        nt_to_expand = current_form[chosen_idx]

        for rule in grammar.get_productions_for(nt_to_expand):
            # Apply rule
            new_form = current_form[:chosen_idx] + rule.rhs + current_form[chosen_idx + 1:]

            # Basic length heuristic pruning if no epsilon
            if not has_epsilon_in_grammar and len(new_form) > len(target_tokens) + 10:
                continue

            if new_form not in visited:
                visited.add(new_form)
                new_history = history + [(current_form, rule, nt_to_expand, chosen_idx, new_form)]
                queue.append((new_form, new_history))

    return DerivationResult(
        success=False,
        status="NOT_FOUND",
        target_string=target,
        derivation_mode=mode,
        configurations_explored=configs_count,
        message=f"No derivation for '{target}' found within search space of {configs_count} configurations.",
    )
