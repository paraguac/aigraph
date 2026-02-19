/**
 * LangChain TypeScript Usage - True Positive Test
 */

import { ChatOpenAI } from '@langchain/openai';
import { ChatAnthropic } from '@langchain/anthropic';
import { ChatPromptTemplate } from '@langchain/core/prompts';
import { StringOutputParser } from '@langchain/core/output_parsers';

// Initialize models
const openaiModel = new ChatOpenAI({
  modelName: 'gpt-4',
  temperature: 0,
});

const anthropicModel = new ChatAnthropic({
  modelName: 'claude-3-sonnet-20240229',
  temperature: 0,
});

// Create a simple chain
const prompt = ChatPromptTemplate.fromTemplate(
  'Tell me about {topic}'
);

const chain = prompt.pipe(openaiModel).pipe(new StringOutputParser());

export async function askQuestion(topic: string) {
  const result = await chain.invoke({ topic });
  return result;
}

// Use Claude for a different task
const claudeChain = prompt.pipe(anthropicModel).pipe(new StringOutputParser());

export async function askClaude(topic: string) {
  const result = await claudeChain.invoke({ topic });
  return result;
}
