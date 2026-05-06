from rag.rag_pipeline import run_rag


def knowledge_agent(context):
    print("\n[KNOWLEDGE AGENT] Running RAG search...")

    intake = context.get("intake", context)

    user_question = (
        intake.get("user_input")
        or context.get("user_input")
        or context.get("ticket_text")
        or ""
    )

    intent = intake.get("intent", context.get("intent", "unknown"))
    priority = intake.get("priority", context.get("priority", "low"))

    if not user_question:
        return {
            "agent": "knowledge_agent",
            "resolved": False,
            "confidence": 0.0,
            "answer": "",
            "sources": [],
            "message": "No user question was provided for the knowledge search.",
        }

    try:
        rag_result = run_rag(user_question)

        answer = rag_result.get("answer", "")
        confidence = rag_result.get("confidence", 0.0)
        sources = rag_result.get("sources", [])

        resolved = bool(answer) and answer != "No relevant solution found in the knowledge base."

        if resolved:
            message = answer
        else:
            message = (
                "I found some related information, but confidence was too low "
                "to fully resolve the issue. This may need workflow action or escalation."
            )

        return {
            "agent": "knowledge_agent",
            "resolved": resolved,
            "intent": intent,
            "priority": priority,
            "confidence": confidence,
            "answer": answer,
            "sources": sources,
            "message": message,
            "rag_used": True,
        }

    except Exception as e:
        print(f"[KNOWLEDGE AGENT] Error: {e}")

        return {
            "agent": "knowledge_agent",
            "resolved": False,
            "intent": intent,
            "priority": priority,
            "confidence": 0.0,
            "answer": "",
            "sources": [],
            "message": (
                "The knowledge agent could not search the knowledge base. "
                "This issue may need workflow action or escalation."
            ),
            "rag_used": False,
            "error": str(e),
        }