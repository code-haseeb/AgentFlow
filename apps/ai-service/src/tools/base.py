from abc import ABC, abstractmethod
from typing import Type, Dict, Any, Optional
from pydantic import BaseModel

class ToolExecutionResult(BaseModel):
    success: bool
    data: Optional[Dict[str, Any]] = None
    error: Optional[str] = None
    risk_level: str
    approval_required: bool
    execution_time_ms: int

class BaseTool(ABC):
    name: str
    description: str
    risk_level: str  # "LOW", "MEDIUM", "HIGH"
    approval_required: bool
    timeout: int = 15
    input_schema: Type[BaseModel]
    output_schema: Type[BaseModel]

    def validate_input(self, input_data: Dict[str, Any]) -> BaseModel:
        return self.input_schema(**input_data)

    @abstractmethod
    async def run(self, validated_input: BaseModel) -> Dict[str, Any]:
        """Execute the tool action."""
        pass
