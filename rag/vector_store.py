from rag.retriever import retrieve_similar

def search_similar_tickets(query: str, top_k: int = 3):
    try:
        results = retrieve_similar(query, top_k=top_k)
        return results
    except Exception as e:
        print(f"[VECTOR STORE] Search failed: {e}")
        return []
