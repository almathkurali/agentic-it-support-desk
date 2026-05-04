from rag.supabase_client import supabase
from rag.embedding_client import create_embedding

def retrieve_relevant_chunks(user_question, match_count=3):
    query_embedding = create_embedding(user_question)

    response = supabase.rpc(
        "match_knowledge_chunks",
        {
            "query_embedding": query_embedding,
            "match_count": match_count
        }
    ).execute()

    return response.data