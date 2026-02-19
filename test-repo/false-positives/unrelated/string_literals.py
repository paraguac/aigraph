"""
Unrelated String Literals - False Positive Test
This file contains strings that happen to contain AI terms but are unrelated.
"""

# Error messages
ERROR_MESSAGES = {
    "model_not_found": "Model 'gpt-4' is not available in the database",
    "invalid_config": "Configuration for 'claude-3-sonnet' is invalid",
    "connection_failed": "Failed to connect to 'gemini-pro' service",
}

# Log messages
def log_activity(action):
    """Log user activity with action names"""
    logs = {
        "viewed_gpt4_docs": "User viewed GPT-4 documentation",
        "read_claude_article": "User read article about Claude",
        "searched_llama": "User searched for 'llama' in forum",
        "commented_on_mistral": "User commented on Mistral discussion",
    }
    return logs.get(action, "Unknown action")

# URL patterns
URL_PATTERNS = [
    "/api/docs/gpt-4/overview",
    "/blog/posts/claude-3-sonnet-review",
    "/search?q=llama+model",
    "/products/mistral-integration",
    "/services/gemini-pro-api",
]

# Test data / Mock data
TEST_DATA = [
    {"query": "what is gpt-4", "category": "faq"},
    {"query": "how to use claude", "category": "tutorial"},
    {"query": "llama vs alpaca", "category": "comparison"},
    {"query": "mistral wind patterns", "category": "weather"},
]

# Database column names
SCHEMA = {
    "gpt4_usage_count": "integer",
    "claude_api_calls": "integer", 
    "gemini_requests": "integer",
    "llama_deployments": "integer",
}

# Configuration keys (not actual model usage)
CONFIG_KEYS = [
    "enable_gpt4_feature",
    "claude_integration_enabled",
    "gemini_api_available",
    "llama_support_active",
]

def process_query(query):
    """Process search queries that mention AI models"""
    # Just string matching, not actual AI usage
    if "gpt-4" in query.lower():
        return "FAQ about GPT-4"
    elif "claude" in query.lower():
        return "Claude information"
    elif "gemini" in query.lower():
        return "Gemini details"
    return "General info"

# Feature flags (strings that look like model names)
FEATURES = {
    "gpt4_beta": False,
    "claude_preview": False,
    "gemini_experimental": False,
    "llama_local": False,
}

if __name__ == "__main__":
    print(log_activity("viewed_gpt4_docs"))
    print(process_query("What is gpt-4?"))
