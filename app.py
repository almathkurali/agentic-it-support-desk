from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional
import os

from agents.orchestrator import orchestrator

app = FastAPI(title="IT Support Desk API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://agentic-it-support-desk.vercel.app",
        "http://localhost:5173",
        "http://localhost:3000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class TicketRequest(BaseModel):
    issue: str


class LogResultRequest(BaseModel):
    user_issue:      str
    intent:          str
    priority:        str
    status:          str
    ticket_id:       Optional[str] = None
    resolved:        bool = False
    workflow_action: Optional[str] = None


@app.get("/health")
def health():
    return {"status": "ok", "version": "schema-v2", "cors": "explicit-origins"}


@app.post("/api/ticket")
def submit_ticket(request: TicketRequest):
    if not request.issue.strip():
        raise HTTPException(status_code=400, detail="Issue description is required")
    result = orchestrator(request.issue)
    return result


@app.post("/api/log-result")
def log_result(request: LogResultRequest):
    """
    Called by the frontend after the agent pipeline completes.
    - If ticket_id is set: upsert by ticket_id (escalation_agent only updates, never inserts,
      so the row may not exist yet — upsert creates it if missing, updates if present).
    - If no ticket_id: INSERT a new record (simulation / fallback mode).
    """
    try:
        from rag.supabase_client import supabase

        if request.ticket_id:
            # Try UPDATE first (ticket created by intake_agent or escalation_agent).
            # Only touch the fields that finalize a ticket — avoids re-writing
            # classification data and prevents spurious updated_at changes.
            response = supabase.table("tickets").update({
                "status":          request.status,
                "resolved":        request.resolved,
                "workflow_action": request.workflow_action,
            }).eq("ticket_id", request.ticket_id).execute()

            if not response.data:
                # Ticket wasn't created by the agent pipeline (e.g. orchestrator stub),
                # so INSERT the full record now.
                supabase.table("tickets").insert({
                    "ticket_id":       request.ticket_id,
                    "user_issue":      request.user_issue,
                    "intent":          request.intent,
                    "priority":        request.priority,
                    "status":          request.status,
                    "resolved":        request.resolved,
                    "workflow_action": request.workflow_action,
                }).execute()
        else:
            supabase.table("tickets").insert({
                "user_issue": request.user_issue,
                "intent":     request.intent,
                "priority":   request.priority,
                "status":     request.status,
                "resolved":   request.resolved,
            }).execute()

    except Exception as err:
        print(f"[log-result] Supabase error: {err}")

    return {"ok": True}


if __name__ == "__main__":
    import uvicorn
    port = int(os.environ.get("PORT", 8000))
    uvicorn.run(app, host="0.0.0.0", port=port)
