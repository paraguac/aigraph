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
 * Detect dynamic imports of AI modules
 */
from DynamicImportExpr dynImport, StringLiteral source
where
  source = dynImport.getSource() and
  (
    source.getValue() = "openai" or
    source.getValue() = "@anthropic-ai/sdk" or
    source.getValue() = "langchain" or
    source.getValue().matches("@langchain/%") or
    source.getValue() = "@google/generative-ai" or
    source.getValue() = "@huggingface/inference" or
    source.getValue() = "cohere-ai" or
    source.getValue() = "replicate" or
    source.getValue() = "groq-sdk" or
    source.getValue() = "@modelcontextprotocol/sdk" or
    source.getValue() = "ollama" or
    source.getValue() = "ai" or
    source.getValue().matches("@ai-sdk/%")
  )
select dynImport, "Dynamic import of AI module detected: " + source.getValue()
