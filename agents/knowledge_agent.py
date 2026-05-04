from rag.rag_pipeline import run_rag

def knowledge_agent(intake_result):
    print("\n[KNOWLEDGE AGENT] Running RAG search...")

    user_question = intake_result["user_input"]
    rag_result = run_rag(user_question)

    return {
        "agent": "knowledge_agent",
        "answer": rag_result["answer"],
        "confidence": rag_result["confidence"],
        "sources": rag_result["sources"]
    }