# Interactive CFG and PDA Learning Tool
### Full-Stack Formal Languages & Automata Theory Educational Platform

[![FastAPI](https://img.shields.io/badge/FastAPI-0.110+-009688.svg?style=flat&logo=fastapi)](https://fastapi.tiangolo.com)
[![React](https://img.shields.io/badge/React-19.0+-61DAFB.svg?style=flat&logo=react)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-3178C6.svg?style=flat&logo=typescript)](https://www.typescriptlang.org)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-v4-38B2AC.svg?style=flat&logo=tailwind-css)](https://tailwindcss.com)
[![Pytest](https://img.shields.io/badge/Tests-32%20Passed-brightgreen.svg?style=flat&logo=pytest)](https://docs.pytest.org)

An interactive, mathematically rigorous web application designed to help computer science students master Context-Free Grammars (CFGs), normal form transformations (CNF and GNF), CYK parsing, and Pushdown Automata (PDA) simulations.

---

## 🚀 Key Features

1. **Grammar Workspace**: Edit production rules $A \to \alpha$, select start symbols, tokenize multi-character tokens (`id`, `Expr`), and compute fixed-point properties (nullable, unit, generating, and reachable variables).
2. **Derivation Engine**: Step through leftmost (LM) and rightmost (RM) sentential form expansions with cycle-bounded breadth-first search and sentential ribbon highlighting.
3. **Chomsky Normal Form (CNF) Pipeline**: Multi-stage pipeline executing start isolation, $\epsilon$-elimination, unit production elimination, useless variable pruning, terminal replacement, and binary decomposition, validated by an independent CNF validator.
4. **Greibach Normal Form (GNF) Pipeline**: Systematic transformation with non-terminal ordering, immediate left-recursion elimination (introducing $B_i$ helper variables), back-substitution, and independent validation.
5. **Cocke-Younger-Kasami (CYK) Parser**: Dynamic programming triangular table parser displaying cell coordinates, substring lengths $1 \dots n$, and interactive cell inspections showing matching splits and rules.
6. **Pushdown Automaton (PDA) Simulator**: Step-by-step 7-tuple automaton simulator featuring an animated vertical stack (with dynamic `TOP` indicator), tape reading ribbon, and support for both **Final State** and **Empty Stack** acceptance modes.
7. **Parse Tree Visualization**: Hierarchical parse trees reconstructed from actual derivations with zoom, pan, node property inspector, and direct SVG export.
8. **Automata State Diagram**: Interactive graph visualizing states, initial arrows, accepting double circles, directed labeled edges, and self-loops.
9. **Batch Testing Workbench**: Automated test suite execution for CFGs or PDAs with expected vs. actual metrics, pass/fail tracking, and CSV export.
10. **Interactive Learning Guide**: Theory reference containing formal definitions, mathematical notation, and deep-links to each working tool.
11. **Workspace Persistence**: LocalStorage state management with JSON snapshot export, import validation, and dark/light themes.

---

## 🛠️ Technology Stack

- **Frontend**: React 19, TypeScript, Vite, Tailwind CSS v4, Lucide React, React Router.
- **Backend**: Python 3.11+, FastAPI, Pydantic v2, Uvicorn ASGI server.
- **Algorithm Engine**: Pure Python modules independent of HTTP/UI frameworks.
- **Testing**: Pytest (32 automated unit and integration tests).

---

## 💻 Quick Start Instructions (Windows PowerShell)

### Prerequisites
- Python 3.11 or newer
- Node.js v18 or newer and npm

### 1. Automated Setup
Clone or navigate to the project directory and run the setup script:
```powershell
.\scripts\setup.ps1
```
This automatically creates the Python virtual environment, installs backend packages, and installs frontend npm packages.

### 2. Start Application
Launch both backend and frontend servers with a single command:
```powershell
.\scripts\run.ps1
```
The application will open automatically in your default browser at:
- **Frontend Web App**: [http://localhost:5173/](http://localhost:5173/)
- **FastAPI Backend**: [http://127.0.0.1:8001/](http://127.0.0.1:8001/)
- **Interactive OpenAPI Documentation**: [http://127.0.0.1:8001/docs](http://127.0.0.1:8001/docs)

### 3. Run Automated Tests
Execute the complete test suite:
```powershell
.\scripts\test.ps1
```
All 32 backend tests and the production frontend build will execute and report results.

---

## 📁 Project Structure

```text
cfg-pda-learning-tool/
├── README.md               # Project overview & startup instructions
├── LICENSE                 # MIT License
├── .gitignore              # Git ignore rules
├── .editorconfig           # Code formatting rules
│
├── frontend/               # React + TypeScript + Vite + Tailwind CSS Single-Page App
│   ├── src/
│   │   ├── components/     # AppShell, Sidebar, Topbar, StepPlayer, SymbolBadge
│   │   ├── context/        # WorkspaceContext for global state & persistence
│   │   ├── lib/            # Typed API client
│   │   ├── pages/          # All 11 interactive module pages
│   │   └── types/          # TypeScript interface definitions
│   └── vite.config.ts      # Vite configuration & backend proxy
│
├── backend/                # FastAPI backend & Pure Python Algorithm Engine
│   ├── app/
│   │   ├── core/           # CFG models, CNF/GNF converters, CYK, PDA engine
│   │   ├── api/routes/     # REST endpoints for all formal operations
│   │   └── main.py         # FastAPI application entrypoint
│   ├── requirements.txt    # Python dependencies
│   └── tests/              # 32 Pytest unit and integration tests
│
├── docs/                   # Complete academic documentation
│   ├── ARCHITECTURE.md     # System architecture with Mermaid diagrams
│   ├── ALGORITHMS.md       # Formal algorithms, pseudocode & complexities
│   ├── API.md              # REST API contract with request/response examples
│   ├── TESTING.md          # Test report & execution breakdown
│   ├── USER_GUIDE.md       # User manual for all modules
│   ├── FLOWCHARTS.md       # Visual algorithm flowcharts
│   ├── TEST_CASES.md       # Structured test matrix
│   ├── LIMITATIONS.md      # Theoretical & technical bounds disclosure
│   ├── REPORT_CONTENT.md   # Academic project report draft
│   └── RENDER_DEPLOYMENT.md # Cloud deployment guide for Render
│
├── render.yaml             # Render 1-click Blueprint configuration
├── Dockerfile              # Multi-stage production container
└── scripts/
    ├── setup.ps1           # Automated dependency installer
    ├── run.ps1             # Local development launcher
    └── test.ps1            # Test suite runner
```

---

## 🧪 Verified Test Results

- **Backend Pytest Suite**: 32 / 32 Passed (100% success rate in 0.94s).
- **Frontend Production Build**: `npm run build` bundled 1,957 modules in 698ms with zero errors.

---

## 📜 Academic Attribution

Designed and developed for academic demonstration in Formal Languages and Automata Theory.
Distributed under the [MIT License](LICENSE).
