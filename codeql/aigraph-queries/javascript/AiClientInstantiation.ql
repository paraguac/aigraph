/**
 * @name AI Client Instantiation (JavaScript/TypeScript)
 * @description Detects instantiation of AI client classes in JavaScript/TypeScript
 * @kind problem
 * @problem.severity recommendation
 * @id aigraph/javascript/ai-client-instantiation
 * @tags ai
 *       security
 *       aigraph
 * @precision high
 */

import javascript

/**
 * Known AI client class names
 */
predicate isAiClientClass(string className) {
  // OpenAI
  className = "OpenAI" or
  className = "OpenAIApi" or
  className = "Configuration" or  // OpenAI SDK v3
  // Anthropic
  className = "Anthropic" or
  className = "AnthropicBedrock" or
  // LangChain models
  className = "ChatOpenAI" or
  className = "ChatAnthropic" or
  className = "ChatGoogleGenerativeAI" or
  className = "ChatVertexAI" or
  className = "ChatCohere" or
  className = "ChatGroq" or
  className = "ChatOllama" or
  className = "ChatMistralAI" or
  className = "ChatTogether" or
  className = "ChatFireworks" or
  className = "ChatBedrock" or
  className = "BedrockChat" or
  // Google AI
  className = "GoogleGenerativeAI" or
  className = "GenerativeModel" or
  // Cohere
  className = "CohereClient" or
  // Groq
  className = "Groq" or
  // Together
  className = "Together" or
  // Replicate
  className = "Replicate" or
  // Mistral
  className = "Mistral" or
  className = "MistralClient" or
  // Vercel AI SDK
  className = "OpenAIProvider" or
  className = "AnthropicProvider" or
  className = "GoogleProvider" or
  // MCP
  className = "McpServer" or
  className = "Server" or
  className = "McpClient" or
  className = "Client" or
  // LlamaIndex
  className = "VectorStoreIndex" or
  className = "ServiceContext" or
  // Ollama
  className = "Ollama"
}

/**
 * Get the SDK for a client class
 */
string getClientSdk(string className) {
  (className.matches("%OpenAI%") and result = "openai") or
  (className.matches("%Anthropic%") and result = "anthropic") or
  (className.matches("Chat%") and result = "langchain") or
  (className.matches("%Google%") or className = "GenerativeModel" and result = "google-ai") or
  (className.matches("%Cohere%") and result = "cohere") or
  (className.matches("%Groq%") and result = "groq") or
  (className.matches("%Together%") and result = "together") or
  (className.matches("%Replicate%") and result = "replicate") or
  (className.matches("%Mistral%") and result = "mistral") or
  (className.matches("%Provider%") and result = "vercel-ai") or
  (className.matches("%Mcp%") or className = "Server" or className = "Client" and result = "mcp") or
  (className.matches("%Ollama%") and result = "ollama") or
  (not (
    className.matches("%OpenAI%") or className.matches("%Anthropic%") or className.matches("Chat%")
  ) and result = "other")
}

from NewExpr newExpr, string className, string sdk
where
  className = newExpr.getCallee().(Identifier).getName() and
  isAiClientClass(className) and
  sdk = getClientSdk(className)
select newExpr, "AI client instantiation: new " + className + "() (sdk: " + sdk + ")"
