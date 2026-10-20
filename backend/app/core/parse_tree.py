"""Parse Tree Construction and Layout Engine.

Converts grammar derivation steps or CYK backpointers into hierarchical trees
and computed coordinates for visual rendering (zoomable SVG or Canvas).
"""

from __future__ import annotations
from dataclasses import dataclass, field
from typing import List, Dict, Any, Optional
import uuid
from .derivation_engine import DerivationStep


@dataclass
class ParseTreeNode:
    id: str
    symbol: str
    node_type: str  # "non-terminal", "terminal", "epsilon"
    production: Optional[str] = None
    children: List[ParseTreeNode] = field(default_factory=list)
    x: float = 0.0
    y: float = 0.0
    depth: int = 0

    def to_dict(self) -> Dict[str, Any]:
        return {
            "id": self.id,
            "symbol": self.symbol,
            "node_type": self.node_type,
            "production": self.production,
            "children": [c.to_dict() for c in self.children],
            "x": self.x,
            "y": self.y,
            "depth": self.depth,
        }


def build_parse_tree_from_derivation(
    start_symbol: str,
    steps: List[DerivationStep],
    terminals: set[str],
) -> ParseTreeNode:
    """Reconstruct a complete parse tree from a list of DerivationSteps."""
    root = ParseTreeNode(
        id=f"node_{uuid.uuid4().hex[:6]}",
        symbol=start_symbol,
        node_type="non-terminal",
        depth=0,
    )

    # Track active leaf non-terminals in order of sentential form
    # Each entry in frontier is a reference to a ParseTreeNode
    frontier: List[ParseTreeNode] = [root]

    for step in steps:
        repl_idx = step.replacement_index
        rule = step.rule_applied
        rhs_symbols = rule.get("rhs", [])
        rule_text = rule.get("text", "")

        if repl_idx < len(frontier):
            target_node = frontier[repl_idx]
            target_node.production = rule_text

            # Create children for target_node
            new_children: List[ParseTreeNode] = []
            if not rhs_symbols:  # Epsilon production A -> ε
                eps_node = ParseTreeNode(
                    id=f"node_{uuid.uuid4().hex[:6]}",
                    symbol="ε",
                    node_type="epsilon",
                    depth=target_node.depth + 1,
                )
                target_node.children.append(eps_node)
                # target_node is replaced by nothing in frontier
                frontier = frontier[:repl_idx] + frontier[repl_idx + 1:]
            else:
                for sym in rhs_symbols:
                    n_type = "terminal" if sym in terminals else "non-terminal"
                    child = ParseTreeNode(
                        id=f"node_{uuid.uuid4().hex[:6]}",
                        symbol=sym,
                        node_type=n_type,
                        depth=target_node.depth + 1,
                    )
                    new_children.append(child)
                    target_node.children.append(child)

                # Update frontier: replace target_node with new_children
                frontier = frontier[:repl_idx] + new_children + frontier[repl_idx + 1:]

    # Compute tidy tree layout coordinates
    _layout_tree(root)
    return root


def _layout_tree(root: ParseTreeNode, level_height: float = 90.0, sibling_gap: float = 60.0):
    """Compute (x, y) coordinates for all nodes in the tree."""
    leaf_index = 0

    def assign_leaf_positions(node: ParseTreeNode, depth: int):
        nonlocal leaf_index
        node.depth = depth
        node.y = depth * level_height

        if not node.children:
            node.x = leaf_index * sibling_gap
            leaf_index += 1
        else:
            for child in node.children:
                assign_leaf_positions(child, depth + 1)
            # Center parent over children
            node.x = (node.children[0].x + node.children[-1].x) / 2.0

    assign_leaf_positions(root, 0)


def flatten_tree_to_graph(root: ParseTreeNode) -> Dict[str, Any]:
    """Convert tree into nodes and edges lists for rendering in graph components."""
    nodes: List[Dict[str, Any]] = []
    edges: List[Dict[str, Any]] = []

    def traverse(node: ParseTreeNode):
        nodes.append({
            "id": node.id,
            "label": node.symbol,
            "type": node.node_type,
            "production": node.production,
            "x": node.x,
            "y": node.y,
            "depth": node.depth,
        })
        for child in node.children:
            edges.append({
                "id": f"e_{node.id}_{child.id}",
                "source": node.id,
                "target": child.id,
            })
            traverse(child)

    traverse(root)
    return {"nodes": nodes, "edges": edges}
