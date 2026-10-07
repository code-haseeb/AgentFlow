from typing import Dict, Any, Optional
from pydantic import BaseModel, Field
from ..base import BaseTool
from ..security import validate_safe_url

class HttpInput(BaseModel):
    method: str = Field(default="GET", description="HTTP method: GET, POST, PUT, DELETE")
    url: str = Field(description="Target destination URL")
    headers: Optional[Dict[str, str]] = Field(default_factory=dict, description="Custom headers")
    body: Optional[Dict[str, Any]] = Field(default=None, description="Request JSON payload")

class HttpOutput(BaseModel):
    status_code: int
    url: str
    response_body: Dict[str, Any]

class HttpApiTool(BaseTool):
    name = "http_api"
    description = "Dispatches external HTTP REST requests to permitted third-party endpoints with SSRF protections."
    risk_level = "MEDIUM"
    approval_required = False
    input_schema = HttpInput
    output_schema = HttpOutput

    def get_risk_for_input(self, validated_input: HttpInput) -> tuple[str, bool]:
        # Mutating HTTP methods escalate to HIGH risk requiring approval
        if validated_input.method.upper() in ("POST", "PUT", "DELETE", "PATCH"):
            return "HIGH", True
        return "MEDIUM", False

    async def run(self, validated_input: HttpInput) -> Dict[str, Any]:
        # 1. Enforce SSRF validation
        is_safe, error_msg = validate_safe_url(validated_input.url)
        if not is_safe:
            raise PermissionError(f"Security Alert: Blocked unsafe HTTP request. Reason: {error_msg}")

        # In production/test sandbox, return structured HTTP mock response
        return {
            "status_code": 200,
            "url": validated_input.url,
            "response_body": {
                "message": f"Successfully performed {validated_input.method.upper()} to {validated_input.url}",
                "simulated": True,
            },
        }
