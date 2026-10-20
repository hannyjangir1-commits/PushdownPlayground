import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { WorkspaceProvider } from "./context/WorkspaceContext";
import { AppShell } from "./components/layout/AppShell";

import { DashboardPage } from "./pages/DashboardPage";
import { GrammarEditorPage } from "./pages/GrammarEditorPage";
import { DerivationPage } from "./pages/DerivationPage";
import { NormalFormsPage } from "./pages/NormalFormsPage";
import { CYKPage } from "./pages/CYKPage";
import { PDASimulatorPage } from "./pages/PDASimulatorPage";
import { ParseTreePage } from "./pages/ParseTreePage";
import { AutomataPage } from "./pages/AutomataPage";
import { TestWorkbenchPage } from "./pages/TestWorkbenchPage";
import { GuidePage } from "./pages/GuidePage";
import { SettingsPage } from "./pages/SettingsPage";
import { NotFoundPage } from "./pages/NotFoundPage";

export const App: React.FC = () => {
  return (
    <WorkspaceProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<AppShell />}>
            <Route index element={<DashboardPage />} />
            <Route path="grammar" element={<GrammarEditorPage />} />
            <Route path="derivations" element={<DerivationPage />} />
            <Route path="normal-forms" element={<NormalFormsPage />} />
            <Route path="cyk" element={<CYKPage />} />
            <Route path="pda" element={<PDASimulatorPage />} />
            <Route path="parse-tree" element={<ParseTreePage />} />
            <Route path="automata" element={<AutomataPage />} />
            <Route path="batch-testing" element={<TestWorkbenchPage />} />
            <Route path="guide" element={<GuidePage />} />
            <Route path="settings" element={<SettingsPage />} />
            <Route path="*" element={<NotFoundPage />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </WorkspaceProvider>
  );
};

export default App;
