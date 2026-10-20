import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
  BookOpen,
  ArrowRight,
  ExternalLink,
  Code2,
  Cpu,
  Layers,
  Grid3X3,
  Network,
  GitBranch,
} from "lucide-react";

export const GuidePage: React.FC = () => {
  const [selectedTopic, setSelectedTopic] = useState("cfg");

  const topics = [
    { id: "cfg", title: "Context-Free Grammars (CFG)", icon: Code2 },
    { id: "derivations", title: "Derivations (LM / RM)", icon: GitBranch },
    { id: "cnf", title: "Chomsky Normal Form (CNF)", icon: Cpu },
    { id: "gnf", title: "Greibach Normal Form (GNF)", icon: Cpu },
    { id: "cyk", title: "CYK Dynamic Programming", icon: Grid3X3 },
    { id: "pda", title: "Pushdown Automata (PDA)", icon: Layers },
    { id: "parse-tree", title: "Parse Trees & Ambiguity", icon: Network },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="pb-4 border-b border-white/5">
        <div className="flex items-center gap-2 mb-1">
          <span className="w-2 h-2 rounded-full bg-cyan-400 shadow-[0_0_8px_#06b6d4]" />
          <span className="text-[11px] font-mono font-semibold tracking-wider uppercase text-cyan-400">
            Theoretical Foundations
          </span>
        </div>
        <h1 className="text-xl md:text-2xl font-bold tracking-tight text-white font-display">
          Formal Languages &amp; Automata Theory Guide
        </h1>
        <p className="text-xs md:text-sm text-slate-400">
          Rigorous mathematical definitions, algorithm explanations, conversion steps, and interactive tool deep-links.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* Navigation Sidebar (4 cols) */}
        <div className="md:col-span-4 space-y-2">
          <span className="text-xs font-mono font-semibold text-slate-400 uppercase tracking-wider block px-2 mb-2">
            Theory Topics
          </span>
          {topics.map((t) => (
            <button
              key={t.id}
              onClick={() => setSelectedTopic(t.id)}
              className={`w-full text-left px-4 py-3 rounded-xl text-xs font-medium flex items-center justify-between transition-all ${
                selectedTopic === t.id
                  ? "bg-gradient-to-r from-cyan-500/20 to-blue-500/20 text-cyan-300 border border-cyan-500/40 shadow-lg shadow-cyan-950/30 font-bold"
                  : "glass-card text-slate-300 hover:text-white hover:border-white/20 border border-white/10"
              }`}
            >
              <div className="flex items-center gap-3">
                <t.icon className={`w-4 h-4 flex-shrink-0 ${selectedTopic === t.id ? "text-cyan-400" : "text-slate-400"}`} />
                <span>{t.title}</span>
              </div>
              <ArrowRight className="w-3.5 h-3.5 opacity-60" />
            </button>
          ))}
        </div>

        {/* Topic Content Panel (8 cols) */}
        <div className="md:col-span-8 glass-card p-6 border border-white/10 shadow-2xl space-y-6">
          {selectedTopic === "cfg" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-white/10">
                <h2 className="text-base font-bold text-white">
                  Context-Free Grammars G = (V, Σ, P, S)
                </h2>
                <Link
                  to="/grammar"
                  className="px-3.5 py-1.5 bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all shadow-sm"
                >
                  <span>Open Editor</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </Link>
              </div>

              <div className="space-y-3 text-xs text-slate-300 leading-relaxed">
                <p>
                  A <strong>Context-Free Grammar (CFG)</strong> is a 4-tuple{" "}
                  <code className="font-mono text-cyan-400 font-bold">G = (V, Σ, P, S)</code> where:
                </p>
                <ul className="list-disc list-inside space-y-1.5 pl-2">
                  <li><strong>V</strong>: Finite set of non-terminal symbols (variables), usually uppercase letters like <code>S, A, B</code>.</li>
                  <li><strong>Σ</strong>: Finite set of terminal symbols disjoint from V (e.g. <code>a, b, +, *</code>).</li>
                  <li><strong>P</strong>: Finite set of production rules of the form <code>A → α</code>, where <code>A ∈ V</code> and <code>α ∈ (V ∪ Σ)*</code>.</li>
                  <li><strong>S ∈ V</strong>: Designated start symbol.</li>
                </ul>

                <div className="p-4 bg-slate-950/60 rounded-xl border border-white/10 space-y-1.5">
                  <span className="font-semibold text-white">Canonical Example: Equal a's and b's</span>
                  <pre className="font-mono text-cyan-400 text-sm">S → a S b | ε</pre>
                  <p className="text-[11px] text-slate-400">
                    Generates the language L = &#123;aⁿbⁿ | n ≥ 0&#125;. Epsilon (ε) represents the base case of 0 a's and 0 b's.
                  </p>
                </div>
              </div>
            </div>
          )}

          {selectedTopic === "derivations" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-white/10">
                <h2 className="text-base font-bold text-white">
                  Derivations: Leftmost &amp; Rightmost
                </h2>
                <Link
                  to="/derivations"
                  className="px-3.5 py-1.5 bg-violet-500/10 hover:bg-violet-500/20 text-violet-300 border border-violet-500/30 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all shadow-sm"
                >
                  <span>Open Derivations</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </Link>
              </div>

              <div className="space-y-3 text-xs text-slate-300 leading-relaxed">
                <p>
                  A <strong>derivation</strong> is a sequence of production rule applications transforming the start symbol <code>S</code> into a terminal string <code>w ∈ Σ*</code>.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                  <div className="p-4 bg-slate-950/60 rounded-xl border border-white/10">
                    <h4 className="font-bold text-white mb-1">Leftmost Derivation (LM)</h4>
                    <p className="text-[11px] text-slate-400">
                      At every step, the <em>leftmost</em> non-terminal variable in the current sentential form is replaced.
                    </p>
                  </div>
                  <div className="p-4 bg-slate-950/60 rounded-xl border border-white/10">
                    <h4 className="font-bold text-white mb-1">Rightmost Derivation (RM)</h4>
                    <p className="text-[11px] text-slate-400">
                      At every step, the <em>rightmost</em> non-terminal variable in the current sentential form is replaced.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {selectedTopic === "cnf" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-white/10">
                <h2 className="text-base font-bold text-white">
                  Chomsky Normal Form (CNF)
                </h2>
                <Link
                  to="/normal-forms"
                  className="px-3.5 py-1.5 bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all shadow-sm"
                >
                  <span>CNF Converter</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </Link>
              </div>

              <div className="space-y-3 text-xs text-slate-300 leading-relaxed">
                <p>
                  A context-free grammar is in <strong>Chomsky Normal Form (CNF)</strong> if every production is of one of two forms:
                </p>
                <div className="p-4 bg-slate-950/60 rounded-xl border border-white/10 font-mono text-xs text-cyan-300 space-y-1">
                  <p>1. A → B C (two non-terminals)</p>
                  <p>2. A → a (single terminal)</p>
                  <p>3. S₀ → ε (permitted only for the start symbol if ε ∈ L(G))</p>
                </div>
                <h4 className="font-bold text-white pt-2 font-mono text-xs uppercase tracking-wider">The 7 Conversion Stages:</h4>
                <ol className="list-decimal list-inside space-y-1.5 pl-2 text-slate-300">
                  <li><strong>Start Symbol Isolation:</strong> Introduce S₀ → S if S appears on any RHS.</li>
                  <li><strong>Nullable Set:</strong> Compute variables deriving ε via fixed-point iteration.</li>
                  <li><strong>Eliminate ε-Rules:</strong> Expand combinations omitting nullable variables.</li>
                  <li><strong>Eliminate Unit Rules:</strong> Compute unit pairs (A, B) such that A ⇒* B.</li>
                  <li><strong>Eliminate Useless Symbols:</strong> Filter non-generating then unreachable symbols.</li>
                  <li><strong>Replace Terminals:</strong> Create helper rules T_a → a for composite rules (len ≥ 2).</li>
                  <li><strong>Binary Decomposition:</strong> Break long chains (len &gt; 2) into cascades of binary rules.</li>
                </ol>
              </div>
            </div>
          )}

          {selectedTopic === "gnf" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-white/10">
                <h2 className="text-base font-bold text-white">
                  Greibach Normal Form (GNF)
                </h2>
                <Link
                  to="/normal-forms"
                  className="px-3.5 py-1.5 bg-violet-500/10 hover:bg-violet-500/20 text-violet-300 border border-violet-500/30 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all shadow-sm"
                >
                  <span>GNF Converter</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </Link>
              </div>

              <div className="space-y-3 text-xs text-slate-300 leading-relaxed">
                <p>
                  A grammar is in <strong>Greibach Normal Form (GNF)</strong> if every production begins with exactly one terminal symbol, followed by zero or more non-terminals:
                </p>
                <div className="p-4 bg-slate-950/60 rounded-xl border border-white/10 font-mono text-xs text-violet-300">
                  A → a A₁ A₂ ... Aₖ (a ∈ Σ, Aᵢ ∈ V, k ≥ 0)
                </div>
                <p>
                  Because every step consumes exactly one terminal symbol from the input, GNF grammars guarantee that any derivation of a string of length <code>n</code> takes exactly <code>n</code> steps, preventing infinite recursion during parsing.
                </p>
              </div>
            </div>
          )}

          {selectedTopic === "cyk" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-white/10">
                <h2 className="text-base font-bold text-white">
                  Cocke-Younger-Kasami (CYK) Algorithm
                </h2>
                <Link
                  to="/cyk"
                  className="px-3.5 py-1.5 bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all shadow-sm"
                >
                  <span>Open CYK Parser</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </Link>
              </div>

              <div className="space-y-3 text-xs text-slate-300 leading-relaxed">
                <p>
                  The CYK algorithm is a dynamic programming membership algorithm that decides whether <code>w ∈ L(G)</code> in polynomial time <strong>O(n³ · |P|)</strong>, where <code>G</code> is in Chomsky Normal Form (CNF).
                </p>
                <div className="p-4 bg-slate-950/60 rounded-xl border border-white/10 space-y-2">
                  <p className="font-semibold text-white">Table Structure T[length, start]:</p>
                  <p className="font-mono text-[11px] text-cyan-400">
                    Length 1: T[1, i] = &#123; A | A → aᵢ ∈ P &#125;
                  </p>
                  <p className="font-mono text-[11px] text-cyan-400">
                    Length l &gt; 1: T[l, i] = &#123; A | A → B C ∈ P, B ∈ T[k, i], C ∈ T[l-k, i+k] &#125;
                  </p>
                  <p className="text-[11px] text-slate-400">
                    Final Acceptance: String w is accepted if and only if start symbol <code>S ∈ T[n, 1]</code> covering the entire string.
                  </p>
                </div>
              </div>
            </div>
          )}

          {selectedTopic === "pda" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-white/10">
                <h2 className="text-base font-bold text-white">
                  Pushdown Automata (PDA)
                </h2>
                <Link
                  to="/pda"
                  className="px-3.5 py-1.5 bg-violet-500/10 hover:bg-violet-500/20 text-violet-300 border border-violet-500/30 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all shadow-sm"
                >
                  <span>Open Simulator</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </Link>
              </div>

              <div className="space-y-3 text-xs text-slate-300 leading-relaxed">
                <p>
                  A <strong>Pushdown Automaton (PDA)</strong> is a 7-tuple:{" "}
                  <code className="font-mono text-cyan-400 font-bold">M = (Q, Σ, Γ, δ, q₀, Z₀, F)</code>:
                </p>
                <ul className="list-disc list-inside space-y-1.5 pl-2">
                  <li><strong>Q</strong>: Finite set of states.</li>
                  <li><strong>Σ</strong>: Input alphabet.</li>
                  <li><strong>Γ</strong>: Stack alphabet (includes Z₀).</li>
                  <li><strong>δ: Q × (Σ ∪ &#123;ε&#125;) × Γ → P(Q × Γ*)</strong>: Transition function.</li>
                  <li><strong>q₀ ∈ Q</strong>: Initial start state.</li>
                  <li><strong>Z₀ ∈ Γ</strong>: Initial start stack symbol.</li>
                  <li><strong>F ⊆ Q</strong>: Set of accepting states.</li>
                </ul>

                <h4 className="font-bold text-white pt-2 font-mono text-xs uppercase tracking-wider">Acceptance Modes:</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="p-4 bg-slate-950/60 rounded-xl border border-white/10">
                    <p className="font-bold text-white">Final State Acceptance</p>
                    <p className="text-[11px] text-slate-400 mt-1">
                      Input string is fully consumed and automaton ends in an accepting state <code>q ∈ F</code>.
                    </p>
                  </div>
                  <div className="p-4 bg-slate-950/60 rounded-xl border border-white/10">
                    <p className="font-bold text-white">Empty Stack Acceptance</p>
                    <p className="text-[11px] text-slate-400 mt-1">
                      Input string is fully consumed and the stack is completely empty (all symbols including Z₀ popped).
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {selectedTopic === "parse-tree" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-white/10">
                <h2 className="text-base font-bold text-white">
                  Parse Trees &amp; Ambiguity
                </h2>
                <Link
                  to="/parse-tree"
                  className="px-3.5 py-1.5 bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all shadow-sm"
                >
                  <span>Open Parse Tree</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </Link>
              </div>

              <div className="space-y-3 text-xs text-slate-300 leading-relaxed">
                <p>
                  A <strong>parse tree</strong> is an ordered, rooted tree representing the syntactic structure of a string derived from a CFG:
                </p>
                <ul className="list-disc list-inside space-y-1.5 pl-2">
                  <li>The root is labeled with the start symbol <code>S</code>.</li>
                  <li>Interior nodes are labeled with non-terminals from <code>V</code>.</li>
                  <li>Leaf nodes are labeled with terminals from <code>Σ</code> or <code>ε</code>.</li>
                  <li>If an interior node <code>A</code> has children <code>X₁, X₂, ..., Xₖ</code>, then <code>A → X₁ X₂ ... Xₖ</code> is a production in <code>P</code>.</li>
                </ul>
                <p>
                  A grammar is <strong>ambiguous</strong> if there exists at least one string with two or more distinct parse trees (or distinct leftmost derivations).
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
