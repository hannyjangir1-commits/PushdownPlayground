import React, { useState } from "react";
import confetti from "canvas-confetti";
import {
  Grid3X3,
  Play,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Info,
  Network,
  Sparkles,
} from "lucide-react";
import { useWorkspace } from "../context/WorkspaceContext";
import { apiClient } from "../lib/api-client";
import { StepPlayer } from "../components/common/StepPlayer";
import type { CYKResult, CYKCell } from "../types";

export const CYKPage: React.FC = () => {
  const { grammarText, parsedGrammar } = useWorkspace();
  const [inputString, setInputString] = useState("ba");
  const [autoConvertCNF, setAutoConvertCNF] = useState(true);
  const [result, setResult] = useState<CYKResult | null>(null);
  const [selectedCell, setSelectedCell] = useState<CYKCell | null>(null);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleRunCYK = async () => {
    setIsLoading(true);
    setErrorMessage(null);
    setSelectedCell(null);
    setCurrentStepIndex(0);

    try {
      const res = await apiClient.runCYK({
        raw_text: grammarText,
        grammar: parsedGrammar || undefined,
        input_string: inputString,
        convert_to_cnf_first: autoConvertCNF,
      });

      setResult(res);
      if (!res.success) {
        setErrorMessage(res.message);
      } else if (res.accepted) {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
        });
      }
    } catch (err: any) {
      setErrorMessage(err.message || "Failed to execute CYK algorithm.");
    } finally {
      setIsLoading(false);
    }
  };

  const currentStep = result && result.steps.length > 0 ? result.steps[currentStepIndex] : null;

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-white/5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2 h-2 rounded-full bg-cyan-400 shadow-[0_0_8px_#06b6d4]" />
            <span className="text-[11px] font-mono font-semibold tracking-wider uppercase text-cyan-400">
              Polynomial Membership Decider
            </span>
          </div>
          <h1 className="text-xl md:text-2xl font-bold tracking-tight text-white font-display">
            Cocke-Younger-Kasami (CYK) Algorithm
          </h1>
          <p className="text-xs md:text-sm text-slate-400">
            Dynamic programming triangular table parser for Grammars in Chomsky Normal Form (CNF).
          </p>
        </div>
      </div>

      {/* Control Form */}
      <div className="glass-card p-5 border border-white/10 shadow-2xl space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
          {/* Target string input */}
          <div className="md:col-span-6 space-y-1.5">
            <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
              <span>Input String to Test</span>
              <span className="font-mono text-cyan-400">(w ∈ Σ*)</span>
            </label>
            <div className="relative">
              <input
                type="text"
                value={inputString}
                onChange={(e) => setInputString(e.target.value)}
                placeholder="e.g. ba or aabb"
                className="w-full px-3.5 py-2.5 bg-slate-950/60 font-mono text-sm border border-white/10 rounded-xl text-slate-100 placeholder-slate-600 focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/30 transition-all"
              />
            </div>
            <div className="flex gap-2 text-[11px] text-slate-400 pt-1">
              <span>Quick tests:</span>
              {["ba", "ab", "bba", "aabb"].map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setInputString(s)}
                  className="hover:text-cyan-400 font-mono underline decoration-slate-600 hover:decoration-cyan-400 transition-colors"
                >
                  "{s}"
                </button>
              ))}
            </div>
          </div>

          {/* Auto CNF conversion toggle */}
          <div className="md:col-span-3 pb-2">
            <label className="flex items-center gap-2.5 cursor-pointer text-xs font-medium text-slate-300">
              <input
                type="checkbox"
                checked={autoConvertCNF}
                onChange={(e) => setAutoConvertCNF(e.target.checked)}
                className="w-4 h-4 rounded text-cyan-500 bg-slate-950/60 border-white/10 focus:ring-cyan-500 focus:ring-offset-slate-950 cursor-pointer"
              />
              <span>Auto-Convert to CNF First</span>
            </label>
          </div>

          {/* Run Button */}
          <div className="md:col-span-3">
            <button
              onClick={handleRunCYK}
              disabled={isLoading}
              className="w-full py-2.5 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-semibold text-xs rounded-xl shadow-lg shadow-cyan-500/25 flex items-center justify-center gap-2 transition-all disabled:opacity-50"
            >
              <Play className="w-4 h-4 fill-white" />
              <span>{isLoading ? "Running CYK..." : "Run CYK Algorithm"}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Error Alert */}
      {errorMessage && (
        <div className="p-4 bg-rose-500/10 border border-rose-500/30 rounded-2xl text-rose-300 text-xs flex items-start gap-3 backdrop-blur shadow-lg shadow-rose-950/20">
          <XCircle className="w-5 h-5 flex-shrink-0 mt-0.5 text-rose-400" />
          <div>
            <p className="font-bold text-sm text-rose-200">CYK Execution Error</p>
            <p className="text-xs mt-0.5 font-mono text-rose-300/90">{errorMessage}</p>
          </div>
        </div>
      )}

      {/* Results View */}
      {result && result.success && (
        <div className="space-y-6">
          {/* Status Decision Banner */}
          <div
            className={`p-4 rounded-2xl border flex items-center justify-between backdrop-blur shadow-lg ${
              result.accepted
                ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-300 shadow-emerald-950/20"
                : "bg-rose-500/10 border-rose-500/30 text-rose-300 shadow-rose-950/20"
            }`}
          >
            <div className="flex items-center gap-3">
              {result.accepted ? (
                <CheckCircle2 className="w-6 h-6 text-emerald-400" />
              ) : (
                <XCircle className="w-6 h-6 text-rose-400" />
              )}
              <div>
                <p className="font-bold text-base text-white">
                  {result.accepted ? "String ACCEPTED by Grammar" : "String REJECTED"}
                </p>
                <p className="text-xs opacity-90 font-mono">{result.message}</p>
              </div>
            </div>
            <div className="text-right">
              <span className="font-mono text-xs font-bold px-3 py-1.5 rounded-xl bg-slate-950/60 border border-white/10 text-cyan-300">
                Start: {result.start_symbol}
              </span>
            </div>
          </div>

          {/* Stepper Playback */}
          {result.steps.length > 0 && (
            <StepPlayer
              currentStep={currentStepIndex}
              totalSteps={result.steps.length}
              onStepChange={setCurrentStepIndex}
            />
          )}

          {/* Current Step Explanation Box */}
          {currentStep && (
            <div className="p-4 bg-cyan-500/10 border border-cyan-500/30 rounded-2xl text-xs text-cyan-200 flex items-start gap-3 backdrop-blur shadow-lg shadow-cyan-950/20">
              <Sparkles className="w-4 h-4 text-cyan-400 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-bold text-sm text-cyan-300">
                  Step {currentStep.step_number}: Evaluating Cell ({currentStep.cell_coords[0]}, {currentStep.cell_coords[1] + 1}) for substring "{currentStep.substring}"
                </p>
                <p className="mt-1 text-cyan-200/90 font-mono text-[11px] leading-relaxed">{currentStep.explanation}</p>
              </div>
            </div>
          )}

          {/* Interactive Triangular Parsing Table */}
          {result.table.length > 0 && (
            <div className="glass-card p-6 border border-white/10 shadow-2xl space-y-4">
              <div className="flex flex-wrap items-center justify-between pb-3 border-b border-white/10 gap-3">
                <div className="flex items-center gap-2">
                  <Grid3X3 className="w-5 h-5 text-cyan-400" />
                  <h3 className="font-bold text-sm text-white">
                    Triangular CYK Parsing Table (Click any cell to inspect)
                  </h3>
                </div>
                <div className="flex items-center gap-4 text-xs">
                  <div className="flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded bg-emerald-500/20 border border-emerald-500" />
                    <span className="text-slate-400">Contains S (Accepting)</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded bg-cyan-500/30 border border-cyan-400" />
                    <span className="text-slate-400">Active / Selected</span>
                  </div>
                </div>
              </div>

              {/* Table Render: In inverted triangular form (Length n down to 1) */}
              <div className="flex flex-col items-center gap-2 overflow-x-auto py-4">
                {result.table
                  .slice()
                  .reverse()
                  .map((row) => {
                    const l = row[0]?.length || 1;
                    return (
                      <div key={l} className="flex items-center gap-2">
                        <span className="w-14 text-right text-[11px] font-mono text-slate-500 font-semibold">
                          len {l}:
                        </span>
                        <div className="flex gap-2">
                          {row.map((cell) => {
                            const isSelected =
                              selectedCell?.length === cell.length &&
                              selectedCell?.start_index === cell.start_index;
                            const isCurrentStepCell =
                              currentStep &&
                              currentStep.cell_coords[0] === cell.length &&
                              currentStep.cell_coords[1] === cell.start_index;

                            return (
                              <button
                                key={cell.start_index}
                                onClick={() => setSelectedCell(cell)}
                                className={`w-24 h-16 rounded-xl border flex flex-col items-center justify-center p-1.5 transition-all cursor-pointer font-mono text-xs ${
                                  isSelected
                                    ? "bg-gradient-to-br from-cyan-600 to-blue-700 text-white border-cyan-400 shadow-[0_0_20px_#06b6d4] ring-2 ring-cyan-300 scale-105 z-10"
                                    : isCurrentStepCell
                                    ? "ring-2 ring-cyan-400 bg-cyan-500/25 border-cyan-400 text-cyan-200 shadow-[0_0_15px_#06b6d4] scale-105 z-10 animate-pulse"
                                    : cell.is_start_present
                                    ? "bg-emerald-500/15 border-emerald-500/40 text-emerald-300 font-bold shadow-[0_0_12px_rgba(16,185,129,0.15)]"
                                    : cell.symbols.length > 0
                                    ? "bg-slate-950/70 border-white/10 text-slate-200 hover:border-cyan-500/30"
                                    : "bg-slate-950/30 border-dashed border-white/5 text-slate-600 hover:border-white/10"
                                }`}
                              >
                                <span className={`text-[10px] ${isSelected ? "text-cyan-200" : "text-slate-500"}`}>
                                  "{cell.substring}"
                                </span>
                                <span className="font-bold text-sm tracking-wider">
                                  {cell.symbols.length > 0 ? `{ ${cell.symbols.join(", ")} }` : "∅"}
                                </span>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
              </div>

              {/* Substring characters along bottom */}
              <div className="flex justify-center gap-2 pl-16 border-t border-white/10 pt-3 text-xs font-mono font-bold text-slate-400">
                {result.tokens.map((tok, i) => (
                  <span key={i} className="w-24 text-center">
                    w[{i + 1}] = '{tok}'
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Cell Details Inspector */}
          {selectedCell && (
            <div className="glass-card p-5 border border-white/10 shadow-2xl space-y-3 animate-in fade-in">
              <div className="flex items-center justify-between pb-2 border-b border-white/10">
                <h4 className="font-bold text-sm text-white">
                  Cell Inspection: Substring "{selectedCell.substring}" (Length {selectedCell.length}, Start {selectedCell.start_index + 1})
                </h4>
                <span className="text-xs font-mono px-3 py-1 bg-cyan-500/15 border border-cyan-500/30 text-cyan-300 rounded-lg font-bold">
                  {selectedCell.symbols.length > 0 ? `{ ${selectedCell.symbols.join(", ")} }` : "Empty set ∅"}
                </span>
              </div>

              {selectedCell.splits.length > 0 ? (
                <div className="space-y-2">
                  <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block font-mono">
                    Dynamic Subproblem Splits Evaluated:
                  </span>
                  <div className="space-y-1.5 max-h-48 overflow-y-auto">
                    {selectedCell.splits.map((sp, idx) => (
                      <div
                        key={idx}
                        className="p-2.5 bg-slate-950/60 rounded-xl border border-white/5 text-xs font-mono flex items-center justify-between"
                      >
                        <div className="flex items-center gap-2">
                          <span className="text-cyan-400 font-bold">
                            Split {sp.split_index}:
                          </span>
                          <span className="text-slate-300">
                            T[{sp.left_cell[0]}, {sp.left_cell[1] + 1}] ({sp.left_symbol}) × T[{sp.right_cell[0]}, {sp.right_cell[1] + 1}] ({sp.right_symbol})
                          </span>
                        </div>
                        <span className="px-2.5 py-0.5 bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 rounded-lg font-bold">
                          {sp.rule_used}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ) : selectedCell.length === 1 ? (
                <p className="text-xs text-slate-400">
                  Base level cell: Computed directly from unit rules generating terminal '{selectedCell.substring}'.
                </p>
              ) : (
                <p className="text-xs text-slate-400">
                  No binary production combinations matched for this cell's splits.
                </p>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
