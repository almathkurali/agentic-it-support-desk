import { simulateAgentPipeline } from "./data";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

/**
 * The orchestrator returns a flat dict:
 * {
 *   user_input, employee_id, category, intent, priority,
 *   kb_results      : string[]   — steps from knowledge agent
 *   kb_confidence   : float
 *   workflow_attempted : bool
 *   workflow_result : "success" | "failed" | "not_attempted"
 *   ticket_id       : string | null  — set by escalation_agent
 *   escalation_summary : string      — non-empty means escalated
 *   resolved        : bool
 *   messages        : {role, agent, content}[]
 * }
 */
function mapApiResponse(data) {
  const escalated = Boolean(data.escalation_summary);
  const answer = data.kb_results?.length > 0 ? data.kb_results.join("\n") : null;
  const automated = data.workflow_attempted && data.workflow_result === "success";

  return {
    intent:       data.intent      || "unknown",
    priority:     data.priority    || "low",
    confidence:   data.kb_confidence ?? 0,
    escalated,
    primaryAgent: data.workflow_attempted ? "workflow_agent" : "knowledge_agent",
    ticketId:     data.ticket_id   || null,
    resolution: {
      solution:   escalated ? null : answer,
      source:     null,
      confidence: data.kb_confidence ?? 0,
      automated,
    },
  };
}

export async function saveTicketToSupabase(ticket, result) {
  if (!BACKEND_URL) return;
  try {
    await fetch(`${BACKEND_URL}/api/log-result`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        user_issue:      ticket.body,
        intent:          result.intent,
        priority:        result.priority,
        status:          result.escalated ? "escalated" : "resolved",
        ticket_id:       result.ticketId  || null,
        resolved:        !result.escalated,
        workflow_action: result.resolution?.automated ? "automated" : null,
      }),
    });
  } catch (err) {
    console.warn("log-result failed:", err.message);
  }
}

export async function submitTicket(issue, signal) {
  if (!BACKEND_URL) {
    return simulateAgentPipeline(issue);
  }
  try {
    const response = await fetch(`${BACKEND_URL}/api/ticket`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ issue }),
      signal,
    });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const data = await response.json();
    console.log("[api] raw /api/ticket response:", data);
    const mapped = mapApiResponse(data);
    console.log("[api] mapApiResponse result:", mapped);
    return mapped;
  } catch (err) {
    if (err.name === "AbortError") return null;
    console.warn("Backend unavailable, using simulation:", err.message);
    return simulateAgentPipeline(issue);
  }
}
