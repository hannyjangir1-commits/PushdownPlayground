import React, { useState } from "react";
import { Link } from "react-router-dom";
import confetti from "canvas-confetti";
import {
  Layers,
  Play,
  RotateCcw,
  CheckCircle2,
  XCircle,
  Network,
  Info,
  Plus,
  Trash2,
  Sparkles,
} from "lucide-react";
import { useWorkspace } from "../context/WorkspaceContext";
import { apiClient } from "../lib/api-client";
import { StepPlayer } from "../components/common/StepPlayer";
import { SymbolBadge } from "../components/common/SymbolBadge";
import type { PDA, PDASimulationResult, PDATransition } from "../types";

export const PDASimulatorPage: React.FC = () => {
  const { activePDA, setActivePDA, samplePDAs, loadSamplePDA } = useWorkspace();
  const [inputString, setInputString] = useState("aabb");
  const [simResult, setSimResult] = useState<PDASimulationResult | null>(null);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // New transition form state
  const [showAddTransition, setShowAddTransition] = useState(false);
  const [fromState, setFromState] = useState("q0");
  const [inSym, setInSym] = useState("a");
  const [popSym, setPopSym] = useState("Z0");
  const [toState, setToState] = useState("q0");
  const [pushSyms, setPushSyms] = useState("AZ0");

  const handleSimulate = async () => {
    if (!activePDA) return;
    setIsLoading(true);
    setErrorMessage(null);
    setCurrentStepIndex(0);

    try {
      const res = await apiClient.simulatePDA({
        pda: activePDA,
        input_string: inputString,
        max_steps: 1000,
        max_configurations: 5000,
      });

      setSimResult(res);
      if (!res.success && res.status === "INVALID_PDA") {
        setErrorMessage(res.message);
      } else if (res.accepted) {
        confetti({
          particleCount: 75,
          spread: 60,
          origin: { y: 0.6 },
        });
      }
    } catch (err: any) {
      setErrorMessage(err.message || "Failed to simulate PDA.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddTransition = () => {
    if (!activePDA) return;
    const cleanIn = inSym === "ε" || inSym === "epsilon" ? "" : inSym;
    const cleanPush = pushSyms === "ε" || pushSyms === "epsilon" || pushSyms === "" ? [] : pushSyms.split("");

    const newTrans: PDATransition = {
      from_state: fromState,
      input_symbol: cleanIn,
      pop_symbol: popSym,
      to_state: toState,
      push_symbols: cleanPush,
    };

    const updatedPDA: PDA = {
      ...activePDA,
      transitions: [...activePDA.transitions, newTrans],
    };
    setActivePDA(updatedPDA);
    setShowAddTransition(false);
  };

  const handleDeleteTransition = (index: number) => {
    if (!activePDA) return;
    const updated = [...activePDA.transitions];
    updated.splice(index, 1);
    setActivePDA({ ...activePDA, transitions: updated });
  };

  const currentConfig =
    simResult && simResult.trace.length > 0 ? simResult.trace[currentStepIndex] : null;

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-white/5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2 h-2 rounded-full bg-violet-400 shadow-[0_0_8px_#8b5cf6]" />
            <span className="text-[11px] font-mono font-semibold tracking-wider uppercase text-violet-400">
              Automata Stack Engine
            </span>
          </div>
          <h1 className="text-xl md:text-2xl font-bold tracking-tight text-white font-display">
            Pushdown Automaton (PDA) Simulator
          </h1>
          <p className="text-xs md:text-sm text-slate-400">
            Step-by-step stack transition engine supporting Final State &amp; Empty Stack acceptance.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            to="/automata"
            className="px-4 py-2 bg-slate-900/80 hover:bg-slate-800 border border-white/10 text-slate-300 text-xs font-semibold rounded-xl flex items-center gap-2 transition-all shadow-sm"
          >
            <Network className="w-4 h-4 text-cyan-400" />
            <span>State Diagram</span>
          </Link>
        </div>
      </div>

      {/* Simulator Control & Input */}
      <div className="glass-card p-5 border border-white/10 shadow-2xl space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
          {/* Sample PDA selector */}
          <div className="md:col-span-3 space-y-1.5">
            <label className="text-xs font-semibold text-slate-300">
              Active PDA Preset
            </label>
            <select
              onChange={(e) => {
                if (e.target.value) loadSamplePDA(e.target.value);
              }}
              defaultValue="pda-anbn"
              className="w-full px-3.5 py-2.5 bg-slate-950/60 font-medium text-xs border border-white/10 rounded-xl text-slate-200 focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/30 cursor-pointer transition-all"
            >
              {samplePDAs.map((s) => (
                <option key={s.id} value={s.id} className="bg-slate-900 text-slate-200">
                  {s.name}
                </option>
              ))}
            </select>
          </div>

          {/* Input string */}
          <div className="md:col-span-5 space-y-1.5">
            <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
              <span>Tape Input String</span>
              <span className="font-mono text-cyan-400">(w ∈ Σ*)</span>
            </label>
            <input
              type="text"
              value={inputString}
              onChange={(e) => setInputString(e.target.value)}
              placeholder="e.g. aabb or leave empty for ε"
              className="w-full px-3.5 py-2.5 bg-slate-950/60 font-mono text-sm border border-white/10 rounded-xl text-slate-100 placeholder-slate-600 focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/30 transition-all"
            />
            <div className="flex gap-2 text-[11px] text-slate-400 pt-0.5">
              <span>Tests:</span>
              {["", "ab", "aabb", "aaabbb", "aab", "abb", "ba"].map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setInputString(s)}
                  className="hover:text-cyan-400 font-mono underline decoration-slate-600 hover:decoration-cyan-400 transition-colors"
                >
                  {s === "" ? "ε" : s}
                </button>
              ))}
            </div>
          </div>

          {/* Acceptance Mode Badge */}
          <div className="md:col-span-2 space-y-1.5">
            <label className="text-xs font-semibold text-slate-300">
              Acceptance Mode
            </label>
            <div className="px-3 py-2.5 bg-slate-950/60 border border-white/10 rounded-xl text-xs font-mono font-bold text-violet-300 text-center">
              {activePDA?.acceptance_mode === "FINAL_STATE" ? "Final State (F)" : "Empty Stack (∅)"}
            </div>
          </div>

          {/* Simulate Action */}
          <div className="md:col-span-2">
            <button
              onClick={handleSimulate}
              disabled={isLoading || !activePDA}
              className="w-full py-2.5 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-semibold text-xs rounded-xl shadow-lg shadow-cyan-500/25 flex items-center justify-center gap-2 transition-all disabled:opacity-50"
            >
              <Play className="w-4 h-4 fill-white" />
              <span>{isLoading ? "Simulating..." : "Simulate"}</span>
            </button>
          </div>
        </div>
      </div>

      {errorMessage && (
        <div className="p-4 bg-rose-500/10 border border-rose-500/30 rounded-2xl text-rose-300 text-xs flex items-start gap-3 backdrop-blur shadow-lg shadow-rose-950/20">
          <XCircle className="w-5 h-5 flex-shrink-0 mt-0.5 text-rose-400" />
          <div>
            <p className="font-bold text-sm text-rose-200">PDA Simulation Error</p>
            <p className="text-xs mt-0.5 font-mono text-rose-300/90">{errorMessage}</p>
          </div>
        </div>
      )}

      {/* Simulation Stepper & Visual Workspace */}
      {simResult && (
        <div className="space-y-6">
          {/* Decision Banner */}
          <div
            className={`p-4 rounded-2xl border flex items-center justify-between backdrop-blur shadow-lg ${
              simResult.accepted
                ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-300 shadow-emerald-950/20"
                : "bg-rose-500/10 border-rose-500/30 text-rose-300 shadow-rose-950/20"
            }`}
          >
            <div className="flex items-center gap-3">
              {simResult.accepted ? (
                <CheckCircle2 className="w-6 h-6 text-emerald-400" />
              ) : (
                <XCircle className="w-6 h-6 text-rose-400" />
              )}
              <div>
                <p className="font-bold text-base text-white">
                  {simResult.accepted ? "String ACCEPTED by PDA" : "String REJECTED"}
                </p>
                <p className="text-xs opacity-90 font-mono">{simResult.message}</p>
              </div>
            </div>
            <div className="text-right text-xs font-mono text-slate-300">
              <span className="font-bold text-cyan-400">{simResult.total_steps}</span> steps &bull;{" "}
              <span className="font-bold text-violet-400">{simResult.configurations_explored}</span> configs
            </div>
          </div>

          {/* Stepper Playback Controller */}
          <StepPlayer
            currentStep={currentStepIndex}
            totalSteps={simResult.trace.length}
            onStepChange={setCurrentStepIndex}
          />

          {/* Interactive Stack & Tape Dual View */}
          {currentConfig && (
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
              {/* Left Column: Stack Visualizer (4 Cols) */}
              <div className="md:col-span-4 glass-card p-5 border border-white/10 shadow-2xl space-y-3 flex flex-col items-center">
                <div className="w-full flex items-center justify-between pb-2 border-b border-white/10 text-xs">
                  <span className="font-bold text-white uppercase tracking-wider font-mono">
                    Pushdown Stack (Γ)
                  </span>
                  <span className="font-mono text-cyan-400 font-semibold">
                    Depth: {currentConfig.stack.length}
                  </span>
                </div>

                {/* Vertical Sci-Fi Glass Tube */}
                <div className="w-52 min-h-64 border-2 border-dashed border-violet-500/30 rounded-2xl bg-slate-950/60 p-2.5 flex flex-col-reverse justify-start gap-1.5 overflow-hidden shadow-inner">
                  {currentConfig.stack.length > 0 ? (
                    currentConfig.stack.map((sym, idx) => {
                      const isTop = idx === currentConfig.stack.length - 1;
                      return (
                        <div
                          key={idx}
                          className={`w-full py-2.5 rounded-xl border flex items-center justify-between px-3 font-mono font-bold text-sm transition-all ${
                            isTop
                              ? "bg-gradient-to-r from-violet-600 to-indigo-600 text-white border-violet-400 shadow-[0_0_15px_#8b5cf6] ring-2 ring-violet-300 animate-in slide-in-from-top-1"
                              : "bg-slate-900/80 border-white/10 text-slate-200"
                          }`}
                        >
                          <span>{sym}</span>
                          {isTop && (
                            <span className="text-[10px] uppercase tracking-wider bg-white/20 px-2 py-0.5 rounded-md font-sans">
                              TOP
                            </span>
                          )}
                        </div>
                      );
                    })
                  ) : (
                    <div className="h-full flex items-center justify-center text-xs text-slate-500 italic">
                      [ Stack is Empty ]
                    </div>
                  )}
                </div>

                <span className="text-[11px] text-slate-500 font-mono">Bottom of Stack (Z₀)</span>
              </div>

              {/* Right Column: State & Tape Inspector (8 Cols) */}
              <div className="md:col-span-8 space-y-4">
                {/* Input Tape */}
                <div className="glass-card p-5 border border-white/10 shadow-2xl space-y-3">
                  <div className="flex items-center justify-between text-xs pb-1">
                    <span className="font-bold text-white uppercase tracking-wider font-mono">
                      Input Tape (Σ)
                    </span>
                    <span className="font-mono text-cyan-400">
                      Position: {currentConfig.input_pos} / {inputString.length}
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 p-3 bg-slate-950/70 rounded-xl border border-white/10 font-mono">
                    {inputString.length > 0 ? (
                      inputString.split("").map((ch, idx) => {
                        const isConsumed = idx < currentConfig.input_pos;
                        const isCurrentHead = idx === currentConfig.input_pos;
                        return (
                          <div
                            key={idx}
                            className={`w-10 h-11 rounded-xl flex flex-col items-center justify-center font-bold text-sm border transition-all ${
                              isCurrentHead
                                ? "bg-cyan-400 text-slate-950 font-black border-cyan-300 shadow-[0_0_16px_#22d3ee] ring-2 ring-cyan-200 scale-105"
                                : isConsumed
                                ? "bg-slate-950/40 text-slate-600 border-white/5 opacity-50"
                                : "bg-slate-900/80 text-slate-200 border-white/10"
                            }`}
                          >
                            <span>{ch}</span>
                            {isCurrentHead && <span className="text-[7px] uppercase font-mono tracking-tighter">READ</span>}
                          </div>
                        );
                      })
                    ) : (
                      <span className="text-xs text-cyan-400 italic font-mono">Empty Tape (ε)</span>
                    )}
                  </div>
                </div>

                {/* State Machine Status Card */}
                <div className="glass-card p-5 border border-white/10 shadow-2xl space-y-3">
                  <div className="flex items-center justify-between text-xs pb-2 border-b border-white/10">
                    <span className="font-bold text-white uppercase tracking-wider font-mono">
                      Configuration at Step {currentConfig.step_number}
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="text-slate-400">Current State:</span>
                      <span
                        className={`px-3 py-1 rounded-lg font-mono font-bold text-xs border ${
                          currentConfig.is_accepting_state
                            ? "bg-emerald-500/15 text-emerald-300 border-emerald-500/30"
                            : "bg-sky-500/15 text-sky-300 border-sky-500/30"
                        }`}
                      >
                        {currentConfig.state}
                        {currentConfig.is_accepting_state && " (Accepting)"}
                      </span>
                    </div>
                  </div>

                  {currentConfig.transition_applied && (
                    <div className="p-3 bg-slate-950/60 rounded-xl border border-white/10 text-xs font-mono flex items-center justify-between">
                      <span className="text-slate-400">Applied Rule:</span>
                      <span className="text-cyan-400 font-bold">
                        {currentConfig.transition_applied.text}
                      </span>
                    </div>
                  )}

                  <div className="p-3 bg-slate-950/60 rounded-xl border border-white/10 text-xs text-slate-300 flex items-start gap-2.5">
                    <Info className="w-4 h-4 text-cyan-400 mt-0.5 flex-shrink-0" />
                    <span>{currentConfig.explanation}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Full Trace History Table */}
          <div className="glass-card p-0 border border-white/10 shadow-2xl overflow-hidden">
            <div className="px-5 py-3.5 bg-slate-950/60 border-b border-white/10">
              <h3 className="font-bold text-sm text-white">
                PDA Execution Trace Log
              </h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-mono">
                <thead className="bg-slate-950/80 text-slate-400 border-b border-white/10">
                  <tr>
                    <th className="py-3 px-4 w-16">Step</th>
                    <th className="py-3 px-4">State</th>
                    <th className="py-3 px-4">Remaining Input</th>
                    <th className="py-3 px-4">Stack (Bottom → Top)</th>
                    <th className="py-3 px-4">Transition</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {simResult.trace.map((cfg, i) => (
                    <tr
                      key={i}
                      onClick={() => setCurrentStepIndex(i)}
                      className={`cursor-pointer transition-colors ${
                        i === currentStepIndex
                          ? "bg-cyan-500/15 text-cyan-200"
                          : "hover:bg-white/5"
                      }`}
                    >
                      <td className="py-3 px-4 font-bold text-slate-500">{cfg.step_number}</td>
                      <td className="py-3 px-4 font-bold text-cyan-400">
                        {cfg.state}
                      </td>
                      <td className="py-3 px-4 text-slate-200">
                        "{cfg.remaining_input || "ε"}"
                      </td>
                      <td className="py-3 px-4 text-violet-400">
                        [{cfg.stack.join(", ") || "∅"}]
                      </td>
                      <td className="py-3 px-4 text-slate-400">
                        {cfg.transition_applied?.label || "Initial Start"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* PDA Formal Definition Table & Transition Editor */}
      {activePDA && (
        <div className="glass-card p-6 border border-white/10 shadow-2xl space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-white/10">
            <div>
              <h3 className="font-bold text-sm text-white">
                Formal Specification M = (Q, Σ, Γ, δ, q₀, Z₀, F)
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Current PDA: {activePDA.name}
              </p>
            </div>
            <button
              onClick={() => setShowAddTransition(!showAddTransition)}
              className="px-3.5 py-1.5 bg-slate-900/80 hover:bg-slate-800 border border-white/10 text-slate-300 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all shadow-sm"
            >
              <Plus className="w-3.5 h-3.5 text-cyan-400" />
              <span>Add Transition</span>
            </button>
          </div>

          {/* Add transition form */}
          {showAddTransition && (
            <div className="p-4 bg-slate-950/70 rounded-xl border border-white/10 space-y-3">
              <h4 className="font-semibold text-xs text-white">
                New Transition: δ(from_state, input_symbol, pop_symbol) → (to_state, push_symbols)
              </h4>
              <div className="grid grid-cols-5 gap-3 text-xs">
                <div>
                  <label className="block text-slate-400 mb-1">From State (q)</label>
                  <input
                    type="text"
                    value={fromState}
                    onChange={(e) => setFromState(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-slate-900/90 border border-white/10 font-mono text-slate-100 focus:outline-none focus:border-cyan-500/50"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Input (a or ε)</label>
                  <input
                    type="text"
                    value={inSym}
                    onChange={(e) => setInSym(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-slate-900/90 border border-white/10 font-mono text-slate-100 focus:outline-none focus:border-cyan-500/50"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Pop Symbol (X)</label>
                  <input
                    type="text"
                    value={popSym}
                    onChange={(e) => setPopSym(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-slate-900/90 border border-white/10 font-mono text-slate-100 focus:outline-none focus:border-cyan-500/50"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">To State (p)</label>
                  <input
                    type="text"
                    value={toState}
                    onChange={(e) => setToState(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-slate-900/90 border border-white/10 font-mono text-slate-100 focus:outline-none focus:border-cyan-500/50"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Push (γ or ε)</label>
                  <input
                    type="text"
                    value={pushSyms}
                    onChange={(e) => setPushSyms(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-slate-900/90 border border-white/10 font-mono text-slate-100 focus:outline-none focus:border-cyan-500/50"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  onClick={() => setShowAddTransition(false)}
                  className="px-3.5 py-1.5 bg-slate-900 border border-white/10 rounded-xl text-xs text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddTransition}
                  className="px-4 py-1.5 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white rounded-xl text-xs font-semibold shadow-md"
                >
                  Save Transition
                </button>
              </div>
            </div>
          )}

          {/* Transitions List */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {activePDA.transitions.map((t, idx) => (
              <div
                key={idx}
                className="p-3 bg-slate-950/60 rounded-xl border border-white/10 flex items-center justify-between text-xs font-mono"
              >
                <div>
                  <span className="font-bold text-cyan-400">
                    δ({t.from_state}, {t.input_symbol || "ε"}, {t.pop_symbol})
                  </span>
                  <span className="text-slate-500 mx-1">→</span>
                  <span className="font-bold text-violet-400">
                    ({t.to_state}, {t.push_symbols.join("") || "ε"})
                  </span>
                </div>
                <button
                  onClick={() => handleDeleteTransition(idx)}
                  className="text-slate-500 hover:text-rose-400 p-1 transition-colors"
                  title="Delete transition"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
