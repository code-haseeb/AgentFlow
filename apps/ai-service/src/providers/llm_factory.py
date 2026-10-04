from .base import BaseLLMProvider
from .mock_provider import MockLLMProvider
from ..config import settings

def get_llm_provider() -> BaseLLMProvider:
    # Always default to Mock provider unless valid external keys exist
    return MockLLMProvider()
