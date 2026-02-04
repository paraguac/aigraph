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
bindingset[urlValue]
predicate isAiApiEndpoint(string urlValue) {
  // OpenAI
  urlValue.matches("%api.openai.com%") or
  // Anthropic
  urlValue.matches("%api.anthropic.com%") or
  // Google AI
  urlValue.matches("%generativelanguage.googleapis.com%") or
  urlValue.matches("%aiplatform.googleapis.com%") or
  urlValue.matches("%us-central1-aiplatform.googleapis.com%") or
  // Azure OpenAI
  urlValue.matches("%openai.azure.com%") or
  urlValue.matches("%.cognitiveservices.azure.com%") or
  // Hugging Face
  urlValue.matches("%api-inference.huggingface.co%") or
  urlValue.matches("%huggingface.co/api%") or
  // Cohere
  urlValue.matches("%api.cohere.ai%") or
  urlValue.matches("%api.cohere.com%") or
  // Replicate
  urlValue.matches("%api.replicate.com%") or
  // Together AI
  urlValue.matches("%api.together.xyz%") or
  urlValue.matches("%together.ai%") or
  // Groq
  urlValue.matches("%api.groq.com%") or
  // Fireworks
  urlValue.matches("%api.fireworks.ai%") or
  // Perplexity
  urlValue.matches("%api.perplexity.ai%") or
  // OpenRouter
  urlValue.matches("%openrouter.ai/api%") or
  // Mistral
  urlValue.matches("%api.mistral.ai%") or
  // Ollama (local)
  urlValue.matches("%localhost:11434%") or
  urlValue.matches("%127.0.0.1:11434%") or
  // LM Studio (local)
  urlValue.matches("%localhost:1234%") or
  urlValue.matches("%127.0.0.1:1234%")
}

// Detect string literals containing AI API endpoints
from StringLiteral str
where isAiApiEndpoint(str.getValue())
select str, "AI API endpoint detected: " + str.getValue()
