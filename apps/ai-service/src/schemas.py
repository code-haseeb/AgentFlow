from typing import List, Dict, Any, Optional
from pydantic import BaseModel, Field

class TriageOutput(BaseModel):
    category: str = Field(description="Detected inquiry category, e.g. billing, technical, refund, policy")
    priority: str = Field(description="Priority: low, medium, high, critical")
    requires_human: bool = Field(description="Whether a human must review/approve this request")
    reason: str = Field(description="Rationale for priority and escalation determination")
    confidence: float = Field(ge=0.0, le=1.0, description="Confidence score between 0 and 1")

class ResearchOutput(BaseModel):
    verified_facts: List[str] = Field(default_factory=list, description="Validated ground truths from internal data")
    relevant_policies: List[str] = Field(default_factory=list, description="Applicable SLAs or business policies")
    account_context: Dict[str, Any] = Field(default_factory=dict, description="Retrieved customer account context")
    evidence_sources: List[str] = Field(default_factory=list, description="Cited data sources")

class ResponseOutput(BaseModel):
    subject: str = Field(description="Subject line for the communication draft")
    draft_reply: str = Field(description="Structured professional response text")
    tone: str = Field(description="Tone style, e.g., empathetic-professional, concise")
    recommended_action: str = Field(description="Action to take, e.g., issue_credit, send_documentation, escalate")
    risk_level: str = Field(description="Risk classification: LOW, MEDIUM, HIGH")
    requires_approval: bool = Field(description="Whether explicit human approval is needed prior to sending")

class PipelineStepResult(BaseModel):
    step_index: int
    step_name: str
    agent_name: str
    status: str  # COMPLETED, FAILED, WAITING_FOR_APPROVAL
    output: Dict[str, Any]
    duration_ms: int

class ExecutePipelineRequest(BaseModel):
    run_id: str
    workflow_id: str
    organization_id: str
    inquiry_text: str
    customer_email: Optional[str] = "customer@domain.com"
    metadata: Optional[Dict[str, Any]] = None

class ExecutePipelineResponse(BaseModel):
    run_id: str
    status: str
    steps: List[PipelineStepResult]
    final_output: Dict[str, Any]
    requires_approval: bool
    risk_level: str
    tokens_used: int
    total_duration_ms: int
