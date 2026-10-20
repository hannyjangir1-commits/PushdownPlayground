# Algorithm Flowcharts
## Interactive CFG and PDA Learning Tool

---

## 1. Overall Application Lifecycle & Workspace Flow

```mermaid
flowchart TD
    Start([User Opens Application]) --> ModeSelect{Select Entry Mode}
    ModeSelect -->|Grammar Path| LoadGrammar[Enter / Load CFG in Grammar Editor]
    ModeSelect -->|PDA Path| LoadPDA[Enter / Select Pushdown Automaton]

    LoadGrammar --> ValidateCFG{Validate Syntax & Disjoint Sets}
    ValidateCFG -->|Errors| DisplaySyntaxErr[Display Parse/Grammar Error Alert]
    ValidateCFG -->|Valid| AnalyzeProperties[Compute Nullable, Unit, Reachable, Generating]

    AnalyzeProperties --> GrammarActions{Select Action}
    GrammarActions -->|Derive String| DerivationEngine[Run Bounded BFS Search]
    GrammarActions -->|Convert CNF| CNFPipeline[Execute 7-Stage CNF Pipeline]
    GrammarActions -->|Convert GNF| GNFPipeline[Execute GNF Transformation]
    GrammarActions -->|Test String| CYKEngine[Run CYK Dynamic Programming]
    GrammarActions -->|Batch Suite| BatchSuiteCFG[Run CFG Test Suite]

    DerivationEngine --> DerivationSteps[Display StepPlayer & Sentential Ribbon]
    DerivationSteps --> ParseTree[Generate Interactive Parse Tree]

    CNFPipeline --> CNFValidator{Independent CNF Validation}
    CNFValidator --> DisplayStagesCNF[Display Stage Stepper & Intermediate Rules]

    GNFPipeline --> GNFValidator{Independent GNF Validation}
    GNFValidator --> DisplayStagesGNF[Display Stage Stepper & Helper Variables]

    CYKEngine --> CYKTable[Construct Triangular Parsing Table]
    CYKTable --> InspectSplits[Inspect Substring Splits on Cell Click]

    LoadPDA --> ValidatePDA{Validate 7-Tuple & Determinism}
    ValidatePDA --> PDASim[Simulate Input Tape Step-by-Step]
    PDASim --> StackRender[Render Animated Vertical Stack & Ribbon]
    PDASim --> AutomataGraph[Render State Transition Diagram]
    LoadPDA --> BatchSuitePDA[Run PDA Batch Test Suite]
```

---

## 2. Chomsky Normal Form (CNF) 7-Stage Conversion Pipeline

```mermaid
flowchart TD
    CFGStart([Input Grammar G]) --> S1[Stage 1: Isolate Start Symbol S0 -> S if needed]
    S1 --> S2[Stage 2: Fixed-point Computation of Nullable Set]
    S2 --> S3[Stage 3: Eliminate Epsilon Rules by Subset Expansion]
    S3 --> S4[Stage 4: Unit Production Elimination via Transitive Pairs]
    S4 --> S5A[Stage 5a: Remove Non-Generating Variables]
    S5A --> S5B[Stage 5b: Remove Unreachable Symbols from S0]
    S5B --> S6[Stage 6: Replace Terminals in Composite Rules with T_a -> a]
    S6 --> S7[Stage 7: Decompose Long Rules into Binary Cascades X_i]
    S7 --> CNFCheck{Independent CNF Validator}
    CNFCheck -->|Valid| CNFDone([Verified Chomsky Normal Form Output])
    CNFCheck -->|Invalid| CNFFail([Error Diagnostics])
```

---

## 3. Greibach Normal Form (GNF) Conversion Pipeline

```mermaid
flowchart TD
    GNFStart([Input Grammar G]) --> Simplify[Simplify Grammar via CNF Base]
    Simplify --> OrderNTs[Order Non-Terminals: A1, A2, ..., Am with S0 = A1]
    OrderNTs --> ForwardLoop[For i = 1 to m: Substitute Aj for j < i]
    ForwardLoop --> DetectLeftRec{Direct Left Recursion on Ai?}
    DetectLeftRec -->|Yes| ElimLeftRec[Introduce Helper Bi: Ai -> beta | beta Bi, Bi -> alpha | alpha Bi]
    DetectLeftRec -->|No| NextForward[Continue Forward Pass]
    ElimLeftRec --> NextForward
    NextForward --> BackSub[Back-Substitution: For i = m-1 down to 1, substitute leading non-terminals]
    BackSub --> HelperSub[Substitute leading non-terminals in Bi rules]
    HelperSub --> TrailingTerminals[Replace trailing terminals with helper rules T_a -> a]
    TrailingTerminals --> GNFCheck{Independent GNF Validator}
    GNFCheck -->|Valid| GNFDone([Verified Greibach Normal Form Output])
    GNFCheck -->|Invalid| GNFFail([Error Diagnostics])
```

---

## 4. Cocke-Younger-Kasami (CYK) Membership Testing Flowchart

```mermaid
flowchart TD
    CYKInput([Input String w and CNF Grammar G]) --> LenCheck{Is String Empty?}
    LenCheck -->|Yes| EpsilonCheck{Does Grammar contain S0 -> ε?}
    EpsilonCheck -->|Yes| AcceptEps([Accept ε])
    EpsilonCheck -->|No| RejectEps([Reject ε])

    LenCheck -->|No| Tokenize[Tokenize w into terminals a1, a2, ..., an]
    Tokenize --> BaseLevel[Base Level l = 1: For each a_i, T[1, i] = { A | A -> a_i in P }]
    BaseLevel --> LoopLength[For substring length l = 2 to n]
    LoopLength --> LoopStart[For start index s = 0 to n - l]
    LoopStart --> LoopSplit[For split point k = 1 to l - 1]
    LoopSplit --> MatchRules[Lookup binary rules A -> B C where B in T[k, s] and C in T[l-k, s+k]]
    MatchRules --> RecordEvidence[Add A to cell T[l, s] and record split evidence]
    RecordEvidence --> SplitsDone{More splits for cell?}
    SplitsDone -->|Yes| LoopSplit
    SplitsDone -->|No| CellsDone{More cells for length l?}
    CellsDone -->|Yes| LoopStart
    CellsDone -->|No| LenDone{More lengths l <= n?}
    LenDone -->|Yes| LoopLength
    LenDone -->|No| Decision{Is Start Symbol S in Top Cell T[n, 0]?}
    Decision -->|Yes| CYKAccept([String ACCEPTED: Construct Parse Tree])
    Decision -->|No| CYKReject([String REJECTED])
```

---

## 5. Pushdown Automata (PDA) Simulation Loop

```mermaid
flowchart TD
    PDAStart([Start: Configuration (q0, input, [Z0])]) --> CheckImmediate{Acceptance Condition Satisfied?}
    CheckImmediate -->|Yes| PDAAccept([String ACCEPTED])
    CheckImmediate -->|No| QueueInit[Initialize BFS Queue and Visited Configuration Set]

    QueueInit --> QueuePop[Pop Configuration: (state, input_pos, stack)]
    QueuePop --> HaltCheck{Input Consumed & Stack/State Valid?}
    HaltCheck -->|Yes| PDAAccept

    HaltCheck -->|No| MatchTrans[Find Applicable Transitions Matching Current State, Stack Top, and Input/Epsilon]
    MatchTrans --> AnyTrans{Applicable Transitions Found?}
    AnyTrans -->|No| QueueEmptyCheck{BFS Queue Empty?}
    AnyTrans -->|Yes| ForEachTrans[For each transition: delta(q, a, X) -> (p, gamma)]

    ForEachTrans --> UpdateStack[Pop X, Push gamma in reverse order so top is first]
    UpdateStack --> AdvanceTape[If input consumed, input_pos += 1; if epsilon, position unchanged]
    AdvanceTape --> StateCheck{New Configuration Satisfies Acceptance?}
    StateCheck -->|Yes| PDAAccept
    StateCheck -->|No| VisitedCheck{Configuration in Visited Set?}
    VisitedCheck -->|No| Enqueue[Add to Visited Set & BFS Queue]
    VisitedCheck -->|Yes| NextTrans
    Enqueue --> NextTrans{More applicable transitions?}
    NextTrans -->|Yes| ForEachTrans
    NextTrans -->|No| QueueEmptyCheck

    QueueEmptyCheck -->|No| QueuePop
    QueueEmptyCheck -->|Yes| PDAReject([String REJECTED: All exploration paths exhausted])
```
