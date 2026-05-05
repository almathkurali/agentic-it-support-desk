from rag.retriever import retrieve_relevant_chunks

def search_similar_tickets(query: str, top_k: int = 3):
    try:
        results = retrieve_relevant_chunks(query, match_count=top_k)
        return results if results else []
    except Exception as e:
        print(f"[VECTOR STORE] Search failed: {e}")
        return []
