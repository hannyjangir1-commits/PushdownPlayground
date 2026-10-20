import React from "react";
import { Link } from "react-router-dom";
import {
  FileCode2,
  GitBranch,
  ArrowRightLeft,
  Grid3X3,
  Layers,
  Network,
  FlaskConical,
  BookOpen,
  ArrowRight,
  CheckCircle2,
  Sparkles,
  Zap,
} from "lucide-react";
import { useWorkspace } from "../context/WorkspaceContext";

export const DashboardPage: React.FC = () => {
  const { sampleGrammars, loadSampleGrammar } = useWorkspace();

  const modules = [
    {
      title: "Grammar Workspace",
      desc: "Define Context-Free Grammars, tokenize multi-character symbols, and validate structural properties.",
      icon: FileCode2,
      to: "/grammar",
      color: "from-blue-500 to-indigo-600",
      accent: "text-blue-400",
    },
    {
      title: "Derivations Engine",
      desc: "Step through leftmost and rightmost sentential forms with bounded cycle-free BFS search.",
      icon: GitBranch,
      to: "/derivations",
      color: "from-cyan-500 to-blue-600",
      accent: "text-cyan-400",
    },
    {
      title: "CNF & GNF Converter",
      desc: "Multi-stage pipeline transforming CFGs to Chomsky Normal Form and Greibach Normal Form.",
      icon: ArrowRightLeft,
      to: "/normal-forms",
      color: "from-violet-500 to-purple-600",
      accent: "text-violet-400",
    },
    {
      title: "CYK Parser",
      desc: "Cocke-Younger-Kasami dynamic programming algorithm with interactive triangular table inspection.",
      icon: Grid3X3,
      to: "/cyk",
      color: "from-teal-500 to-emerald-600",
      accent: "text-teal-400",
    },
    {
      title: "PDA Simulator",
      desc: "Step-by-step Pushdown Automaton execution with realistic vertical stack and tape visualization.",
      icon: Layers,
      to: "/pda",
      color: "from-sky-500 to-cyan-600",
      accent: "text-sky-400",
    },
    {
      title: "Parse Tree & Diagram",
      desc: "Interactive visual diagrams with zoom/pan for hierarchical derivations and PDA state machines.",
      icon: Network,
      to: "/parse-tree",
      color: "from-indigo-500 to-violet-600",
      accent: "text-indigo-400",
    },
    {
      title: "Batch Testing",
      desc: "Run comprehensive test suites against CFGs and PDAs with pass/fail tracking and CSV export.",
      icon: FlaskConical,
      to: "/batch-testing",
      color: "from-rose-500 to-pink-600",
      accent: "text-rose-400",
    },
    {
      title: "Theory Guide",
      desc: "Concise formal language theory, definitions, conversion rules, and algorithm walkthroughs.",
      icon: BookOpen,
      to: "/guide",
      color: "from-emerald-500 to-teal-600",
      accent: "text-emerald-400",
    },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Hero Welcome Card */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#0c1322] via-[#090d18] to-[#05070c] p-6 md:p-10 text-white shadow-2xl border border-cyan-500/20">
        {/* Glow ambient background inside card */}
        <div className="absolute top-0 right-0 w-[450px] h-[350px] bg-gradient-to-bl from-cyan-500/15 via-blue-500/10 to-transparent blur-[80px] pointer-events-none" />

        <div className="relative z-10 max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-cyan-500/10 text-cyan-300 border border-cyan-500/30 text-xs font-semibold backdrop-blur-md shadow-[0_0_15px_rgba(6,182,212,0.15)]">
            <Zap className="w-3.5 h-3.5 text-cyan-400" />
            <span>Formal Languages & Automata Theory Studio</span>
          </div>

          <h1 className="text-2xl md:text-4xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white via-slate-100 to-cyan-200">
            Interactive CFG & Pushdown Automata Lab
          </h1>

          <p className="text-slate-300 text-xs md:text-sm leading-relaxed max-w-2xl">
            Experiment with Context-Free Grammars, step-by-step sentential form derivations,
            Chomsky and Greibach Normal Forms, the dynamic CYK membership algorithm, and genuine
            Pushdown Automata stack simulations.
          </p>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <Link
              to="/grammar"
              className="px-5 py-2.5 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-semibold text-xs rounded-xl shadow-lg shadow-cyan-500/25 flex items-center gap-2 transition-all hover:gap-3"
            >
              <span>Open Grammar Workspace</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              to="/pda"
              className="px-5 py-2.5 bg-slate-800/80 hover:bg-slate-700/80 text-slate-200 font-semibold text-xs rounded-xl border border-slate-700/80 hover:border-slate-600 transition-all backdrop-blur-sm"
            >
              Simulate Pushdown Automaton
            </Link>
          </div>
        </div>
      </div>

      {/* Recommended Pedagogical Learning Path */}
      <div className="glass-card rounded-2xl p-6 shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider text-[11px] text-slate-400">
            Recommended Pedagogical Learning Sequence
          </h2>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
          {[
            { step: "01", name: "Grammar", to: "/grammar" },
            { step: "02", name: "Derivations", to: "/derivations" },
            { step: "03", name: "CNF / GNF", to: "/normal-forms" },
            { step: "04", name: "CYK Table", to: "/cyk" },
            { step: "05", name: "PDA Stack", to: "/pda" },
            { step: "06", name: "Parse Tree", to: "/parse-tree" },
            { step: "07", name: "Batch Tests", to: "/batch-testing" },
          ].map((item, idx) => (
            <Link
              key={idx}
              to={item.to}
              className="flex flex-col items-center justify-center p-3.5 rounded-xl bg-slate-50 dark:bg-[#111726]/60 border border-slate-200/80 dark:border-[#1f293d] hover:border-cyan-500/40 hover:shadow-[0_0_15px_rgba(6,182,212,0.1)] transition-all group text-center"
            >
              <span className="w-7 h-7 rounded-lg bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 text-xs font-mono font-bold flex items-center justify-center mb-1.5 group-hover:bg-gradient-to-r group-hover:from-cyan-500 group-hover:to-blue-600 group-hover:text-white transition-all">
                {item.step}
              </span>
              <span className="text-xs font-medium text-slate-700 dark:text-slate-300 group-hover:text-cyan-400 transition-colors">
                {item.name}
              </span>
            </Link>
          ))}
        </div>
      </div>

      {/* Preset Grammars Cards */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white">Sample Formal Grammars</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Select any preconfigured language to load it into all workspace modules.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {sampleGrammars.map((sample) => (
            <div
              key={sample.id}
              className="glass-card flex flex-col justify-between p-5 rounded-2xl shadow-sm hover:shadow-lg hover:border-cyan-500/40 dark:hover:border-cyan-500/40 transition-all duration-200 group"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold text-sm text-slate-900 dark:text-white group-hover:text-cyan-400 transition-colors">
                    {sample.name}
                  </h3>
                  <span className="text-[10px] font-mono px-2 py-0.5 bg-slate-100 dark:bg-slate-800/80 rounded-md text-cyan-400 font-bold border border-cyan-500/20">
                    S: {sample.start_symbol}
                  </span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mb-3">{sample.description}</p>
                <pre className="p-3 bg-slate-50 dark:bg-[#07090e] rounded-xl text-xs font-mono text-cyan-400 border border-slate-200 dark:border-[#192233] overflow-x-auto whitespace-pre-wrap mb-4 shadow-inner">
                  {sample.raw_text}
                </pre>
              </div>

              <button
                onClick={() => loadSampleGrammar(sample.id)}
                className="w-full py-2 bg-slate-100 dark:bg-slate-800/80 hover:bg-gradient-to-r hover:from-cyan-500 hover:to-blue-600 hover:text-white text-slate-700 dark:text-slate-300 text-xs font-semibold rounded-xl transition-all duration-150 flex items-center justify-center gap-1.5 shadow-sm"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Load Into Workspace</span>
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Interactive Modules Grid */}
      <div>
        <h2 className="text-base font-bold text-slate-900 dark:text-white mb-4">All Interactive Modules</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {modules.map((m, idx) => (
            <Link
              key={idx}
              to={m.to}
              className="glass-card flex flex-col justify-between p-5 rounded-2xl shadow-sm hover:shadow-xl hover:border-cyan-500/40 dark:hover:border-cyan-500/40 transition-all duration-200 group"
            >
              <div>
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${m.color} text-white flex items-center justify-center shadow-lg mb-3.5 group-hover:scale-105 transition-transform`}>
                  <m.icon className="w-5 h-5" />
                </div>
                <h3 className="font-semibold text-sm text-slate-900 dark:text-white group-hover:text-cyan-400 transition-colors">
                  {m.title}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5 leading-relaxed">
                  {m.desc}
                </p>
              </div>

              <div className="mt-4 flex items-center text-xs font-semibold text-cyan-500 dark:text-cyan-400 group-hover:translate-x-1 transition-transform">
                <span>Launch</span>
                <ArrowRight className="w-3.5 h-3.5 ml-1" />
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};
