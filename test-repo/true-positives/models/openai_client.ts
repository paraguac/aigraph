/**
 * OpenAI Node.js Client - True Positive Test
 * This file demonstrates OpenAI usage in JavaScript/TypeScript that SHOULD be detected.
 */

import OpenAI from 'openai';

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Use GPT-4 for chat
async function chatWithGPT4() {
  const response = await client.chat.completions.create({
    model: 'gpt-4',
    messages: [
      { role: 'system', content: 'You are a helpful assistant.' },
      { role: 'user', content: 'Hello!' }
    ],
  });
  return response.choices[0].message.content;
}

// Use GPT-4o (optimized)
async function chatWithGPT4o() {
  const response = await client.chat.completions.create({
    model: 'gpt-4o',
    messages: [{ role: 'user', content: 'Explain AI' }],
  });
  return response.choices[0].message.content;
}

// Use GPT-3.5 Turbo
async function chatWithGPT35() {
  const response = await client.chat.completions.create({
    model: 'gpt-3.5-turbo',
    messages: [{ role: 'user', content: 'Tell me a joke' }],
  });
  return response.choices[0].message.content;
}

// Use O1 model
async function useO1() {
  const response = await client.chat.completions.create({
    model: 'o1-preview',
    messages: [{ role: 'user', content: 'Solve this problem' }],
  });
  return response.choices[0].message.content;
}

// Generate embeddings
async function generateEmbeddings(text: string) {
  const response = await client.embeddings.create({
    model: 'text-embedding-3-small',
    input: text,
  });
  return response.data[0].embedding;
}

export { chatWithGPT4, chatWithGPT4o, chatWithGPT35, useO1, generateEmbeddings };
