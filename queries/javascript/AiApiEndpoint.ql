/**
 * @name AI API Endpoint Detection (JavaScript/TypeScript)
 * @description Detects HTTP calls to AI provider API endpoints in JavaScript/TypeScript
 * @kind problem
 * @problem.severity warning
 * @id aigraph/javascript/ai-api-endpoint
 * @tags ai
 *       security
 *       aigraph
 *       external/cwe/cwe-319
 * @precision high
 */

import javascript

/**
 * AI provider API endpoint patterns
 */
predicate isAiApiEndpoint(string url) {
  // OpenAI
  url.matches("%api.openai.com%") or
  // Anthropic
  url.matches("%api.anthropic.com%") or
  // Google AI
  url.matches("%generativelanguage.googleapis.com%") or
  url.matches("%aiplatform.googleapis.com%") or
  url.matches("%us-central1-aiplatform.googleapis.com%") or
  // Azure OpenAI
  url.matches("%openai.azure.com%") or
  url.matches("%.cognitiveservices.azure.com%") or
  // Hugging Face
  url.matches("%api-inference.huggingface.co%") or
  url.matches("%huggingface.co/api%") or
  // Cohere
  url.matches("%api.cohere.ai%") or
  url.matches("%api.cohere.com%") or
  // Replicate
  url.matches("%api.replicate.com%") or
  // Together AI
  url.matches("%api.together.xyz%") or
  url.matches("%together.ai%") or
  // Groq
  url.matches("%api.groq.com%") or
  // Fireworks
  url.matches("%api.fireworks.ai%") or
  // Perplexity
  url.matches("%api.perplexity.ai%") or
  // OpenRouter
  url.matches("%openrouter.ai/api%") or
  // Mistral
  url.matches("%api.mistral.ai%") or
  // Ollama (local)
  url.matches("%localhost:11434%") or
  url.matches("%127.0.0.1:11434%") or
  // LM Studio (local)
  url.matches("%localhost:1234%") or
  url.matches("%127.0.0.1:1234%")
}

/**
 * Get the AI provider from URL
 */
string getProviderFromUrl(string url) {
  (url.matches("%openai.com%") and not url.matches("%azure%") and result = "openai") or
  (url.matches("%anthropic.com%") and result = "anthropic") or
  (url.matches("%googleapis.com%") and result = "google") or
  (url.matches("%azure%") and result = "azure") or
  (url.matches("%huggingface%") and result = "huggingface") or
  (url.matches("%cohere%") and result = "cohere") or
  (url.matches("%replicate%") and result = "replicate") or
  (url.matches("%together%") and result = "together") or
  (url.matches("%groq%") and result = "groq") or
  (url.matches("%fireworks%") and result = "fireworks") or
  (url.matches("%perplexity%") and result = "perplexity") or
  (url.matches("%openrouter%") and result = "openrouter") or
  (url.matches("%mistral%") and result = "mistral") or
  (url.matches("%localhost:11434%") and result = "ollama") or
  (url.matches("%localhost:1234%") and result = "lmstudio") or
  (not (
    url.matches("%openai%") or url.matches("%anthropic%") or url.matches("%google%")
  ) and result = "unknown")
}

// Detect fetch calls with AI API endpoints
from CallExpr call, StringLiteral urlArg, string url, string provider
where
  (call.getCalleeName() = "fetch" or 
   call.getCallee().(PropAccess).getPropertyName() = "get" or
   call.getCallee().(PropAccess).getPropertyName() = "post") and
  urlArg = call.getArgument(0) and
  url = urlArg.getValue() and
  isAiApiEndpoint(url) and
  provider = getProviderFromUrl(url)
select call, "Direct AI API call detected: " + url + " (provider: " + provider + ")"

// Detect string literals containing AI API endpoints
from StringLiteral str, string value, string provider
where
  value = str.getValue() and
  isAiApiEndpoint(value) and
  provider = getProviderFromUrl(value)
select str, "AI API endpoint reference: " + value + " (provider: " + provider + ")"
