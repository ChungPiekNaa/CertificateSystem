import { useState } from "react";
import { Routes, Route } from "react-router-dom";
import Sidebar from "./components/Sidebar";
import GenerateCertificatePage from "./pages/GenerateCertificatePage";
import ParticipantListPage from "./pages/ParticipantListPage";

export default function App() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="app">
      {!sidebarOpen && (
        <button className="sidebar-toggle-fab" onClick={() => setSidebarOpen(true)} aria-label="Open menu">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <path d="M3 6h18M3 12h18M3 18h18" />
          </svg>
        </button>
      )}

      <div className={`sidebar-scrim ${sidebarOpen ? "show" : ""}`} onClick={() => setSidebarOpen(false)} />
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <main className="main">
        <Routes>
          <Route path="/" element={<GenerateCertificatePage />} />
          <Route path="/history" element={<ParticipantListPage />} />
        </Routes>
      </main>
    </div>
  );
}