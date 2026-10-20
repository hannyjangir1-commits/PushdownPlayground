import React from "react";
import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  FileCode2,
  GitBranch,
  ArrowRightLeft,
  Grid3X3,
  Layers,
  Network,
  GitCommit,
  FlaskConical,
  BookOpen,
  Settings,
  ChevronLeft,
  ChevronRight,
  Cpu,
  Sparkles,
} from "lucide-react";
import { useWorkspace } from "../../context/WorkspaceContext";

interface NavItem {
  to: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}

const navItems: NavItem[] = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard },
  { to: "/grammar", label: "Grammar Workspace", icon: FileCode2 },
  { to: "/derivations", label: "Derivations", icon: GitBranch },
  { to: "/normal-forms", label: "CNF / GNF Converter", icon: ArrowRightLeft },
  { to: "/cyk", label: "CYK Parser", icon: Grid3X3 },
  { to: "/pda", label: "PDA Simulator", icon: Layers },
  { to: "/parse-tree", label: "Parse Tree", icon: Network },
  { to: "/automata", label: "State Diagram", icon: GitCommit },
  { to: "/batch-testing", label: "Batch Testing", icon: FlaskConical },
  { to: "/guide", label: "Theory Guide", icon: BookOpen },
  { to: "/settings", label: "Settings", icon: Settings },
];

export const Sidebar: React.FC = () => {
  const { sidebarCollapsed, setSidebarCollapsed } = useWorkspace();

  return (
    <aside
      className={`fixed top-0 left-0 z-40 h-screen transition-all duration-300 ease-in-out flex flex-col bg-[#07090e] border-r border-[#192233] text-slate-300 select-none ${
        sidebarCollapsed ? "w-18" : "w-64"
      }`}
    >
      {/* Brand Header */}
      <div className="flex items-center justify-between h-18 px-4 border-b border-[#192233] bg-[#090d16]/60 backdrop-blur-md">
        <NavLink to="/" className="flex items-center gap-3 overflow-hidden group">
          <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-400 via-sky-500 to-indigo-600 text-white shadow-[0_0_20px_rgba(6,182,212,0.35)] flex-shrink-0 group-hover:scale-105 transition-transform">
            <Cpu className="w-5 h-5" />
          </div>
          {!sidebarCollapsed && (
            <div className="flex flex-col">
              <span className="font-extrabold text-sm tracking-tight text-white font-sans bg-clip-text text-transparent bg-gradient-to-r from-white via-slate-200 to-cyan-300">
                TOC Studio
              </span>
              <span className="text-[10px] font-mono tracking-wider text-cyan-400 uppercase font-semibold">
                CFG &bull; CNF &bull; PDA
              </span>
            </div>
          )}
        </NavLink>

        <button
          onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
          className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800/60 transition-colors hidden md:block"
          title={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {sidebarCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 px-3 py-4 space-y-1.5 overflow-y-auto">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-medium transition-all group relative ${
                isActive
                  ? "bg-gradient-to-r from-cyan-500/15 to-blue-500/10 text-cyan-300 border border-cyan-500/30 shadow-[0_0_15px_rgba(6,182,212,0.15)] font-semibold"
                  : "text-slate-400 hover:text-slate-100 hover:bg-slate-800/40 border border-transparent"
              }`
            }
            title={sidebarCollapsed ? item.label : undefined}
          >
            {({ isActive }) => (
              <>
                <item.icon
                  className={`w-4 h-4 flex-shrink-0 transition-colors ${
                    isActive ? "text-cyan-400" : "text-slate-400 group-hover:text-slate-200"
                  }`}
                />
                {!sidebarCollapsed && <span className="truncate">{item.label}</span>}
                {isActive && !sidebarCollapsed && (
                  <span className="absolute right-2.5 w-1.5 h-1.5 rounded-full bg-cyan-400 shadow-[0_0_8px_#38bdf8]" />
                )}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Footer Info */}
      {!sidebarCollapsed && (
        <div className="p-4 border-t border-[#192233] bg-[#05070a]/60 text-xs text-slate-500">
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_#10b981]" />
            <span className="font-semibold text-slate-300 text-[11px]">Engine v1.0 &bull; Online</span>
          </div>
          <p className="text-[10px] text-slate-500 font-mono">Formal Languages & Automata</p>
        </div>
      )}
    </aside>
  );
};
