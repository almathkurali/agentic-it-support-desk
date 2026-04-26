from agents.intake_agent import intake_agent
from agents.knowledge_agent import knowledge_agent
from agents.workflow_agent import workflow_agent
from agents.escalation_agent import escalation_agent

def orchestrator(user_input):
    print("\n[ORCHESTRATOR] Routing request...")

    intake_result = intake_agent(user_input)

    if intake_result["intent"] in ["wifi_issue", "vpn_issue"]:
        primary_result = knowledge_agent(intake_result)
    else:
        primary_result = workflow_agent(intake_result)

    escalation_result = escalation_agent(intake_result)

    return {
        "intake": intake_result,
        "primary_result": primary_result,
        "escalation": escalation_result
    }