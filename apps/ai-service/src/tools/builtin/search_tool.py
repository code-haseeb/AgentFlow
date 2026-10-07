from typing import Dict, Any, List
from pydantic import BaseModel, Field
from ..base import BaseTool

class SearchInput(BaseModel):
    query: str = Field(description="Search terms or question for knowledge retrieval")
    max_results: int = Field(default=3, ge=1, le=10, description="Maximum results to return")

class SearchOutput(BaseModel):
    query: str
    total_found: int
    snippets: List[Dict[str, str]]

class SearchTool(BaseTool):
    name = "search_knowledge"
    description = "Searches internal documentation, SLA rules, and verified FAQs."
    risk_level = "LOW"
    approval_required = False
    input_schema = SearchInput
    output_schema = SearchOutput

    async def run(self, validated_input: SearchInput) -> Dict[str, Any]:
        q = validated_input.query.lower()
        snippets = []

        if "refund" in q or "invoice" in q:
            snippets.append({
                "title": "Refund Policy & Guarantees (v2.4)",
                "content": "Customers are eligible for a 100% refund within 30 days of initial purchase. Refunds above $100 require Manager sign-off.",
                "source": "knowledge_base/finance/refunds.md",
            })
        if "rate limit" in q or "api" in q:
            snippets.append({
                "title": "API Rate Limits & Quotas",
                "content": "Business plans allow up to 1,000 requests per minute with webhook retry exponential backoff.",
                "source": "docs/api/limits.md",
            })

        if not snippets:
            snippets.append({
                "title": "General System Overview",
                "content": "AgentFlow enterprise automation platform with multi-tenant isolation and policy boundaries.",
                "source": "docs/general.md",
            })

        return {
            "query": validated_input.query,
            "total_found": len(snippets),
            "snippets": snippets[: validated_input.max_results],
        }
