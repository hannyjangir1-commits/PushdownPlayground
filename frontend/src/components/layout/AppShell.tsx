import React, { useState } from "react";
import { Outlet } from "react-router-dom";
import { Sidebar } from "./Sidebar";
import { Topbar } from "./Topbar";
import { useWorkspace } from "../../context/WorkspaceContext";

export const AppShell: React.FC = () => {
  const { sidebarCollapsed } = useWorkspace();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#f8fafc] dark:bg-[#06080e] text-slate-900 dark:text-slate-100 flex flex-col font-sans transition-colors relative overflow-hidden">
      {/* Ambient background mesh glow (Ultra-premium dark mode lighting) */}
      <div className="fixed top-[-10%] right-[-5%] w-[600px] h-[600px] rounded-full bg-cyan-500/5 dark:bg-cyan-500/10 blur-[130px] pointer-events-none -z-10" />
      <div className="fixed bottom-[-10%] left-[20%] w-[500px] h-[500px] rounded-full bg-violet-600/5 dark:bg-violet-600/10 blur-[130px] pointer-events-none -z-10" />
      <div className="fixed top-[40%] left-[5%] w-[400px] h-[400px] rounded-full bg-blue-500/5 dark:bg-blue-600/5 blur-[120px] pointer-events-none -z-10" />

      {/* Desktop Sidebar */}
      <div className="hidden md:block">
        <Sidebar />
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setMobileMenuOpen(false)}
          />
          <div className="relative z-10 w-64 h-full bg-[#07090e] shadow-2xl">
            <Sidebar />
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div
        className={`flex-1 flex flex-col transition-all duration-300 ease-in-out ${
          sidebarCollapsed ? "md:ml-18" : "md:ml-64"
        }`}
      >
        <Topbar onMobileMenuToggle={() => setMobileMenuOpen(!mobileMenuOpen)} />

        <main className="flex-1 p-4 md:p-8 max-w-7xl w-full mx-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
