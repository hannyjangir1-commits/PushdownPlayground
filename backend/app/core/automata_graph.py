"""Pushdown Automaton State-Transition Graph Generator.

Transforms formal PDA definitions into graph nodes and edges with coordinates,
supporting:
- Initial state indicator
- Double circle for accepting states
- Directed edges with stack transition labels
- Self loops and parallel edges grouping
- Active state & edge highlighting during simulation.
"""

from __future__ import annotations
import math
from typing import List, Dict, Any, Optional
from .pda_model import PDA, PDATransition


def generate_pda_graph(pda: PDA) -> Dict[str, Any]:
    """Generate layout nodes and edges for visualizing PDA state transitions."""
    states = sorted(list(pda.states))
    num_states = len(states)

    nodes: List[Dict[str, Any]] = []

    # Position states in a circle or horizontal line
    if num_states <= 4:
        # Linear or simple layout
        spacing = 180
        for i, st in enumerate(states):
            nodes.append({
                "id": st,
                "label": st,
                "is_initial": st == pda.initial_state,
                "is_accepting": st in pda.accepting_states,
                "x": 100 + i * spacing,
                "y": 150,
            })
    else:
        # Circular layout
        radius = max(140, num_states * 35)
        center_x = radius + 80
        center_y = radius + 80
        for i, st in enumerate(states):
            angle = (2 * math.pi * i) / num_states
            x = center_x + radius * math.cos(angle)
            y = center_y + radius * math.sin(angle)
            nodes.append({
                "id": st,
                "label": st,
                "is_initial": st == pda.initial_state,
                "is_accepting": st in pda.accepting_states,
                "x": round(x, 1),
                "y": round(y, 1),
            })

    # Group transitions between same source and target
    grouped_edges: Dict[Tuple[str, str], List[PDATransition]] = {}
    for t in pda.transitions:
        pair = (t.from_state, t.to_state)
        if pair not in grouped_edges:
            grouped_edges[pair] = []
        grouped_edges[pair].append(t)

    edges: List[Dict[str, Any]] = []
    for (src, tgt), trans_list in grouped_edges.items():
        is_loop = (src == tgt)
        labels = [
            f"{t.input_symbol or 'ε'}, {t.pop_symbol} → {''.join(t.push_symbols) or 'ε'}"
            for t in trans_list
        ]
        composite_label = "\n".join(labels)
        transition_ids = [t.transition_id for t in trans_list]

        edges.append({
            "id": f"e_{src}_{tgt}",
            "source": src,
            "target": tgt,
            "label": composite_label,
            "labels_list": labels,
            "transition_ids": transition_ids,
            "is_self_loop": is_loop,
        })

    return {
        "nodes": nodes,
        "edges": edges,
        "initial_state": pda.initial_state,
        "accepting_states": sorted(list(pda.accepting_states)),
        "acceptance_mode": pda.acceptance_mode,
    }
