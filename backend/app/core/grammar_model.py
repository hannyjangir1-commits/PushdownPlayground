"""Canonical Context-Free Grammar (CFG) data model.

Represents G = (V, Σ, P, S) where:
- V is the finite set of non-terminal symbols.
- Σ is the finite set of terminal symbols, disjoint from V.
- P is the finite set of production rules A -> α with A ∈ V and α ∈ (V ∪ Σ)*.
- S ∈ V is the start symbol.
Epsilon is canonically represented as an empty tuple () in RHS.
"""

from __future__ import annotations
from dataclasses import dataclass, field
from typing import List, Tuple, Set, Dict, Any, Optional
import uuid


@dataclass(frozen=True)
class Production:
    """A production rule A -> α.
    
    Attributes:
        lhs: The non-terminal symbol on the left-hand side.
        rhs: A tuple of symbols on the right-hand side. Empty tuple () denotes epsilon.
        rule_id: Unique identifier for tracking and tracing derivations.
    """
    lhs: str
    rhs: Tuple[str, ...]
    rule_id: str = field(default_factory=lambda: str(uuid.uuid4())[:8])

    @property
    def is_epsilon(self) -> bool:
        """Return True if this production generates the empty string ε."""
        return len(self.rhs) == 0

    @property
    def is_unit(self) -> bool:
        """Return True if RHS is a single symbol (caller determines if it's non-terminal)."""
        return len(self.rhs) == 1

    def to_string(self, epsilon_symbol: str = "ε") -> str:
        """Format production as human-readable string."""
        if not self.rhs:
            return f"{self.lhs} -> {epsilon_symbol}"
        return f"{self.lhs} -> {' '.join(self.rhs)}"

    def to_dict(self) -> Dict[str, Any]:
        return {
            "id": self.rule_id,
            "lhs": self.lhs,
            "rhs": list(self.rhs),
            "is_epsilon": self.is_epsilon,
            "text": self.to_string(),
        }

    @classmethod
    def from_dict(cls, data: Dict[str, Any]) -> Production:
        return cls(
            lhs=data["lhs"],
            rhs=tuple(data.get("rhs", [])),
            rule_id=data.get("id", str(uuid.uuid4())[:8])
        )


@dataclass
class Grammar:
    """Canonical representation of a Context-Free Grammar."""
    non_terminals: Set[str]
    terminals: Set[str]
    productions: List[Production]
    start_symbol: str
    grammar_id: str = field(default_factory=lambda: str(uuid.uuid4())[:8])
    name: str = "Untitled Grammar"
    description: str = ""
    raw_text: str = ""

    def copy(self) -> Grammar:
        """Produce a safe deep copy to prevent mutation."""
        return Grammar(
            non_terminals=set(self.non_terminals),
            terminals=set(self.terminals),
            productions=[Production(p.lhs, tuple(p.rhs), p.rule_id) for p in self.productions],
            start_symbol=self.start_symbol,
            grammar_id=str(uuid.uuid4())[:8],
            name=f"{self.name} (Copy)",
            description=self.description,
            raw_text=self.raw_text,
        )

    def get_productions_for(self, non_terminal: str) -> List[Production]:
        """Return all productions having the given non-terminal as LHS."""
        return [p for p in self.productions if p.lhs == non_terminal]

    def grouped_productions_text(self, epsilon_symbol: str = "ε") -> str:
        """Return grouped string representations e.g. S -> a S b | ε."""
        grouped: Dict[str, List[str]] = {}
        order: List[str] = []
        for p in self.productions:
            if p.lhs not in grouped:
                grouped[p.lhs] = []
                order.append(p.lhs)
            rhs_str = " ".join(p.rhs) if p.rhs else epsilon_symbol
            grouped[p.lhs].append(rhs_str)

        lines = []
        for nt in order:
            rhss = " | ".join(grouped[nt])
            lines.append(f"{nt} -> {rhss}")
        return "\n".join(lines)

    def to_dict(self) -> Dict[str, Any]:
        return {
            "id": self.grammar_id,
            "name": self.name,
            "description": self.description,
            "non_terminals": sorted(list(self.non_terminals)),
            "terminals": sorted(list(self.terminals)),
            "start_symbol": self.start_symbol,
            "productions": [p.to_dict() for p in self.productions],
            "raw_text": self.raw_text or self.grouped_productions_text(),
        }

    @classmethod
    def from_dict(cls, data: Dict[str, Any]) -> Grammar:
        productions = [Production.from_dict(p) for p in data.get("productions", [])]
        return cls(
            non_terminals=set(data.get("non_terminals", [])),
            terminals=set(data.get("terminals", [])),
            productions=productions,
            start_symbol=data.get("start_symbol", ""),
            grammar_id=data.get("id", str(uuid.uuid4())[:8]),
            name=data.get("name", "Grammar"),
            description=data.get("description", ""),
            raw_text=data.get("raw_text", ""),
        )
