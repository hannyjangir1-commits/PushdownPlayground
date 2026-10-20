import React, { useState } from "react";
import { useLocation } from "react-router-dom";
import { Moon, Sun, HelpCircle, Sparkles, BookMarked, Menu, Terminal } from "lucide-react";
import { useWorkspace } from "../../context/WorkspaceContext";

export const Topbar: React.FC<{ onMobileMenuToggle?: () => void }> = ({ onMobileMenuToggle }) => {
  const location = useLocation();
  const {
    theme,
    toggleTheme,
    parsedGrammar,
    sampleGrammars,
    loadSampleGrammar,
  } = useWorkspace();

  const [showHelp, setShowHelp] = useState(false);

  const routeTitles: Record<string, string> = {
    "/": "Overview & Studio Dashboard",
    "/grammar": "Context-Free Grammar Workspace",
    "/derivations": "Sentential Form Derivations",
    "/normal-forms": "Normal Forms Engine (CNF & GNF)",
    "/cyk": "CYK Membership Dynamic Programming",
    "/pda": "Pushdown Automaton (PDA) Simulator",
    "/parse-tree": "Hierarchical Parse Tree",
    "/automata": "State-Transition Diagram",
    "/batch-testing": "Automated Batch Testing Suite",
    "/guide": "Theoretical Foundations Guide",
    "/settings": "Workspace & Persistence Settings",
  };

  const title = routeTitles[location.pathname] || "Theory of Computation Studio";

  return (
    <>
      <header className="sticky top-0 z-30 flex items-center justify-between h-18 px-4 md:px-8 glass-panel border-b border-slate-200/80 dark:border-[#192233] transition-colors">
        {/* Left side: Mobile Menu + Page Header */}
        <div className="flex items-center gap-3">
          {onMobileMenuToggle && (
            <button
              onClick={onMobileMenuToggle}
              className="p-2 text-slate-500 hover:text-slate-100 hover:bg-slate-800/50 rounded-xl md:hidden transition-colors"
            >
              <Menu className="w-5 h-5" />
            </button>
          )}

          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-sm md:text-base font-bold text-slate-900 dark:text-white tracking-tight">
                {title}
              </h1>
            </div>
            <div className="flex items-center gap-1.5 text-[11px] text-slate-400 font-mono">
              <span className="text-cyan-500">studio</span>
              <span>/</span>
              <span className="capitalize">{location.pathname.replace("/", "") || "dashboard"}</span>
            </div>
          </div>
        </div>

        {/* Right side: Quick Sample Selector & Actions */}
        <div className="flex items-center gap-2 md:gap-3">
          {/* Preset Sample Selector */}
          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-slate-100 dark:bg-[#111726] rounded-xl border border-slate-200 dark:border-[#1f293d] text-xs shadow-sm">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            <span className="text-slate-400 text-[11px] font-sans">Example:</span>
            <select
              onChange={(e) => {
                if (e.target.value) loadSampleGrammar(e.target.value);
              }}
              defaultValue=""
              className="bg-transparent text-slate-800 dark:text-slate-200 font-medium cursor-pointer focus:outline-none text-xs"
            >
              <option value="" disabled>Load Preset...</option>
              {sampleGrammars.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>

          {/* Active grammar pill */}
          {parsedGrammar && (
            <div className="hidden lg:flex items-center gap-2 px-3 py-1 bg-cyan-500/10 text-cyan-300 border border-cyan-500/30 rounded-xl text-xs font-mono shadow-[0_0_12px_rgba(6,182,212,0.15)]">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse shadow-[0_0_8px_#38bdf8]" />
              <span className="font-bold">G: {parsedGrammar.start_symbol}</span>
            </div>
          )}

          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="p-2 text-slate-500 hover:text-cyan-400 hover:bg-slate-800/40 rounded-xl transition-all"
            title={theme === "dark" ? "Switch to Light Mode" : "Switch to Dark Mode"}
          >
            {theme === "dark" ? <Sun className="w-4 h-4 text-cyan-300" /> : <Moon className="w-4 h-4 text-slate-600" />}
          </button>

          {/* Help Modal Trigger */}
          <button
            onClick={() => setShowHelp(true)}
            className="p-2 text-slate-500 hover:text-cyan-400 hover:bg-slate-800/40 rounded-xl transition-all"
            title="Formal Theory Cheat-Sheet"
          >
            <HelpCircle className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Help Modal */}
      {showHelp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-200">
          <div className="w-full max-w-lg bg-[#0b0f19] border border-[#1f293d] rounded-3xl shadow-2xl p-6 overflow-hidden text-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-[#192233]">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                  <BookMarked className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-white">Formal Languages Cheat-Sheet</h3>
                  <span className="text-[10px] text-slate-400 font-mono">Mathematical Definitions</span>
                </div>
              </div>
              <button
                onClick={() => setShowHelp(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <div className="mt-4 space-y-3.5 text-xs text-slate-300 max-h-[60vh] overflow-y-auto pr-1">
              <div className="p-3 rounded-2xl bg-[#111726] border border-[#192233]">
                <p className="font-bold text-cyan-300 mb-1">Context-Free Grammar G = (V, Σ, P, S)</p>
                <p className="text-[11px] text-slate-400">
                  <span className="font-mono text-violet-400 font-bold">V</span>: Non-terminals &bull;{" "}
                  <span className="font-mono text-teal-400 font-bold">Σ</span>: Terminals &bull;{" "}
                  <span className="font-mono text-cyan-400 font-bold">ε</span>: Empty string &bull;{" "}
                  <span className="font-mono text-slate-300 font-bold">S</span>: Start symbol.
                </p>
              </div>

              <div className="p-3 rounded-2xl bg-[#111726] border border-[#192233]">
                <p className="font-bold text-cyan-300 mb-1">Chomsky Normal Form (CNF)</p>
                <p className="text-[11px] text-slate-400">
                  Productions must be <code className="font-mono text-violet-300 font-bold">A → B C</code> (two non-terminals) or <code className="font-mono text-teal-300 font-bold">A → a</code> (one terminal). Epsilon allowed only for S₀ if ε ∈ L(G).
                </p>
              </div>

              <div className="p-3 rounded-2xl bg-[#111726] border border-[#192233]">
                <p className="font-bold text-cyan-300 mb-1">Greibach Normal Form (GNF)</p>
                <p className="text-[11px] text-slate-400">
                  Productions must be <code className="font-mono text-cyan-300 font-bold">A → a A₁ A₂ ... Aₖ</code> (one terminal followed by zero or more non-terminals).
                </p>
              </div>

              <div className="p-3 rounded-2xl bg-[#111726] border border-[#192233]">
                <p className="font-bold text-cyan-300 mb-1">Pushdown Automaton M = (Q, Σ, Γ, δ, q₀, Z₀, F)</p>
                <p className="text-[11px] text-slate-400">
                  Transition <code className="font-mono text-sky-400 font-bold">δ(q, a, X) → (p, γ)</code> reads symbol a (or ε), pops stack top X, pushes sequence γ, and transitions to state p.
                </p>
              </div>
            </div>

            <div className="mt-5 pt-3 border-t border-[#192233] flex justify-end">
              <button
                onClick={() => setShowHelp(false)}
                className="px-5 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white text-xs font-semibold rounded-xl shadow-lg shadow-cyan-500/20 transition-all"
              >
                Close Cheat-Sheet
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
