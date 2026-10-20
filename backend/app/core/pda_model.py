"""Pushdown Automaton (PDA) Data Model and Validation.

Mathematical 7-tuple: M = (Q, Σ, Γ, δ, q0, Z0, F)
- Q: finite set of states
- Σ: input alphabet
- Γ: stack alphabet
- δ: transition function δ(q, a, X) -> list of (p, γ)
- q0: initial state
- Z0: initial stack symbol
- F: set of accepting / final states
"""

from __future__ import annotations
from dataclasses import dataclass, field
from typing import List, Tuple, Set, Dict, Any, Optional
from collections import defaultdict
import uuid


@dataclass(frozen=True)
class PDATransition:
    """A transition δ(from_state, input_symbol, pop_symbol) -> (to_state, push_symbols).
    
    Attributes:
        from_state: Current state q ∈ Q
        input_symbol: Symbol a ∈ Σ or ε (represented as "")
        pop_symbol: Top stack symbol X ∈ Γ to match and pop
        to_state: Destination state p ∈ Q
        push_symbols: Tuple of symbols γ ∈ Γ* to replace X on stack.
                     Empty tuple () means pop X (ε push).
                     (X,) means keep stack top unchanged.
                     (Y, X) means push Y on top of X (first element is new top).
        transition_id: Unique identifier for tracking and visualization.
    """
    from_state: str
    input_symbol: str
    pop_symbol: str
    to_state: str
    push_symbols: Tuple[str, ...]
    transition_id: str = field(default_factory=lambda: str(uuid.uuid4())[:8])

    @property
    def is_epsilon_input(self) -> bool:
        return self.input_symbol in {"", "ε", "epsilon"}

    def to_string(self) -> str:
        in_sym = self.input_symbol if not self.is_epsilon_input else "ε"
        push_str = "".join(self.push_symbols) if self.push_symbols else "ε"
        return f"δ({self.from_state}, {in_sym}, {self.pop_symbol}) -> ({self.to_state}, {push_str})"

    def to_dict(self) -> Dict[str, Any]:
        return {
            "id": self.transition_id,
            "from_state": self.from_state,
            "input_symbol": "" if self.is_epsilon_input else self.input_symbol,
            "pop_symbol": self.pop_symbol,
            "to_state": self.to_state,
            "push_symbols": list(self.push_symbols),
            "label": f"{self.input_symbol or 'ε'}, {self.pop_symbol} → {''.join(self.push_symbols) or 'ε'}",
            "text": self.to_string(),
        }

    @classmethod
    def from_dict(cls, data: Dict[str, Any]) -> PDATransition:
        in_sym = data.get("input_symbol", "")
        if in_sym in {"ε", "epsilon"}:
            in_sym = ""
        push_syms = tuple(data.get("push_symbols", []))
        return cls(
            from_state=data["from_state"],
            input_symbol=in_sym,
            pop_symbol=data["pop_symbol"],
            to_state=data["to_state"],
            push_symbols=push_syms,
            transition_id=data.get("id", str(uuid.uuid4())[:8]),
        )


@dataclass
class PDA:
    """Formal Pushdown Automaton model."""
    states: Set[str]
    input_alphabet: Set[str]
    stack_alphabet: Set[str]
    transitions: List[PDATransition]
    initial_state: str
    initial_stack_symbol: str
    accepting_states: Set[str]
    acceptance_mode: str = "FINAL_STATE"  # "FINAL_STATE" or "EMPTY_STACK"
    pda_id: str = field(default_factory=lambda: str(uuid.uuid4())[:8])
    name: str = "Untitled PDA"
    description: str = ""

    def copy(self) -> PDA:
        return PDA(
            states=set(self.states),
            input_alphabet=set(self.input_alphabet),
            stack_alphabet=set(self.stack_alphabet),
            transitions=[
                PDATransition(t.from_state, t.input_symbol, t.pop_symbol, t.to_state, tuple(t.push_symbols), t.transition_id)
                for t in self.transitions
            ],
            initial_state=self.initial_state,
            initial_stack_symbol=self.initial_stack_symbol,
            accepting_states=set(self.accepting_states),
            acceptance_mode=self.acceptance_mode,
            pda_id=str(uuid.uuid4())[:8],
            name=f"{self.name} (Copy)",
            description=self.description,
        )

    def to_dict(self) -> Dict[str, Any]:
        return {
            "id": self.pda_id,
            "name": self.name,
            "description": self.description,
            "states": sorted(list(self.states)),
            "input_alphabet": sorted(list(self.input_alphabet)),
            "stack_alphabet": sorted(list(self.stack_alphabet)),
            "transitions": [t.to_dict() for t in self.transitions],
            "initial_state": self.initial_state,
            "initial_stack_symbol": self.initial_stack_symbol,
            "accepting_states": sorted(list(self.accepting_states)),
            "acceptance_mode": self.acceptance_mode,
        }

    @classmethod
    def from_dict(cls, data: Dict[str, Any]) -> PDA:
        transitions = [PDATransition.from_dict(t) for t in data.get("transitions", [])]
        return cls(
            states=set(data.get("states", [])),
            input_alphabet=set(data.get("input_alphabet", [])),
            stack_alphabet=set(data.get("stack_alphabet", [])),
            transitions=transitions,
            initial_state=data.get("initial_state", ""),
            initial_stack_symbol=data.get("initial_stack_symbol", "Z0"),
            accepting_states=set(data.get("accepting_states", [])),
            acceptance_mode=data.get("acceptance_mode", "FINAL_STATE"),
            pda_id=data.get("id", str(uuid.uuid4())[:8]),
            name=data.get("name", "PDA"),
            description=data.get("description", ""),
        )


def validate_pda(pda: PDA) -> Tuple[bool, List[str], List[str]]:
    """Validate PDA 7-tuple. Returns (is_valid, errors, warnings)."""
    errors: List[str] = []
    warnings: List[str] = []

    if not pda.states:
        errors.append("States set Q cannot be empty.")
    if not pda.initial_state:
        errors.append("Initial state q0 must be specified.")
    elif pda.initial_state not in pda.states:
        errors.append(f"Initial state '{pda.initial_state}' is not in states set Q.")

    if not pda.initial_stack_symbol:
        errors.append("Initial stack symbol Z0 must be specified.")
    elif pda.initial_stack_symbol not in pda.stack_alphabet:
        errors.append(f"Initial stack symbol '{pda.initial_stack_symbol}' is not in stack alphabet Γ.")

    for s in pda.accepting_states:
        if s not in pda.states:
            errors.append(f"Accepting state '{s}' is not in states set Q.")

    # Validate transitions
    seen_transitions: Set[Tuple[str, str, str, str, Tuple[str, ...]]] = set()
    deterministic_map: Dict[Tuple[str, str, str], List[PDATransition]] = defaultdict(list)

    for t in pda.transitions:
        if t.from_state not in pda.states:
            errors.append(f"Transition source state '{t.from_state}' is not in states set Q.")
        if t.to_state not in pda.states:
            errors.append(f"Transition destination state '{t.to_state}' is not in states set Q.")
        if not t.is_epsilon_input and t.input_symbol not in pda.input_alphabet:
            errors.append(f"Transition input symbol '{t.input_symbol}' is not in input alphabet Σ.")
        if t.pop_symbol not in pda.stack_alphabet:
            errors.append(f"Transition pop symbol '{t.pop_symbol}' is not in stack alphabet Γ.")
        for p_sym in t.push_symbols:
            if p_sym not in pda.stack_alphabet:
                errors.append(f"Transition push symbol '{p_sym}' is not in stack alphabet Γ.")

        sig = (t.from_state, t.input_symbol, t.pop_symbol, t.to_state, t.push_symbols)
        if sig in seen_transitions:
            warnings.append(f"Duplicate transition: {t.to_string()}")
        seen_transitions.add(sig)

        deterministic_map[(t.from_state, t.input_symbol, t.pop_symbol)].append(t)

    # Check for non-determinism
    is_deterministic = True
    for key, trans_list in deterministic_map.items():
        if len(trans_list) > 1:
            is_deterministic = False
        from_st, in_sym, pop_sym = key
        # If there is both an epsilon transition and a terminal transition for same state and stack top
        if in_sym == "" and (from_st, "", pop_sym) in deterministic_map:
            for other_in in pda.input_alphabet:
                if (from_st, other_in, pop_sym) in deterministic_map:
                    is_deterministic = False

    if not is_deterministic:
        warnings.append("PDA contains non-deterministic transitions (NPDA). Bounded exploration will be used.")

    return (len(errors) == 0, errors, warnings)
