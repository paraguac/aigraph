/**
 * @name AI Model Name Detection
 * @description Detects hardcoded AI model names in Python code (not in comments)
 * @kind problem
 * @problem.severity recommendation
 * @id aigraph/python/ai-model-name
 * @tags ai
 *       security
 *       aigraph
 * @precision high
 */

import python
import semmle.python.dataflow.new.DataFlow

/**
 * Known AI model name patterns
 */
predicate isAiModelName(string value) {
  // OpenAI models
  value.regexpMatch("(?i)gpt-4.*") or
  value.regexpMatch("(?i)gpt-3\\.5.*") or
  value.regexpMatch("(?i)o1(-preview|-mini)?") or
  value.regexpMatch("(?i)text-embedding.*") or
  value.regexpMatch("(?i)dall-e.*") or
  value.regexpMatch("(?i)whisper.*") or
  value.regexpMatch("(?i)tts-1.*") or
  // Anthropic models
  value.regexpMatch("(?i)claude-3.*") or
  value.regexpMatch("(?i)claude-2.*") or
  value.regexpMatch("(?i)claude-instant.*") or
  // Google models
  value.regexpMatch("(?i)gemini.*") or
  value.regexpMatch("(?i)palm.*") or
  value.regexpMatch("(?i)text-bison.*") or
  value.regexpMatch("(?i)chat-bison.*") or
  // Meta models
  value.regexpMatch("(?i)llama-?[23].*") or
  value.regexpMatch("(?i)codellama.*") or
  value.regexpMatch("(?i)meta-llama.*") or
  // Mistral models
  value.regexpMatch("(?i)mistral.*") or
  value.regexpMatch("(?i)mixtral.*") or
  // Cohere models
  value.regexpMatch("(?i)command-r.*") or
  // Other models
  value.regexpMatch("(?i)falcon-.*") or
  value.regexpMatch("(?i)phi-[23].*") or
  value.regexpMatch("(?i)stable-diffusion.*") or
  value.regexpMatch("(?i)sdxl.*")
}

/**
 * Get the provider for a model name
 */
string getModelProvider(string modelName) {
  (modelName.regexpMatch("(?i)gpt.*|o1.*|text-embedding.*|dall-e.*|whisper.*|tts-1.*") and result = "openai") or
  (modelName.regexpMatch("(?i)claude.*") and result = "anthropic") or
  (modelName.regexpMatch("(?i)gemini.*|palm.*|bison.*") and result = "google") or
  (modelName.regexpMatch("(?i)llama.*|codellama.*|meta-llama.*") and result = "meta") or
  (modelName.regexpMatch("(?i)mistral.*|mixtral.*") and result = "mistral") or
  (modelName.regexpMatch("(?i)command.*") and result = "cohere") or
  (modelName.regexpMatch("(?i)falcon.*") and result = "tii") or
  (modelName.regexpMatch("(?i)phi.*") and result = "microsoft") or
  (modelName.regexpMatch("(?i)stable.*|sdxl.*") and result = "stability-ai") or
  (not (
    modelName.regexpMatch("(?i)gpt.*|claude.*|gemini.*|llama.*|mistral.*")
  ) and result = "unknown")
}

from StringLiteral str, string value, string provider
where
  value = str.getText() and
  isAiModelName(value) and
  provider = getModelProvider(value) and
  // Exclude strings that are in comments (StringLiteral won't match comments)
  not str.getParent() instanceof Comment
select str, "AI model name detected: " + value + " (provider: " + provider + ")"
