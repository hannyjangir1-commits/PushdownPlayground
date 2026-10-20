import type {
  Grammar,
  GrammarAnalysis,
  DerivationResult,
  NormalFormResult,
  CYKResult,
  PDA,
  PDASimulationResult,
  AutomataGraph,
  BatchTestResponse,
  BatchTestItem,
} from "../types";

const API_BASE = import.meta.env.VITE_API_BASE_URL 
  ? `${import.meta.env.VITE_API_BASE_URL.replace(/\/$/, "")}/api`
  : "/api";

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const url = `${API_BASE}${endpoint}`;
  const headers = {
    "Content-Type": "application/json",
    ...(options.headers || {}),
  };

  try {
    const res = await fetch(url, { ...options, headers });
    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(errorData.message || errorData.detail || `HTTP Error ${res.status}`);
    }
    return (await res.json()) as T;
  } catch (err: any) {
    console.error(`API request error on ${endpoint}:`, err);
    throw err;
  }
}

export const apiClient = {
  checkHealth: () => request<{ status: string; version: string }>("/health"),

  parseGrammar: (raw_text: string, name?: string, start_symbol?: string) =>
    request<{ success: boolean; data?: Grammar; error?: string }>("/grammar/parse", {
      method: "POST",
      body: JSON.stringify({ raw_text, name, start_symbol }),
    }),

  validateGrammar: (raw_text: string, start_symbol?: string) =>
    request<GrammarAnalysis>("/grammar/validate", {
      method: "POST",
      body: JSON.stringify({ raw_text, start_symbol }),
    }),

  getSampleGrammars: () =>
    request<{ samples: any[] }>("/grammar/samples"),

  searchDerivation: (params: {
    raw_text?: string;
    grammar?: Grammar;
    target_string: string;
    mode?: "LEFTMOST" | "RIGHTMOST";
    max_depth?: number;
    max_configurations?: number;
  }) =>
    request<DerivationResult>("/derivations/search", {
      method: "POST",
      body: JSON.stringify(params),
    }),

  convertToCNF: (params: { raw_text?: string; grammar?: Grammar }) =>
    request<NormalFormResult>("/normal-forms/cnf", {
      method: "POST",
      body: JSON.stringify(params),
    }),

  convertToGNF: (params: { raw_text?: string; grammar?: Grammar }) =>
    request<NormalFormResult>("/normal-forms/gnf", {
      method: "POST",
      body: JSON.stringify(params),
    }),

  runCYK: (params: {
    raw_text?: string;
    grammar?: Grammar;
    input_string: string;
    convert_to_cnf_first?: boolean;
  }) =>
    request<CYKResult>("/cyk/run", {
      method: "POST",
      body: JSON.stringify(params),
    }),

  validatePDA: (pda: PDA) =>
    request<{ success: boolean; is_valid: boolean; errors: string[]; warnings: string[]; pda: PDA }>("/pda/validate", {
      method: "POST",
      body: JSON.stringify(pda),
    }),

  simulatePDA: (params: {
    pda?: PDA;
    sample_id?: string;
    input_string: string;
    max_steps?: number;
    max_configurations?: number;
  }) =>
    request<PDASimulationResult>("/pda/simulate", {
      method: "POST",
      body: JSON.stringify(params),
    }),

  getSamplePDAs: () =>
    request<{ samples: any[] }>("/pda/samples"),

  getParseTree: (params: {
    raw_text?: string;
    grammar?: Grammar;
    target_string: string;
    mode?: "LEFTMOST" | "RIGHTMOST";
  }) =>
    request<{ success: boolean; root?: any; nodes: any[]; edges: any[]; message: string }>("/visualization/parse-tree", {
      method: "POST",
      body: JSON.stringify(params),
    }),

  getPDAVisualGraph: (pda: PDA) =>
    request<AutomataGraph>("/visualization/pda", {
      method: "POST",
      body: JSON.stringify(pda),
    }),

  runBatchTests: (params: {
    model_type: "CFG" | "PDA";
    grammar_raw_text?: string;
    grammar?: Grammar;
    pda?: PDA;
    sample_id?: string;
    test_items: BatchTestItem[];
    convert_to_cnf?: boolean;
  }) =>
    request<BatchTestResponse>("/tests/batch", {
      method: "POST",
      body: JSON.stringify(params),
    }),
};
