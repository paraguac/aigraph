/**
 * @name Dynamic AI Import Detection
 * @description Detects dynamic imports of AI libraries using importlib or __import__
 * @kind problem
 * @problem.severity warning
 * @id aigraph/python/dynamic-ai-import
 * @tags ai
 *       security
 *       aigraph
 * @precision medium
 */

import python

/**
 * AI module names that might be dynamically imported
 */
bindingset[moduleName]
predicate isAiModuleName(string moduleName) {
  moduleName = "openai" or
  moduleName = "anthropic" or
  moduleName = "langchain" or
  moduleName = "langgraph" or
  moduleName = "langsmith" or
  moduleName = "transformers" or
  moduleName = "huggingface_hub" or
  moduleName = "google.generativeai" or
  moduleName = "vertexai" or
  moduleName = "cohere" or
  moduleName = "replicate" or
  moduleName = "together" or
  moduleName = "groq" or
  moduleName = "llama_index" or
  moduleName = "autogen" or
  moduleName = "crewai" or
  moduleName = "dspy" or
  moduleName = "instructor" or
  moduleName = "mcp" or
  moduleName = "ollama" or
  moduleName = "torch" or
  moduleName = "tensorflow"
}

// Detect importlib.import_module calls with AI module names
from Call call, StringLiteral arg, string moduleName
where
  (
    call.getFunc().(Attribute).getName() = "import_module" or
    call.getFunc().(Name).getId() = "__import__"
  ) and
  arg = call.getArg(0) and
  moduleName = arg.getText() and
  isAiModuleName(moduleName)
select call, "Dynamic import of AI module detected: " + moduleName
