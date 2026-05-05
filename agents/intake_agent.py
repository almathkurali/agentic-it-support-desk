"""
Intake Agent — Agentic AI Support Platform

Inspired by professor's example:
  - Pydantic schema enforces structured output (replaces manual JSON parsing)
  - "reason" field explains every classification decision (great for demos)
  - Keyword fallback keeps the system alive if the LLM API fails
  - RAG, metrics, audit trail, MCP tools, clarification flow all preserved
"""

import json
import time
from datetime import datetime, timezone
from typing import Literal

from anthropic import Anthropic
from pydantic import BaseModel, Field

from rag.supabase_client import supabase
from rag.vector_store import search_similar_tickets

client = Anthropic()


# ─────────────────────────────────────────────
# Pydantic schema — mirrors the Zod schema in the professor's example.
# Claude is prompted to return JSON matching this shape; we validate
# with Pydantic instead of parsing raw strings.
# ─────────────────────────────────────────────

class IntakeClassification(BaseModel):
    intent: Literal["network", "password", "hardware", "software", "unknown"]
    priority: Literal["high", "medium", "low"]
    confidence: float = Field(ge=0.0, le=1.0)
    clarification_needed: bool
    clarification_question: str = Field(
        description="One specific question to ask the employee, or empty string."
    )
    summary: str = Field(description="One sentence plain-English description of the issue.")
    rag_match: bool
    rag_summary: str = Field(description="Brief description of matching past ticket, or empty string.")
    # Adopted from the professor's example — explains the classification decision
    reason: str = Field(description="Brief explanation of why this intent and priority were chosen.")


# ─────────────────────────────────────────────
# MCP-compatible tool definitions
# ─────────────────────────────────────────────

TOOLS = [
    {
        "name": "search_knowledge_base",
        "description": (
            "Search past resolved tickets and IT knowledge base articles "
            "using semantic similarity. Call this before classifying to check "
            "whether a similar issue has been resolved before."
        ),
        "input_schema": {
            "type": "object",
            "properties": {
                "query": {
                    "type": "string",
                    "description": "Plain-language description of the IT issue."
                },
                "top_k": {
                    "type": "integer",
                    "description": "Number of results to return.",
                    "default": 3
                }
            },
            "required": ["query"]
        }
    }
]

SYSTEM_PROMPT = f"""You are the Intake Agent of an autonomous IT support platform.

## Phase 1 — Knowledge Check (always do this first)
Call search_knowledge_base with the employee's issue to check for past resolutions.

## Phase 2 — Classification
After reviewing search results, return ONLY a raw JSON object matching this exact schema:

{json.dumps(IntakeClassification.model_json_schema(), indent=2)}

### Intent categories
- network   : Wi-Fi, VPN, connectivity, DNS, firewall
- password  : password reset, account unlock, MFA, SSO
- hardware  : laptop, monitor, peripheral, printer, physical device
- software  : application install/crash, OS, license, SaaS access
- unknown   : too vague or does not fit the above

### Priority
- high   : fully blocked, production issue, security incident
- medium : partially degraded, workaround exists
- low    : cosmetic, question, nice-to-have

### Rules
- If confidence < 0.7, set clarification_needed=true and write ONE clarification_question.
- The "reason" field must explain why you chose that intent and priority. This is used for debugging.
- Respond ONLY with raw JSON. No markdown. No explanation outside the JSON."""


# ─────────────────────────────────────────────
# RAG tool executor
# ─────────────────────────────────────────────

def _execute_tool(tool_name: str, tool_input: dict) -> str:
    if tool_name == "search_knowledge_base":
        results = search_similar_tickets(
            query=tool_input["query"],
            top_k=tool_input.get("top_k", 3)
        )
        if not results:
            return json.dumps({"results": [], "message": "No similar tickets found."})
        return json.dumps({"results": results})
    return json.dumps({"error": f"Unknown tool: {tool_name}"})


# ─────────────────────────────────────────────
# Keyword fallback — adopted from professor's example.
# Keeps the system alive if the LLM API fails entirely.
# ─────────────────────────────────────────────

def _keyword_fallback(user_input: str) -> IntakeClassification:
    print("[INTAKE AGENT] ⚠️  LLM failed — using keyword fallback.")
    lower = user_input.lower()

    if any(w in lower for w in ("wifi", "wi-fi", "vpn", "internet", "network", "connect")):
        intent, priority = "network", "high"
    elif any(w in lower for w in ("password", "reset", "locked", "unlock", "mfa", "sso")):
        intent, priority = "password", "medium"
    elif any(w in lower for w in ("laptop", "monitor", "keyboard", "mouse", "printer", "hardware")):
        intent, priority = "hardware", "medium"
    elif any(w in lower for w in ("app", "software", "install", "crash", "license", "access")):
        intent, priority = "software", "medium"
    else:
        intent, priority = "unknown", "low"

    return IntakeClassification(
        intent=intent,
        priority=priority,
        confidence=0.5,
        clarification_needed=(intent == "unknown"),
        clarification_question="Could you describe what's not working in more detail?" if intent == "unknown" else "",
        summary=f"Possible {intent} issue (classified by keyword fallback).",
        rag_match=False,
        rag_summary="",
        reason="LLM API unavailable — classified using keyword matching as fallback.",
    )


# ─────────────────────────────────────────────
# Agentic LLM loop with tool use + Pydantic validation
# ─────────────────────────────────────────────

def _call_llm_with_tools(user_input: str, conversation_history: list[dict]) -> tuple[IntakeClassification, bool]:
    """
    Run the classifier with tool use. Returns (IntakeClassification, rag_was_used).
    Falls back to keyword matching if the API fails.
    """
    messages = conversation_history + [{"role": "user", "content": user_input}]
    rag_used = False

    try:
        while True:
            response = client.messages.create(
                model="claude-sonnet-4-20250514",
                max_tokens=1024,
                system=SYSTEM_PROMPT,
                tools=TOOLS,
                messages=messages,
            )

            if response.stop_reason == "tool_use":
                rag_used = True
                tool_uses = [b for b in response.content if b.type == "tool_use"]
                tool_results = []

                for tool_use in tool_uses:
                    print(f"[INTAKE AGENT] Tool call: {tool_use.name} | {tool_use.input}")
                    result_content = _execute_tool(tool_use.name, tool_use.input)
                    tool_results.append({
                        "type": "tool_result",
                        "tool_use_id": tool_use.id,
                        "content": result_content,
                    })

                messages.append({"role": "assistant", "content": response.content})
                messages.append({"role": "user", "content": tool_results})
                continue

            # Parse and validate with Pydantic
            raw = next(b.text for b in response.content if hasattr(b, "text")).strip()
            if raw.startswith("```"):
                raw = raw.split("```")[1]
                if raw.startswith("json"):
                    raw = raw[4:]

            result = IntakeClassification.model_validate_json(raw)
            return result, rag_used

    except Exception as e:
        print(f"[INTAKE AGENT] LLM error: {e}")
        return _keyword_fallback(user_input), False


# ─────────────────────────────────────────────
# Main agent function
# ─────────────────────────────────────────────

def intake_agent(context: dict) -> dict:
    """
    Intake Agent — classifies an employee support request.

    Expects context keys:
        user_input            : str   — employee's latest Slack message
        employee_id           : str   — authenticated employee ID
        device_info           : str   — device/OS string (from MDM or profile)
        conversation_history  : list  — prior {"role", "content"} turns (default [])

    Returns a dict with:
        agent                 : "intake_agent"
        clarification_needed  : bool
        clarification_question: str
        conversation_history  : list  — updated history for next call
        intake                : dict  — classification payload for downstream agents
        ticket_id             : str | None
        metrics               : dict  — latency + RAG + confidence stats
        message               : str   — reply to send the employee via Slack
    """
    print("\n[INTAKE AGENT] Classifying request...")
    start_time = time.time()

    user_input = context.get("user_input", "")
    employee_id = context.get("employee_id", "unknown")
    device_info = context.get("device_info", "unknown")
    conversation_history = context.get("conversation_history", [])

    enriched_input = (
        f"Employee ID: {employee_id}\n"
        f"Device: {device_info}\n\n"
        f"Request: {user_input}"
    )

    result, rag_used = _call_llm_with_tools(enriched_input, conversation_history)
    latency_ms = round((time.time() - start_time) * 1000)

    metrics = {
        "agent": "intake_agent",
        "latency_ms": latency_ms,
        "rag_used": rag_used,
        "rag_match": result.rag_match,
        "confidence": result.confidence,
        "timestamp": datetime.now(timezone.utc).isoformat(),
    }

    print(
        f"[INTAKE AGENT] {latency_ms}ms | intent={result.intent} | "
        f"priority={result.priority} | confidence={result.confidence:.2f} | "
        f"rag_match={result.rag_match} | reason={result.reason}"
    )

    updated_history = conversation_history + [
        {"role": "user", "content": enriched_input},
        {"role": "assistant", "content": result.model_dump_json()},
    ]

    # ── Clarification needed — hold ticket creation ──
    if result.clarification_needed:
        print(f"[INTAKE AGENT] Asking: {result.clarification_question}")
        return {
            "agent": "intake_agent",
            "clarification_needed": True,
            "clarification_question": result.clarification_question,
            "conversation_history": updated_history,
            "intake": {
                "user_input": user_input,
                "employee_id": employee_id,
                "device_info": device_info,
                "intent": result.intent,
                "priority": result.priority,
                "confidence": result.confidence,
                "summary": result.summary,
                "rag_match": result.rag_match,
                "rag_summary": result.rag_summary,
                "reason": result.reason,
            },
            "ticket_id": None,
            "metrics": metrics,
            "message": result.clarification_question,
        }

    # ── Confident — write full audit record to Supabase ──
    now = datetime.now(timezone.utc).isoformat()

    ticket_response = supabase.table("tickets").insert({
        "user_issue": user_input,
        "employee_id": employee_id,
        "device_info": device_info,
        "intent": result.intent,
        "priority": result.priority,
        "summary": result.summary,
        "status": "open",
        "confidence": result.confidence,
        "rag_used": rag_used,
        "rag_match": result.rag_match,
        "rag_summary": result.rag_summary,
        "reason": result.reason,
        "created_at": now,
        "agent_version": "intake_agent_v3",
        "latency_ms": latency_ms,
    }).execute()

    ticket = ticket_response.data[0] if ticket_response.data else {}
    ticket_id = ticket.get("ticket_id", ticket.get("id", "UNKNOWN"))

    supabase.table("agent_metrics").insert({
        **metrics,
        "ticket_id": ticket_id,
        "intent": result.intent,
        "priority": result.priority,
    }).execute()

    return {
        "agent": "intake_agent",
        "clarification_needed": False,
        "clarification_question": "",
        "conversation_history": updated_history,
        "intake": {
            "user_input": user_input,
            "employee_id": employee_id,
            "device_info": device_info,
            "intent": result.intent,
            "priority": result.priority,
            "confidence": result.confidence,
            "summary": result.summary,
            "rag_match": result.rag_match,
            "rag_summary": result.rag_summary,
            "reason": result.reason,
        },
        "ticket_id": ticket_id,
        "metrics": metrics,
        "message": (
            f"Got it — I've logged your request (Ticket #{ticket_id}).\n\n"
            f"**Issue**: {result.summary}\n"
            f"**Priority**: {result.priority.capitalize()}\n"
            + (f"**Similar past issue found**: {result.rag_summary}\n" if result.rag_match else "")
            + f"\nI'll start working on a fix now."
        ),
    }
