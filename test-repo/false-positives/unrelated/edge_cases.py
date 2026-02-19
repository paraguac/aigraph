"""
More False Positive Edge Cases
Testing strings that should NOT trigger false positives.
"""

# Historical or academic references
HISTORICAL_CONTEXT = """
The Titan was a class of British rocket.
Claude Shannon founded information theory.
Gemini was NASA's second human spaceflight program.
The mistral is a wind in southern France.
A llama is a domesticated South American camelid.
"""

# Company/product names that aren't AI
COMPANIES = {
    "titan_corp": "Titan Corporation (not Amazon Titan)",
    "gemini_exchange": "Gemini cryptocurrency exchange",
    "claude_fashion": "Claude Fashion brand",
    "mistral_software": "Mistral Software Inc (not Mistral AI)",
}

# URLs and domains
URLS = [
    "https://example.com/blog/what-is-gpt4",
    "https://docs.example.com/claude-integration-guide",
    "https://api.example.com/v1/models/list?q=gemini",
    "https://forum.example.com/threads/llama-vs-alpaca",
]

# File paths
FILE_PATHS = [
    "/docs/tutorials/gpt4-getting-started.md",
    "/examples/claude-api-example.py",
    "/src/providers/openai/gpt4-handler.js",
    "/config/models/gemini-settings.json",
]

# Database schemas
DATABASE_SCHEMA = """
CREATE TABLE model_usage (
    id INTEGER PRIMARY KEY,
    model_name VARCHAR(100),  -- stores "gpt-4", "claude", etc. as data
    usage_count INTEGER,
    last_used TIMESTAMP
);

CREATE TABLE ai_providers (
    id INTEGER PRIMARY KEY,
    provider_name VARCHAR(50),  -- "openai", "anthropic", etc. as data
    api_key_hash VARCHAR(64)
);
"""

# Natural language text
TEXT_CONTENT = """
Users often ask about GPT-4 capabilities.
Many developers prefer Claude for coding tasks.
Gemini has gained popularity recently.
LLaMA models are widely used in research.
Some teams deploy Mistral for efficiency.
"""

# JSON as string (not parsed)
JSON_STRING = '{"model": "gpt-4", "provider": "openai"}'

# Not actual imports, just strings
IMPORT_EXAMPLES = [
    "from openai import OpenAI",
    "import anthropic",
    "from langchain import ChatOpenAI",
]

if __name__ == "__main__":
    print("These are just strings, not actual AI usage")
