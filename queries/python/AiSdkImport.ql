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

// Find Import statements with AI SDK modules
from Import imp
where
  exists(Alias a | a = imp.getAName() |
    exists(string modName | modName = a.getAsname().(Name).getId() or modName = a.getValue().(Name).getId() |
      modName.matches("openai%") or
      modName.matches("anthropic%") or
      modName.matches("langchain%") or
      modName.matches("langgraph%") or
      modName.matches("transformers%") or
      modName.matches("google%") or
      modName.matches("vertexai%") or
      modName.matches("llama_index%") or
      modName.matches("autogen%") or
      modName.matches("crewai%") or
      modName.matches("cohere%") or
      modName.matches("groq%") or
      modName.matches("together%") or
      modName.matches("mcp%") or
      modName.matches("ollama%") or
      modName.matches("azure%")
    )
  )
select imp, "AI SDK import detected"
