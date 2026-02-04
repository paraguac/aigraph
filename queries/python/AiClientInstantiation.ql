/**
 * @name AI Client Instantiation
 * @description Detects instantiation of AI client classes like OpenAI(), Anthropic(), etc.
 * @kind problem
 * @problem.severity recommendation
 * @id aigraph/python/ai-client-instantiation
 * @tags ai
 *       security
 *       aigraph
 * @precision high
 */

import python
import semmle.python.dataflow.new.DataFlow

/**
 * Known AI client class names
 */
predicate isAiClientClass(string className) {
  // OpenAI clients
  className = "OpenAI" or
  className = "AsyncOpenAI" or
  className = "AzureOpenAI" or
  className = "AsyncAzureOpenAI" or
  // Anthropic clients
  className = "Anthropic" or
  className = "AsyncAnthropic" or
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
  // LangChain LLMs
  className = "OpenAI" or
  className = "Anthropic" or
  className = "Cohere" or
  className = "HuggingFaceHub" or
  className = "HuggingFacePipeline" or
  className = "Ollama" or
  className = "LlamaCpp" or
  className = "GPT4All" or
  className = "Replicate" or
  // Google AI
  className = "GenerativeModel" or
  className = "ChatModel" or
  // Cohere
  className = "Client" or  // cohere.Client
  className = "CohereClient" or
  // Groq
  className = "Groq" or
  className = "AsyncGroq" or
  // Together
  className = "Together" or
  // AutoGen
  className = "AssistantAgent" or
  className = "UserProxyAgent" or
  className = "GroupChat" or
  // CrewAI
  className = "Agent" or
  className = "Crew" or
  className = "Task" or
  // LlamaIndex
  className = "ServiceContext" or
  className = "VectorStoreIndex" or
  className = "LLMPredictor" or
  // MCP
  className = "McpServer" or
  className = "McpClient" or
  className = "Server" or  // from mcp.server
  // Transformers
  className = "AutoModelForCausalLM" or
  className = "AutoModelForSeq2SeqLM" or
  className = "AutoTokenizer" or
  className = "pipeline" or
  // Bedrock
  className = "BedrockRuntime" or
  className = "BedrockRuntimeClient"
}

/**
 * Get the SDK for a client class
 */
string getClientSdk(string className) {
  (className.matches("%OpenAI%") and not className.matches("%Azure%") and result = "openai") or
  (className.matches("%Azure%") and result = "azure-openai") or
  (className.matches("%Anthropic%") or className.matches("ChatAnthropic") and result = "anthropic") or
  (className.matches("Chat%") and result = "langchain") or
  (className.matches("%Google%") or className = "GenerativeModel" and result = "google-ai") or
  (className.matches("%Cohere%") and result = "cohere") or
  (className.matches("%Groq%") and result = "groq") or
  (className.matches("%Together%") and result = "together") or
  (className.matches("%Ollama%") and result = "ollama") or
  (className.matches("%Agent%") or className = "Crew" and result = "agentic") or
  (className.matches("%Mcp%") or className = "Server" and result = "mcp") or
  (className.matches("Auto%") or className = "pipeline" and result = "transformers") or
  (className.matches("%Bedrock%") and result = "aws-bedrock") or
  (not (
    className.matches("%OpenAI%") or className.matches("%Anthropic%") or className.matches("Chat%")
  ) and result = "other")
}

from Call call, string className, string sdk
where
  className = call.getFunc().(Name).getId() and
  isAiClientClass(className) and
  sdk = getClientSdk(className)
select call, "AI client instantiation: " + className + " (sdk: " + sdk + ")"
