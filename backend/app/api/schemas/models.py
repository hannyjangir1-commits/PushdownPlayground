"""Pydantic schemas for request and response validation across all endpoints."""

from __future__ import annotations
from typing import List, Dict, Any, Optional, Set
from pydantic import BaseModel, Field


# --- Health ---
class HealthResponse(BaseModel):
    status: str = "ok"
    version: str = "1.0.0"
    app_name: str = "Interactive CFG and PDA Learning Tool"


# --- Grammar ---
class GrammarParseRequest(BaseModel):
    raw_text: str = Field(..., description="Raw grammar string e.g. S -> a S b | ε")
    name: Optional[str] = "Grammar"
    description: Optional[str] = ""
    start_symbol: Optional[str] = None


class ProductionSchema(BaseModel):
    id: str
    lhs: str
    rhs: List[str]
    is_epsilon: bool
    text: str


class GrammarSchema(BaseModel):
    id: str
    name: str
    description: str
    non_terminals: List[str]
    terminals: List[str]
    start_symbol: str
    productions: List[ProductionSchema]
    raw_text: str


class GrammarParseResponse(BaseModel):
    success: bool
    data: Optional[GrammarSchema] = None
    error: Optional[str] = None


class GrammarValidateResponse(BaseModel):
    success: bool
    is_valid: bool
    errors: List[str] = Field(default_factory=list)
    warnings: List[str] = Field(default_factory=list)
    nullable_symbols: List[str] = Field(default_factory=list)
    generating_symbols: List[str] = Field(default_factory=list)
    non_generating_symbols: List[str] = Field(default_factory=list)
    reachable_symbols: List[str] = Field(default_factory=list)
    unreachable_symbols: List[str] = Field(default_factory=list)
    unit_productions: List[Dict[str, str]] = Field(default_factory=list)
    epsilon_productions: List[str] = Field(default_factory=list)
    stats: Dict[str, Any] = Field(default_factory=dict)


# --- Derivations ---
class DerivationSearchRequest(BaseModel):
    grammar: Optional[GrammarSchema] = None
    raw_text: Optional[str] = None
    target_string: str = ""
    mode: str = "LEFTMOST"  # "LEFTMOST" or "RIGHTMOST"
    max_depth: int = 15
    max_configurations: int = 4000


class DerivationStepSchema(BaseModel):
    step_number: int
    before_form: List[str]
    rule_applied: Dict[str, Any]
    symbol_replaced: str
    replacement_index: int
    after_form: List[str]
    explanation: str


class DerivationSearchResponse(BaseModel):
    success: bool
    status: str
    target_string: str
    derivation_mode: str
    steps: List[DerivationStepSchema] = Field(default_factory=list)
    sentential_forms: List[List[str]] = Field(default_factory=list)
    configurations_explored: int = 0
    message: str = ""


# --- Normal Forms (CNF / GNF) ---
class NormalFormRequest(BaseModel):
    grammar: Optional[GrammarSchema] = None
    raw_text: Optional[str] = None


class NormalFormStageSchema(BaseModel):
    stage_number: int
    stage_name: str
    description: str
    grammar: GrammarSchema
    changes_made: List[str]


class NormalFormResponse(BaseModel):
    success: bool
    normal_form: str  # "CNF" or "GNF"
    original_grammar: GrammarSchema
    converted_grammar: GrammarSchema
    is_valid: bool
    stages: List[NormalFormStageSchema] = Field(default_factory=list)
    validation_errors: List[str] = Field(default_factory=list)
    message: str = ""


# --- CYK ---
class CYKRunRequest(BaseModel):
    grammar: Optional[GrammarSchema] = None
    raw_text: Optional[str] = None
    input_string: str = ""
    convert_to_cnf_first: bool = False


class CYKRunResponse(BaseModel):
    success: bool
    accepted: bool
    input_string: str
    tokens: List[str]
    table: List[List[Dict[str, Any]]] = Field(default_factory=list)
    start_symbol: str
    steps: List[Dict[str, Any]] = Field(default_factory=list)
    parse_trees: List[Dict[str, Any]] = Field(default_factory=list)
    message: str = ""


# --- PDA ---
class PDATransitionSchema(BaseModel):
    id: Optional[str] = None
    from_state: str
    input_symbol: str
    pop_symbol: str
    to_state: str
    push_symbols: List[str] = Field(default_factory=list)


class PDASchema(BaseModel):
    id: Optional[str] = None
    name: str = "PDA"
    description: str = ""
    states: List[str]
    input_alphabet: List[str]
    stack_alphabet: List[str]
    transitions: List[PDATransitionSchema]
    initial_state: str
    initial_stack_symbol: str = "Z0"
    accepting_states: List[str]
    acceptance_mode: str = "FINAL_STATE"  # "FINAL_STATE" or "EMPTY_STACK"


class PDASimulateRequest(BaseModel):
    pda: Optional[PDASchema] = None
    sample_id: Optional[str] = None
    input_string: str = ""
    max_steps: int = 1000
    max_configurations: int = 5000


class PDAConfigurationSchema(BaseModel):
    step_number: int
    state: str
    input_pos: int
    remaining_input: str
    stack: List[str]
    stack_top: Optional[str]
    transition_applied: Optional[Dict[str, Any]]
    is_accepting_state: bool
    is_empty_stack: bool
    is_accepted: bool
    is_rejected: bool
    explanation: str


class PDASimulateResponse(BaseModel):
    success: bool
    accepted: bool
    status: str
    input_string: str
    acceptance_mode: str
    trace: List[PDAConfigurationSchema] = Field(default_factory=list)
    configurations_explored: int = 0
    total_steps: int = 0
    message: str = ""


# --- Visualizations ---
class ParseTreeResponse(BaseModel):
    success: bool
    root: Optional[Dict[str, Any]] = None
    nodes: List[Dict[str, Any]] = Field(default_factory=list)
    edges: List[Dict[str, Any]] = Field(default_factory=list)
    message: str = ""


class AutomataGraphResponse(BaseModel):
    success: bool
    nodes: List[Dict[str, Any]] = Field(default_factory=list)
    edges: List[Dict[str, Any]] = Field(default_factory=list)
    initial_state: str = ""
    accepting_states: List[str] = Field(default_factory=list)
    acceptance_mode: str = "FINAL_STATE"


# --- Batch Testing ---
class BatchTestItem(BaseModel):
    input_string: str
    expected: Optional[bool] = None


class BatchTestRequest(BaseModel):
    model_type: str  # "CFG" or "PDA"
    grammar: Optional[GrammarSchema] = None
    grammar_raw_text: Optional[str] = None
    pda: Optional[PDASchema] = None
    sample_id: Optional[str] = None
    test_items: List[BatchTestItem]
    convert_to_cnf: bool = True


class BatchTestItemResult(BaseModel):
    input_string: str
    expected: Optional[bool] = None
    actual: bool
    status: str  # "ACCEPTED", "REJECTED", "ERROR"
    matched_expectation: Optional[bool] = None
    configurations_explored: int = 0
    message: str = ""


class BatchTestResponse(BaseModel):
    success: bool
    model_type: str
    total_tests: int
    passed_count: int
    failed_count: int
    results: List[BatchTestItemResult] = Field(default_factory=list)
    summary: str = ""
