import { useState, useEffect } from "react";
import Sidebar from "./components/Sidebar";
import TweaksPanel from "./components/TweaksPanel";
import DashboardScreen from "./screens/DashboardScreen";
import TicketFormScreen from "./screens/TicketFormScreen";
import ProcessingScreen from "./screens/ProcessingScreen";
import ResolutionScreen from "./screens/ResolutionScreen";
import HistoryScreen from "./screens/HistoryScreen";
import { SAMPLE_TICKETS } from "./data";
import { saveTicketToSupabase } from "./api";

const TWEAK_DEFAULTS = {
  accentHue: 250,
  darkSidebar: true,
  animSpeed: 1,
  demoMode: true,
};

function applyTweaks(tweaks) {
  const root = document.documentElement;
  root.style.setProperty("--accent",       `oklch(0.55 0.2 ${tweaks.accentHue})`);
  root.style.setProperty("--accent-light", `oklch(0.92 0.06 ${tweaks.accentHue})`);
  root.style.setProperty("--accent-dim",   `oklch(0.65 0.15 ${tweaks.accentHue})`);

  if (tweaks.darkSidebar) {
    root.style.setProperty("--sidebar-bg",     "oklch(0.16 0.02 255)");
    root.style.setProperty("--sidebar-text",   "oklch(0.72 0.04 250)");
    root.style.setProperty("--sidebar-muted",  "oklch(0.45 0.03 250)");
    root.style.setProperty("--sidebar-hover",  "oklch(0.22 0.03 255)");
    root.style.setProperty("--sidebar-active", "oklch(0.26 0.05 255)");
  } else {
    root.style.setProperty("--sidebar-bg",     "oklch(0.94 0.01 240)");
    root.style.setProperty("--sidebar-text",   "oklch(0.3 0.01 250)");
    root.style.setProperty("--sidebar-muted",  "oklch(0.55 0.01 250)");
    root.style.setProperty("--sidebar-hover",  "oklch(0.9 0.01 240)");
    root.style.setProperty("--sidebar-active", "oklch(0.86 0.04 250)");
  }
}

export default function App() {
  const [screen, setScreen] = useState("dashboard");
  const [activeTicket, setActiveTicket] = useState(null);
  const [agentResult, setAgentResult] = useState(null);
  const [tickets, setTickets] = useState(() => {
    try {
      const saved = localStorage.getItem("it_support_tickets");
      return saved ? JSON.parse(saved) : SAMPLE_TICKETS;
    } catch {
      return SAMPLE_TICKETS;
    }
  });
  const [showTweaks, setShowTweaks] = useState(false);
  const [tweaks, setTweaksState] = useState(TWEAK_DEFAULTS);

  const setTweak = (key, value) => {
    const next = { ...tweaks, [key]: value };
    setTweaksState(next);
    applyTweaks(next);
  };

  // Persist tickets across page refreshes
  useEffect(() => {
    localStorage.setItem("it_support_tickets", JSON.stringify(tickets));
  }, [tickets]);

  // Support tweaks panel toggle from parent frame (Claude Design compatibility)
  useEffect(() => {
    const handler = (e) => {
      if (e.data?.type === "__activate_edit_mode") setShowTweaks(true);
      if (e.data?.type === "__deactivate_edit_mode") setShowTweaks(false);
    };
    window.addEventListener("message", handler);
    window.parent.postMessage({ type: "__edit_mode_available" }, "*");
    return () => window.removeEventListener("message", handler);
  }, []);

  const handleNewTicket = () => {
    setScreen("form");
    setActiveTicket(null);
    setAgentResult(null);
  };

  const handleSubmit = (ticket) => {
    setActiveTicket(ticket);
    setScreen("processing");
  };

  const handleComplete = (result) => {
    const newEntry = {
      id: result.ticketId || ("TKT-" + String(Math.floor(Math.random() * 9000) + 1000)),
      subject: activeTicket.subject || activeTicket.body.slice(0, 50),
      category: activeTicket.category || "other",
      status: result.escalated ? "escalated" : "resolved",
      time: "just now",
      priority: result.priority || "medium",
    };
    setTickets(prev => [newEntry, ...prev]);
    setAgentResult(result);
    setScreen("resolution");
    // Write resolved ticket to Supabase
    saveTicketToSupabase(activeTicket, result);
  };

  const renderScreen = () => {
    switch (screen) {
      case "dashboard":
        return <DashboardScreen onNewTicket={handleNewTicket} tickets={tickets} />;
      case "form":
        return (
          <TicketFormScreen
            onSubmit={handleSubmit}
            onBack={() => setScreen("dashboard")}
            demoMode={tweaks.demoMode}
          />
        );
      case "processing":
        return (
          <ProcessingScreen
            ticket={activeTicket}
            onGoToForm={() => setScreen("form")}
            onComplete={handleComplete}
            speed={tweaks.animSpeed}
          />
        );
      case "resolution":
        if (!agentResult) { setScreen("dashboard"); return null; }
        return (
          <ResolutionScreen
            ticket={activeTicket}
            result={agentResult}
            onNewTicket={handleNewTicket}
          />
        );
      case "history":
        return <HistoryScreen tickets={tickets} />;
      default:
        return null;
    }
  };

  return (
    <div style={{ display: "flex", height: "100vh", overflow: "hidden" }}>
      <Sidebar
        activeScreen={screen}
        setScreen={setScreen}
        tickets={tickets}
        onNewTicket={handleNewTicket}
      />
      <main style={{ flex: 1, overflowY: "auto", background: "oklch(0.97 0.005 240)" }}>
        {renderScreen()}
      </main>
      {showTweaks && (
        <TweaksPanel
          tweaks={tweaks}
          setTweak={setTweak}
          onClose={() => {
            setShowTweaks(false);
            window.parent.postMessage({ type: "__edit_mode_dismissed" }, "*");
          }}
        />
      )}
    </div>
  );
}
