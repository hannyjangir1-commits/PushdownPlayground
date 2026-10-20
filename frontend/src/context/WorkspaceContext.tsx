import React, { createContext, useContext, useState, useEffect } from "react";
import type { Grammar, PDA } from "../types";
import { apiClient } from "../lib/api-client";

interface WorkspaceContextType {
  grammarText: string;
  setGrammarText: (text: string) => void;
  parsedGrammar: Grammar | null;
  setParsedGrammar: (g: Grammar | null) => void;
  activePDA: PDA | null;
  setActivePDA: (pda: PDA | null) => void;
  theme: "light" | "dark";
  toggleTheme: () => void;
  sidebarCollapsed: boolean;
  setSidebarCollapsed: (c: boolean) => void;
  sampleGrammars: any[];
  samplePDAs: any[];
  loadSampleGrammar: (sampleId: string) => Promise<void>;
  loadSamplePDA: (sampleId: string) => Promise<void>;
  resetWorkspace: () => void;
  exportWorkspace: () => void;
  importWorkspace: (fileContent: string) => { success: boolean; error?: string };
}

const DEFAULT_GRAMMAR_TEXT = "S -> a S b | ε";

const WorkspaceContext = createContext<WorkspaceContextType | undefined>(undefined);

export const WorkspaceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setTheme] = useState<"light" | "dark">(() => {
    const saved = localStorage.getItem("toc_theme");
    return saved === "dark" || (!saved && window.matchMedia("(prefers-color-scheme: dark)").matches)
      ? "dark"
      : "light";
  });

  const [sidebarCollapsed, setSidebarCollapsed] = useState<boolean>(() => {
    return localStorage.getItem("toc_sidebar_collapsed") === "true";
  });

  const [grammarText, setGrammarTextState] = useState<string>(() => {
    return localStorage.getItem("toc_grammar_text") || DEFAULT_GRAMMAR_TEXT;
  });

  const [parsedGrammar, setParsedGrammarState] = useState<Grammar | null>(() => {
    const saved = localStorage.getItem("toc_parsed_grammar");
    try {
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [activePDA, setActivePDAState] = useState<PDA | null>(() => {
    const saved = localStorage.getItem("toc_active_pda");
    try {
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [sampleGrammars, setSampleGrammars] = useState<any[]>([]);
  const [samplePDAs, setSamplePDAs] = useState<any[]>([]);

  // Apply dark mode class to root HTML
  useEffect(() => {
    const root = document.documentElement;
    if (theme === "dark") {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
    localStorage.setItem("toc_theme", theme);
  }, [theme]);

  // Persist sidebar state
  useEffect(() => {
    localStorage.setItem("toc_sidebar_collapsed", String(sidebarCollapsed));
  }, [sidebarCollapsed]);

  // Fetch sample grammars & PDAs on mount
  useEffect(() => {
    apiClient.getSampleGrammars().then((res) => {
      setSampleGrammars(res.samples || []);
    }).catch(console.error);

    apiClient.getSamplePDAs().then((res) => {
      setSamplePDAs(res.samples || []);
      if (!activePDA && res.samples && res.samples.length > 0) {
        setActivePDAState(res.samples[0].pda);
        localStorage.setItem("toc_active_pda", JSON.stringify(res.samples[0].pda));
      }
    }).catch(console.error);
  }, []);

  const setGrammarText = (text: string) => {
    setGrammarTextState(text);
    localStorage.setItem("toc_grammar_text", text);
  };

  const setParsedGrammar = (g: Grammar | null) => {
    setParsedGrammarState(g);
    if (g) {
      localStorage.setItem("toc_parsed_grammar", JSON.stringify(g));
    } else {
      localStorage.removeItem("toc_parsed_grammar");
    }
  };

  const setActivePDA = (pda: PDA | null) => {
    setActivePDAState(pda);
    if (pda) {
      localStorage.setItem("toc_active_pda", JSON.stringify(pda));
    } else {
      localStorage.removeItem("toc_active_pda");
    }
  };

  const toggleTheme = () => {
    setTheme((prev) => (prev === "light" ? "dark" : "light"));
  };

  const loadSampleGrammar = async (sampleId: string) => {
    const s = sampleGrammars.find((x) => x.id === sampleId);
    if (s) {
      setGrammarText(s.raw_text);
      try {
        const res = await apiClient.parseGrammar(s.raw_text, s.name, s.start_symbol);
        if (res.success && res.data) {
          setParsedGrammar(res.data);
        }
      } catch (err) {
        console.error("Failed to parse sample grammar:", err);
      }
    }
  };

  const loadSamplePDA = async (sampleId: string) => {
    const s = samplePDAs.find((x) => x.id === sampleId);
    if (s && s.pda) {
      setActivePDA(s.pda);
    }
  };

  const resetWorkspace = () => {
    setGrammarText(DEFAULT_GRAMMAR_TEXT);
    setParsedGrammar(null);
    if (samplePDAs.length > 0) {
      setActivePDA(samplePDAs[0].pda);
    }
    localStorage.removeItem("toc_grammar_text");
    localStorage.removeItem("toc_parsed_grammar");
  };

  const exportWorkspace = () => {
    const data = {
      app: "Interactive CFG and PDA Learning Tool",
      version: "1.0.0",
      exported_at: new Date().toISOString(),
      grammarText,
      parsedGrammar,
      activePDA,
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `cfg-pda-workspace-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const importWorkspace = (fileContent: string) => {
    try {
      const data = JSON.parse(fileContent);
      if (!data || typeof data !== "object") {
        return { success: false, error: "Invalid JSON format." };
      }
      if (typeof data.grammarText === "string") {
        setGrammarText(data.grammarText);
      }
      if (data.parsedGrammar) {
        setParsedGrammar(data.parsedGrammar);
      }
      if (data.activePDA) {
        setActivePDA(data.activePDA);
      }
      return { success: true };
    } catch (e: any) {
      return { success: false, error: `Import failed: ${e.message}` };
    }
  };

  return (
    <WorkspaceContext.Provider
      value={{
        grammarText,
        setGrammarText,
        parsedGrammar,
        setParsedGrammar,
        activePDA,
        setActivePDA,
        theme,
        toggleTheme,
        sidebarCollapsed,
        setSidebarCollapsed,
        sampleGrammars,
        samplePDAs,
        loadSampleGrammar,
        loadSamplePDA,
        resetWorkspace,
        exportWorkspace,
        importWorkspace,
      }}
    >
      {children}
    </WorkspaceContext.Provider>
  );
};

export const useWorkspace = () => {
  const context = useContext(WorkspaceContext);
  if (!context) {
    throw new Error("useWorkspace must be used within a WorkspaceProvider");
  }
  return context;
};
