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

/**
 * AI-related environment variable names
 */
predicate isAiEnvVar(StringLiteral str) {
  exists(string envName |
    envName = str.getText() and
    (
      // OpenAI
      envName = "OPENAI_API_KEY" or
      envName = "OPENAI_ORG_ID" or
      envName = "OPENAI_API_BASE" or
      // Anthropic
      envName = "ANTHROPIC_API_KEY" or
      envName = "CLAUDE_API_KEY" or
      // Google AI
      envName = "GOOGLE_API_KEY" or
      envName = "GOOGLE_APPLICATION_CREDENTIALS" or
      // Azure
      envName = "AZURE_OPENAI_API_KEY" or
      envName = "AZURE_OPENAI_ENDPOINT" or
      // Hugging Face
      envName = "HUGGINGFACE_API_KEY" or
      envName = "HF_TOKEN" or
      envName = "HF_API_KEY" or
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
    )
  )
}

// Detect os.getenv() or os.environ[] with AI env vars
from Call call, StringLiteral arg
where
  (
    call.getFunc().(Attribute).getName() = "getenv" or
    call.getFunc().(Attribute).getName() = "get"
  ) and
  arg = call.getArg(0) and
  isAiEnvVar(arg)
select call, "AI environment variable access: " + arg.getText()
