from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from .config import settings
from .schemas import ExecutePipelineRequest, ExecutePipelineResponse
from .orchestrator.pipeline import WorkflowOrchestrator

app = FastAPI(
    title="AgentFlow AI Service",
    description="Multi-agent business automation service running Triage, Research, and Response agents",
    version="0.1.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

orchestrator = WorkflowOrchestrator()

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

@app.post("/execute-pipeline", response_model=ExecutePipelineResponse)
async def execute_pipeline(request: ExecutePipelineRequest):
    try:
        return await orchestrator.run(request)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("apps.ai-service.src.main:app", host=settings.HOST, port=settings.PORT, reload=True)
