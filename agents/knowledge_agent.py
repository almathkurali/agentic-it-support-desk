from rag.supabase_client import supabase

def knowledge_agent(intake_result):
    print("\n[KNOWLEDGE AGENT] Searching knowledge base...")

    intent = intake_result["intent"]

    if intent == "vpn_issue":
        source = "vpn_guide"
    elif intent == "wifi_issue":
        source = "wifi_guide"
    else:
        source = None

    query = supabase.table("knowledge_chunks").select("content")

    if source:
        query = query.eq("source", source)

    response = query.limit(1).execute()

    print("DEBUG:", response.data)

    if response.data:
        return response.data[0]["content"]

    return "No solution found in the knowledge base."