export const SAMPLE_TICKETS = [
  { id: "TKT-0042", subject: "Can't connect to VPN", category: "vpn", status: "escalated", time: "2h ago", priority: "high" },
  { id: "TKT-0041", subject: "WiFi dropping in conf room B", category: "wifi", status: "resolved", time: "5h ago", priority: "medium" },
  { id: "TKT-0040", subject: "Password reset needed", category: "password", status: "resolved", time: "1d ago", priority: "high" },
  { id: "TKT-0039", subject: "Can't access shared drive", category: "access", status: "escalated", time: "1d ago", priority: "medium" },
  { id: "TKT-0038", subject: "Laptop won't wake from sleep", category: "hardware", status: "resolved", time: "2d ago", priority: "low" },
  { id: "TKT-0037", subject: "Email not syncing on mobile", category: "email", status: "resolved", time: "3d ago", priority: "medium" },
];

export const DEMO_SCENARIOS = [
  { label: "WiFi Setup",     value: "wifi",     text: "My laptop can't connect to the office WiFi. It keeps saying authentication failed." },
  { label: "VPN",            value: "vpn",      text: "My VPN won't connect. I'm getting a timeout error when I try to log in remotely." },
  { label: "Password Reset", value: "password", text: "I forgot my password and I'm locked out of my account. Can you help me reset it?" },
  { label: "Unknown",        value: "unknown",  text: "My computer is making a weird noise and things are running slow today." },
];

export function simulateAgentPipeline(text) {
  const lower = text.toLowerCase();
  let intent, priority, confidence;

  if (lower.includes("wifi") || lower.includes("wi-fi")) {
    intent = "wifi_issue"; priority = "medium"; confidence = 0.85;
  } else if (lower.includes("vpn")) {
    intent = "vpn_issue"; priority = "high"; confidence = 0.90;
  } else if (lower.includes("password") || lower.includes("login") || lower.includes("locked out")) {
    intent = "password_reset"; priority = "high"; confidence = 0.88;
  } else {
    intent = "unknown"; priority = "low"; confidence = 0.42;
  }

  const escalated = confidence < 0.6 || intent === "unknown";

  return {
    intent,
    priority,
    confidence,
    escalated,
    primaryAgent: intent === "password_reset" ? "workflow_agent" : "knowledge_agent",
    resolution: {
      solution: escalated ? null : `Here are the steps to resolve your ${intent.replace("_", " ")} issue:\n\n1. Check your connection settings\n2. Restart the service\n3. Contact IT if issue persists`,
      confidence,
      automated: intent === "password_reset",
    },
  };
}
// data module
