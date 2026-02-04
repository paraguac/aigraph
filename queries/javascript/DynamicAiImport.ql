/**
 * @name Dynamic AI Import Detection (JavaScript/TypeScript)
 * @description Detects dynamic imports of AI libraries
 * @kind problem
 * @problem.severity warning
 * @id aigraph/javascript/dynamic-ai-import
 * @tags ai
 *       security
 *       aigraph
 * @precision medium
 */

import javascript

/**
 * AI module names that might be dynamically imported
 */
predicate isAiModuleName(string name) {
  name = "openai" or
  name = "@anthropic-ai/sdk" or
  name = "langchain" or
  name.matches("@langchain/%") or
  name = "@google/generative-ai" or
  name = "@huggingface/inference" or
  name = "cohere-ai" or
  name = "replicate" or
  name = "together-ai" or
  name = "groq-sdk" or
  name = "@modelcontextprotocol/sdk" or
  name = "ollama" or
  name = "ai" or
  name.matches("@ai-sdk/%")
}

// Detect dynamic imports: import('module')
from DynamicImportExpr dynImport, string moduleName
where
  moduleName = dynImport.getSource().(StringLiteral).getValue() and
  isAiModuleName(moduleName)
select dynImport, "Dynamic import of AI module detected: " + moduleName

// Detect require with variable (potential dynamic require)
from CallExpr call, VarAccess varAccess
where
  call.getCalleeName() = "require" and
  varAccess = call.getArgument(0) and
  // This is a heuristic - we flag requires with variables as potentially dynamic
  exists(string comment | 
    comment = call.getParent().getAChild().toString() and
    (comment.matches("%openai%") or comment.matches("%anthropic%") or comment.matches("%langchain%"))
  )
select call, "Potentially dynamic AI module require detected"
