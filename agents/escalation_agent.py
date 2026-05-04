from rag.supabase_client import supabase

def escalation_agent(context):
    print("\n[ESCALATION AGENT] Checking escalation rules...")

    confidence = context.get("primary_result", {}).get("confidence", context.get("confidence", 0))
    priority = context.get("intake", {}).get("priority", context.get("priority", "low"))
    intent = context.get("intake", {}).get("intent", context.get("intent", "unknown"))
    user_issue = context.get("intake", {}).get("user_input", context.get("user_input", ""))

    should_escalate = (
        confidence < 0.7
        or priority == "high"
        or intent == "unknown"
    )

    if should_escalate:
        response = supabase.table("tickets").insert({
            "user_issue": user_issue,
            "intent": intent,
            "priority": priority,
            "status": "escalated"
        }).execute()

        ticket = response.data[0] if response.data else {}
        ticket_id = ticket.get("ticket_id", ticket.get("id", "UNKNOWN"))

        return {
            "agent": "escalation_agent",
            "escalated": True,
            "ticket_id": ticket_id,
            "priority": priority,
            "reason": "Escalated because confidence is low, priority is high, or issue type is unknown.",
            "message": (
                f"Your issue has been escalated to IT support.\n\n"
                f"Ticket ID: {ticket_id}\n"
                f"Priority: {priority}\n\n"
                f"A support specialist should review this request soon."
            )
        }

    return {
        "agent": "escalation_agent",
        "escalated": False,
        "ticket_id": None,
        "priority": priority,
        "reason": "No escalation needed because confidence is acceptable and priority is not high.",
        "message": "This issue can be handled automatically using the knowledge base response."
    }