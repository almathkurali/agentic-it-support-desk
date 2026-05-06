import { useState, useEffect } from "react";
import AgentStep from "../components/AgentStep";
import { simulateAgentPipeline } from "../data";
import { submitTicket } from "../api";

export default function ProcessingScreen({ ticket, onGoToForm, onComplete, speed }) {
  const speedMs = (ms) => Math.round(ms / (speed || 1));

  const simulated = ticket
    ? simulateAgentPipeline(ticket.body)
    : { intent: "unknown", priority: "low", confidence: 0, escalated: false, primaryAgent: "knowledge_agent", resolution: {} };
  const primaryKey = simulated.primaryAgent === "knowledge_agent" ? "knowledge" : "workflow";

  const [steps, setSteps] = useState([
    { agent: "intake",     status: "running", detail: null },
    { agent: primaryKey,   status: "waiting", detail: null },
    { agent: "escalation", status: "waiting", detail: null },
  ]);

  useEffect(() => {
    if (!ticket) {
      onGoToForm();
      return;
    }

    const apiPromise = submitTicket(ticket.body);

    const t1 = setTimeout(() => {
      setSteps(prev => prev.map((s, i) => {
        if (i === 0) return {
          ...s, status: "done",
          detail: `intent: ${simulated.intent} · priority: ${simulated.priority} · confidence: ${(simulated.confidence * 100).toFixed(0)}%`,
        };
        if (i === 1) return { ...s, status: "running" };
        return s;
      }));
    }, speedMs(1800));

    const t2 = setTimeout(() => {
      setSteps(prev => prev.map((s, i) => {
        if (i === 1) return {
          ...s, status: "done",
          detail: simulated.resolution?.source
            ? `source: ${simulated.resolution.source}`
            : "workflow executed · ticket saved to Supabase",
        };
        if (i === 2) return { ...s, status: "running" };
        return s;
      }));
    }, speedMs(3800));

    const t3 = setTimeout(async () => {
      const result = await apiPromise.catch(() => simulated);
      const finalResult = result || simulated;
      const escalated = finalResult.escalated;

      setSteps(prev => prev.map((s, i) => {
        if (i === 2) return {
          ...s,
          status: escalated ? "escalated" : "done",
          detail: escalated ? "escalated · routed to human queue" : "no escalation needed",
        };
        return s;
      }));

      setTimeout(() => onComplete(finalResult), speedMs(800));
    }, speedMs(5600));

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  if (!ticket) return null;

  return (
    <div className="fade-up" style={{ padding: "36px 40px", maxWidth: 620 }}>
      <div style={{ marginBottom: 28 }}>
        <div style={{
          display: "inline-flex", alignItems: "center", gap: 7,
          background: "var(--accent-light)", color: "var(--accent)",
          padding: "5px 12px", borderRadius: 20, fontSize: 12, fontWeight: 600, marginBottom: 14,
        }}>
          <div style={{
            width: 6, height: 6, borderRadius: "50%",
            background: "var(--accent)", animation: "pulse-ring 1.4s ease-out infinite",
          }} />
          Agents Working
        </div>
        <h1 style={{ fontSize: 22, fontWeight: 700, letterSpacing: "-0.02em", marginBottom: 4 }}>
          Processing Your Ticket
        </h1>
        <p style={{ color: "var(--muted)", fontSize: 14 }}>
          <span style={{ fontFamily: "DM Mono, monospace" }}>
            {ticket.body.substring(0, 60)}{ticket.body.length > 60 ? "…" : ""}
          </span>
        </p>
      </div>

      <div style={{ height: 3, background: "var(--border)", borderRadius: 2, marginBottom: 32, overflow: "hidden" }}>
        <div style={{
          height: "100%", background: "var(--accent)", borderRadius: 2,
          animation: `progressBar ${speedMs(5600)}ms ease-out forwards`,
        }} />
      </div>

      <div>
        {steps.map((s, i) => (
          <AgentStep
            key={s.agent + i}
            agent={s.agent}
            status={s.status}
            detail={s.detail}
            delay={i * 150}
            isLast={i === steps.length - 1}
          />
        ))}
      </div>

      <div style={{ marginTop: 24, fontSize: 13, color: "var(--muted)", fontStyle: "italic" }}>
        Typical resolution: under 60 seconds
      </div>
    </div>
  );
}
