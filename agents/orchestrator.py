"""
IT Support Multi-Agent Orchestrator
Built with LangGraph + Claude as the LLM router.
 
Agent exposure: Since agents aren't finalized yet, each is wrapped as a
callable Python function. Swap the internals when your real agents are ready.
"""
 
from __future__ import annotations
 
import json
from typing import Annotated, Literal, TypedDict
 
# Real agent imports
from agents.escalation_agent import escalation_agent   # ← adjust path to match your project
 
from langchain_anthropic import ChatAnthropic
from langchain_core.messages import AIMessage, BaseMessage, HumanMessage, SystemMessage
from langgraph.graph import END, StateGraph
from langgraph.graph.message import add_messages
 
 
# ─────────────────────────────────────────────
# 1. STATE DEFINITION
#    Everything every agent can read or write.
# ─────────────────────────────────────────────
 
class TicketState(TypedDict):
    # Full conversation / message history (append-only via add_messages)
    messages: Annotated[list[BaseMessage], add_messages]
 
    # Intake Agent outputs
    ticket_text: str
    ticket_category: str          # e.g. "network", "password", "software", "hardware"
    priority: str                 # P1 / P2 / P3 / P4
    employee_id: str
 
    # Knowledge Agent outputs
    kb_results: list[str]         # Top retrieved resolution steps
    kb_confidence: float          # 0.0 – 1.0; low = uncertain
 
    # Workflow Agent outputs (stub for now)
    workflow_attempted: bool
    workflow_result: str          # "success" | "failed" | "not_attempted" | "awaiting_confirmation"
 
    # Escalation Agent outputs
    escalation_summary: str
    ticket_id: str | None          # Supabase ticket ID, set by Escalation Agent
 
    # Intent from Intake Agent (used by Escalation Agent for routing logic)
    # e.g. "password_reset", "software_install", "unknown"
    intent: str
 
    # Router decision (set by the LLM router after each node)
    next_agent: str               # "intake" | "knowledge" | "workflow" | "escalation" | "end"
 
    # User confirmation for workflow execution
    user_confirmed: bool | None   # None = not asked yet
 
 
# ─────────────────────────────────────────────
# 2. LLM SETUP
# ─────────────────────────────────────────────
 
llm = ChatAnthropic(model="claude-sonnet-4-20250514", temperature=0)
 
 
# ─────────────────────────────────────────────
# 3. AGENT STUBS
#    Replace each function body with your real agent call.
#    Signature must stay the same: (TicketState) -> dict
# ─────────────────────────────────────────────
 
def run_intake_agent(state: TicketState) -> dict:
    """
    Intake Agent: classifies the ticket, assigns priority, extracts metadata.
    STUB — replace with your real IntakeAgent call.
    """
    # ── YOUR AGENT GOES HERE ──────────────────────────────────────────────
    # result = your_intake_agent.run(state["ticket_text"])
    # For now we return hardcoded demo values:
    result = {
        "ticket_category": "password",
        "priority": "P2",
        "employee_id": state.get("employee_id", "emp_unknown"),
    }
    # ─────────────────────────────────────────────────────────────────────
 
    summary = (
        f"[Intake Agent] Classified as '{result['ticket_category']}' | "
        f"Priority: {result['priority']} | Employee: {result['employee_id']}"
    )
    return {
        **result,
        "messages": [AIMessage(content=summary, name="intake_agent")],
    }
 
 
def run_knowledge_agent(state: TicketState) -> dict:
    """
    Knowledge Agent: semantic + keyword search over the IT knowledge base.
    STUB — replace with your real KnowledgeAgent (RAG) call.
    """
    # ── YOUR AGENT GOES HERE ──────────────────────────────────────────────
    # result = your_knowledge_agent.run(state["ticket_text"], state["ticket_category"])
    kb_results = [
        "Step 1: Go to company SSO portal → 'Forgot Password'.",
        "Step 2: Verify via MFA to your registered mobile device.",
        "Step 3: Set a new password meeting complexity requirements.",
    ]
    kb_confidence = 0.91
    # ─────────────────────────────────────────────────────────────────────
 
    summary = (
        f"[Knowledge Agent] Retrieved {len(kb_results)} steps "
        f"(confidence: {kb_confidence:.0%}): {kb_results[0][:60]}…"
    )
    return {
        "kb_results": kb_results,
        "kb_confidence": kb_confidence,
        "messages": [AIMessage(content=summary, name="knowledge_agent")],
    }
 
 
def run_workflow_agent(state: TicketState) -> dict:
    """
    Workflow Agent: executes automated fixes (password resets, account unlocks, etc.).
    NOT YET BUILT — this node handles the confirmation step before escalating.
    """
    # If user has NOT been asked yet, ask for confirmation
    if state.get("user_confirmed") is None:
        confirm_msg = (
            "[Workflow Agent] I can attempt to automatically reset your password. "
            "Should I proceed? (Reply 'yes' to confirm or 'no' to escalate to a human.)"
        )
        return {
            "workflow_attempted": False,
            "workflow_result": "awaiting_confirmation",
            "next_agent": "awaiting_user",           # special state; graph will pause here
            "messages": [AIMessage(content=confirm_msg, name="workflow_agent")],
        }
 
    # User declined or workflow not yet built → flag for escalation
    if not state["user_confirmed"]:
        return {
            "workflow_attempted": False,
            "workflow_result": "not_attempted",
            "messages": [AIMessage(
                content="[Workflow Agent] User declined auto-fix. Routing to escalation.",
                name="workflow_agent",
            )],
        }
 
    # ── YOUR AGENT GOES HERE (when built) ────────────────────────────────
    # result = your_workflow_agent.execute(state["ticket_category"], state["employee_id"])
    # For now simulate a stub execution:
    workflow_result = "failed"  # Change to "success" when agent is real
    # ─────────────────────────────────────────────────────────────────────
 
    summary = f"[Workflow Agent] Execution result: {workflow_result}"
    return {
        "workflow_attempted": True,
        "workflow_result": workflow_result,
        "messages": [AIMessage(content=summary, name="workflow_agent")],
    }
 
 
def run_escalation_agent(state: TicketState) -> dict:
    """
    Escalation Agent: updates or creates a Supabase ticket and writes a
    human-readable handoff summary.
 
    Your escalation_agent() expects a flat 'context' dict with these keys:
        intake          → dict with priority, intent, user_input, ticket_id
        primary_result  → dict with confidence
    We build that from TicketState here so the agent needs no changes.
    """
 
    # ── BRIDGE: TicketState → escalation_agent context ───────────────────
    #
    # priority: your agent expects "high"/"low" strings; our state uses
    #           "P1"–"P4". Map P1/P2 → "high", P3/P4 → "low".
    raw_priority = state.get("priority", "P3")
    mapped_priority = "high" if raw_priority in ("P1", "P2") else "low"
 
    # intent: not yet in TicketState (Intake Agent stub doesn't set it).
    # Use ticket_category as a stand-in until your real Intake Agent runs.
    intent = state.get("intent") or state.get("ticket_category") or "unknown"
 
    context = {
        # Intake sub-dict — mirrors what your agent reads via context["intake"]
        "intake": {
            "priority":   mapped_priority,
            "intent":     intent,
            "user_input": state.get("ticket_text", ""),
            "ticket_id":  state.get("ticket_id"),        # may be None on first run
        },
        # primary_result sub-dict — mirrors context["primary_result"]
        "primary_result": {
            "confidence": state.get("kb_confidence", 0.0),
            "ticket_id":  state.get("ticket_id"),
        },
    }
    # ─────────────────────────────────────────────────────────────────────
 
    # ── REAL AGENT CALL ───────────────────────────────────────────────────
    result = escalation_agent(context)
    # result keys: agent, escalated, ticket_id, priority, reason, message
    # ─────────────────────────────────────────────────────────────────────
 
    # ── BRIDGE: escalation_agent result → TicketState ────────────────────
    escalation_summary = (
        f"Escalated: {result['escalated']}\n"
        f"Ticket ID: {result.get('ticket_id', 'N/A')}\n"
        f"Priority:  {result.get('priority', 'N/A')}\n"
        f"Reason:    {result.get('reason', '')}\n"
        f"Message:   {result.get('message', '')}"
    )
 
    updates: dict = {
        "escalation_summary": escalation_summary,
        "messages": [AIMessage(
            content=f"[Escalation Agent]\n{result.get('message', escalation_summary)}",
            name="escalation_agent",
        )],
    }
 
    # Persist the Supabase ticket_id back into state so other agents can
    # reference it (e.g. if Workflow Agent needs to attach a log).
    if result.get("ticket_id"):
        updates["ticket_id"] = result["ticket_id"]
 
    return updates
    # ─────────────────────────────────────────────────────────────────────
 
 
# ─────────────────────────────────────────────
# 4. LLM ROUTER NODE
#    The LLM reads full state and decides next step.
# ─────────────────────────────────────────────
 
ROUTER_SYSTEM_PROMPT = """You are the orchestrator of a multi-agent IT support system.
Your only job is to decide which agent to run next given the current ticket state.
 
Agents available:
- "intake"     → Run first. Classifies ticket type, priority, and intent.
- "knowledge"  → Run after intake. Retrieves KB resolution steps.
- "workflow"   → Run after knowledge IF the issue is automatable (password reset,
                  account unlock, Wi-Fi reconnect). Ask user to confirm first.
- "escalation" → Run when ANY of: (a) workflow failed, (b) user declined workflow,
                  (c) kb_confidence < 0.7, (d) priority is "high" (P1/P2),
                  (e) intent is "unknown", or (f) issue is not automatable.
- "end"        → Run when ticket is fully resolved (workflow succeeded).
 
Respond ONLY with a JSON object like: {"next": "knowledge"}
Do not explain. Do not add any other text.
"""
 
def llm_router(state: TicketState) -> dict:
    """LLM reads the full state history and decides the next node."""
 
    # Build a compact state summary for the LLM to reason over
    state_summary = {
        "ticket_category": state.get("ticket_category"),
        "intent": state.get("intent"),
        "priority": state.get("priority"),
        "kb_confidence": state.get("kb_confidence"),
        "workflow_result": state.get("workflow_result"),
        "user_confirmed": state.get("user_confirmed"),
        "escalation_summary": bool(state.get("escalation_summary")),
        "ticket_id": state.get("ticket_id"),
        "last_agent_message": (
            state["messages"][-1].content
            if state.get("messages") else "none"
        ),
    }
 
    response = llm.invoke([
        SystemMessage(content=ROUTER_SYSTEM_PROMPT),
        HumanMessage(content=f"Current state:\n{json.dumps(state_summary, indent=2)}\n\nWhat is the next agent?"),
    ])
 
    raw = response.content.strip()
    try:
        decision = json.loads(raw)
        next_agent = decision.get("next", "escalation")
    except json.JSONDecodeError:
        next_agent = "escalation"   # safe default
 
    return {"next_agent": next_agent}
 
 
# ─────────────────────────────────────────────
# 5. EDGE CONDITION
#    LangGraph reads next_agent from state to route.
# ─────────────────────────────────────────────
 
def route_by_decision(state: TicketState) -> Literal[
    "intake", "knowledge", "workflow", "escalation", "__end__"
]:
    decision = state.get("next_agent", "escalation")
    if decision == "end":
        return "__end__"
    if decision in ("intake", "knowledge", "workflow", "escalation"):
        return decision
    return "escalation"   # fallback
 
 
# ─────────────────────────────────────────────
# 6. GRAPH CONSTRUCTION
# ─────────────────────────────────────────────
 
def build_graph() -> StateGraph:
    graph = StateGraph(TicketState)
 
    # Register nodes
    graph.add_node("router",     llm_router)
    graph.add_node("intake",     run_intake_agent)
    graph.add_node("knowledge",  run_knowledge_agent)
    graph.add_node("workflow",   run_workflow_agent)
    graph.add_node("escalation", run_escalation_agent)
 
    # Entry point → always route first
    graph.set_entry_point("router")
 
    # Router decides which agent to run
    graph.add_conditional_edges(
        "router",
        route_by_decision,
        {
            "intake":     "intake",
            "knowledge":  "knowledge",
            "workflow":   "workflow",
            "escalation": "escalation",
            "__end__":    END,
        },
    )
 
    # After each agent → always go back to router for next decision
    for agent in ("intake", "knowledge", "workflow", "escalation"):
        graph.add_edge(agent, "router")
 
    return graph.compile()
 
 
# ─────────────────────────────────────────────
# 7. RUN EXAMPLE
# ─────────────────────────────────────────────
 
if __name__ == "__main__":
    app = build_graph()
 
    initial_state: TicketState = {
        "messages": [HumanMessage(content="I forgot my password and can't log in.")],
        "ticket_text": "I forgot my password and can't log in.",
        "ticket_category": "",
        "priority": "",
        "employee_id": "emp_00123",
        "intent": "",              # populated by Intake Agent
        "ticket_id": None,         # populated by Escalation Agent via Supabase
        "kb_results": [],
        "kb_confidence": 0.0,
        "workflow_attempted": False,
        "workflow_result": "not_attempted",
        "escalation_summary": "",
        "next_agent": "",
        "user_confirmed": None,
    }
 
    print("=== Starting IT Support Orchestrator ===\n")
    for step in app.stream(initial_state, stream_mode="updates"):
        node_name = list(step.keys())[0]
        node_output = step[node_name]
        if "messages" in node_output:
            for msg in node_output["messages"]:
                print(f"[{node_name.upper()}] {msg.content}\n")
