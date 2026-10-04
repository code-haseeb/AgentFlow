from ..schemas import TriageOutput
from ..providers.base import BaseLLMProvider

SYSTEM_INSTRUCTION = """
You are the AgentFlow Triage Agent.
Your role is to classify incoming customer requests, assess urgency and risk, and determine if human escalation is required.
You must always output strict structured data. Never hallucinate unsupported categories.
"""

class TriageAgent:
    def __init__(self, provider: BaseLLMProvider):
        self.provider = provider

    async def execute(self, inquiry_text: str) -> TriageOutput:
        prompt = f"Analyze the following incoming customer inquiry and classify it:\n\n{inquiry_text}"
        return await self.provider.generate_structured(
            prompt=prompt,
            system_instruction=SYSTEM_INSTRUCTION,
            response_model=TriageOutput,
        )
