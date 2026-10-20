import React, { useState, useEffect } from "react";
import {
  Settings,
  Download,
  Upload,
  RotateCcw,
  Sun,
  Moon,
  CheckCircle2,
  XCircle,
  Activity,
  Cpu,
} from "lucide-react";
import { useWorkspace } from "../context/WorkspaceContext";
import { apiClient } from "../lib/api-client";

export const SettingsPage: React.FC = () => {
  const {
    theme,
    toggleTheme,
    resetWorkspace,
    exportWorkspace,
    importWorkspace,
  } = useWorkspace();

  const [backendHealth, setBackendHealth] = useState<{ status: string; version: string } | null>(null);
  const [importStatus, setImportStatus] = useState<{ success: boolean; message: string } | null>(null);

  useEffect(() => {
    apiClient.checkHealth().then(setBackendHealth).catch(() => setBackendHealth(null));
  }, []);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      const res = importWorkspace(content);
      if (res.success) {
        setImportStatus({ success: true, message: "Workspace imported successfully!" });
      } else {
        setImportStatus({ success: false, message: res.error || "Failed to parse workspace JSON." });
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto animate-in fade-in duration-300">
      {/* Header */}
      <div className="pb-4 border-b border-white/5">
        <div className="flex items-center gap-2 mb-1">
          <span className="w-2 h-2 rounded-full bg-cyan-400 shadow-[0_0_8px_#06b6d4]" />
          <span className="text-[11px] font-mono font-semibold tracking-wider uppercase text-cyan-400">
            System &amp; Configuration
          </span>
        </div>
        <h1 className="text-xl md:text-2xl font-bold tracking-tight text-white font-display">
          Workspace &amp; System Settings
        </h1>
        <p className="text-xs md:text-sm text-slate-400">
          Manage local storage persistence, import/export workspace snapshots, and inspect backend health.
        </p>
      </div>

      {/* Backend Status Card */}
      <div className="glass-card p-5 border border-white/10 shadow-2xl space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
              <Activity className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-white">
                Python Mathematical Engine
              </h3>
              <p className="text-xs text-slate-400">
                FastAPI ASGI Server &amp; Pure Algorithmic Core
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {backendHealth ? (
              <span className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-500/10 text-emerald-300 border border-emerald-500/30 rounded-full text-xs font-semibold shadow-[0_0_12px_rgba(16,185,129,0.2)]">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>Online (v{backendHealth.version})</span>
              </span>
            ) : (
              <span className="inline-flex items-center gap-2 px-3 py-1 bg-rose-500/10 text-rose-300 border border-rose-500/30 rounded-full text-xs font-semibold">
                <XCircle className="w-3.5 h-3.5 text-rose-400" />
                <span>Disconnected</span>
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Appearance Card */}
      <div className="glass-card p-5 border border-white/10 shadow-2xl space-y-4">
        <h3 className="font-bold text-sm text-white">Interface Appearance</h3>
        <div className="flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-300">Theme</span>
            <p className="text-xs text-slate-400">
              Currently using {theme === "dark" ? "Obsidian Studio (Dark Mode)" : "Clean Neutral Light Mode"}.
            </p>
          </div>
          <button
            onClick={toggleTheme}
            className="px-4 py-2 bg-slate-900/80 hover:bg-slate-800 border border-white/10 text-slate-200 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all shadow-sm"
          >
            {theme === "dark" ? <Sun className="w-4 h-4 text-cyan-400" /> : <Moon className="w-4 h-4 text-slate-400" />}
            <span>Switch to {theme === "dark" ? "Light Mode" : "Dark Mode"}</span>
          </button>
        </div>
      </div>

      {/* Persistence & Snapshot Card */}
      <div className="glass-card p-5 border border-white/10 shadow-2xl space-y-4">
        <div>
          <h3 className="font-bold text-sm text-white">Workspace Persistence</h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Export all active grammars, PDA definitions, and test configurations to JSON or restore a snapshot.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 pt-2">
          <button
            onClick={exportWorkspace}
            className="px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white rounded-xl text-xs font-semibold flex items-center gap-2 shadow-lg shadow-cyan-500/25 transition-all"
          >
            <Download className="w-4 h-4" />
            <span>Export Snapshot (.json)</span>
          </button>

          <label className="px-4 py-2 bg-slate-900/80 hover:bg-slate-800 border border-white/10 text-slate-300 rounded-xl text-xs font-semibold flex items-center gap-2 cursor-pointer transition-all shadow-sm">
            <Upload className="w-4 h-4 text-cyan-400" />
            <span>Import Snapshot (.json)</span>
            <input
              type="file"
              accept=".json"
              onChange={handleFileUpload}
              className="hidden"
            />
          </label>

          <button
            onClick={resetWorkspace}
            className="px-4 py-2 bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all ml-auto shadow-sm"
          >
            <RotateCcw className="w-4 h-4 text-rose-400" />
            <span>Reset Workspace</span>
          </button>
        </div>

        {importStatus && (
          <div
            className={`p-3 rounded-xl border text-xs flex items-center gap-2 ${
              importStatus.success
                ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-300"
                : "bg-rose-500/10 border-rose-500/30 text-rose-300"
            }`}
          >
            {importStatus.success ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <XCircle className="w-4 h-4 text-rose-400" />}
            <span>{importStatus.message}</span>
          </div>
        )}
      </div>
    </div>
  );
};
