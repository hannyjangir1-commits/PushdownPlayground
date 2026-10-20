import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRightLeft,
  CheckCircle2,
  XCircle,
  Copy,
  Grid3X3,
  Layers,
  ChevronRight,
  Info,
  Sparkles,
  Play,
  ArrowRight,
} from "lucide-react";
import { useWorkspace } from "../context/WorkspaceContext";
import { apiClient } from "../lib/api-client";
import { SymbolBadge } from "../components/common/SymbolBadge";
import type { NormalFormResult } from "../types";

export const NormalFormsPage: React.FC = () => {
  const { grammarText, parsedGrammar, setGrammarText } = useWorkspace();
  const [selectedForm, setSelectedForm] = useState<"CNF" | "GNF">("CNF");
  const [result, setResult] = useState<NormalFormResult | null>(null);
  const [activeStageIndex, setActiveStageIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const handleConvert = async () => {
    setIsLoading(true);
    setErrorMessage(null);
    setActiveStageIndex(0);
    try {
      if (selectedForm === "CNF") {
        const res = await apiClient.convertToCNF({
          raw_text: grammarText,
          grammar: parsedGrammar || undefined,
        });
        setResult(res);
        if (!res.success) {
          setErrorMessage(res.message);
        }
      } else {
        const res = await apiClient.convertToGNF({
          raw_text: grammarText,
          grammar: parsedGrammar || undefined,
        });
        setResult(res);
        if (!res.success) {
          setErrorMessage(res.message);
        }
      }
    } catch (err: any) {
      setErrorMessage(err.message || "Normal form conversion failed.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyConverted = () => {
    if (result && result.converted_grammar) {
      navigator.clipboard.writeText(result.converted_grammar.raw_text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleUseInWorkspace = () => {
    if (result && result.converted_grammar) {
      setGrammarText(result.converted_grammar.raw_text);
    }
  };

  const activeStage = result && result.stages.length > 0 ? result.stages[activeStageIndex] : null;

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Page Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-white/5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2 h-2 rounded-full bg-cyan-400 shadow-[0_0_8px_#06b6d4]" />
            <span className="text-[11px] font-mono font-semibold tracking-wider uppercase text-cyan-400">
              Grammar Canonical Transformer
            </span>
          </div>
          <h1 className="text-xl md:text-2xl font-bold tracking-tight text-white font-display">
            Normal Forms Conversion (CNF &amp; GNF)
          </h1>
          <p className="text-xs md:text-sm text-slate-400">
            Systematic multi-stage transformations to Chomsky Normal Form and Greibach Normal Form with independent validation.
          </p>
        </div>

        {/* Tab switch */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-950/60 border border-white/10 rounded-xl">
          <button
            onClick={() => {
              setSelectedForm("CNF");
              setResult(null);
            }}
            className={`px-4 py-2 text-xs font-semibold rounded-lg transition-all ${
              selectedForm === "CNF"
                ? "bg-gradient-to-r from-cyan-500/20 to-blue-500/20 text-cyan-300 border border-cyan-500/30 shadow-sm"
                : "text-slate-400 hover:text-white"
            }`}
          >
            Chomsky Normal Form (CNF)
          </button>
          <button
            onClick={() => {
              setSelectedForm("GNF");
              setResult(null);
            }}
            className={`px-4 py-2 text-xs font-semibold rounded-lg transition-all ${
              selectedForm === "GNF"
                ? "bg-gradient-to-r from-violet-500/20 to-indigo-500/20 text-violet-300 border border-violet-500/30 shadow-sm"
                : "text-slate-400 hover:text-white"
            }`}
          >
            Greibach Normal Form (GNF)
          </button>
        </div>
      </div>

      {/* Action / Trigger Banner */}
      <div className="glass-card p-5 border border-white/10 shadow-2xl flex flex-wrap items-center justify-between gap-4">
        <div>
          <h3 className="font-bold text-sm text-white">
            Transform Active Grammar to {selectedForm}
          </h3>
          <p className="text-xs text-slate-400 mt-1 max-w-xl">
            {selectedForm === "CNF"
              ? "Enforces A → BC and A → a (allows S₀ → ε if ε ∈ L(G)). Enables polynomial-time CYK parsing."
              : "Enforces A → a A₁...Aₖ (every rule starts with terminal). Directly applicable to top-down LL and PDA constructions."}
          </p>
        </div>

        <button
          onClick={handleConvert}
          disabled={isLoading}
          className="px-5 py-2.5 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-semibold text-xs rounded-xl shadow-lg shadow-cyan-500/25 flex items-center gap-2 transition-all disabled:opacity-50"
        >
          <Play className="w-4 h-4 fill-white" />
          <span>{isLoading ? "Transforming..." : `Execute ${selectedForm} Pipeline`}</span>
        </button>
      </div>

      {errorMessage && (
        <div className="p-4 bg-rose-500/10 border border-rose-500/30 rounded-2xl text-rose-300 text-xs flex items-start gap-3 backdrop-blur shadow-lg shadow-rose-950/20">
          <XCircle className="w-5 h-5 flex-shrink-0 mt-0.5 text-rose-400" />
          <div>
            <p className="font-bold text-sm text-rose-200">Conversion Error</p>
            <p className="text-xs mt-0.5 font-mono text-rose-300/90">{errorMessage}</p>
          </div>
        </div>
      )}

      {/* Results View */}
      {result && (
        <div className="space-y-6">
          {/* Validation Status Header */}
          <div
            className={`p-4 rounded-2xl border flex items-center justify-between backdrop-blur shadow-lg ${
              result.is_valid
                ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-300 shadow-emerald-950/20"
                : "bg-rose-500/10 border-rose-500/30 text-rose-300 shadow-rose-950/20"
            }`}
          >
            <div className="flex items-center gap-3">
              {result.is_valid ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-400" />
              ) : (
                <XCircle className="w-5 h-5 text-rose-400" />
              )}
              <div>
                <p className="font-bold text-sm text-white">
                  {result.is_valid
                    ? `Independent Validator: Valid ${result.normal_form}`
                    : `Validation Failed`}
                </p>
                <p className="text-xs opacity-90 font-mono">{result.message}</p>
              </div>
            </div>

            {result.normal_form === "CNF" && result.is_valid && (
              <Link
                to="/cyk"
                className="px-4 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-semibold text-xs rounded-xl shadow-lg shadow-emerald-600/25 flex items-center gap-1.5 transition-all"
              >
                <Grid3X3 className="w-3.5 h-3.5" />
                <span>Test in CYK Parser</span>
              </Link>
            )}
          </div>

          {/* Transformation Stages Stepper */}
          <div className="glass-card p-5 border border-white/10 shadow-2xl space-y-4">
            <h3 className="font-bold text-sm text-white">
              Multi-Stage Transformation Pipeline ({result.stages.length} Stages)
            </h3>

            {/* Stepper Tabs */}
            <div className="flex flex-wrap gap-2 pb-3 border-b border-white/10">
              {result.stages.map((st, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveStageIndex(idx)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all ${
                    idx === activeStageIndex
                      ? "bg-gradient-to-r from-cyan-500/25 to-blue-500/25 text-cyan-300 border border-cyan-500/40 shadow-sm"
                      : "bg-slate-950/50 border border-white/5 text-slate-400 hover:text-white"
                  }`}
                >
                  <span className={`w-4 h-4 rounded-full text-[10px] flex items-center justify-center font-bold ${
                    idx === activeStageIndex ? "bg-cyan-400 text-slate-950" : "bg-white/10 text-slate-300"
                  }`}>
                    {st.stage_number}
                  </span>
                  <span>{st.stage_name}</span>
                </button>
              ))}
            </div>

            {/* Stage Detail View */}
            {activeStage && (
              <div className="grid grid-cols-1 md:grid-cols-12 gap-6 pt-2">
                {/* Left: Description & Changes (6 Cols) */}
                <div className="md:col-span-6 space-y-3">
                  <div>
                    <h4 className="font-bold text-sm text-white">
                      Stage {activeStage.stage_number}: {activeStage.stage_name}
                    </h4>
                    <p className="text-xs text-slate-400 mt-1">
                      {activeStage.description}
                    </p>
                  </div>

                  <div className="space-y-1.5">
                    <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block font-mono">
                      Operations Performed:
                    </span>
                    <ul className="space-y-1.5 text-xs text-slate-300">
                      {activeStage.changes_made.map((ch, i) => (
                        <li key={i} className="flex items-start gap-2 bg-slate-950/60 p-2.5 rounded-xl border border-white/5">
                          <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 mt-1.5 flex-shrink-0" />
                          <span className="font-mono text-[11px] text-slate-300">{ch}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Right: Intermediate Grammar (6 Cols) */}
                <div className="md:col-span-6 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider font-mono">
                      Intermediate Grammar at Stage {activeStage.stage_number}:
                    </span>
                    <span className="text-[11px] font-mono text-cyan-400">
                      {activeStage.grammar.productions.length} rules
                    </span>
                  </div>
                  <pre className="p-4 bg-slate-950/80 rounded-xl border border-white/10 font-mono text-xs text-cyan-300 leading-relaxed max-h-64 overflow-y-auto whitespace-pre-wrap selection:bg-cyan-500/30">
                    {activeStage.grammar.raw_text}
                  </pre>
                </div>
              </div>
            )}
          </div>

          {/* Final Converted Grammar Output Card */}
          <div className="glass-card p-6 border border-white/10 shadow-2xl space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-white/10">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-cyan-400" />
                <h3 className="font-bold text-base text-white">
                  Final Converted {result.normal_form} Grammar
                </h3>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleCopyConverted}
                  className="px-3 py-1.5 bg-slate-900/80 hover:bg-slate-800 border border-white/10 text-slate-300 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all shadow-sm"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>{copied ? "Copied!" : "Copy"}</span>
                </button>
                <button
                  onClick={handleUseInWorkspace}
                  className="px-3.5 py-1.5 bg-gradient-to-r from-cyan-500/15 to-blue-500/15 hover:bg-cyan-500/25 text-cyan-300 border border-cyan-500/30 rounded-xl text-xs font-semibold transition-all shadow-sm"
                >
                  Set as Workspace Grammar
                </button>
              </div>
            </div>

            <pre className="p-4 bg-slate-950/80 rounded-xl border border-white/10 font-mono text-sm text-slate-200 leading-relaxed whitespace-pre-wrap selection:bg-cyan-500/30">
              {result.converted_grammar.raw_text}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
};
