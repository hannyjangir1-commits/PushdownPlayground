# Automated Testing Report
## Interactive CFG and PDA Learning Tool

---

## 1. Test Execution Summary

| Test Suite | Framework | Tests Executed | Passed | Failed | Execution Time |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Backend Unit & Algorithm Tests** | Pytest 9.1.1 | 32 | 32 | 0 | 0.94s |
| **Frontend TypeScript & Build** | Vite 8.3 / TS 5 | 1 (1957 modules) | 1 | 0 | 698ms |
| **Overall Health & Readiness** | System Check | 100% Pass | All Passed | 0 | Verified |

---

## 2. Backend Automated Test Suite Breakdown

### 2.1 Grammar Parsing & Validation (`test_grammar.py`)
- `test_valid_grammar_parsing`: Verifies multi-rule parsing and separation of $V$ and $\Sigma$. **[PASSED]**
- `test_epsilon_aliases`: Validates aliases `ε`, `epsilon`, `eps`, `λ`. **[PASSED]**
- `test_invalid_syntax_missing_arrow`: Ensures malformed productions raise structured `GrammarParseError`. **[PASSED]**
- `test_multi_char_tokens`: Tests multi-character identifiers (`id`, expressions). **[PASSED]**
- `test_nullable_fixed_point`: Verifies fixed-point iteration for cascading nullable variables. **[PASSED]**
- `test_generating_and_unreachable_symbols`: Detects non-generating cycles and disconnected components. **[PASSED]**

### 2.2 Derivation Engine (`test_derivations.py`)
- `test_leftmost_derivation_anbn`: Computes LM derivation for `aabb`. **[PASSED]**
- `test_rightmost_derivation_anbn`: Computes RM derivation for `ab`. **[PASSED]**
- `test_epsilon_derivation`: Validates derivation of empty string $\epsilon$. **[PASSED]**
- `test_invalid_target_derivation`: Correctly reports `NOT_FOUND` on non-derivable strings. **[PASSED]**

### 2.3 Chomsky Normal Form (`test_cnf.py`)
- `test_cnf_conversion_sample_anbn`: Validates 7-stage conversion of $a^n b^n$. **[PASSED]**
- `test_cnf_conversion_unit_and_long_rhs`: Decomposes binary chains and unit rules. **[PASSED]**
- `test_cnf_validator_rejects_non_cnf`: Independent validator rejects productions of length $> 2$. **[PASSED]**

### 2.4 Greibach Normal Form (`test_gnf.py`)
- `test_gnf_conversion_simple`: Converts prefix grammar to GNF. **[PASSED]**
- `test_gnf_conversion_left_recursion`: Eliminates immediate left recursion introducing $B_i$ helper variables. **[PASSED]**
- `test_gnf_validator_rejects_non_gnf`: Independent validator rejects non-terminal leading rules. **[PASSED]**

### 2.5 CYK Membership Algorithm (`test_cyk.py`)
- `test_cyk_cnf_ready_grammar`: Dynamic programming table verification for accepted (`ba`, `ab`) and rejected (`bba`) strings. **[PASSED]**
- `test_cyk_after_cnf_conversion_anbn`: End-to-end CNF conversion and CYK testing for $a^n b^n$. **[PASSED]**

### 2.6 Pushdown Automata (`test_pda.py`)
- `test_pda_validation_anbn`: Verifies 7-tuple definition and determinism. **[PASSED]**
- `test_pda_anbn_simulation_acceptance`: Validates acceptance of `""`, `"ab"`, `"aabb"`, `"aaabbb"`. **[PASSED]**
- `test_pda_anbn_simulation_rejection`: Validates rejection of unbalanced strings (`"aab"`, `"abb"`, `"ba"`, `"abab"`). **[PASSED]**
- `test_pda_parens_empty_stack_acceptance`: Validates empty-stack acceptance mode for balanced parentheses. **[PASSED]**

### 2.7 Visualizations (`test_visualizations.py`)
- `test_parse_tree_construction`: Reconstructs hierarchical parse tree from derivation steps. **[PASSED]**
- `test_automata_graph_generation`: Verifies nodes, incoming start arrows, and self-loop edge groupings. **[PASSED]**

### 2.8 API Integration Tests (`test_api.py`)
- `test_api_health`: `/api/health` returns status `ok`. **[PASSED]**
- `test_api_grammar_parse_and_validate`: Integration with parser and validator. **[PASSED]**
- `test_api_derivation_search`: Integration with derivation engine. **[PASSED]**
- `test_api_cnf`: Integration with CNF converter. **[PASSED]**
- `test_api_gnf`: Integration with GNF converter. **[PASSED]**
- `test_api_cyk`: Integration with CYK dynamic programming table. **[PASSED]**
- `test_api_pda_simulate`: Integration with PDA simulator. **[PASSED]**
- `test_api_batch_testing`: Integration with batch testing runner. **[PASSED]**

---

## 3. How to Run Tests Locally

Execute the provided PowerShell test script:
```powershell
.\scripts\test.ps1
```
Or run individually:
```powershell
# Backend unit & integration tests
backend\venv\Scripts\pytest.exe backend\tests -v

# Frontend TypeScript check and production build
cd frontend
npm run build
```
