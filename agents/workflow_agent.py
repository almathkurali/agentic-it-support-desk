from datetime import datetime

def workflow_agent(context):
    print("\n[WORKFLOW AGENT] Creating mock ticket...")

    ticket_id = f"TICKET-{datetime.now().strftime('%Y%m%d%H%M%S')}"

    return {
        "agent": "workflow_agent",
        "ticket_id": ticket_id,
        "intent": context["intent"],
        "priority": context["priority"],
        "status": "created",
        "note": "PLACEHOLDER WORKFLOW: This will later write tickets to Supabase."
    }