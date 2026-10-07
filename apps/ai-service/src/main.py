import time
import uuid
from typing import Dict, Any, Optional, List
from pydantic import BaseModel
from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from .config import settings
from .schemas import ExecutePipelineRequest, ExecutePipelineResponse
from .orchestrator.pipeline import WorkflowOrchestrator
from .tools.registry import tool_registry

app = FastAPI(
    title="AgentFlow AI Service",
    description="Multi-agent business automation service running Triage, Research, and Response agents with controlled tool permissions",
    version="0.1.0",
)

@app.middleware("http")
async def add_trace_and_timing(request: Request, call_next):
    request_id = request.headers.get("x-request-id", str(uuid.uuid4()))
    start_time = time.time()
    response = await call_next(request)
    duration_ms = round((time.time() - start_time) * 1000, 2)
    response.headers["x-request-id"] = request_id
    response.headers["x-response-time-ms"] = str(duration_ms)
    return response

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["x-request-id", "x-response-time-ms"],
)

orchestrator = WorkflowOrchestrator()

class ExecuteToolRequest(BaseModel):
    tool_name: str
    parameters: Dict[str, Any]
    user_role: Optional[str] = "VIEWER"
    allowed_tools: Optional[List[str]] = None

@app.get("/")
def get_root():
    return {
        "status": "healthy",
        "service": "AgentFlow AI Orchestration Service",
        "version": "0.1.0",
        "provider": settings.AI_PROVIDER,
    }

@app.get("/health")
def get_health():
    return {"status": "ok", "provider": settings.AI_PROVIDER}

@app.get("/tools")
def list_tools():
    return tool_registry.list_tools()

@app.post("/tools/execute")
async def execute_tool(request: ExecuteToolRequest):
    result = await tool_registry.execute_tool(
        tool_name=request.tool_name,
        parameters=request.parameters,
        user_role=request.user_role or "VIEWER",
        allowed_tools=request.allowed_tools,
    )
    return result

@app.post("/execute-pipeline", response_model=ExecutePipelineResponse)
async def execute_pipeline(request: ExecutePipelineRequest):
    try:
        return await orchestrator.run(request)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("apps.ai-service.src.main:app", host=settings.HOST, port=settings.PORT, reload=True)
