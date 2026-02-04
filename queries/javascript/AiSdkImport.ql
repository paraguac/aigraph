/**
 * @name AI SDK Import Detection
 * @description Detects imports of AI/ML SDK libraries like OpenAI, Anthropic, LangChain, etc.
 * @kind problem
 * @problem.severity recommendation
 * @id aigraph/javascript/ai-sdk-import
 * @tags ai
 *       security
 *       aigraph
 * @precision high
 */

import javascript

/**
 * Holds if the module name matches an AI SDK pattern
 */
bindingset[moduleName]
predicate isAiSdkModule(string moduleName) {
  // OpenAI
  moduleName = "openai" or
  moduleName.matches("openai/%") or
  // Anthropic
  moduleName = "@anthropic-ai/sdk" or
  moduleName.matches("@anthropic-ai/%") or
  // LangChain
  moduleName.matches("langchain%") or
  moduleName.matches("@langchain/%") or
  moduleName = "langgraph" or
  moduleName = "langsmith" or
  // Google AI
  moduleName = "@google/generative-ai" or
  moduleName.matches("@google-ai/%") or
  moduleName.matches("@google-cloud/aiplatform%") or
  moduleName = "@google-cloud/vertexai" or
  // Hugging Face
  moduleName = "@huggingface/inference" or
  moduleName.matches("@huggingface/%") or
  // Cohere
  moduleName = "cohere-ai" or
  moduleName.matches("cohere%") or
  // Replicate
  moduleName = "replicate" or
  // Together AI
  moduleName = "together-ai" or
  // Groq
  moduleName = "groq-sdk" or
  moduleName = "@groq/sdk" or
  // Fireworks
  moduleName.matches("%fireworks%") or
  // Mistral
  moduleName = "@mistralai/mistralai" or
  moduleName.matches("@mistralai/%") or
  // Vercel AI SDK
  moduleName = "ai" or
  moduleName.matches("@ai-sdk/%") or
  // MCP
  moduleName = "@modelcontextprotocol/sdk" or
  moduleName.matches("@modelcontextprotocol/%") or
  // Ollama
  moduleName = "ollama" or
  moduleName = "ollama-ai-provider" or
  // TensorFlow.js
  moduleName.matches("@tensorflow/%") or
  // Azure OpenAI
  moduleName = "@azure/openai" or
  moduleName.matches("@azure/openai%") or
  // AWS Bedrock
  moduleName = "@aws-sdk/client-bedrock" or
  moduleName = "@aws-sdk/client-bedrock-runtime"
}

// ES6 imports
from ImportDeclaration imp, string moduleName
where
  moduleName = imp.getImportedPath().getValue() and
  isAiSdkModule(moduleName)
select imp, "AI SDK import detected: " + moduleName
