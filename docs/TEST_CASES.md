# Comprehensive Test Cases Matrix
## Interactive CFG and PDA Learning Tool

All test cases listed below have been executed and verified against the pure Python algorithm engine and FastAPI integration endpoints.

---

## 1. Context-Free Grammar Parsing & Property Tests

| Test ID | Objective | Input Grammar | Expected Output | Actual Output | Status | Notes |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **TC-CFG-01** | Multi-rule CFG Parsing | `S -> a S b \| ε` | $V=\{S\}, \Sigma=\{a, b\}$, start=$S$ | $V=\{S\}, \Sigma=\{a, b\}$, start=$S$ | **PASS** | Validates correct classification of $V$ and $\Sigma$. |
| **TC-CFG-02** | Epsilon Alias Handling | `S -> a \| eps` | Single $\epsilon$-production identified | Production with RHS=() identified | **PASS** | Tests aliases `ε`, `eps`, `epsilon`, `λ`. |
| **TC-CFG-03** | Syntax Error Detection | `S a b c` (no arrow) | `GrammarParseError` | `GrammarParseError: Missing production arrow` | **PASS** | Structured syntax error raised. |
| **TC-CFG-04** | Multi-Character Tokenization | `E -> E + T \| id` | Tokens `E`, `+`, `T`, `id` preserved | Tokens `id` and `+` distinct in $\Sigma$ | **PASS** | Tokenizer preserves identifier boundaries. |
| **TC-CFG-05** | Nullable Fixed-Point | `S -> AB; A -> a \| ε; B -> ε` | $Nullable = \{A, B, S\}$ | $Nullable = \{A, B, S\}$ | **PASS** | Fixed-point iteration identifies cascading nullability. |
| **TC-CFG-06** | Useless Symbol Detection | `S -> A; A -> a; B -> B b; C -> c` | $B$ non-generating, $C$ unreachable | $B$ in non-generating, $C$ in unreachable | **PASS** | Distinguishes warnings from fatal errors. |

---

## 2. Derivation Engine Tests

| Test ID | Objective | Input Target String | Expected Output | Actual Output | Status | Notes |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **TC-DER-01** | Leftmost Derivation of `aabb` | `aabb` on $a^n b^n$ | 3 derivation steps | 3 steps ($S \to aSb \to aaSbb \to aabb$) | **PASS** | Correct sequence of sentential forms. |
| **TC-DER-02** | Rightmost Derivation of `ab` | `ab` on $a^n b^n$ | 2 derivation steps | 2 steps ($S \to aSb \to ab$) | **PASS** | Validates rightmost non-terminal expansion. |
| **TC-DER-03** | Epsilon Derivation | `""` or `ε` on $a^n b^n$ | 1 derivation step ($S \to \epsilon$) | 1 step ($S \to \epsilon$) | **PASS** | Correctly handles base empty string. |
| **TC-DER-04** | Non-Derivable String Rejection | `aab` on $a^n b^n$ | `NOT_FOUND` | `NOT_FOUND` (search exhausted) | **PASS** | Halts without infinite recursion. |

---

## 3. Chomsky Normal Form (CNF) Tests

| Test ID | Objective | Input Grammar | Expected Output | Actual Output | Status | Notes |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **TC-CNF-01** | Standard CNF Conversion | $a^n b^n$: `S -> a S b \| ε` | Valid CNF with binary & terminal rules | 6 stages executed; Independent CNF validator: True | **PASS** | All rules strictly $A \to B C$ or $A \to a$. |
| **TC-CNF-02** | Unit & Long RHS Decomposition | `S -> A B C; A -> a; B -> b; C -> c` | Binary cascade $S \to A X_1, X_1 \to B C$ | Binary cascade generated; Validator: True | **PASS** | Decomposes length 3 productions into binary rules. |
| **TC-CNF-03** | Validator Rejection of Non-CNF | `S -> A B C` | Validator reports errors | Reported length violation (len 3) | **PASS** | Proves independent validation is genuine. |

---

## 4. Greibach Normal Form (GNF) Tests

| Test ID | Objective | Input Grammar | Expected Output | Actual Output | Status | Notes |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **TC-GNF-01** | Direct Conversion | `S -> a A \| b B; A -> a; B -> b` | Valid GNF rules starting with terminal | Independent GNF validator: True | **PASS** | Rules satisfy $A \to a \alpha$. |
| **TC-GNF-02** | Immediate Left Recursion Removal | `S -> S a \| b` | Rules for $S$ and helper $B_S$ | Independent GNF validator: True | **PASS** | Eliminates direct left recursion correctly. |
| **TC-GNF-03** | Validator Rejection of Non-GNF | `S -> A B` | Validator reports error | Reported rule does not start with terminal | **PASS** | Proves independent validation is genuine. |

---

## 5. CYK Membership Testing

| Test ID | Objective | Grammar & Input String | Expected Output | Actual Output | Status | Notes |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **TC-CYK-01** | CNF String Acceptance | CNF grammar, input `"ba"` | Accepted ($S \in T[2, 0]$) | Accepted ($S \in T[2, 0]$) | **PASS** | Cell combinations match $S \to B C$. |
| **TC-CYK-02** | CNF String Rejection | CNF grammar, input `"bba"` | Rejected ($S \notin T[3, 0]$) | Rejected ($S \notin T[3, 0]$) | **PASS** | Correctly identifies non-membership. |
| **TC-CYK-03** | End-to-end CNF + CYK | $a^n b^n$ converted, input `"aabb"` | Accepted | Accepted | **PASS** | Language equivalence preserved in CNF. |
| **TC-CYK-04** | Disjoint Terminal Rejection | Input `"c"` (symbol not in $\Sigma$) | Immediate Rejection | Immediate Rejection with diagnostic | **PASS** | Fails fast on invalid alphabet characters. |

---

## 6. Pushdown Automata Simulator

| Test ID | Objective | PDA Model & Input | Expected Output | Actual Output | Status | Notes |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **TC-PDA-01** | Empty String Acceptance | $a^n b^n$ PDA, input `""` | Accepted | Accepted (transition to $q_2$ on $\epsilon$) | **PASS** | Step 0 / initial $\epsilon$-acceptance verified. |
| **TC-PDA-02** | Balanced String Acceptance | $a^n b^n$ PDA, input `"aabb"` | Accepted | Accepted in 5 configuration steps | **PASS** | Stack pushes $A A$, pops $A A$, reaches $Z_0$. |
| **TC-PDA-03** | Excess a's Rejection | $a^n b^n$ PDA, input `"aab"` | Rejected | Rejected (unmatched $A$ on stack) | **PASS** | Halted in non-accepting state $q_1$. |
| **TC-PDA-04** | Excess b's Rejection | $a^n b^n$ PDA, input `"abb"` | Rejected | Rejected (stack underflow / no transition) | **PASS** | Cannot pop $A$ when top is $Z_0$. |
| **TC-PDA-05** | Inverted Sequence Rejection | $a^n b^n$ PDA, input `"ba"` | Rejected | Rejected (no transition from $q_0$ on $b, Z_0$) | **PASS** | Rejects prefix violation. |
| **TC-PDA-06** | Empty Stack Acceptance Mode | Balanced parens PDA, input `"(())"` | Accepted by Empty Stack | Accepted by Empty Stack ($|stack| = 0$) | **PASS** | Validates alternative acceptance criterion. |

---

## 7. Parse Tree & State Diagram Visualizations

| Test ID | Objective | Input Model | Expected Output | Actual Output | Status | Notes |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **TC-VIS-01** | Parse Tree Generation | Derivation of `"ab"` | Hierarchical node tree with depth & coordinates | Root $S$, children $a, S, b$ ordered correctly | **PASS** | Generates SVG graph structure. |
| **TC-VIS-02** | PDA Graph Generation | $a^n b^n$ PDA 7-tuple | 3 nodes, initial arrow, accepting double circle | Nodes $q_0, q_1, q_2$ with self-loops | **PASS** | Circular/layered layout computed. |
