"""Pushdown Automaton (PDA) Simulation and Step-by-Step Execution Engine.

Supports:
- Deterministic PDA simulation
- Bounded Nondeterministic PDA (NPDA) configuration BFS search
- Acceptance by Final State (M = (Q, Σ, Γ, δ, q0, Z0, F))
- Acceptance by Empty Stack (N = (Q, Σ, Γ, δ, q0, Z0, ∅))
- Full configuration trace with vertical/horizontal stack representation.
"""

from __future__ import annotations
from dataclasses import dataclass, field
from typing import List, Tuple, Set, Dict, Any, Optional
from collections import deque
from .pda_model import PDA, PDATransition, validate_pda


@dataclass
class PDAConfiguration:
    step_number: int
    state: str
    input_pos: int
    remaining_input: str
    stack: List[str]  # Ordered bottom-to-top, so stack[-1] is top
    stack_top: Optional[str]
    transition_applied: Optional[Dict[str, Any]]
    is_accepting_state: bool
    is_empty_stack: bool
    is_accepted: bool
    is_rejected: bool
    explanation: str

    def to_dict(self) -> Dict[str, Any]:
        return {
            "step_number": self.step_number,
            "state": self.state,
            "input_pos": self.input_pos,
            "remaining_input": self.remaining_input,
            "stack": list(self.stack),
            "stack_top": self.stack_top,
            "transition_applied": self.transition_applied,
            "is_accepting_state": self.is_accepting_state,
            "is_empty_stack": self.is_empty_stack,
            "is_accepted": self.is_accepted,
            "is_rejected": self.is_rejected,
            "explanation": self.explanation,
        }


@dataclass
class PDASimulationResult:
    accepted: bool
    status: str  # "ACCEPTED", "REJECTED", "LIMIT_EXCEEDED", "INVALID_PDA"
    input_string: str
    acceptance_mode: str
    trace: List[PDAConfiguration] = field(default_factory=list)
    configurations_explored: int = 0
    total_steps: int = 0
    message: str = ""

    def to_dict(self) -> Dict[str, Any]:
        return {
            "accepted": self.accepted,
            "status": self.status,
            "input_string": self.input_string,
            "acceptance_mode": self.acceptance_mode,
            "trace": [c.to_dict() for c in self.trace],
            "configurations_explored": self.configurations_explored,
            "total_steps": self.total_steps,
            "message": self.message,
        }


def _check_acceptance(
    state: str,
    input_pos: int,
    total_input_len: int,
    stack: List[str],
    pda: PDA,
) -> bool:
    """Check if the current configuration satisfies the configured acceptance criteria."""
    if input_pos < total_input_len:
        return False
    if pda.acceptance_mode == "FINAL_STATE":
        return state in pda.accepting_states
    elif pda.acceptance_mode == "EMPTY_STACK":
        return len(stack) == 0
    return False


def simulate_pda(
    pda: PDA,
    input_string: str,
    max_steps: int = 1000,
    max_configurations: int = 5000,
) -> PDASimulationResult:
    """Execute simulation on the given PDA and input string.
    
    Uses bounded BFS to support both DPDA and NPDA execution.
    Returns complete trace from initial state to final decision.
    """
    is_valid, errors, _ = validate_pda(pda)
    if not is_valid:
        return PDASimulationResult(
            accepted=False,
            status="INVALID_PDA",
            input_string=input_string,
            acceptance_mode=pda.acceptance_mode,
            message=f"Invalid PDA definition: {'; '.join(errors)}",
        )

    # Clean input: empty or ε
    clean_input = "" if input_string in {"ε", "epsilon"} else input_string
    # Validate input symbols belong to Σ
    for ch in clean_input:
        if ch not in pda.input_alphabet:
            return PDASimulationResult(
                accepted=False,
                status="REJECTED",
                input_string=input_string,
                acceptance_mode=pda.acceptance_mode,
                message=f"Input symbol '{ch}' is not in the PDA's input alphabet Σ.",
            )

    n = len(clean_input)
    initial_stack = [pda.initial_stack_symbol] if pda.initial_stack_symbol else []

    # Check immediate acceptance at step 0
    init_accepted = _check_acceptance(pda.initial_state, 0, n, initial_stack, pda)

    init_config = PDAConfiguration(
        step_number=0,
        state=pda.initial_state,
        input_pos=0,
        remaining_input=clean_input,
        stack=list(initial_stack),
        stack_top=initial_stack[-1] if initial_stack else None,
        transition_applied=None,
        is_accepting_state=pda.initial_state in pda.accepting_states,
        is_empty_stack=len(initial_stack) == 0,
        is_accepted=init_accepted,
        is_rejected=False,
        explanation=f"Initial configuration at state '{pda.initial_state}' with stack [{', '.join(initial_stack)}].",
    )

    if init_accepted:
        return PDASimulationResult(
            accepted=True,
            status="ACCEPTED",
            input_string=input_string,
            acceptance_mode=pda.acceptance_mode,
            trace=[init_config],
            configurations_explored=1,
            total_steps=0,
            message=f"String '{input_string}' immediately accepted at start state in mode {pda.acceptance_mode}.",
        )

    # BFS Queue item: (state, input_pos, stack_tuple, history_of_configs)
    queue = deque([ (pda.initial_state, 0, tuple(initial_stack), [init_config]) ])
    visited: Set[Tuple[str, int, Tuple[str, ...]]] = { (pda.initial_state, 0, tuple(initial_stack)) }

    configs_explored = 0
    longest_trace: List[PDAConfiguration] = [init_config]

    while queue:
        configs_explored += 1
        if configs_explored > max_configurations:
            return PDASimulationResult(
                accepted=False,
                status="LIMIT_EXCEEDED",
                input_string=input_string,
                acceptance_mode=pda.acceptance_mode,
                trace=longest_trace,
                configurations_explored=configs_explored,
                total_steps=len(longest_trace) - 1,
                message=f"Simulation resource limit reached ({max_configurations} configurations explored). Potential infinite loop or epsilon cycle.",
            )

        curr_state, curr_pos, curr_stack, history = queue.popleft()

        if len(history) > len(longest_trace):
            longest_trace = history

        if len(history) > max_steps:
            continue

        stack_top = curr_stack[-1] if curr_stack else None

        # Look for applicable transitions:
        # A transition requires matching curr_state, stack_top == pop_symbol,
        # and either input_symbol == curr_input_char OR input_symbol == ε ("")
        curr_char = clean_input[curr_pos] if curr_pos < n else None

        applicable_transitions: List[Tuple[PDATransition, bool]] = []  # (trans, is_epsilon_move)

        if stack_top is not None:
            for t in pda.transitions:
                if t.from_state == curr_state and t.pop_symbol == stack_top:
                    # Case 1: Terminal move
                    if curr_char is not None and t.input_symbol == curr_char:
                        applicable_transitions.append((t, False))
                    # Case 2: Epsilon move
                    elif t.is_epsilon_input:
                        applicable_transitions.append((t, True))

        for trans, is_eps in applicable_transitions:
            next_pos = curr_pos if is_eps else curr_pos + 1
            next_rem = clean_input[next_pos:]

            # Apply stack replacement: pop X, push γ in reverse order so push_symbols[0] is top
            # curr_stack is tuple
            stack_without_top = list(curr_stack[:-1])
            # push_symbols: tuple (Y1, Y2, ...) where Y1 is top
            # To have Y1 at the end of the list (top), we extend with reversed(push_symbols)
            new_stack = stack_without_top + list(reversed(trans.push_symbols))
            new_stack_tuple = tuple(new_stack)

            next_state = trans.to_state
            is_acc = _check_acceptance(next_state, next_pos, n, new_stack, pda)

            consumed_desc = f"consumed '{clean_input[curr_pos]}'" if not is_eps else "consumed no input (ε)"
            push_desc = f"pushed '{''.join(trans.push_symbols)}'" if trans.push_symbols else "popped top (ε push)"
            exp = (
                f"Step {len(history)}: Applied {trans.to_string()}. "
                f"Read {consumed_desc}, popped '{trans.pop_symbol}', {push_desc}. "
                f"Transitioned to '{next_state}'."
            )

            new_config = PDAConfiguration(
                step_number=len(history),
                state=next_state,
                input_pos=next_pos,
                remaining_input=next_rem,
                stack=new_stack,
                stack_top=new_stack[-1] if new_stack else None,
                transition_applied=trans.to_dict(),
                is_accepting_state=next_state in pda.accepting_states,
                is_empty_stack=len(new_stack) == 0,
                is_accepted=is_acc,
                is_rejected=False,
                explanation=exp,
            )

            new_history = history + [new_config]

            if is_acc:
                return PDASimulationResult(
                    accepted=True,
                    status="ACCEPTED",
                    input_string=input_string,
                    acceptance_mode=pda.acceptance_mode,
                    trace=new_history,
                    configurations_explored=configs_explored,
                    total_steps=len(new_history) - 1,
                    message=f"String '{input_string}' ACCEPTED in {len(new_history) - 1} steps by {pda.acceptance_mode}.",
                )

            state_key = (next_state, next_pos, new_stack_tuple)
            if state_key not in visited:
                visited.add(state_key)
                queue.append((next_state, next_pos, new_stack_tuple, new_history))

    # All branches exhausted without acceptance
    # Mark last config in longest trace as rejected
    if longest_trace:
        last = longest_trace[-1]
        reason = []
        if last.input_pos < n:
            reason.append(f"unconsumed input '{last.remaining_input}'")
        if pda.acceptance_mode == "FINAL_STATE" and last.state not in pda.accepting_states:
            reason.append(f"ended in non-accepting state '{last.state}'")
        elif pda.acceptance_mode == "EMPTY_STACK" and len(last.stack) > 0:
            reason.append(f"stack is non-empty [{', '.join(last.stack)}]")

        longest_trace[-1].is_rejected = True
        explanation = f"String REJECTED: All execution branches halted. ({', '.join(reason)})."
        longest_trace[-1].explanation += f" -> {explanation}"

    return PDASimulationResult(
        accepted=False,
        status="REJECTED",
        input_string=input_string,
        acceptance_mode=pda.acceptance_mode,
        trace=longest_trace,
        configurations_explored=configs_explored,
        total_steps=len(longest_trace) - 1,
        message=f"String '{input_string}' REJECTED by PDA in mode {pda.acceptance_mode}.",
    )
