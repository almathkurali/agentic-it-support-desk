from rag.retriever import retrieve_relevant_chunks


def run_rag(user_question):
    chunks = retrieve_relevant_chunks(user_question)

    if not chunks:
        return {
            "answer": "No relevant solution found in the knowledge base.",
            "confidence": 0.0,
            "sources": []
        }

    best_chunk = chunks[0]

    answer = best_chunk.get("content", "No answer content found.")
    confidence = float(best_chunk.get("similarity") or 0.0)

    sources = [
        chunk.get("source", "unknown")
        for chunk in chunks
    ]

    return {
        "answer": answer,
        "confidence": confidence,
        "sources": sources
    }