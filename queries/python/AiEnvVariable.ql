/**
 * @name AI Environment Variable Usage
 * @description Detects usage of AI-related environment variables
 * @kind problem
 * @problem.severity recommendation
 * @id aigraph/python/ai-env-variable
 * @tags ai
 *       security
 *       aigraph
 * @precision high
 */

import python
import semmle.python.dataflow.new.DataFlow

/**
 * AI-related environment variable names
 */
predicate isAiEnvVar(string name) {
  // OpenAI
  name = "OPENAI_API_KEY" or
  name = "OPENAI_ORG_ID" or
  name = "OPENAI_API_BASE" or
  name = "OPENAI_API_TYPE" or
  // Anthropic
  name = "ANTHROPIC_API_KEY" or
  name = "CLAUDE_API_KEY" or
  // Google AI
  name = "GOOGLE_API_KEY" or
  name = "GOOGLE_APPLICATION_CREDENTIALS" or
  name = "VERTEX_PROJECT" or
  name = "VERTEX_LOCATION" or
  // Azure
  name = "AZURE_OPENAI_API_KEY" or
  name = "AZURE_OPENAI_ENDPOINT" or
  name = "AZURE_OPENAI_API_VERSION" or
  // Hugging Face
  name = "HUGGINGFACE_API_KEY" or
  name = "HUGGINGFACE_TOKEN" or
  name = "HF_TOKEN" or
  name = "HF_API_KEY" or
  // Cohere
  name = "COHERE_API_KEY" or
  name = "CO_API_KEY" or
  // Replicate
  name = "REPLICATE_API_TOKEN" or
  name = "REPLICATE_API_KEY" or
  // Together AI
  name = "TOGETHER_API_KEY" or
  name = "TOGETHERAI_API_KEY" or
  // Groq
  name = "GROQ_API_KEY" or
  // Fireworks
  name = "FIREWORKS_API_KEY" or
  // Perplexity
  name = "PERPLEXITY_API_KEY" or
  name = "PPLX_API_KEY" or
  // OpenRouter
  name = "OPENROUTER_API_KEY" or
  // Mistral
  name = "MISTRAL_API_KEY" or
  // LangChain/LangSmith
  name = "LANGCHAIN_API_KEY" or
  name = "LANGSMITH_API_KEY" or
  name = "LANGCHAIN_TRACING_V2" or
  name = "LANGCHAIN_PROJECT" or
  // AWS Bedrock
  name = "AWS_BEDROCK_REGION" or
  // Ollama
  name = "OLLAMA_HOST" or
  name = "OLLAMA_BASE_URL"
}

/**
 * Get the AI provider from env var name
 */
string getEnvVarProvider(string name) {
  (name.matches("OPENAI%") and result = "openai") or
  (name.matches("ANTHROPIC%") or name.matches("CLAUDE%") and result = "anthropic") or
  (name.matches("GOOGLE%") or name.matches("VERTEX%") and result = "google") or
  (name.matches("AZURE%") and result = "azure") or
  (name.matches("HUGGING%") or name.matches("HF_%") and result = "huggingface") or
  (name.matches("COHERE%") or name.matches("CO_%") and result = "cohere") or
  (name.matches("REPLICATE%") and result = "replicate") or
  (name.matches("TOGETHER%") and result = "together") or
  (name.matches("GROQ%") and result = "groq") or
  (name.matches("FIREWORKS%") and result = "fireworks") or
  (name.matches("PERPLEXITY%") or name.matches("PPLX%") and result = "perplexity") or
  (name.matches("OPENROUTER%") and result = "openrouter") or
  (name.matches("MISTRAL%") and result = "mistral") or
  (name.matches("LANGCHAIN%") or name.matches("LANGSMITH%") and result = "langchain") or
  (name.matches("AWS%") and result = "aws") or
  (name.matches("OLLAMA%") and result = "ollama") or
  (not (name.matches("OPENAI%") or name.matches("ANTHROPIC%")) and result = "other")
}

// Detect os.getenv() or os.environ[] with AI env vars
from Call call, StringLiteral arg, string envVarName, string provider
where
  (
    call.getFunc().(Attribute).getName() = "getenv" or
    call.getFunc().(Attribute).getName() = "get"
  ) and
  arg = call.getArg(0) and
  envVarName = arg.getText() and
  isAiEnvVar(envVarName) and
  provider = getEnvVarProvider(envVarName)
select call, "AI environment variable usage: " + envVarName + " (provider: " + provider + ")"
