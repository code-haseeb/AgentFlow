import pytest
from src.providers.mock_provider import MockLLMProvider
from src.agents.triage_agent import TriageAgent
from src.agents.research_agent import ResearchAgent
from src.agents.response_agent import ResponseAgent
from src.schemas import TriageOutput, ResearchOutput, ResponseOutput

@pytest.mark.asyncio
async def test_triage_agent_refund():
    provider = MockLLMProvider()
    agent = TriageAgent(provider)
    result = await agent.execute("I need a refund for invoice #INV-9281 charged to my card.")

    assert isinstance(result, TriageOutput)
    assert result.category == "refund_request"
    assert result.priority in ["high", "critical"]
    assert result.requires_human is True
    assert result.confidence > 0.9

@pytest.mark.asyncio
async def test_research_agent_grounding():
    provider = MockLLMProvider()
    agent = ResearchAgent(provider)
    triage = TriageOutput(
        category="refund_request",
        priority="high",
        requires_human=True,
        reason="Refund check",
        confidence=0.95,
    )
    result = await agent.execute("Refund request for #INV-9281", triage)

    assert isinstance(result, ResearchOutput)
    assert len(result.verified_facts) > 0
    assert len(result.relevant_policies) > 0
    assert len(result.evidence_sources) > 0

@pytest.mark.asyncio
async def test_response_agent_risk_gate():
    provider = MockLLMProvider()
    agent = ResponseAgent(provider)
    triage = TriageOutput(
        category="refund_request",
        priority="high",
        requires_human=True,
        reason="Refund check",
        confidence=0.95,
    )
    research = ResearchOutput(
        verified_facts=["Customer is in good standing"],
        relevant_policies=["30-day money back guarantee"],
        evidence_sources=["BillingDB"],
    )
    result = await agent.execute("Refund request", triage, research)

    assert isinstance(result, ResponseOutput)
    assert result.risk_level == "HIGH"
    assert result.requires_approval is True
    assert len(result.draft_reply) > 20
