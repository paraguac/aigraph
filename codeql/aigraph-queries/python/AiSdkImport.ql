/**
 * @name AI SDK Import Detection
 * @description Detects imports of AI/ML SDK libraries like OpenAI, Anthropic, LangChain, etc.
 * @kind problem
 * @problem.severity recommendation
 * @id aigraph/python/ai-sdk-import
 * @tags ai
 *       security
 *       aigraph
 * @precision high
 */

import python
import semmle.python.dataflow.new.DataFlow

/**
 * Holds if the module name matches an AI SDK pattern
 */
predicate isAiSdkModule(string moduleName) {
  // OpenAI
  moduleName.matches("openai%") or
  // Anthropic
  moduleName.matches("anthropic%") or
  // LangChain ecosystem
  moduleName.matches("langchain%") or
  moduleName.matches("langgraph%") or
  moduleName.matches("langsmith%") or
  // Google AI
  moduleName.matches("google.generativeai%") or
  moduleName.matches("google.cloud.aiplatform%") or
  moduleName.matches("vertexai%") or
  // Hugging Face
  moduleName.matches("transformers%") or
  moduleName.matches("huggingface_hub%") or
  moduleName.matches("diffusers%") or
  // Other AI frameworks
  moduleName.matches("llama_index%") or
  moduleName.matches("autogen%") or
  moduleName.matches("crewai%") or
  moduleName.matches("dspy%") or
  moduleName.matches("instructor%") or
  moduleName.matches("guidance%") or
  moduleName.matches("semantic_kernel%") or
  moduleName.matches("haystack%") or
  moduleName.matches("pydantic_ai%") or
  // Cohere
  moduleName.matches("cohere%") or
  // Replicate
  moduleName.matches("replicate%") or
  // Groq
  moduleName.matches("groq%") or
  // Together AI
  moduleName.matches("together%") or
  // AWS Bedrock
  moduleName.matches("boto3%") and moduleName.matches("%bedrock%") or
  // Azure OpenAI
  moduleName.matches("azure.ai%") or
  // MCP
  moduleName.matches("mcp%") or
  moduleName.matches("modelcontextprotocol%") or
  // PyTorch/TensorFlow (ML frameworks)
  moduleName.matches("torch%") or
  moduleName.matches("tensorflow%") or
  moduleName.matches("keras%") or
  // Ollama
  moduleName.matches("ollama%")
}

/**
 * Get the SDK category for a module
 */
string getSdkCategory(string moduleName) {
  (moduleName.matches("openai%") and result = "openai") or
  (moduleName.matches("anthropic%") and result = "anthropic") or
  (moduleName.matches("langchain%") and result = "langchain") or
  (moduleName.matches("langgraph%") and result = "langgraph") or
  (moduleName.matches("google%") and result = "google-ai") or
  (moduleName.matches("vertexai%") and result = "google-ai") or
  (moduleName.matches("transformers%") and result = "huggingface") or
  (moduleName.matches("huggingface%") and result = "huggingface") or
  (moduleName.matches("llama_index%") and result = "llamaindex") or
  (moduleName.matches("autogen%") and result = "autogen") or
  (moduleName.matches("crewai%") and result = "crewai") or
  (moduleName.matches("mcp%") and result = "mcp") or
  (moduleName.matches("modelcontextprotocol%") and result = "mcp") or
  (moduleName.matches("torch%") and result = "pytorch") or
  (moduleName.matches("tensorflow%") and result = "tensorflow") or
  (moduleName.matches("boto3%") and result = "aws-bedrock") or
  (moduleName.matches("azure%") and result = "azure-ai") or
  (moduleName.matches("cohere%") and result = "cohere") or
  (moduleName.matches("groq%") and result = "groq") or
  (moduleName.matches("ollama%") and result = "ollama") or
  (not (
    moduleName.matches("openai%") or moduleName.matches("anthropic%") or
    moduleName.matches("langchain%") or moduleName.matches("google%") or
    moduleName.matches("transformers%") or moduleName.matches("mcp%")
  ) and result = "other-ai")
}

from Import imp, string moduleName, string category
where 
  moduleName = imp.getImportedModuleName() and
  isAiSdkModule(moduleName) and
  category = getSdkCategory(moduleName)
select imp, "AI SDK import detected: " + moduleName + " (category: " + category + ")"
