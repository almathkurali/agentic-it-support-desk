from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import os

from agents.orchestrator import orchestrator
from rag.supabase_client import supabase

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
    user_issue: str
    intent: str
    priority: str
    status: str

@app.get("/health")
def health():
    return {"status": "ok"}

@app.post("/api/ticket")
def submit_ticket(request: TicketRequest):
    if not request.issue.strip():
        raise HTTPException(status_code=400, detail="Issue description is required")
    result = orchestrator(request.issue)
    return result

@app.post("/api/log-result")
def log_result(request: LogResultRequest):
    try:
        supabase.table("tickets").insert({
            "user_issue": request.user_issue,
            "intent":     request.intent,
            "priority":   request.priority,
            "status":     request.status,
        }).execute()
    except Exception as err:
        print(f"[log-result] Supabase insert failed: {err}")
    return {"ok": True}

if __name__ == "__main__":
    import uvicorn
    port = int(os.environ.get("PORT", 8000))
    uvicorn.run(app, host="0.0.0.0", port=port)
