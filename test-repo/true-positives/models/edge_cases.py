"""
Edge Cases and Mixed Scenarios - True Positive Test
This file tests edge cases and mixed usage patterns.
"""

import os

# Dynamic model selection
def get_model_name(provider):
    """Dynamically select model based on provider"""
    models = {
        "openai": "gpt-4-turbo",
        "anthropic": "claude-3-opus-20240229",
        "google": "gemini-1.5-pro",
        "meta": "llama-3-70b",
        "mistral": "mistral-large-latest"
    }
    return models.get(provider, "gpt-3.5-turbo")

# Multiple models in one function
def multi_model_ensemble():
    """Use multiple models for ensemble"""
    primary_model = "gpt-4"
    fallback_model = "claude-3-sonnet-20240229"
    local_model = "llama2"
    
    # Try primary first
    try:
        result = call_model(primary_model)
    except:
        # Fall back to Claude
        try:
            result = call_model(fallback_model)
        except:
            # Final fallback to local model
            result = call_model(local_model)
    
    return result

def call_model(model_name):
    """Mock function to call a model"""
    return f"Called {model_name}"

# Model configuration with environment variables
OPENAI_CONFIG = {
    "api_key": os.getenv("OPENAI_API_KEY"),
    "model": os.getenv("MODEL_NAME", "gpt-4"),
    "backup_model": "gpt-3.5-turbo",
    "embedding_model": "text-embedding-3-large"
}

ANTHROPIC_CONFIG = {
    "api_key": os.getenv("ANTHROPIC_API_KEY"),
    "model": os.getenv("CLAUDE_MODEL", "claude-3-sonnet-20240229"),
    "max_tokens": 4096
}

# Framework combination
def use_multiple_frameworks():
    """Combine multiple AI frameworks"""
    # LangChain for orchestration
    from langchain.chat_models import ChatOpenAI
    
    # LlamaIndex for RAG
    from llama_index import VectorStoreIndex
    
    # Use both together
    llm = ChatOpenAI(model="gpt-4")
    # index would use llm for queries
    
    return "Combined frameworks"

# Platform switching
def get_platform_client(platform):
    """Get client for different platforms"""
    if platform == "aws":
        import boto3
        return boto3.client('bedrock-runtime')
    elif platform == "azure":
        from azure.ai.openai import AzureOpenAI
        return AzureOpenAI()
    elif platform == "gcp":
        import google.generativeai as genai
        return genai
    elif platform == "local":
        import ollama
        return ollama
    
    return None

# String interpolation with models
prompt = f"Use {os.getenv('MODEL', 'gpt-4')} to analyze"
claude_prompt = f"Send to {os.getenv('CLAUDE_MODEL', 'claude-3-sonnet')}"

if __name__ == "__main__":
    print(get_model_name("openai"))
    print(multi_model_ensemble())
