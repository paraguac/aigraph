/**
 * JavaScript Comments with AI Terms - False Positive Test
 * This file contains AI terms only in comments - should NOT be detected.
 */

// TODO: Migrate to gpt-4 for better results
// Consider using claude-3-sonnet for analysis
// LangChain integration might improve workflow

/**
 * Process user input
 * 
 * @param {string} input - User input
 * @returns {string} Processed output
 * 
 * NOTE: We evaluated these AI options:
 * - GPT-4: High cost, good quality
 * - Claude-3: Good balance
 * - LLaMA-2: Open source
 * - Mistral-7B: Fast inference
 * 
 * Decided to use rule-based approach instead.
 */
function processInput(input) {
  // Not using openai, anthropic, or any AI SDK
  // Just simple string manipulation
  // Even though we mention gpt-4 in comments
  return input.trim().toLowerCase();
}

// The following frameworks were considered but NOT used:
// - langchain
// - langgraph  
// - autogen
// - crewai
// - llamaindex

function calculateMetrics(data) {
  /* 
   * Multi-line comment mentioning AI:
   * We could use gemini-pro for this
   * Or maybe azure-openai service
   * AWS Bedrock was also an option
   * But we're using simple math instead
   */
  return data.length;
}

// No MCP servers used:
// - @modelcontextprotocol/server-filesystem
// - @modelcontextprotocol/server-github
// - @modelcontextprotocol/server-postgres

export { processInput, calculateMetrics };
