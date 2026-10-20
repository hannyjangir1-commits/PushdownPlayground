import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
  GitBranch,
  Play,
  CheckCircle2,
  XCircle,
  Network,
  Info,
  Clock,
  ArrowRight,
  Sparkles,
} from "lucide-react";
import { useWorkspace } from "../context/WorkspaceContext";
import { apiClient } from "../lib/api-client";
import { StepPlayer } from "../components/common/StepPlayer";
import { SymbolBadge } from "../components/common/SymbolBadge";
import type { DerivationResult } from "../types";

export const DerivationPage: React.FC = () => {
  const { grammarText, parsedGrammar } = useWorkspace();
  const [targetString, setTargetString] = useState("aabb");
  const [mode, setMode] = useState<"LEFTMOST" | "RIGHTMOST">("LEFTMOST");
  const [maxDepth, setMaxDepth] = useState(15);
  const [result, setResult] = useState<DerivationResult | null>(null);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSearch = async () => {
    setIsLoading(true);
    setErrorMsg(null);
    setCurrentStepIndex(0);
    try {
      const res = await apiClient.searchDerivation({
        raw_text: grammarText,
        grammar: parsedGrammar || undefined,
        target_string: targetString,
        mode,
        max_depth: maxDepth,
        max_configurations: 4000,
      });
      setResult(res);
      if (!res.success) {
        setErrorMsg(res.message);
      }
    } catch (err: any) {
      setErrorMsg(err.message || "Derivation search failed.");
    } finally {
      setIsLoading(false);
    }
  };

  const currentStep = result && result.steps.length > 0 ? result.steps[currentStepIndex] : null;

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Page Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-white/5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2 h-2 rounded-full bg-violet-400 shadow-[0_0_8px_#a78bfa]" />
            <span className="text-[11px] font-mono font-semibold tracking-wider uppercase text-violet-400">
              Grammar Syntactic Engine
            </span>
          </div>
          <h1 className="text-xl md:text-2xl font-bold tracking-tight text-white font-display">
            Grammar Derivation Engine
          </h1>
          <p className="text-xs md:text-sm text-slate-400">
            Compute step-by-step leftmost (LM) and rightmost (RM) sentential forms with bounded cycle detection.
          </p>
        </div>

        {result && result.success && (
          <Link
            to={`/parse-tree?target=${encodeURIComponent(targetString)}`}
            className="px-4 py-2 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white text-xs font-semibold rounded-xl flex items-center gap-2 shadow-lg shadow-violet-600/25 transition-all"
          >
            <Network className="w-4 h-4" />
            <span>Generate Parse Tree</span>
          </Link>
        )}
      </div>

      {/* Control Form */}
      <div className="glass-card p-5 space-y-4 border border-white/10 shadow-2xl">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
          {/* Target String */}
          <div className="md:col-span-5 space-y-1.5">
            <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
              <span>Target String</span>
              <span className="font-mono text-cyan-400">(w ∈ Σ*)</span>
            </label>
            <div className="relative">
              <input
                type="text"
                value={targetString}
                onChange={(e) => setTargetString(e.target.value)}
                placeholder="e.g. aabb or leave empty for ε"
                className="w-full px-3.5 py-2.5 bg-slate-950/60 font-mono text-sm border border-white/10 rounded-xl text-slate-100 placeholder-slate-600 focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/30 transition-all"
              />
              {targetString === "" && (
                <span className="absolute right-3 top-3 text-xs text-cyan-400 font-mono font-semibold">
                  (Empty string ε)
                </span>
              )}
            </div>
            <div className="flex gap-2 text-[11px] text-slate-400 pt-1">
              <span>Presets:</span>
              {["", "ab", "aabb", "aaabbb"].map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setTargetString(s)}
                  className="hover:text-cyan-400 font-mono underline decoration-slate-600 hover:decoration-cyan-400 transition-colors"
                >
                  {s === "" ? "ε" : s}
                </button>
              ))}
            </div>
          </div>

          {/* Mode Selector */}
          <div className="md:col-span-4 space-y-1.5">
            <label className="text-xs font-semibold text-slate-300">
              Derivation Mode
            </label>
            <div className="flex items-center gap-1.5 bg-slate-950/60 p-1 rounded-xl border border-white/10">
              <button
                type="button"
                onClick={() => setMode("LEFTMOST")}
                className={`flex-1 py-2 text-xs font-medium rounded-lg transition-all ${
                  mode === "LEFTMOST"
                    ? "bg-gradient-to-r from-cyan-500/20 to-blue-500/20 text-cyan-300 border border-cyan-500/30 shadow-sm font-semibold"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                Leftmost (LM)
              </button>
              <button
                type="button"
                onClick={() => setMode("RIGHTMOST")}
                className={`flex-1 py-2 text-xs font-medium rounded-lg transition-all ${
                  mode === "RIGHTMOST"
                    ? "bg-gradient-to-r from-violet-500/20 to-indigo-500/20 text-violet-300 border border-violet-500/30 shadow-sm font-semibold"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                Rightmost (RM)
              </button>
            </div>
          </div>

          {/* Max Depth & Search Button */}
          <div className="md:col-span-3 flex items-end">
            <button
              onClick={handleSearch}
              disabled={isLoading}
              className="w-full py-2.5 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white text-xs font-semibold rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/25 transition-all disabled:opacity-50"
            >
              <Play className="w-4 h-4 fill-white" />
              <span>{isLoading ? "Searching..." : "Derive String"}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Results View */}
      {result && result.success && (
        <div className="space-y-6">
          {/* Status Banner */}
          <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl flex items-center justify-between text-emerald-300 backdrop-blur shadow-lg shadow-emerald-950/20">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-400" />
              <div>
                <p className="font-bold text-sm text-emerald-200">Target Derived Successfully</p>
                <p className="text-xs text-emerald-400/90 font-mono">
                  {result.steps.length} sentential steps ({result.configurations_explored} configurations explored in {mode} mode).
                </p>
              </div>
            </div>
            <span className="text-xs font-mono px-3 py-1 bg-emerald-500/20 text-emerald-200 border border-emerald-500/30 rounded-lg font-bold">
              w = "{result.target_string || "ε"}"
            </span>
          </div>

          {/* Step Player Controller */}
          <StepPlayer
            currentStep={currentStepIndex}
            totalSteps={result.steps.length}
            onStepChange={setCurrentStepIndex}
          />

          {/* Current Step Visualization Card */}
          {currentStep && (
            <div className="glass-card p-6 space-y-4 border border-white/10 shadow-2xl">
              <div className="flex items-center justify-between pb-3 border-b border-white/10">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 font-mono">
                  Sentential Form at Step {currentStep.step_number}
                </span>
                <span className="text-xs font-mono text-cyan-300 font-bold bg-cyan-500/10 px-3 py-1 rounded-lg border border-cyan-500/30">
                  Rule Applied: {currentStep.rule_applied.text}
                </span>
              </div>

              {/* Before and After Visual Sentential Ribbon */}
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <span className="text-xs font-mono font-semibold text-slate-400 w-16">Before:</span>
                  <div className="flex flex-wrap items-center gap-2 p-2.5 bg-slate-950/70 rounded-xl border border-white/10 min-h-12 flex-1">
                    {currentStep.before_form.map((sym, idx) => {
                      const isReplaced = idx === currentStep.replacement_index;
                      return (
                        <span
                          key={idx}
                          className={`font-mono px-3 py-1 rounded-lg text-sm font-bold transition-all ${
                            isReplaced
                              ? "bg-cyan-400 text-slate-950 font-black ring-2 ring-cyan-300 shadow-[0_0_16px_#22d3ee] animate-pulse scale-105"
                              : parsedGrammar?.non_terminals.includes(sym)
                              ? "bg-violet-500/15 text-violet-300 border border-violet-500/30"
                              : "bg-teal-500/15 text-teal-300 border border-teal-500/30"
                          }`}
                        >
                          {sym}
                        </span>
                      );
                    })}
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span className="text-xs font-mono font-semibold text-slate-400 w-16">After:</span>
                  <div className="flex flex-wrap items-center gap-2 p-2.5 bg-slate-950/70 rounded-xl border border-white/10 min-h-12 flex-1">
                    {currentStep.after_form.length > 0 ? (
                      currentStep.after_form.map((sym, idx) => (
                        <span
                          key={idx}
                          className={`font-mono px-3 py-1 rounded-lg text-sm font-bold ${
                            parsedGrammar?.non_terminals.includes(sym)
                              ? "bg-violet-500/15 text-violet-300 border border-violet-500/30"
                              : "bg-teal-500/15 text-teal-300 border border-teal-500/30"
                          }`}
                        >
                          {sym}
                        </span>
                      ))
                    ) : (
                      <span className="text-cyan-400 font-mono text-sm font-bold px-2 py-1 bg-cyan-500/10 rounded-lg border border-cyan-500/30">
                        ε (Empty String)
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Explanation Note */}
              <div className="p-3 bg-slate-950/60 rounded-xl border border-white/10 text-xs text-slate-300 flex items-start gap-2.5">
                <Info className="w-4 h-4 text-cyan-400 flex-shrink-0 mt-0.5" />
                <span>{currentStep.explanation}</span>
              </div>
            </div>
          )}

          {/* Full Derivation History Table */}
          <div className="glass-card p-0 border border-white/10 shadow-2xl overflow-hidden">
            <div className="px-5 py-3.5 bg-slate-950/60 border-b border-white/10">
              <h3 className="font-bold text-sm text-white">
                Complete Derivation Sequence
              </h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-mono">
                <thead className="bg-slate-950/80 text-slate-400 border-b border-white/10">
                  <tr>
                    <th className="py-3 px-4 w-16">Step</th>
                    <th className="py-3 px-4">Sentential Form</th>
                    <th className="py-3 px-4">Applied Production</th>
                    <th className="py-3 px-4">Replaced Symbol</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  <tr className="bg-slate-950/40">
                    <td className="py-3 px-4 text-slate-500">0</td>
                    <td className="py-3 px-4 font-bold text-violet-400">
                      {parsedGrammar?.start_symbol || "S"}
                    </td>
                    <td className="py-3 px-4 text-slate-400">Initial Start Symbol</td>
                    <td className="py-3 px-4 text-slate-500">—</td>
                  </tr>
                  {result.steps.map((st, i) => (
                    <tr
                      key={i}
                      onClick={() => setCurrentStepIndex(i)}
                      className={`cursor-pointer transition-colors ${
                        i === currentStepIndex
                          ? "bg-cyan-500/15 text-cyan-200"
                          : "hover:bg-white/5"
                      }`}
                    >
                      <td className="py-3 px-4 font-bold text-slate-400">{st.step_number}</td>
                      <td className="py-3 px-4 font-semibold text-slate-200">
                        {st.after_form.join(" ") || "ε"}
                      </td>
                      <td className="py-3 px-4 text-cyan-400 font-semibold">
                        {st.rule_applied.text}
                      </td>
                      <td className="py-3 px-4">
                        <span className="px-2.5 py-0.5 bg-cyan-500/10 text-cyan-300 border border-cyan-500/30 rounded-lg">
                          {st.symbol_replaced} at pos {st.replacement_index}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Failure message */}
      {result && !result.success && (
        <div className="p-5 bg-rose-500/10 border border-rose-500/30 rounded-2xl flex items-start gap-3 text-rose-300 backdrop-blur shadow-lg shadow-rose-950/20">
          <XCircle className="w-5 h-5 flex-shrink-0 mt-0.5 text-rose-400" />
          <div className="space-y-1">
            <h4 className="font-bold text-sm text-rose-200">Derivation Not Found</h4>
            <p className="text-xs font-mono">{result.message}</p>
            <p className="text-[11px] text-rose-400/80">
              Note: A bounded search cannot derive strings outside the language L(G) or that exceed max search depth.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
