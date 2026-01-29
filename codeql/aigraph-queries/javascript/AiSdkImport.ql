/**
 * @name AI SDK Import Detection (JavaScript/TypeScript)
 * @description Detects imports of AI/ML SDK libraries in JavaScript/TypeScript
 * @kind problem
 * @problem.severity recommendation
 * @id aigraph/javascript/ai-sdk-import
 * @tags ai
 *       security
 *       aigraph
 * @precision high
 */

import javascript
import semmle.javascript.dataflow.DataFlow

/**
 * Holds if the module name matches an AI SDK pattern
 */
predicate isAiSdkModule(string moduleName) {
  // OpenAI
  moduleName = "openai" or
  moduleName.matches("openai/%") or
  // Anthropic
  moduleName = "@anthropic-ai/sdk" or
  moduleName.matches("@anthropic-ai/%") or
  // LangChain ecosystem
  moduleName = "langchain" or
  moduleName.matches("langchain/%") or
  moduleName.matches("@langchain/%") or
  // Google AI
  moduleName = "@google/generative-ai" or
  moduleName = "@google-cloud/vertexai" or
  moduleName = "@google-cloud/aiplatform" or
  // Hugging Face
  moduleName = "@huggingface/inference" or
  moduleName = "@huggingface/hub" or
  moduleName.matches("@huggingface/%") or
  // Cohere
  moduleName = "cohere-ai" or
  moduleName = "cohere" or
  // Replicate
  moduleName = "replicate" or
  // Together AI
  moduleName = "together-ai" or
  // Groq
  moduleName = "groq-sdk" or
  moduleName = "groq" or
  // Mistral
  moduleName = "@mistralai/mistralai" or
  // Fireworks
  moduleName = "@fireworks-ai/sdk" or
  // AI SDK (Vercel)
  moduleName = "ai" or
  moduleName.matches("ai/%") or
  moduleName = "@ai-sdk/openai" or
  moduleName = "@ai-sdk/anthropic" or
  moduleName = "@ai-sdk/google" or
  moduleName.matches("@ai-sdk/%") or
  // MCP
  moduleName = "@modelcontextprotocol/sdk" or
  moduleName.matches("@modelcontextprotocol/%") or
  // Ollama
  moduleName = "ollama" or
  moduleName = "ollama-ai-provider" or
  // LlamaIndex
  moduleName = "llamaindex" or
  // TensorFlow.js
  moduleName = "@tensorflow/tfjs" or
  moduleName.matches("@tensorflow/%") or
  // ONNX
  moduleName = "onnxruntime-web" or
  moduleName = "onnxruntime-node"
}

/**
 * Get the SDK category for a module
 */
string getSdkCategory(string moduleName) {
  (moduleName.matches("%openai%") and result = "openai") or
  (moduleName.matches("%anthropic%") and result = "anthropic") or
  (moduleName.matches("%langchain%") and result = "langchain") or
  (moduleName.matches("%google%") and result = "google-ai") or
  (moduleName.matches("%huggingface%") and result = "huggingface") or
  (moduleName.matches("%cohere%") and result = "cohere") or
  (moduleName.matches("%replicate%") and result = "replicate") or
  (moduleName.matches("%together%") and result = "together") or
  (moduleName.matches("%groq%") and result = "groq") or
  (moduleName.matches("%mistral%") and result = "mistral") or
  (moduleName.matches("%ai-sdk%") or moduleName = "ai" and result = "vercel-ai") or
  (moduleName.matches("%modelcontextprotocol%") and result = "mcp") or
  (moduleName.matches("%ollama%") and result = "ollama") or
  (moduleName.matches("%tensorflow%") and result = "tensorflow") or
  (not (
    moduleName.matches("%openai%") or moduleName.matches("%anthropic%") or 
    moduleName.matches("%langchain%") or moduleName.matches("%google%")
  ) and result = "other-ai")
}

// ES6 imports
from ImportDeclaration imp, string moduleName, string category
where
  moduleName = imp.getImportedPath().getValue() and
  isAiSdkModule(moduleName) and
  category = getSdkCategory(moduleName)
select imp, "AI SDK import detected: " + moduleName + " (category: " + category + ")"

// CommonJS requires
from CallExpr call, string moduleName, string category
where
  call.getCalleeName() = "require" and
  moduleName = call.getArgument(0).(StringLiteral).getValue() and
  isAiSdkModule(moduleName) and
  category = getSdkCategory(moduleName)
select call, "AI SDK require detected: " + moduleName + " (category: " + category + ")"
