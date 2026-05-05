from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import os

from agents.orchestrator import orchestrator

app = FastAPI(title="IT Support Desk API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class TicketRequest(BaseModel):
    issue: str

@app.get("/health")
def health():
    return {"status": "ok"}

@app.post("/api/ticket")
def submit_ticket(request: TicketRequest):
    if not request.issue.strip():
        raise HTTPException(status_code=400, detail="Issue description is required")
    result = orchestrator(request.issue)
    return result

if __name__ == "__main__":
    import uvicorn
    port = int(os.environ.get("PORT", 8000))
    uvicorn.run(app, host="0.0.0.0", port=port)
