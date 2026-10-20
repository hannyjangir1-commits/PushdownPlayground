import React, { useState } from "react";
import {
  FlaskConical,
  Play,
  CheckCircle2,
  XCircle,
  Download,
  Plus,
  Trash2,
  Sparkles,
  RefreshCw,
} from "lucide-react";
import { useWorkspace } from "../context/WorkspaceContext";
import { apiClient } from "../lib/api-client";
import type { BatchTestItem, BatchTestResponse } from "../types";

export const TestWorkbenchPage: React.FC = () => {
  const { grammarText, parsedGrammar, activePDA, sampleGrammars, samplePDAs } = useWorkspace();
  const [modelType, setModelType] = useState<"CFG" | "PDA">("CFG");
  const [testItems, setTestItems] = useState<BatchTestItem[]>([
    { input_string: "", expected: true },
    { input_string: "ab", expected: true },
    { input_string: "aabb", expected: true },
    { input_string: "aaabbb", expected: true },
    { input_string: "aab", expected: false },
    { input_string: "abb", expected: false },
    { input_string: "ba", expected: false },
  ]);
  const [newString, setNewString] = useState("");
  const [newExpected, setNewExpected] = useState<boolean | undefined>(true);
  const [testResponse, setTestResponse] = useState<BatchTestResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleRunBatch = async () => {
    setIsLoading(true);
    try {
      const res = await apiClient.runBatchTests({
        model_type: modelType,
        grammar_raw_text: grammarText,
        grammar: parsedGrammar || undefined,
        pda: activePDA || undefined,
        test_items: testItems,
        convert_to_cnf: true,
      });
      setTestResponse(res);
    } catch (err: any) {
      console.error("Batch testing failed:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddTest = () => {
    setTestItems([...testItems, { input_string: newString, expected: newExpected }]);
    setNewString("");
  };

  const handleDeleteTest = (index: number) => {
    const updated = [...testItems];
    updated.splice(index, 1);
    setTestItems(updated);
  };

  const loadPresetTests = () => {
    if (modelType === "CFG") {
      const s = sampleGrammars[0];
      if (s && s.test_strings) {
        setTestItems(s.test_strings.map((t: any) => ({ input_string: t.input, expected: t.expected })));
      }
    } else {
      const s = samplePDAs[0];
      if (s && s.test_strings) {
        setTestItems(s.test_strings.map((t: any) => ({ input_string: t.input, expected: t.expected })));
      }
    }
  };

  const exportCSV = () => {
    if (!testResponse) return;
    const headers = "Input String,Expected,Actual,Status,Configurations Explored\n";
    const rows = testResponse.results
      .map(
        (r) =>
          `"${r.input_string}",${r.expected !== undefined ? r.expected : ""},${r.actual},${r.status},${r.configurations_explored}`
      )
      .join("\n");
    const blob = new Blob([headers + rows], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `batch-test-results-${modelType.toLowerCase()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-white/5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2 h-2 rounded-full bg-cyan-400 shadow-[0_0_8px_#06b6d4]" />
            <span className="text-[11px] font-mono font-semibold tracking-wider uppercase text-cyan-400">
              Regression &amp; Automated Verification
            </span>
          </div>
          <h1 className="text-xl md:text-2xl font-bold tracking-tight text-white font-display">
            Batch Testing Workbench
          </h1>
          <p className="text-xs md:text-sm text-slate-400">
            Execute automated test suites against CFG (via CYK) or PDA with validation metrics and CSV export.
          </p>
        </div>

        {/* Model Switch */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 p-1 bg-slate-950/60 border border-white/10 rounded-xl">
            <button
              onClick={() => {
                setModelType("CFG");
                setTestResponse(null);
              }}
              className={`px-4 py-2 text-xs font-semibold rounded-lg transition-all ${
                modelType === "CFG"
                  ? "bg-gradient-to-r from-cyan-500/20 to-blue-500/20 text-cyan-300 border border-cyan-500/30 shadow-sm"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              Test CFG (CYK)
            </button>
            <button
              onClick={() => {
                setModelType("PDA");
                setTestResponse(null);
              }}
              className={`px-4 py-2 text-xs font-semibold rounded-lg transition-all ${
                modelType === "PDA"
                  ? "bg-gradient-to-r from-violet-500/20 to-indigo-500/20 text-violet-300 border border-violet-500/30 shadow-sm"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              Test PDA
            </button>
          </div>

          {testResponse && (
            <button
              onClick={exportCSV}
              className="px-3.5 py-2 bg-slate-900/80 hover:bg-slate-800 border border-white/10 text-slate-300 text-xs font-semibold rounded-xl flex items-center gap-1.5 transition-all shadow-sm"
            >
              <Download className="w-4 h-4 text-cyan-400" />
              <span>Export CSV</span>
            </button>
          )}
        </div>
      </div>

      {/* Control / Action Panel */}
      <div className="glass-card p-5 border border-white/10 shadow-2xl space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <span className="font-bold text-sm text-white">
              Target Model: {modelType === "CFG" ? parsedGrammar?.name || "Active Grammar" : activePDA?.name || "Active PDA"}
            </span>
            <p className="text-xs text-slate-400 mt-0.5 font-mono">
              {testItems.length} test cases configured.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={loadPresetTests}
              className="px-3.5 py-2 bg-slate-900/80 hover:bg-slate-800 border border-white/10 text-slate-300 text-xs font-semibold rounded-xl flex items-center gap-1.5 transition-all shadow-sm"
            >
              <RefreshCw className="w-3.5 h-3.5 text-cyan-400" />
              <span>Load Preset Tests</span>
            </button>

            <button
              onClick={handleRunBatch}
              disabled={isLoading}
              className="px-5 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-semibold text-xs rounded-xl shadow-lg shadow-cyan-500/25 flex items-center gap-2 transition-all disabled:opacity-50"
            >
              <Play className="w-4 h-4 fill-white" />
              <span>{isLoading ? "Running Suite..." : "Run All Test Cases"}</span>
            </button>
          </div>
        </div>

        {/* Add new test row */}
        <div className="flex flex-wrap items-center gap-3 pt-3 border-t border-white/10">
          <input
            type="text"
            value={newString}
            onChange={(e) => setNewString(e.target.value)}
            placeholder="Add new test string (e.g. aabb or empty for ε)"
            className="flex-1 min-w-[200px] px-3.5 py-2 bg-slate-950/60 font-mono text-xs border border-white/10 rounded-xl text-slate-100 placeholder-slate-600 focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/30 transition-all"
          />

          <select
            value={String(newExpected)}
            onChange={(e) => setNewExpected(e.target.value === "true")}
            className="px-3.5 py-2 bg-slate-950/60 text-xs border border-white/10 rounded-xl text-slate-300 focus:outline-none"
          >
            <option value="true" className="bg-slate-900">Expect: Accepted</option>
            <option value="false" className="bg-slate-900">Expect: Rejected</option>
          </select>

          <button
            onClick={handleAddTest}
            className="px-4 py-2 bg-slate-900/80 hover:bg-slate-800 border border-white/10 text-slate-200 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all shadow-sm"
          >
            <Plus className="w-3.5 h-3.5 text-cyan-400" />
            <span>Add String</span>
          </button>
        </div>
      </div>

      {/* Metrics Summary if executed */}
      {testResponse && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="glass-card p-4 border border-white/10 shadow-2xl flex items-center justify-between">
            <div>
              <span className="text-xs text-slate-400 font-mono font-semibold uppercase tracking-wider">Total Executed</span>
              <p className="text-2xl font-bold font-mono text-cyan-400 mt-1">
                {testResponse.total_tests}
              </p>
            </div>
            <FlaskConical className="w-8 h-8 text-cyan-400 opacity-60" />
          </div>

          <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl shadow-lg shadow-emerald-950/20 backdrop-blur flex items-center justify-between text-emerald-300">
            <div>
              <span className="text-xs font-mono font-semibold uppercase tracking-wider text-emerald-400">Passed Expectations</span>
              <p className="text-2xl font-bold font-mono mt-1 text-emerald-200">
                {testResponse.passed_count}
              </p>
            </div>
            <CheckCircle2 className="w-8 h-8 text-emerald-400 opacity-60" />
          </div>

          <div className="p-4 bg-rose-500/10 border border-rose-500/30 rounded-2xl shadow-lg shadow-rose-950/20 backdrop-blur flex items-center justify-between text-rose-300">
            <div>
              <span className="text-xs font-mono font-semibold uppercase tracking-wider text-rose-400">Failed Expectations</span>
              <p className="text-2xl font-bold font-mono mt-1 text-rose-200">
                {testResponse.failed_count}
              </p>
            </div>
            <XCircle className="w-8 h-8 text-rose-400 opacity-60" />
          </div>
        </div>
      )}

      {/* Test Cases Table */}
      <div className="glass-card p-0 border border-white/10 shadow-2xl overflow-hidden">
        <table className="w-full text-left text-xs font-mono">
          <thead className="bg-slate-950/80 text-slate-400 border-b border-white/10">
            <tr>
              <th className="py-3 px-4 w-12">#</th>
              <th className="py-3 px-4">Input String</th>
              <th className="py-3 px-4">Expected</th>
              <th className="py-3 px-4">Actual Result</th>
              <th className="py-3 px-4">Evaluation</th>
              <th className="py-3 px-4 w-16 text-center">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {testItems.map((item, idx) => {
              const resItem = testResponse?.results[idx];
              const isMatch = resItem?.matched_expectation;

              return (
                <tr key={idx} className="hover:bg-white/5 transition-colors">
                  <td className="py-3 px-4 text-slate-500 font-bold">{idx + 1}</td>
                  <td className="py-3 px-4 font-bold text-white">
                    "{item.input_string}" {item.input_string === "" && <span className="text-cyan-400 font-bold">(ε)</span>}
                  </td>
                  <td className="py-3 px-4">
                    {item.expected !== undefined ? (
                      <span
                        className={`px-2.5 py-0.5 rounded-lg font-semibold text-[11px] border ${
                          item.expected
                            ? "bg-emerald-500/15 text-emerald-300 border-emerald-500/30"
                            : "bg-rose-500/15 text-rose-300 border-rose-500/30"
                        }`}
                      >
                        {item.expected ? "Accept" : "Reject"}
                      </span>
                    ) : (
                      <span className="text-slate-500">—</span>
                    )}
                  </td>
                  <td className="py-3 px-4">
                    {resItem ? (
                      <span
                        className={`font-bold ${
                          resItem.actual
                            ? "text-emerald-400"
                            : "text-rose-400"
                        }`}
                      >
                        {resItem.actual ? "ACCEPTED" : "REJECTED"}
                      </span>
                    ) : (
                      <span className="text-slate-500 italic">Not run</span>
                    )}
                  </td>
                  <td className="py-3 px-4">
                    {resItem ? (
                      <span
                        className={`inline-flex items-center gap-1 font-semibold text-[11px] ${
                          isMatch
                            ? "text-emerald-400"
                            : "text-rose-400"
                        }`}
                      >
                        {isMatch ? <CheckCircle2 className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5" />}
                        <span>{isMatch ? "Pass" : "Fail"}</span>
                      </span>
                    ) : (
                      <span className="text-slate-500">—</span>
                    )}
                  </td>
                  <td className="py-3 px-4 text-center">
                    <button
                      onClick={() => handleDeleteTest(idx)}
                      className="text-slate-500 hover:text-rose-400 p-1 transition-colors"
                      title="Remove test string"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
