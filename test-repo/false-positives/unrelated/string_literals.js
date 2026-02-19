/**
 * Unrelated String Literals - False Positive Test
 * Strings that contain AI terms but are not actual AI usage.
 */

// Error messages that mention AI terms
const ERROR_MESSAGES = {
  MODEL_NOT_FOUND: "The model 'gpt-4' was not found in configuration",
  INVALID_SETUP: "Setup for 'claude-3-sonnet' is incomplete",
  SERVICE_DOWN: "The 'gemini-pro' service is currently unavailable",
  DEPRECATED: "Support for 'gpt-3.5-turbo' has been deprecated",
};

// API route paths
const API_ROUTES = [
  '/api/v1/docs/gpt-4',
  '/api/v1/models/claude-3',
  '/api/v1/services/gemini-pro',
  '/api/v1/platforms/aws-bedrock',
  '/api/v1/frameworks/langchain',
];

// Blog post titles and metadata
const BLOG_POSTS = [
  {
    title: "Understanding GPT-4: A Comprehensive Guide",
    slug: "understanding-gpt-4-guide",
    tags: ["ai", "gpt-4", "tutorial"]
  },
  {
    title: "Claude 3 vs GPT-4: Which is Better?",
    slug: "claude-vs-gpt4",
    tags: ["comparison", "claude", "gpt-4"]
  },
  {
    title: "Building with LangChain and LlamaIndex",
    slug: "langchain-llamaindex-tutorial",
    tags: ["frameworks", "langchain", "llamaindex"]
  },
];

// User search queries (not actual model usage)
const SEARCH_QUERIES = [
  "how to use gpt-4 api",
  "claude-3-sonnet pricing",
  "llama2 vs llama3 comparison",
  "mistral-7b performance benchmarks",
  "gemini-pro api documentation",
  "aws bedrock tutorial",
];

// Feature flag names
const FEATURE_FLAGS = {
  gpt4_integration_enabled: false,
  claude_support_enabled: false,
  gemini_preview_enabled: false,
  langchain_beta_active: false,
};

// Database table names
const TABLE_NAMES = {
  gpt4_usage_logs: 'user_gpt4_logs',
  claude_api_calls: 'claude_call_history',
  model_preferences: 'user_model_prefs',
};

// Mock data for testing
const MOCK_RESPONSES = {
  "gpt-4": "This is mock data, not real GPT-4",
  "claude-3-sonnet": "This is mock data, not real Claude",
  "gemini-pro": "This is mock data, not real Gemini",
};

function processSearchQuery(query) {
  // Just matching strings, not using AI
  if (query.includes('gpt-4')) {
    return { type: 'model_docs', model: 'gpt-4' };
  }
  if (query.includes('claude')) {
    return { type: 'model_docs', model: 'claude' };
  }
  return { type: 'general' };
}

export { ERROR_MESSAGES, API_ROUTES, BLOG_POSTS, SEARCH_QUERIES };
