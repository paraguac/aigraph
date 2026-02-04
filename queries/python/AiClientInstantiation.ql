/**
 * @name AI Client Instantiation Detection
 * @description Detects instantiation of AI SDK client classes like OpenAI(), Anthropic(), etc.
 * @kind problem
 * @problem.severity recommendation
 * @id aigraph/python/ai-client-instantiation
 * @tags ai
 *       security
 *       aigraph
 * @precision high
 */

import python

/**
 * Holds if the class name matches an AI client pattern
 */
bindingset[className]
predicate isAiClientClass(string className) {
  // OpenAI
  className = "OpenAI" or
  className = "AsyncOpenAI" or
  className = "AzureOpenAI" or
  className = "AsyncAzureOpenAI" or
  // Anthropic
  className = "Anthropic" or
  className = "AsyncAnthropic" or
  className = "ChatAnthropic" or
  // LangChain
  className = "ChatOpenAI" or
  className = "ChatAnthropic" or
  className = "ChatGoogleGenerativeAI" or
  className = "ChatVertexAI" or
  className = "ChatGroq" or
  className = "ChatCohere" or
  className = "ChatOllama" or
  className = "ChatTogether" or
  // Google AI
  className = "GenerativeModel" or
  className = "ChatGoogleGenerativeAI" or
  // Cohere
  className = "Client" or
  className = "AsyncClient" or
  // Groq
  className = "Groq" or
  className = "AsyncGroq" or
  // Together
  className = "Together" or
  // Ollama
  className = "Client" or
  className = "AsyncClient" or
  // Agents/CrewAI
  className = "Agent" or
  className = "Crew" or
  className = "Task" or
  // Autogen
  className = "AssistantAgent" or
  className = "UserProxyAgent" or
  className = "GroupChat" or
  // MCP
  className = "Server" or
  className = "McpServer" or
  className = "StdioServerTransport" or
  // Hugging Face
  className = "AutoModel" or
  className = "AutoModelForCausalLM" or
  className = "AutoModelForSeq2SeqLM" or
  className = "AutoTokenizer" or
  className = "pipeline" or
  // Bedrock
  className = "BedrockRuntime" or
  className = "BedrockRuntimeClient"
}

from Call call, string className
where
  className = call.getFunc().(Name).getId() and
  isAiClientClass(className)
select call, "AI client instantiation: " + className
