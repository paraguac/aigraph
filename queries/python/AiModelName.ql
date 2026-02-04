/**
 * @name AI Model Name Detection
 * @description Detects hardcoded AI model names in Python code
 * @kind problem
 * @problem.severity recommendation
 * @id aigraph/python/ai-model-name
 * @tags ai
 *       security
 *       aigraph
 * @precision high
 */

import python

/**
 * Known AI model name patterns
 */
predicate isAiModelName(StringLiteral str) {
  exists(string value | 
    value = str.getText() and
    (
      // OpenAI models
      value.regexpMatch("(?i).*gpt-4.*") or
      value.regexpMatch("(?i).*gpt-3\\.5.*") or
      value.regexpMatch("(?i).*o1(-preview|-mini)?.*") or
      value.regexpMatch("(?i).*text-embedding.*") or
      value.regexpMatch("(?i).*dall-e.*") or
      value.regexpMatch("(?i).*whisper.*") or
      value.regexpMatch("(?i).*tts-1.*") or
      // Anthropic models
      value.regexpMatch("(?i).*claude-3.*") or
      value.regexpMatch("(?i).*claude-2.*") or
      value.regexpMatch("(?i).*claude-instant.*") or
      // Google models
      value.regexpMatch("(?i).*gemini.*") or
      value.regexpMatch("(?i).*palm-.*") or
      value.regexpMatch("(?i).*text-bison.*") or
      value.regexpMatch("(?i).*chat-bison.*") or
      // Meta models
      value.regexpMatch("(?i).*llama-?[23].*") or
      value.regexpMatch("(?i).*codellama.*") or
      value.regexpMatch("(?i).*meta-llama.*") or
      // Mistral models
      value.regexpMatch("(?i).*mistral-.*") or
      value.regexpMatch("(?i).*mixtral.*") or
      // Cohere models
      value.regexpMatch("(?i).*command-r.*") or
      // Other models
      value.regexpMatch("(?i).*falcon-[0-9].*") or
      value.regexpMatch("(?i).*phi-[23].*") or
      value.regexpMatch("(?i).*stable-diffusion.*") or
      value.regexpMatch("(?i).*sdxl.*")
    )
  )
}

from StringLiteral str
where isAiModelName(str)
select str, "AI model name detected: " + str.getText()
