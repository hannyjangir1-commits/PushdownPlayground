# Algorithm Specifications
## Interactive CFG and PDA Learning Tool

---

## 1. Grammar Property Analysis

### 1.1 Nullable Symbols (Fixed-Point Iteration)
- **Input**: Grammar $G = (V, \Sigma, P, S)$.
- **Output**: Set $Nullable \subseteq V$.
- **Algorithm**:
  1. Base: $Nullable_0 = \{ A \in V \mid A \to \epsilon \in P \}$.
  2. Iterate: $Nullable_{i+1} = Nullable_i \cup \{ A \in V \mid \exists (A \to Y_1 \dots Y_k) \in P \text{ s.t. } \forall j, Y_j \in Nullable_i \}$.
  3. Stop when $Nullable_{i+1} = Nullable_i$.
- **Complexity**: $O(|P| \cdot |V|)$.

### 1.2 Generating & Reachable Symbols
- **Generating**: Non-terminals that can derive terminal strings $w \in \Sigma^*$.
  - Initialized with $\Sigma \cup \{\epsilon\}$, iterated until closure.
- **Reachable**: Symbols reachable from start symbol $S$.
  - Initialized with $\{S\}$, traversed through RHS symbols until closure.
- **Useless Symbols**: Non-generating symbols are eliminated first, followed by unreachable symbols.

---

## 2. Derivation Search Engine

- **Input**: Grammar $G$, target string $w$, mode $\in \{\text{LEFTMOST}, \text{RIGHTMOST}\}$.
- **Search Strategy**: Bounded Breadth-First Search (BFS) over sentential forms.
- **Cycle Prevention**: Visited hash set storing distinct sentential forms.
- **Pruning**: If $G$ has no $\epsilon$-productions and the terminal count of a sentential form exceeds $|w|$, prune that branch.
- **Bounds**: Configurable depth limit (default 15) and maximum configurations explored (default 4,000).

---

## 3. Chomsky Normal Form (CNF) 7-Stage Pipeline

A grammar is in CNF if all productions are of the form $A \to B C$ or $A \to a$, with optional $S_0 \to \epsilon$ if $\epsilon \in L(G)$.

1. **Stage 1 (Start Symbol Isolation)**: Introduce fresh $S_0 \to S$ if $S$ appears on any RHS or $\epsilon \in L(G)$.
2. **Stage 2 (Nullable Computation)**: Compute $Nullable \subseteq V$ via fixed-point iteration.
3. **Stage 3 (Elimination of $\epsilon$-Productions)**: For each rule $A \to Y_1 \dots Y_k$, generate all non-empty subsets obtained by omitting nullable symbols.
4. **Stage 4 (Elimination of Unit Productions)**: Compute reflexive transitive closure of unit pairs $(A, B)$ where $A \Rightarrow^* B$ ($B \in V$), and copy non-unit productions of $B$ to $A$.
5. **Stage 5 (Elimination of Useless Symbols)**: Remove non-generating variables, then remove unreachable variables.
6. **Stage 6 (Terminal Replacement in Long Rules)**: For rules of length $\ge 2$, replace terminal occurrences $a$ with fresh helper non-terminals $T_a \to a$.
7. **Stage 7 (Binary Decomposition)**: For rules $A \to B_1 B_2 \dots B_m$ with $m > 2$, decompose into binary cascade $A \to B_1 X_1, X_1 \to B_2 X_2, \dots, X_{m-2} \to B_{m-1} B_m$.
8. **Independent Validation**: Explicit verification that every rule strictly satisfies $A \to B C$ ($B, C \in V$), $A \to a$ ($a \in \Sigma$), or valid $S_0 \to \epsilon$.

---

## 4. Greibach Normal Form (GNF) Conversion Pipeline

A grammar is in GNF if every production is $A \to a A_1 \dots A_k$ ($a \in \Sigma, A_i \in V, k \ge 0$).

1. **CNF Base**: Grammar is simplified into CNF.
2. **Non-Terminal Ordering**: Assign linear order $A_1, A_2, \dots, A_m$ with $S_0 = A_1$.
3. **Forward Substitution & Immediate Left Recursion Removal**:
   - For $i = 1$ to $m$:
     - For $j = 1$ to $i - 1$: substitute $A_j$ in rules $A_i \to A_j \gamma$.
     - Eliminate immediate left recursion on $A_i$: partition into $A_i \to A_i \alpha$ and $A_i \to \beta$. Introduce helper variable $B_i$:
       $$A_i \to \beta \mid \beta B_i, \quad B_i \to \alpha \mid \alpha B_i$$
4. **Back-Substitution**: For $i = m - 1$ down to 1, substitute leading non-terminals so all $A_i$ productions begin with terminals.
5. **Helper Variable Substitution**: Substitute leading non-terminals in $B_i$ rules.
6. **Trailing Terminal Isolation**: Replace any terminal at index $\ge 1$ with helper variable $T_a \to a$.
7. **Independent Validation**: Verify every production starts with a terminal and all trailing symbols are non-terminals.

---

## 5. Cocke-Younger-Kasami (CYK) Parsing Algorithm

- **Input**: CNF Grammar $G$, input string $w = a_1 a_2 \dots a_n$.
- **Data Structure**: Triangular table $T[length][start]$.
- **Base Level ($l = 1$)**:
  $$T[1, s] = \{ A \in V \mid A \to a_s \in P \}$$
- **Dynamic Programming ($l = 2 \dots n$)**:
  For split point $k = 1 \dots l - 1$:
  $$T[l, s] = \bigcup_{k=1}^{l-1} \{ A \in V \mid A \to B C \in P, B \in T[k, s], C \in T[l-k, s+k] \}$$
- **Backpointer Storage**: For each added variable $A$, store $(k, \text{left\_cell}, \text{right\_cell}, B, C, \text{rule})$ to allow exact parse-tree reconstruction.
- **Acceptance**: $w \in L(G) \iff S \in T[n, 0]$.
- **Complexity**: Time: $O(n^3 \cdot |P|)$; Space: $O(n^2 \cdot |V|)$.

---

## 6. Pushdown Automata (PDA) Simulation Engine

Mathematical 7-tuple: $M = (Q, \Sigma, \Gamma, \delta, q_0, Z_0, F)$.

- **Stack Top Convention**: The top of the stack is represented at the right of the stack list (`stack[-1]`). In transition $\delta(q, a, X) \to (p, \gamma)$, $X$ is popped, and $\gamma$ is pushed such that $\gamma[0]$ becomes the new stack top.
- **Simulation Modes**:
  1. **Deterministic Execution**: Advances sequentially through single applicable transition.
  2. **Bounded Non-Deterministic BFS**: Explores branches in configuration graph with visited set $(state, input\_pos, tuple(stack))$ to detect and prevent infinite $\epsilon$-cycles.
- **Acceptance Criteria**:
  - **Final State Mode**: $input\_pos == |w|$ and $state \in F$.
  - **Empty Stack Mode**: $input\_pos == |w|$ and $|stack| == 0$.
