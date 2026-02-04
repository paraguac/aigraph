/**
 * @name AI Environment Variable Usage (JavaScript/TypeScript)
 * @description Detects usage of AI-related environment variables
 * @kind problem
 * @problem.severity recommendation
 * @id aigraph/javascript/ai-env-variable
 * @tags ai
 *       security
 *       aigraph
 * @precision high
 */

import javascript

/**
 * AI-related environment variable names
 */
bindingset[envName]
predicate isAiEnvVar(string envName) {
  // OpenAI
  envName = "OPENAI_API_KEY" or
  envName = "OPENAI_ORG_ID" or
  envName = "OPENAI_API_BASE" or
  // Anthropic
  envName = "ANTHROPIC_API_KEY" or
  envName = "CLAUDE_API_KEY" or
  // Google AI
  envName = "GOOGLE_API_KEY" or
  // Azure
  envName = "AZURE_OPENAI_API_KEY" or
  envName = "AZURE_OPENAI_ENDPOINT" or
  // Hugging Face
  envName = "HUGGINGFACE_API_KEY" or
  envName = "HF_TOKEN" or
  // Cohere
  envName = "COHERE_API_KEY" or
  // Replicate
  envName = "REPLICATE_API_TOKEN" or
  // Together AI
  envName = "TOGETHER_API_KEY" or
  // Groq
  envName = "GROQ_API_KEY" or
  // Mistral
  envName = "MISTRAL_API_KEY" or
  // LangChain/LangSmith
  envName = "LANGCHAIN_API_KEY" or
  envName = "LANGSMITH_API_KEY" or
  // Ollama
  envName = "OLLAMA_HOST"
}

// Detect process.env.VAR_NAME access
from PropAccess access
where
  access.getBase().(PropAccess).getPropertyName() = "env" and
  access.getBase().(PropAccess).getBase().(Identifier).getName() = "process" and
  isAiEnvVar(access.getPropertyName())
select access, "AI environment variable usage: process.env." + access.getPropertyName()
