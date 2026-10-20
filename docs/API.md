# REST API Documentation
## Interactive CFG and PDA Learning Tool

Base URL: `http://127.0.0.1:8001/api`

---

## 1. Health Endpoint

### `GET /health`
Returns backend service readiness and application metadata.

**Response `200 OK`**:
```json
{
  "status": "ok",
  "version": "1.0.0",
  "app_name": "Interactive CFG and PDA Learning Tool"
}
```

---

## 2. Grammar Endpoints

### `POST /grammar/parse`
Parses raw grammar text into canonical normalized structure.

**Request**:
```json
{
  "raw_text": "S -> a S b | ε",
  "name": "Sample CFG",
  "start_symbol": "S"
}
```

**Response `200 OK`**:
```json
{
  "success": true,
  "data": {
    "id": "7a9e3b1c",
    "name": "Sample CFG",
    "description": "",
    "non_terminals": ["S"],
    "terminals": ["a", "b"],
    "start_symbol": "S",
    "productions": [
      {
        "id": "p1",
        "lhs": "S",
        "rhs": ["a", "S", "b"],
        "is_epsilon": false,
        "text": "S -> a S b"
      },
      {
        "id": "p2",
        "lhs": "S",
        "rhs": [],
        "is_epsilon": true,
        "text": "S -> ε"
      }
    ],
    "raw_text": "S -> a S b | ε"
  }
}
```

### `POST /grammar/validate`
Performs comprehensive property analysis (nullable, unit, generating, reachable).

**Response `200 OK`**:
```json
{
  "success": true,
  "is_valid": true,
  "errors": [],
  "warnings": [],
  "nullable_symbols": ["S"],
  "generating_symbols": ["S"],
  "non_generating_symbols": [],
  "reachable_symbols": [],
  "unreachable_symbols": [],
  "unit_productions": [],
  "epsilon_productions": ["S -> ε"],
  "stats": {
    "non_terminal_count": 1,
    "terminal_count": 2,
    "production_count": 2,
    "has_epsilon": true,
    "has_unit": false,
    "is_start_nullable": true
  }
}
```

### `GET /grammar/samples`
Retrieves pre-loaded educational sample grammars with verified test cases.

---

## 3. Derivations Endpoint

### `POST /derivations/search`
Computes leftmost or rightmost derivation of target string with cycle-bounded search.

**Request**:
```json
{
  "raw_text": "S -> a S b | ε",
  "target_string": "ab",
  "mode": "LEFTMOST",
  "max_depth": 15,
  "max_configurations": 4000
}
```

**Response `200 OK`**:
```json
{
  "success": true,
  "status": "FOUND",
  "target_string": "ab",
  "derivation_mode": "LEFTMOST",
  "steps": [
    {
      "step_number": 1,
      "before_form": ["S"],
      "rule_applied": { "lhs": "S", "rhs": ["a", "S", "b"], "text": "S -> a S b" },
      "symbol_replaced": "S",
      "replacement_index": 0,
      "after_form": ["a", "S", "b"],
      "explanation": "Step 1: Apply S -> a S b on non-terminal 'S' at position 0."
    },
    {
      "step_number": 2,
      "before_form": ["a", "S", "b"],
      "rule_applied": { "lhs": "S", "rhs": [], "text": "S -> ε" },
      "symbol_replaced": "S",
      "replacement_index": 1,
      "after_form": ["a", "b"],
      "explanation": "Step 2: Apply S -> ε on non-terminal 'S' at position 1."
    }
  ],
  "sentential_forms": [["S"], ["a", "S", "b"], ["a", "b"]],
  "configurations_explored": 3,
  "message": "Successfully derived 'ab' in 2 steps."
}
```

---

## 4. Normal Forms Endpoints

### `POST /normal-forms/cnf`
Transforms CFG to Chomsky Normal Form, returning all 7 stages and independent validation.

### `POST /normal-forms/gnf`
Transforms CFG to Greibach Normal Form with ordering, left recursion removal, and back-substitution.

---

## 5. CYK Endpoint

### `POST /cyk/run`
Executes Cocke-Younger-Kasami dynamic programming algorithm on a CNF grammar.

**Request**:
```json
{
  "raw_text": "S -> A B | B C\nA -> B A | a\nB -> C C | b\nC -> A B | a",
  "input_string": "ba",
  "convert_to_cnf_first": false
}
```

**Response `200 OK`**:
```json
{
  "success": true,
  "accepted": true,
  "input_string": "ba",
  "tokens": ["b", "a"],
  "table": [
    [
      { "length": 1, "start_index": 0, "substring": "b", "symbols": ["B"] },
      { "length": 1, "start_index": 1, "substring": "a", "symbols": ["A", "C"] }
    ],
    [
      { "length": 2, "start_index": 0, "substring": "ba", "symbols": ["A", "S"], "is_start_present": true, "is_final_cell": true }
    ]
  ],
  "start_symbol": "S",
  "message": "String 'ba' is ACCEPTED: Start symbol 'S' is in cell T[2, 1]."
}
```

---

## 6. Pushdown Automata Endpoints

### `POST /pda/validate`
Validates PDA 7-tuple and reports warnings for non-deterministic transitions.

### `POST /pda/simulate`
Simulates PDA on input string, recording step-by-step stack contents and tape progress.

---

## 7. Visualization Endpoints

### `POST /visualization/parse-tree`
Returns hierarchical node structure with computed `(x, y)` coordinates for SVG rendering.

### `POST /visualization/pda`
Returns graph nodes and directed labeled edges for automata state diagrams.

---

## 8. Batch Testing Endpoint

### `POST /tests/batch`
Runs test suites against CFG or PDA, computing pass/fail rates and summary statistics.
