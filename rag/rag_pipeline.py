from rag.retriever import retrieve_relevant_chunks

def run_rag(user_question):
    chunks = retrieve_relevant_chunks(user_question)

    if not chunks:
        return {
            "answer": "No relevant solution found in the knowledge base.",
            "confidence": 0,
            "sources": []
        }

    best_chunk = chunks[0]

    return {
        "answer": best_chunk["content"],
        "confidence": best_chunk.get("similarity", 0),
        "sources": [chunk.get("source") for chunk in chunks]
    }