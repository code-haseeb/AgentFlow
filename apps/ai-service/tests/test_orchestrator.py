import pytest
from src.orchestrator.pipeline import WorkflowOrchestrator
from src.schemas import ExecutePipelineRequest

@pytest.mark.asyncio
async def test_full_pipeline_execution():
    orchestrator = WorkflowOrchestrator()
    req = ExecutePipelineRequest(
        run_id="run-test-123",
        workflow_id="wf-test-456",
        organization_id="org-test-789",
        inquiry_text="Can you please issue a refund of $299 for invoice INV-9281?",
        customer_email="customer@example.com",
    )

    response = await orchestrator.run(req)

    assert response.run_id == "run-test-123"
    assert len(response.steps) == 3
    assert response.steps[0].agent_name == "TriageAgent"
    assert response.steps[1].agent_name == "ResearchAgent"
    assert response.steps[2].agent_name == "ResponseAgent"
    assert response.requires_approval is True
    assert response.status == "WAITING_FOR_APPROVAL"
    assert response.risk_level == "HIGH"
