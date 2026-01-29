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
import semmle.python.dataflow.new.DataFlow
import semmle.python.ApiGraphs

/**
 * AI module names that might be dynamically imported
 */
predicate isAiModuleName(string name) {
  name = "openai" or
  name = "anthropic" or
  name = "langchain" or
  name = "langgraph" or
  name = "langsmith" or
  name = "transformers" or
  name = "huggingface_hub" or
  name = "google.generativeai" or
  name = "vertexai" or
  name = "cohere" or
  name = "replicate" or
  name = "together" or
  name = "groq" or
  name = "llama_index" or
  name = "autogen" or
  name = "crewai" or
  name = "dspy" or
  name = "instructor" or
  name = "mcp" or
  name = "ollama" or
  name = "torch" or
  name = "tensorflow"
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
