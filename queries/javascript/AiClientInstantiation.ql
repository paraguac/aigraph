/**
 * @name AI Client Instantiation Detection
 * @description Detects instantiation of AI SDK client classes like new OpenAI(), new Anthropic(), etc.
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
bindingset[className]
predicate isAiClientClass(string className) {
  // OpenAI
  className = "OpenAI" or
  className = "OpenAIApi" or
  className = "Configuration" or
  // Anthropic
  className = "Anthropic" or
  className = "AnthropicBedrock" or
  // LangChain
  className = "ChatOpenAI" or
  className = "ChatAnthropic" or
  className = "ChatGoogleGenerativeAI" or
  className = "ChatVertexAI" or
  className = "ChatGroq" or
  className = "ChatCohere" or
  className = "ChatOllama" or
  className = "ChatMistralAI" or
  className = "ChatFireworks" or
  className = "ChatBedrock" or
  // Google AI
  className = "GoogleGenerativeAI" or
  className = "GenerativeModel" or
  className = "ChatGoogleGenerativeAI" or
  // Cohere
  className = "CohereClient" or
  className = "Cohere" or
  // Groq
  className = "Groq" or
  // Together
  className = "Together" or
  // Replicate
  className = "Replicate" or
  // Mistral
  className = "MistralClient" or
  className = "Mistral" or
  // Vercel AI SDK
  className = "OpenAIProvider" or
  className = "AnthropicProvider" or
  className = "GoogleProvider" or
  className = "GroqProvider" or
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

from NewExpr newExpr, string className
where
  className = newExpr.getCallee().(Identifier).getName() and
  isAiClientClass(className)
select newExpr, "AI client instantiation: new " + className + "()"
