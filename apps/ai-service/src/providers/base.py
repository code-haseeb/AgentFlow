from abc import ABC, abstractmethod
from typing import Type, TypeVar
from pydantic import BaseModel

T = TypeVar("T", bound=BaseModel)

class BaseLLMProvider(ABC):
    @abstractmethod
    async def generate_structured(
        self,
        prompt: str,
        system_instruction: str,
        response_model: Type[T],
    ) -> T:
        """Generates a strictly structured response conforming to the provided Pydantic model."""
        pass
