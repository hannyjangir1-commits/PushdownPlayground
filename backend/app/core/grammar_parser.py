"""Parser for Context-Free Grammar syntax.

Supports:
- Arrows: '->', '::=', '→', '='
- Alternatives: '|'
- Epsilon aliases: 'ε', 'epsilon', 'eps', 'λ', 'lambda', '^', '""', "''"
- Whitespace-delimited tokens (e.g. 'E -> E + T | id')
- Compact single-character tokens (e.g. 'S -> aSb | ab | ε')
- Quoted tokens (e.g. 'F -> "(" E ")"')
"""

from __future__ import annotations
import re
from typing import List, Tuple, Set, Optional, Dict
from .grammar_model import Grammar, Production


class GrammarParseError(Exception):
    """Raised when grammar syntax is malformed."""
    def __init__(self, message: str, line_number: Optional[int] = None, line_content: Optional[str] = None):
        super().__init__(message)
        self.message = message
        self.line_number = line_number
        self.line_content = line_content

    def to_dict(self) -> Dict[str, Any]:
        return {
            "message": self.message,
            "line_number": self.line_number,
            "line_content": self.line_content
        }


EPSILON_ALIASES = {
    "ε", "epsilon", "EPSILON", "eps", "EPS", "λ", "lambda", "LAMBDA", "^", '""', "''", "e"
}


def _tokenize_rhs_alternative(alt_text: str) -> Tuple[str, ...]:
    """Tokenize a single alternative on the RHS.
    
    If text has whitespace, we split by whitespace or quotes.
    If no whitespace, but contains multi-char keywords (like 'epsilon' or 'id'),
    we handle them; otherwise we split into individual characters.
    """
    text = alt_text.strip()
    if not text:
        return ()

    # Check if this alternative is an explicit epsilon alias
    if text.lower() in {a.lower() for a in EPSILON_ALIASES}:
        return ()

    # Check if quotes are used
    if '"' in text or "'" in text:
        tokens = []
        pattern = re.compile(r'\"([^\"]*)\"|\'([^\']*)\'|(\S+)')
        for match in pattern.finditer(text):
            quoted = match.group(1) or match.group(2)
            if quoted is not None:
                if quoted.lower() in {a.lower() for a in EPSILON_ALIASES}:
                    continue
                tokens.append(quoted)
            else:
                raw = match.group(3)
                if raw.lower() in {a.lower() for a in EPSILON_ALIASES}:
                    continue
                tokens.append(raw)
        return tuple(tokens)

    # If explicit whitespace exists, split by whitespace
    if re.search(r'\s+', text):
        raw_tokens = text.split()
        res = []
        for t in raw_tokens:
            if t.lower() in {a.lower() for a in EPSILON_ALIASES}:
                continue
            res.append(t)
        return tuple(res)

    # Compact single-character representation (e.g. "aSb" or "id")
    # If the text matches a known epsilon alias:
    if text.lower() in {a.lower() for a in EPSILON_ALIASES}:
        return ()

    # If the text is a recognized multi-char identifier like 'id', 'num', 'expr', keep it
    # If all uppercase or mixed letters without spaces, check length
    if len(text) > 1 and text in {"id", "num", "null", "true", "false"}:
        return (text,)

    # Otherwise split into individual characters
    return tuple(list(text))


def parse_grammar_text(
    text: str,
    name: str = "Grammar",
    description: str = "",
    start_symbol_override: Optional[str] = None
) -> Grammar:
    """Parse raw grammar text into a canonical Grammar object.
    
    Raises:
        GrammarParseError: On invalid syntax or empty grammar.
    """
    if not text or not text.strip():
        raise GrammarParseError("Grammar text cannot be empty.")

    lines = text.strip().splitlines()
    raw_rules: List[Tuple[str, List[Tuple[str, ...]]]] = []
    lhs_order: List[str] = []
    all_lhs: Set[str] = set()

    arrow_regex = re.compile(r'(::=|->|→|=)')

    for idx, raw_line in enumerate(lines, start=1):
        line = raw_line.strip()
        # Ignore comments (# or //) and empty lines
        if not line or line.startswith("#") or line.startswith("//"):
            continue

        match = arrow_regex.search(line)
        if not match:
            raise GrammarParseError(
                f"Missing production arrow ('->', '::=', or '→') in line: '{line}'",
                line_number=idx,
                line_content=line,
            )

        arrow = match.group(0)
        lhs_part, rhs_part = line.split(arrow, 1)
        lhs = lhs_part.strip()

        if not lhs:
            raise GrammarParseError(
                f"Left-hand side is missing before '{arrow}' in line: '{line}'",
                line_number=idx,
                line_content=line,
            )

        # In CFGs, LHS must be a single non-terminal symbol
        lhs_tokens = lhs.split()
        if len(lhs_tokens) > 1:
            raise GrammarParseError(
                f"Left-hand side must be a single non-terminal, got '{lhs}' in line {idx}",
                line_number=idx,
                line_content=line,
            )
        lhs_symbol = lhs_tokens[0]

        if lhs_symbol not in all_lhs:
            all_lhs.add(lhs_symbol)
            lhs_order.append(lhs_symbol)

        # Split RHS by '|'
        alternatives = rhs_part.split("|")
        parsed_alts: List[Tuple[str, ...]] = []
        for alt in alternatives:
            parsed_alts.append(_tokenize_rhs_alternative(alt))

        raw_rules.append((lhs_symbol, parsed_alts))

    if not raw_rules:
        raise GrammarParseError("No valid production rules found in grammar text.")

    # Determine start symbol
    first_lhs = lhs_order[0]
    start_symbol = start_symbol_override.strip() if start_symbol_override else first_lhs

    # Construct productions
    productions: List[Production] = []
    rhs_symbols: Set[str] = set()

    for lhs, alts in raw_rules:
        for alt in alts:
            productions.append(Production(lhs=lhs, rhs=alt))
            for sym in alt:
                rhs_symbols.add(sym)

    non_terminals = set(all_lhs)
    # Terminals are all symbols appearing on RHS that are not in non_terminals
    terminals = {s for s in rhs_symbols if s not in non_terminals}

    return Grammar(
        non_terminals=non_terminals,
        terminals=terminals,
        productions=productions,
        start_symbol=start_symbol,
        name=name,
        description=description,
        raw_text=text.strip(),
    )
