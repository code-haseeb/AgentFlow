from ..schemas import TriageOutput, ResearchOutput
from ..providers.base import BaseLLMProvider

SYSTEM_INSTRUCTION = """
You are the AgentFlow Research Agent.
Your responsibility is to retrieve validated internal facts, check account policies, and ground your response in verified evidence.
Never invent policies or cite unverified facts.
"""

class ResearchAgent:
    def __init__(self, provider: BaseLLMProvider):
        self.provider = provider

    async def execute(self, inquiry_text: str, triage: TriageOutput) -> ResearchOutput:
        prompt = (
            f"Customer Inquiry: {inquiry_text}\n"
            f"Triage Category: {triage.category} (Priority: {triage.priority})\n\n"
            "Retrieve verified account facts and applicable policies for this inquiry."
        )
        return await self.provider.generate_structured(
            prompt=prompt,
            system_instruction=SYSTEM_INSTRUCTION,
            response_model=ResearchOutput,
        )
