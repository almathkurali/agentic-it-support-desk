def escalation_agent(context):
    print("\n[ESCALATION AGENT] Checking escalation rules...")

    should_escalate = (
        context["confidence"] < 0.6
        or context["priority"] == "high"
        or context["intent"] == "unknown"
    )

    return {
        "agent": "escalation_agent",
        "escalated": should_escalate,
        "reason": "Escalated because confidence is low, priority is high, or issue is unknown."
        if should_escalate else
        "No escalation needed."
    }