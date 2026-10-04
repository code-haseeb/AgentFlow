from ..schemas import TriageOutput, ResearchOutput, ResponseOutput
from ..providers.base import BaseLLMProvider

SYSTEM_INSTRUCTION = """
You are the AgentFlow Response Agent.
You generate clear, empathetic, and professional communication drafts.
You must ground your response strictly in the provided Research facts and adhere to company policy.
Assign an accurate risk level:
- LOW: Informational answers, standard docs
- MEDIUM: Account preference updates
- HIGH: Financial refunds, data deletion, sensitive policy overrides
Flag requires_approval=True for any action with risk HIGH.
"""

class ResponseAgent:
    def __init__(self, provider: BaseLLMProvider):
        self.provider = provider

    async def execute(
        self,
        inquiry_text: str,
        triage: TriageOutput,
        research: ResearchOutput,
    ) -> ResponseOutput:
        prompt = (
            f"Customer Inquiry:\n{inquiry_text}\n\n"
            f"Triage Assessment:\nCategory: {triage.category} | Priority: {triage.priority}\n\n"
            f"Research Evidence:\n"
            f"Verified Facts: {', '.join(research.verified_facts)}\n"
            f"Policies: {', '.join(research.relevant_policies)}\n\n"
            "Generate the resolution draft, assign risk level, and determine if human approval is required."
        )

        return await self.provider.generate_structured(
            prompt=prompt,
            system_instruction=SYSTEM_INSTRUCTION,
            response_model=ResponseOutput,
        )
