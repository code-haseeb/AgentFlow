import time
from typing import List
from ..schemas import (
    ExecutePipelineRequest,
    ExecutePipelineResponse,
    PipelineStepResult,
)
from ..providers.llm_factory import get_llm_provider
from ..agents.triage_agent import TriageAgent
from ..agents.research_agent import ResearchAgent
from ..agents.response_agent import ResponseAgent

class WorkflowOrchestrator:
    def __init__(self):
        self.provider = get_llm_provider()
        self.triage_agent = TriageAgent(self.provider)
        self.research_agent = ResearchAgent(self.provider)
        self.response_agent = ResponseAgent(self.provider)

    async def run(self, request: ExecutePipelineRequest) -> ExecutePipelineResponse:
        steps: List[PipelineStepResult] = []
        overall_start = time.time()

        # Step 1: Triage Agent
        t0 = time.time()
        triage_res = await self.triage_agent.execute(request.inquiry_text)
        d0 = int((time.time() - t0) * 1000)
        steps.append(
            PipelineStepResult(
                step_index=1,
                step_name="Inquiry Triage & Classification",
                agent_name="TriageAgent",
                status="COMPLETED",
                output=triage_res.model_dump(),
                duration_ms=d0,
            )
        )

        # Step 2: Research Agent
        t1 = time.time()
        research_res = await self.research_agent.execute(request.inquiry_text, triage_res)
        d1 = int((time.time() - t1) * 1000)
        steps.append(
            PipelineStepResult(
                step_index=2,
                step_name="Grounding & Policy Retrieval",
                agent_name="ResearchAgent",
                status="COMPLETED",
                output=research_res.model_dump(),
                duration_ms=d1,
            )
        )

        # Step 3: Response Agent
        t2 = time.time()
        response_res = await self.response_agent.execute(
            request.inquiry_text,
            triage_res,
            research_res,
        )
        d2 = int((time.time() - t2) * 1000)
        steps.append(
            PipelineStepResult(
                step_index=3,
                step_name="Response Generation & Risk Gate",
                agent_name="ResponseAgent",
                status="COMPLETED",
                output=response_res.model_dump(),
                duration_ms=d2,
            )
        )

        # Determine overall workflow execution status
        # If requires_approval is True, the run halts in WAITING_FOR_APPROVAL status
        is_approval_needed = response_res.requires_approval or triage_res.requires_human
        overall_status = "WAITING_FOR_APPROVAL" if is_approval_needed else "COMPLETED"

        total_duration = int((time.time() - overall_start) * 1000)

        final_output = {
            "triage": triage_res.model_dump(),
            "research": research_res.model_dump(),
            "response": response_res.model_dump(),
        }

        return ExecutePipelineResponse(
            run_id=request.run_id,
            status=overall_status,
            steps=steps,
            final_output=final_output,
            requires_approval=is_approval_needed,
            risk_level=response_res.risk_level,
            tokens_used=1240,
            total_duration_ms=total_duration,
        )
