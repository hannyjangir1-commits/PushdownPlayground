import React, { useState, useEffect } from "react";
import {
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Copy,
  Download,
  RotateCcw,
  Sparkles,
  Play,
  Layers,
  ArrowRight,
  ShieldAlert,
} from "lucide-react";
import { useWorkspace } from "../context/WorkspaceContext";
import { apiClient } from "../lib/api-client";
import { SymbolBadge } from "../components/common/SymbolBadge";
import type { GrammarAnalysis } from "../types";

export const GrammarEditorPage: React.FC = () => {
  const {
    grammarText,
    setGrammarText,
    parsedGrammar,
    setParsedGrammar,
    sampleGrammars,
    loadSampleGrammar,
  } = useWorkspace();

  const [grammarName, setGrammarName] = useState("Context-Free Grammar");
  const [startSymbol, setStartSymbol] = useState(parsedGrammar?.start_symbol || "S");
  const [analysis, setAnalysis] = useState<GrammarAnalysis | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  // Validate on initial load or text change
  const handleValidate = async () => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      // 1. Parse
      const parseRes = await apiClient.parseGrammar(grammarText, grammarName, startSymbol);
      if (!parseRes.success || !parseRes.data) {
        setErrorMessage(parseRes.error || "Failed to parse grammar syntax.");
        setParsedGrammar(null);
        setAnalysis(null);
        setIsLoading(false);
        return;
      }
      setParsedGrammar(parseRes.data);
      setStartSymbol(parseRes.data.start_symbol);

      // 2. Validate & Analyze
      const valRes = await apiClient.validateGrammar(grammarText, parseRes.data.start_symbol);
      setAnalysis(valRes);
    } catch (err: any) {
      setErrorMessage(err.message || "An unexpected error occurred during validation.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    handleValidate();
  }, [grammarText]);

  const handleCopy = () => {
    navigator.clipboard.writeText(grammarText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleExport = () => {
    const data = parsedGrammar || { raw_text: grammarText };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${grammarName.toLowerCase().replace(/\s+/g, "-")}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Page Title & Controls */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-white/5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2 h-2 rounded-full bg-cyan-400 shadow-[0_0_8px_#06b6d4]" />
            <span className="text-[11px] font-mono font-semibold tracking-wider uppercase text-cyan-400">
              Grammar Studio Engine
            </span>
          </div>
          <h1 className="text-xl md:text-2xl font-bold tracking-tight text-white font-display">
            Grammar Workspace &amp; Validator
          </h1>
          <p className="text-xs md:text-sm text-slate-400">
            Edit productions G = (V, Σ, P, S), check fixed-point properties, and eliminate structural defects.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Sample Grammar selector */}
          <select
            onChange={(e) => {
              if (e.target.value) loadSampleGrammar(e.target.value);
            }}
            defaultValue=""
            className="px-3 py-1.5 bg-slate-900/80 border border-white/10 rounded-xl text-xs font-medium text-slate-300 cursor-pointer focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/30 transition-all shadow-sm"
          >
            <option value="" disabled>Load Predefined Example...</option>
            {sampleGrammars.map((s) => (
              <option key={s.id} value={s.id} className="bg-slate-900 text-slate-200">
                {s.name}
              </option>
            ))}
          </select>

          <button
            onClick={handleCopy}
            className="p-2 bg-slate-900/80 hover:bg-slate-800 border border-white/10 text-slate-300 rounded-xl text-xs flex items-center gap-1.5 transition-all shadow-sm"
            title="Copy grammar text"
          >
            <Copy className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{copied ? "Copied!" : "Copy"}</span>
          </button>

          <button
            onClick={handleExport}
            className="p-2 bg-slate-900/80 hover:bg-slate-800 border border-white/10 text-slate-300 rounded-xl text-xs flex items-center gap-1.5 transition-all shadow-sm"
            title="Export grammar as JSON"
          >
            <Download className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Export</span>
          </button>

          <button
            onClick={() => setGrammarText("S -> a S b | ε")}
            className="p-2 bg-slate-900/80 hover:bg-rose-500/20 hover:text-rose-400 border border-white/10 text-slate-400 rounded-xl text-xs flex items-center gap-1.5 transition-all shadow-sm"
            title="Reset to default grammar"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Editor & Live Analysis Two-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Grammar Input (7 Cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="glass-card p-0 overflow-hidden border border-white/10 shadow-2xl relative">
            {/* Input Header */}
            <div className="flex items-center justify-between px-4 py-3 bg-slate-950/70 border-b border-white/10">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-cyan-500 animate-pulse" />
                <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider font-mono">
                  Production Rules
                </span>
                <span className="text-xs text-slate-500 font-mono">(S → α | β)</span>
              </div>
              <div className="flex items-center gap-2 text-xs">
                <span className="text-slate-400 font-mono">Start Symbol:</span>
                <input
                  type="text"
                  value={startSymbol}
                  onChange={(e) => setStartSymbol(e.target.value.trim())}
                  className="w-12 px-2 py-0.5 font-mono text-center bg-cyan-950/30 border border-cyan-500/40 rounded-lg text-cyan-300 font-bold focus:outline-none focus:ring-1 focus:ring-cyan-400 shadow-inner"
                  title="Grammar start symbol"
                />
              </div>
            </div>

            {/* Editor Textarea */}
            <div className="relative bg-slate-950/40">
              <textarea
                value={grammarText}
                onChange={(e) => setGrammarText(e.target.value)}
                rows={11}
                placeholder="Enter productions e.g.:&#10;S -> a S b | ε&#10;A -> a A | a"
                className="w-full p-4 font-mono text-sm leading-relaxed bg-transparent text-slate-100 placeholder-slate-600 focus:outline-none resize-y selection:bg-cyan-500/30"
                spellCheck={false}
              />
            </div>

            {/* Quick Syntax Helper Footer */}
            <div className="px-4 py-3 bg-slate-950/70 border-t border-white/10 flex flex-wrap items-center justify-between text-xs text-slate-400 gap-2">
              <div className="flex items-center gap-2">
                <span className="text-slate-400">Epsilon Symbol:</span>
                <button
                  type="button"
                  onClick={() => setGrammarText(grammarText + " | ε")}
                  className="px-2 py-1 bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 rounded-lg font-mono text-xs font-semibold transition-all shadow-sm"
                >
                  + ε
                </button>
                <code className="text-slate-500 font-mono text-[11px]">eps, lambda, ε</code>
              </div>
              <button
                onClick={handleValidate}
                disabled={isLoading}
                className="px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-semibold rounded-xl text-xs flex items-center gap-2 transition-all shadow-lg shadow-cyan-500/25 disabled:opacity-50"
              >
                <Play className="w-3.5 h-3.5 fill-white" />
                <span>{isLoading ? "Validating..." : "Validate &amp; Analyze"}</span>
              </button>
            </div>
          </div>

          {/* Error Alert if parse failed */}
          {errorMessage && (
            <div className="p-4 bg-rose-500/10 border border-rose-500/30 rounded-2xl text-rose-300 text-xs flex items-start gap-3 backdrop-blur shadow-lg shadow-rose-950/20">
              <XCircle className="w-5 h-5 flex-shrink-0 mt-0.5 text-rose-400" />
              <div>
                <p className="font-bold text-sm text-rose-200">Grammar Syntax Error</p>
                <p className="text-xs mt-0.5 font-mono text-rose-300/90">{errorMessage}</p>
              </div>
            </div>
          )}

          {/* Warnings List - Sleek Sky / Ice Blue Warning (NO yellow/amber) */}
          {analysis && analysis.warnings.length > 0 && (
            <div className="p-4 bg-sky-500/10 border border-sky-500/30 rounded-2xl text-sky-200 text-xs space-y-2 backdrop-blur shadow-lg shadow-sky-950/20">
              <div className="flex items-center gap-2 font-semibold text-sky-300">
                <ShieldAlert className="w-4 h-4 text-sky-400" />
                <span>Grammar Diagnostics ({analysis.warnings.length})</span>
              </div>
              <ul className="list-disc list-inside space-y-1 pl-1 text-[11px] text-sky-200/90 font-mono">
                {analysis.warnings.map((w, i) => (
                  <li key={i}>{w}</li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Right Column: Live Structural Analysis (5 Cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="glass-card p-5 space-y-4 border border-white/10 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <h3 className="font-bold text-sm text-white flex items-center gap-2">
                <Layers className="w-4 h-4 text-cyan-400" />
                <span>Formal Analysis G = (V, Σ, P, S)</span>
              </h3>
              {analysis && (
                <span
                  className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${
                    analysis.is_valid
                      ? "bg-emerald-500/10 text-emerald-300 border-emerald-500/30 shadow-[0_0_12px_rgba(16,185,129,0.15)]"
                      : "bg-rose-500/10 text-rose-300 border-rose-500/30 shadow-[0_0_12px_rgba(244,63,94,0.15)]"
                  }`}
                >
                  {analysis.is_valid ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> : <XCircle className="w-3.5 h-3.5 text-rose-400" />}
                  <span>{analysis.is_valid ? "Valid CFG" : "Invalid"}</span>
                </span>
              )}
            </div>

            {parsedGrammar ? (
              <div className="space-y-4 text-xs">
                {/* Non-Terminals V */}
                <div>
                  <span className="font-semibold text-slate-400 block mb-1.5">
                    Non-Terminals V ({parsedGrammar.non_terminals.length}):
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {parsedGrammar.non_terminals.map((nt) => (
                      <SymbolBadge key={nt} symbol={nt} type="non-terminal" />
                    ))}
                  </div>
                </div>

                {/* Terminals Σ */}
                <div>
                  <span className="font-semibold text-slate-400 block mb-1.5">
                    Terminals Σ ({parsedGrammar.terminals.length}):
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {parsedGrammar.terminals.length > 0 ? (
                      parsedGrammar.terminals.map((t) => (
                        <SymbolBadge key={t} symbol={t} type="terminal" />
                      ))
                    ) : (
                      <span className="text-slate-500 italic">None</span>
                    )}
                  </div>
                </div>

                {/* Nullable Non-terminals */}
                {analysis && (
                  <div>
                    <span className="font-semibold text-slate-400 block mb-1.5">
                      Nullable Variables ({analysis.nullable_symbols.length}):
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {analysis.nullable_symbols.length > 0 ? (
                        analysis.nullable_symbols.map((s) => (
                          <SymbolBadge key={s} symbol={s} type="non-terminal" />
                        ))
                      ) : (
                        <span className="text-slate-500 italic">None (no variable derives ε)</span>
                      )}
                    </div>
                  </div>
                )}

                {/* Unit Productions */}
                {analysis && analysis.unit_productions.length > 0 && (
                  <div>
                    <span className="font-semibold text-slate-400 block mb-1.5">
                      Unit Productions ({analysis.unit_productions.length}):
                    </span>
                    <div className="flex flex-wrap gap-2 font-mono text-[11px]">
                      {analysis.unit_productions.map((u, i) => (
                        <span key={i} className="px-2 py-0.5 bg-violet-500/10 text-violet-300 rounded-lg border border-violet-500/30">
                          {u.lhs} → {u.rhs}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Stats Summary */}
                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-white/10">
                  <div className="p-3 bg-slate-950/50 border border-white/5 rounded-xl">
                    <span className="text-[10px] uppercase font-mono tracking-wider text-slate-500 block">Total Rules</span>
                    <span className="text-lg font-bold text-cyan-400 font-mono">
                      {parsedGrammar.productions.length}
                    </span>
                  </div>
                  <div className="p-3 bg-slate-950/50 border border-white/5 rounded-xl">
                    <span className="text-[10px] uppercase font-mono tracking-wider text-slate-500 block">Start Derives ε</span>
                    <span className="text-lg font-bold text-violet-400 font-mono">
                      {analysis?.stats.is_start_nullable ? "Yes" : "No"}
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="py-8 text-center text-slate-500 text-xs">
                <p>Click "Validate" to parse and analyze grammar properties.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
