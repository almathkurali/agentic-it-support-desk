import { simulateAgentPipeline } from "./data";
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;
const SUPABASE_URL = "https://eswobqtykuqnwmvhxqex.supabase.co";
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_KEY;

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

export async function saveTicketToSupabase(ticket, result) {
  if (!SUPABASE_KEY) {
    console.warn("VITE_SUPABASE_KEY not set — skipping Supabase write");
    return;
  }
  try {
    await fetch(`${SUPABASE_URL}/rest/v1/tickets`, {
      method: "POST",
      headers: {
        "apikey": SUPABASE_KEY,
        "Authorization": `Bearer ${SUPABASE_KEY}`,
        "Content-Type": "application/json",
        "Prefer": "return=minimal",
      },
      body: JSON.stringify({
        user_issue: ticket.body,
        intent: result.intent,
        priority: result.priority,
        status: result.escalated ? "escalated" : "resolved",
      }),
    });
  } catch (err) {
    console.warn("Supabase write failed:", err.message);
  }
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
