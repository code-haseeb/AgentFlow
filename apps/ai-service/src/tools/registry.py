import time
from typing import Dict, Any, Optional
from .base import BaseTool, ToolExecutionResult
from .builtin.email_tool import EmailTool
from .builtin.database_tool import DatabaseTool
from .builtin.search_tool import SearchTool
from .builtin.http_tool import HttpApiTool
from .security import detect_prompt_injection

class ToolRegistry:
    def __init__(self):
        self.tools: Dict[str, BaseTool] = {}
        # Register standard tools
        self.register(EmailTool())
        self.register(DatabaseTool())
        self.register(SearchTool())
        self.register(HttpApiTool())

    def register(self, tool: BaseTool):
        self.tools[tool.name] = tool

    def get(self, tool_name: str) -> Optional[BaseTool]:
        return self.tools.get(tool_name)

    def list_tools(self) -> Dict[str, Dict[str, Any]]:
        return {
            name: {
                "name": t.name,
                "description": t.description,
                "risk_level": t.risk_level,
                "approval_required": t.approval_required,
                "timeout": t.timeout,
            }
            for name, t in self.tools.items()
        }

    async def execute_tool(
        self,
        tool_name: str,
        parameters: Dict[str, Any],
        user_role: str = "VIEWER",
        allowed_tools: Optional[list] = None,
    ) -> ToolExecutionResult:
        t0 = time.time()
        tool = self.get(tool_name)
        if not tool:
            return ToolExecutionResult(
                success=False,
                error=f"Tool '{tool_name}' not found in registry.",
                risk_level="HIGH",
                approval_required=False,
                execution_time_ms=0,
            )

        # 1. Organization Tool Allowlists Check
        if allowed_tools is not None and tool_name not in allowed_tools:
            return ToolExecutionResult(
                success=False,
                error=f"Permission Denied: Tool '{tool_name}' is not in the organization allowlist.",
                risk_level=tool.risk_level,
                approval_required=True,
                execution_time_ms=0,
            )

        # 2. Adversarial Injection Check on Arguments
        for key, value in parameters.items():
            if isinstance(value, str):
                is_injected, reason = detect_prompt_injection(value)
                if is_injected:
                    return ToolExecutionResult(
                        success=False,
                        error=f"Security Policy Intercept: {reason}",
                        risk_level="HIGH",
                        approval_required=True,
                        execution_time_ms=0,
                    )

        # 3. Dynamic Risk Level Assessment
        risk_level = tool.risk_level
        approval_required = tool.approval_required
        if hasattr(tool, "get_risk_for_input"):
            try:
                validated_input = tool.validate_input(parameters)
                risk_level, approval_required = tool.get_risk_for_input(validated_input)
            except Exception as e:
                return ToolExecutionResult(
                    success=False,
                    error=f"Input validation error: {str(e)}",
                    risk_level=risk_level,
                    approval_required=approval_required,
                    execution_time_ms=int((time.time() - t0) * 1000),
                )

        # 4. Enforce Schema Validation
        try:
            validated_input = tool.validate_input(parameters)
        except Exception as e:
            return ToolExecutionResult(
                success=False,
                error=f"Schema Validation Failure: {str(e)}",
                risk_level=risk_level,
                approval_required=approval_required,
                execution_time_ms=int((time.time() - t0) * 1000),
            )

        # 5. Execute Tool
        try:
            result_data = await tool.run(validated_input)
            duration = int((time.time() - t0) * 1000)
            return ToolExecutionResult(
                success=True,
                data=result_data,
                risk_level=risk_level,
                approval_required=approval_required,
                execution_time_ms=duration,
            )
        except Exception as e:
            duration = int((time.time() - t0) * 1000)
            return ToolExecutionResult(
                success=False,
                error=str(e),
                risk_level=risk_level,
                approval_required=approval_required,
                execution_time_ms=duration,
            )

# Global Tool Registry instance
tool_registry = ToolRegistry()
