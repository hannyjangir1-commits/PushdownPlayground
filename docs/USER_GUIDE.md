# User Guide
## Interactive CFG and PDA Learning Tool

Welcome to the **Interactive CFG and PDA Learning Tool**, an educational suite designed for computer science students and researchers studying formal languages, grammars, normal forms, and automata theory.

---

## 1. Quick Start

1. Start the application using PowerShell:
   ```powershell
   .\scripts\run.ps1
   ```
2. Open your web browser to:
   ```
   http://localhost:5173/
   ```
3. The **Overview Dashboard** provides direct links to all modules and pre-loaded sample grammars.

---

## 2. Grammar Workspace (`/grammar`)

The Grammar Workspace is the starting point for grammar-based workflows.

### Entering Productions
- Enter production rules in standard syntax:
  ```text
  S -> a S b | ε
  A -> a A | a
  ```
- Arrows supported: `->`, `::=`, `→`, or `=`.
- Alternatives are separated by `|`.
- Epsilon can be written as `ε`, `epsilon`, `eps`, `λ`, or left blank.
- Multi-character tokens (e.g. `id`, `Expr`) are preserved when separated by whitespace or enclosed in quotes.

### Validating & Analyzing
1. Enter your productions and click **Validate & Re-Analyze**.
2. The right panel displays:
   - **Non-Terminals ($V$)**: Color-coded badges for all defined variables.
   - **Terminals ($\Sigma$)**: Set of input alphabet symbols.
   - **Nullable Variables**: Non-terminals capable of deriving $\epsilon$.
   - **Unit Productions**: Rules of the form $A \to B$.
   - **Useless Symbols**: Disconnected or non-generating components.

---

## 3. Derivations Engine (`/derivations`)

Step through formal sentential form expansions.

1. Enter a target string $w$ (e.g., `aabb` or leave blank for $\epsilon$).
2. Choose between **Leftmost (LM)** or **Rightmost (RM)** expansion mode.
3. Click **Derive String**.
4. Use the **StepPlayer** controls:
   - **Play/Pause**: Automatically step through sentential forms.
   - **Next / Previous**: Step forward or backward through rule applications.
   - **Sentential Ribbon**: Highlights the exact non-terminal replaced at each step.
5. Click **Generate Parse Tree** to visualize the derivation as a hierarchical tree.

---

## 4. Normal Forms Converter (`/normal-forms`)

Transform any CFG into Chomsky Normal Form (CNF) or Greibach Normal Form (GNF).

1. Select **Chomsky Normal Form (CNF)** or **Greibach Normal Form (GNF)**.
2. Click **Execute Pipeline**.
3. Inspect each transformation stage in the interactive stepper:
   - Stage description.
   - List of exact operations performed.
   - Intermediate grammar representation.
4. Review the independent validation badge confirming that every production satisfies the normal form constraints.
5. Click **Set as Workspace Grammar** or **Test in CYK Parser**.

---

## 5. CYK Membership Testing (`/cyk`)

Evaluate strings using the Cocke-Younger-Kasami dynamic programming algorithm.

1. Enter an input string to test (e.g., `ba` or `aabb`).
2. Ensure **Auto-Convert to CNF First** is checked if your grammar is not yet in CNF.
3. Click **Run CYK Algorithm**.
4. Inspect the **Triangular Parsing Table**:
   - Bottom row represents substring length 1.
   - Highest cell represents substring length $n$ covering the entire string.
   - Cells containing the start symbol $S$ are highlighted in green.
5. **Click any table cell** to inspect which split points $k$ and production rules were matched.

---

## 6. Pushdown Automata Simulator (`/pda`)

Simulate step-by-step stack operations on genuine 7-tuple PDAs.

1. Select a preset (e.g., $a^n b^n$ or Balanced Parentheses) or define custom transitions.
2. Enter an input string on the tape (e.g., `aabb`).
3. Click **Simulate**.
4. Observe the interactive dual view:
   - **Input Tape**: Highlights consumed symbols vs the current head pointer.
   - **Vertical Stack**: Displays symbols from bottom $Z_0$ up to the active top with an animated `TOP` indicator.
   - **Applied Transition**: Displays rule $\delta(q, a, X) \to (p, \gamma)$ applied at each step.
5. Step through the execution or press **Play** for animated simulation.

---

## 7. Parse Tree & Automata Visualizations

- **Parse Tree (`/parse-tree`)**: Reconstructs hierarchical derivation trees with zoom, pan, and direct SVG export.
- **State Diagram (`/automata`)**: Renders directed transition graphs with start arrows, accepting double circles, and self-loops.

---

## 8. Batch Testing Workbench (`/batch-testing`)

Test collections of strings against a grammar or PDA.

1. Select **Test CFG (CYK)** or **Test PDA**.
2. Add custom strings or click **Load Preset Tests**.
3. Click **Run All Test Cases**.
4. Review pass/fail metrics, configurations explored, and click **Export CSV** to download test results.
