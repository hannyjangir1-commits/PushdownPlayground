import React from "react";
import { Link } from "react-router-dom";
import { Home, ArrowLeft } from "lucide-react";

export const NotFoundPage: React.FC = () => {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center text-center p-6 space-y-4 animate-in fade-in">
      <div className="w-16 h-16 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 flex items-center justify-center font-bold text-2xl font-mono shadow-[0_0_15px_rgba(6,182,212,0.25)]">
        404
      </div>
      <h1 className="text-xl font-bold text-white font-display">Page Not Found</h1>
      <p className="text-xs text-slate-400 max-w-sm">
        The requested formal theory module does not exist or has been relocated in the workspace.
      </p>
      <Link
        to="/"
        className="px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white text-xs font-semibold rounded-xl flex items-center gap-2 shadow-lg shadow-cyan-500/25 transition-all"
      >
        <Home className="w-4 h-4" />
        <span>Return to Dashboard</span>
      </Link>
    </div>
  );
};
