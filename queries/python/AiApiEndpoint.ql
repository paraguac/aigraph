/**
 * @name AI API Endpoint Detection
 * @description Detects HTTP calls to AI provider API endpoints
 * @kind problem
 * @problem.severity warning
 * @id aigraph/python/ai-api-endpoint
 * @tags ai
 *       security
 *       aigraph
 *       external/cwe/cwe-319
 * @precision high
 */

import python

/**
 * AI provider API endpoint patterns
 */
predicate isAiApiEndpoint(StringLiteral str) {
  exists(string urlValue |
    urlValue = str.getText() and
    (
      // OpenAI
      urlValue.matches("%api.openai.com%") or
      // Anthropic
      urlValue.matches("%api.anthropic.com%") or
      // Google AI
      urlValue.matches("%generativelanguage.googleapis.com%") or
      urlValue.matches("%aiplatform.googleapis.com%") or
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
      // Groq
      urlValue.matches("%api.groq.com%") or
      // Mistral
      urlValue.matches("%api.mistral.ai%") or
      // Ollama (local)
      urlValue.matches("%localhost:11434%") or
      urlValue.matches("%127.0.0.1:11434%")
    )
  )
}

from StringLiteral str
where isAiApiEndpoint(str)
select str, "AI API endpoint detected: " + str.getText()
