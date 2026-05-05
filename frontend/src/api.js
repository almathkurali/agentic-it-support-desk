import { simulateAgentPipeline } from "./data";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

function mapApiResponse(data) {
  const { intake, primary_result, escalation } = data;
  const sources = primary_result?.sources;
  const source = Array.isArray(sources) && sources.length > 0 ? sources[0] : null;
  const answer = primary_result?.answer || null;

  return {
    intent: intake.intent,
    priority: intake.priority,
    confidence: intake.confidence,
    escalated: escalation?.escalated ?? false,
    primaryAgent: primary_result?.agent || "knowledge_agent",
    ticketId: escalation?.ticket_id || primary_result?.ticket_id || null,
    resolution: {
      solution: answer,
      source,
      confidence: primary_result?.confidence ?? intake.confidence,
      automated: primary_result?.agent === "workflow_agent",
    },
  };
}

export async function submitTicket(issue) {
  if (!BACKEND_URL) {
    return simulateAgentPipeline(issue);
  }

  try {
    const response = await fetch(`${BACKEND_URL}/api/ticket`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ issue }),
    });

    if (!response.ok) throw new Error(`HTTP ${response.status}`);

    const data = await response.json();
    return mapApiResponse(data);
  } catch (err) {
    console.warn("Backend unavailable, using simulation:", err.message);
    return simulateAgentPipeline(issue);
  }
}
