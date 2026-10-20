# Theoretical & Technical Limitations
## Interactive CFG and PDA Learning Tool

In accordance with academic integrity and rigorous computer science standards, this document explicitly discloses the theoretical bounds, algorithmic scopes, and environmental limitations of the application.

---

## 1. Theoretical Computability Limitations

### 1.1 Undecidability of Context-Free Grammar Equivalence
- **Theory**: It is a proven theorem of formal language theory (via reduction from the Post Correspondence Problem) that determining whether two arbitrary Context-Free Grammars generate the same language ($L(G_1) = L(G_2)$) is **undecidable**.
- **Application Scope**: The tool does not claim to mathematically prove universal language equivalence between arbitrary user-submitted grammars. For normal form transformations (CNF and GNF), language preservation is guaranteed by using textbook step-by-step algorithms, and empirical verification is performed over bounded test sets.

### 1.2 Unrestricted PDA Simulation and $\epsilon$-Loops
- **Theory**: Non-deterministic Pushdown Automata (NPDAs) can contain cycles of $\epsilon$-transitions that push and pop symbols indefinitely without consuming input symbols.
- **Application Scope**: To guarantee that step-by-step simulation and batch testing always terminate without freezing the server, the simulation engine enforces:
  - Configuration deduplication using visited state hash sets: `(state, input_pos, tuple(stack))`.
  - Configurable safety limits: maximum 1,000 simulation steps and 5,000 configurations explored.
  - If a cyclic branch exhausts these bounds without reaching acceptance or rejection, the engine explicitly reports a status of `LIMIT_EXCEEDED` rather than hanging or returning a false negative.

---

## 2. Algorithmic Complexity Bounds

### 2.1 CYK Algorithm Input Length
- The Cocke-Younger-Kasami (CYK) algorithm constructs a dynamic programming table of size $O(n^2)$ and evaluates $O(n^3 \cdot |P|)$ subproblem combinations.
- **Practical Recommendation**: The interactive table is optimized for educational string lengths ($n \le 30$ symbols). Strings of length $n > 50$ can be evaluated by the backend, but the visual triangular table may require horizontal scrolling.

### 2.2 Greibach Normal Form Algorithmic Scope
- The implemented GNF converter converts simplified grammars by ordering variables, eliminating immediate left recursion, and back-substituting leading non-terminals.
- Grammars containing complex mutual left recursion with $\epsilon$-generating non-terminals must be transformed through the preliminary CNF simplification stage first.

---

## 3. Environment & Local Execution Specifics

### 3.1 Network Port Configuration
- On systems where port 8000 is already bound by existing background services, the backend server automatically runs on port `8001`, and the Vite frontend reverse proxy maps `/api` requests to `http://127.0.0.1:8001`.

### 3.2 Automated Browser Tooling in Restricted Environments
- In certain sandboxed or restricted agent environments, the internal automated Playwright browser driver may encounter network CDN download restrictions (`404 Not Found from playwright.azureedge.net`). 
- When this occurs, the full web application remains 100% operational and accessible by running `.\scripts\run.ps1` and accessing `http://localhost:5173/` in the user's local web browser (Google Chrome, Microsoft Edge, Firefox, or Safari).
