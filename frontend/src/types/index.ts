export interface Production {
  id: string;
  lhs: string;
  rhs: string[];
  is_epsilon: boolean;
  text: string;
}

export interface Grammar {
  id: string;
  name: string;
  description: string;
  non_terminals: string[];
  terminals: string[];
  start_symbol: string;
  productions: Production[];
  raw_text: string;
}

export interface GrammarAnalysis {
  is_valid: boolean;
  errors: string[];
  warnings: string[];
  nullable_symbols: string[];
  generating_symbols: string[];
  non_generating_symbols: string[];
  reachable_symbols: string[];
  unreachable_symbols: string[];
  unit_productions: Array<{ lhs: string; rhs: string }>;
  epsilon_productions: string[];
  stats: {
    non_terminal_count: number;
    terminal_count: number;
    production_count: number;
    has_epsilon: boolean;
    has_unit: boolean;
    is_start_nullable: boolean;
  };
}

export interface DerivationStep {
  step_number: number;
  before_form: string[];
  rule_applied: Production;
  symbol_replaced: string;
  replacement_index: number;
  after_form: string[];
  explanation: string;
}

export interface DerivationResult {
  success: boolean;
  status: string;
  target_string: string;
  derivation_mode: string;
  steps: DerivationStep[];
  sentential_forms: string[][];
  configurations_explored: number;
  message: string;
}

export interface NormalFormStage {
  stage_number: number;
  stage_name: string;
  description: string;
  grammar: Grammar;
  changes_made: string[];
}

export interface NormalFormResult {
  success: boolean;
  normal_form: "CNF" | "GNF";
  original_grammar: Grammar;
  converted_grammar: Grammar;
  is_valid: boolean;
  stages: NormalFormStage[];
  validation_errors: string[];
  message: string;
}

export interface CYKSplit {
  split_index: number;
  left_cell: [number, number];
  right_cell: [number, number];
  left_symbol: string;
  right_symbol: string;
  resulting_symbol: string;
  rule_used: string;
}

export interface CYKCell {
  length: number;
  start_index: number;
  substring: string;
  symbols: string[];
  splits: CYKSplit[];
  is_start_present: boolean;
  is_final_cell: boolean;
}

export interface CYKResult {
  success: boolean;
  accepted: boolean;
  input_string: string;
  tokens: string[];
  table: CYKCell[][];
  start_symbol: string;
  steps: Array<{
    step_number: number;
    cell_coords: [number, number];
    substring: string;
    examined_split: number | null;
    left_symbols: string[];
    right_symbols: string[];
    added_symbols: string[];
    explanation: string;
  }>;
  parse_trees: any[];
  message: string;
}

export interface PDATransition {
  id?: string;
  from_state: string;
  input_symbol: string;
  pop_symbol: string;
  to_state: string;
  push_symbols: string[];
  label?: string;
}

export interface PDA {
  id?: string;
  name: string;
  description: string;
  states: string[];
  input_alphabet: string[];
  stack_alphabet: string[];
  transitions: PDATransition[];
  initial_state: string;
  initial_stack_symbol: string;
  accepting_states: string[];
  acceptance_mode: "FINAL_STATE" | "EMPTY_STACK";
}

export interface PDAConfiguration {
  step_number: number;
  state: string;
  input_pos: number;
  remaining_input: string;
  stack: string[];
  stack_top: string | null;
  transition_applied: any;
  is_accepting_state: boolean;
  is_empty_stack: boolean;
  is_accepted: boolean;
  is_rejected: boolean;
  explanation: string;
}

export interface PDASimulationResult {
  success: boolean;
  accepted: boolean;
  status: string;
  input_string: string;
  acceptance_mode: "FINAL_STATE" | "EMPTY_STACK";
  trace: PDAConfiguration[];
  configurations_explored: number;
  total_steps: number;
  message: string;
}

export interface ParseTreeNode {
  id: string;
  symbol: string;
  node_type: "non-terminal" | "terminal" | "epsilon";
  production?: string;
  children: ParseTreeNode[];
  x: number;
  y: number;
  depth: number;
}

export interface AutomataGraph {
  success: boolean;
  nodes: Array<{
    id: string;
    label: string;
    is_initial: boolean;
    is_accepting: boolean;
    x: number;
    y: number;
  }>;
  edges: Array<{
    id: string;
    source: string;
    target: string;
    label: string;
    labels_list: string[];
    transition_ids: string[];
    is_self_loop: boolean;
  }>;
  initial_state: string;
  accepting_states: string[];
  acceptance_mode: "FINAL_STATE" | "EMPTY_STACK";
}

export interface BatchTestItem {
  input_string: string;
  expected?: boolean;
}

export interface BatchTestResultItem {
  input_string: string;
  expected?: boolean;
  actual: boolean;
  status: string;
  matched_expectation?: boolean;
  configurations_explored: number;
  message: string;
}

export interface BatchTestResponse {
  success: boolean;
  model_type: "CFG" | "PDA";
  total_tests: number;
  passed_count: number;
  failed_count: number;
  results: BatchTestResultItem[];
  summary: string;
}
