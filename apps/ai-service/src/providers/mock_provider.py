import re
from typing import Type, TypeVar
from pydantic import BaseModel
from .base import BaseLLMProvider
from ..schemas import TriageOutput, ResearchOutput, ResponseOutput

T = TypeVar("T", bound=BaseModel)

class MockLLMProvider(BaseLLMProvider):
    """
    Deterministic provider for automated testing and offline development.
    Simulates high-quality LLM structured JSON output based on input semantics.
    """
    async def generate_structured(
        self,
        prompt: str,
        system_instruction: str,
        response_model: Type[T],
    ) -> T:
        prompt_lower = prompt.lower()

        if response_model == TriageOutput:
            is_refund = any(w in prompt_lower for w in ["refund", "money", "charged", "billing", "invoice"])
            is_urgent = any(w in prompt_lower for w in ["urgent", "immediately", "broken", "down", "outage"])

            category = "refund_request" if is_refund else ("system_outage" if is_urgent else "general_inquiry")
            priority = "critical" if is_urgent else ("high" if is_refund else "medium")
            requires_human = is_refund or is_urgent

            return TriageOutput(
                category=category,
                priority=priority,
                requires_human=requires_human,
                reason="Financial transaction requested" if is_refund else "Standard tier request requiring validation",
                confidence=0.96,
            )

        elif response_model == ResearchOutput:
            is_refund = any(w in prompt_lower for w in ["refund", "billing", "invoice"])

            if is_refund:
                return ResearchOutput(
                    verified_facts=[
                        "Customer account active since June 2024 (Tier: Business Plan).",
                        "Latest invoice #INV-9281 dated 3 days ago for $299.00.",
                        "No prior refund requests recorded in the last 12 months.",
                    ],
                    relevant_policies=[
                        "30-day money-back guarantee policy applies to current billing cycle.",
                        "Refunds above $100 require explicit Manager/Human Approval Gate.",
                    ],
                    account_context={"plan": "Business", "account_status": "in_good_standing", "mrr": 299},
                    evidence_sources=["BillingDB::invoices", "KnowledgeBase::refund_policy_v2"],
                )
            else:
                return ResearchOutput(
                    verified_facts=[
                        "Service cluster operational: 99.98% uptime in last 30 days.",
                        "API rate limit: 1,000 requests/minute for current organization tier.",
                    ],
                    relevant_policies=[
                        "Standard support SLA response window: 4 hours.",
                    ],
                    account_context={"plan": "Pro", "account_status": "active"},
                    evidence_sources=["Docs::api_specification", "StatusPage::metrics"],
                )

        elif response_model == ResponseOutput:
            is_refund = any(w in prompt_lower for w in ["refund", "billing", "invoice"])

            if is_refund:
                return ResponseOutput(
                    subject="Update regarding your recent AgentFlow billing inquiry (#INV-9281)",
                    draft_reply=(
                        "Hello,\n\n"
                        "Thank you for reaching out. We have reviewed your recent billing inquiry for invoice #INV-9281 ($299.00). "
                        "Because your account is in good standing under our 30-day guarantee policy, we have staged a full refund for your account. "
                        "An account manager has been assigned to execute the transaction immediately.\n\n"
                        "Best regards,\nAgentFlow Customer Operations Team"
                    ),
                    tone="empathetic-professional",
                    recommended_action="issue_credit_refund",
                    risk_level="HIGH",
                    requires_approval=True,
                )
            else:
                return ResponseOutput(
                    subject="Response to your AgentFlow inquiry",
                    draft_reply=(
                        "Hello,\n\n"
                        "Thank you for contacting AgentFlow. We have analyzed your request against our current system documentation "
                        "and verified your configuration. All services are operating normally.\n\n"
                        "Please let us know if you need further assistance.\n\n"
                        "Best regards,\nAgentFlow Support"
                    ),
                    tone="clear-professional",
                    recommended_action="send_informational_response",
                    risk_level="LOW",
                    requires_approval=False,
                )

        # Fallback empty instance
        return response_model()
