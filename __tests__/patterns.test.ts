/**
 * AIGraph Scanner - Tests for Pattern Detection
 */

import { MODEL_PATTERNS, FRAMEWORK_PATTERNS, PLATFORM_PATTERNS, MCP_SERVER_PATTERNS, MCP_TOOL_PATTERNS } from '../src/patterns';
import { DetectionPattern } from '../src/types';

describe('Pattern Detection', () => {
  // Helper to test if a pattern matches a string
  const testPatternMatch = (patterns: DetectionPattern[], name: string, testString: string, shouldMatch: boolean) => {
    const pattern = patterns.find(p => p.name === name);
    if (!pattern) {
      throw new Error(`Pattern not found: ${name}`);
    }

    const matches = pattern.patterns.some(regex => {
      regex.lastIndex = 0;
      return regex.test(testString);
    });

    if (shouldMatch) {
      expect(matches).toBe(true);
    } else {
      expect(matches).toBe(false);
    }
  };

  describe('AI Model Patterns', () => {
    test('detects GPT-4 model', () => {
      testPatternMatch(MODEL_PATTERNS, 'gpt-4', 'model = "gpt-4-turbo"', true);
      testPatternMatch(MODEL_PATTERNS, 'gpt-4', 'using model "gpt-4o"', true);
      testPatternMatch(MODEL_PATTERNS, 'gpt-4', 'random text', false);
    });

    test('detects Claude model', () => {
      testPatternMatch(MODEL_PATTERNS, 'claude', 'model = "claude-3-sonnet"', true);
      testPatternMatch(MODEL_PATTERNS, 'claude', 'claude-3.5-sonnet', true);
      testPatternMatch(MODEL_PATTERNS, 'claude', 'random text', false);
    });

    test('detects LLaMA model', () => {
      testPatternMatch(MODEL_PATTERNS, 'llama', 'using llama-2', true);
      testPatternMatch(MODEL_PATTERNS, 'llama', 'meta-llama/Llama-3', true);
      testPatternMatch(MODEL_PATTERNS, 'llama', 'codellama', true);
    });

    test('detects Mistral model', () => {
      testPatternMatch(MODEL_PATTERNS, 'mistral', '"mistral-7b"', true);
      testPatternMatch(MODEL_PATTERNS, 'mistral', 'mixtral-8x7b', true);
    });

    test('detects Gemini model', () => {
      testPatternMatch(MODEL_PATTERNS, 'gemini', 'model = "gemini-pro"', true);
      testPatternMatch(MODEL_PATTERNS, 'gemini', 'gemini-1.5-pro', true);
    });
  });

  describe('AI Framework Patterns', () => {
    test('detects LangChain', () => {
      testPatternMatch(FRAMEWORK_PATTERNS, 'langchain', 'from langchain import ChatOpenAI', true);
      testPatternMatch(FRAMEWORK_PATTERNS, 'langchain', 'require("langchain")', true);
      testPatternMatch(FRAMEWORK_PATTERNS, 'langchain', '@langchain/core', true);
    });

    test('detects LangGraph', () => {
      testPatternMatch(FRAMEWORK_PATTERNS, 'langgraph', 'from langgraph.graph import Graph', true);
      testPatternMatch(FRAMEWORK_PATTERNS, 'langgraph', '@langchain/langgraph', true);
    });

    test('detects AutoGen', () => {
      testPatternMatch(FRAMEWORK_PATTERNS, 'autogen', 'from autogen import AssistantAgent', true);
      testPatternMatch(FRAMEWORK_PATTERNS, 'autogen', 'import autogen', true);
    });

    test('detects CrewAI', () => {
      testPatternMatch(FRAMEWORK_PATTERNS, 'crewai', 'from crewai import Agent', true);
    });

    test('detects LlamaIndex', () => {
      testPatternMatch(FRAMEWORK_PATTERNS, 'llamaindex', 'from llama_index import VectorStoreIndex', true);
      testPatternMatch(FRAMEWORK_PATTERNS, 'llamaindex', 'llama-index', true);
    });

    test('detects Semantic Kernel', () => {
      testPatternMatch(FRAMEWORK_PATTERNS, 'semantic-kernel', 'from semantic_kernel import Kernel', true);
      testPatternMatch(FRAMEWORK_PATTERNS, 'semantic-kernel', 'Microsoft.SemanticKernel', true);
    });
  });

  describe('AI Platform Patterns', () => {
    test('detects AWS Bedrock', () => {
      testPatternMatch(PLATFORM_PATTERNS, 'aws-bedrock', 'bedrock-runtime', true);
      testPatternMatch(PLATFORM_PATTERNS, 'aws-bedrock', 'BedrockRuntime.InvokeModel', true);
      testPatternMatch(PLATFORM_PATTERNS, 'aws-bedrock', 'amazon.titan-text', true);
    });

    test('detects Azure OpenAI', () => {
      testPatternMatch(PLATFORM_PATTERNS, 'azure-openai', 'from azure.openai import AzureOpenAI', true);
      testPatternMatch(PLATFORM_PATTERNS, 'azure-openai', 'openai.azure.com', true);
      testPatternMatch(PLATFORM_PATTERNS, 'azure-openai', 'AZURE_OPENAI_API_KEY', true);
    });

    test('detects Azure AI Foundry', () => {
      testPatternMatch(PLATFORM_PATTERNS, 'azure-ai-foundry', 'azure-ai-inference', true);
      testPatternMatch(PLATFORM_PATTERNS, 'azure-ai-foundry', 'ai.azure.com', true);
    });

    test('detects Google Vertex AI', () => {
      testPatternMatch(PLATFORM_PATTERNS, 'gcp-vertex-ai', 'google-cloud-aiplatform', true);
      testPatternMatch(PLATFORM_PATTERNS, 'gcp-vertex-ai', 'vertexai.generative_models', true);
    });

    test('detects Hugging Face Inference', () => {
      testPatternMatch(PLATFORM_PATTERNS, 'huggingface-inference', 'from huggingface_hub import InferenceClient', true);
      testPatternMatch(PLATFORM_PATTERNS, 'huggingface-inference', '@huggingface/inference', true);
    });

    test('detects Ollama', () => {
      testPatternMatch(PLATFORM_PATTERNS, 'ollama', 'import ollama', true);
      testPatternMatch(PLATFORM_PATTERNS, 'ollama', 'localhost:11434', true);
    });

    test('detects Groq', () => {
      testPatternMatch(PLATFORM_PATTERNS, 'groq', 'from groq import Groq', true);
      testPatternMatch(PLATFORM_PATTERNS, 'groq', 'api.groq.com', true);
    });
  });

  describe('MCP Server Patterns', () => {
    test('detects generic MCP server', () => {
      testPatternMatch(MCP_SERVER_PATTERNS, 'mcp-server-generic', 'new McpServer()', true);
      testPatternMatch(MCP_SERVER_PATTERNS, 'mcp-server-generic', '"mcpServers":', true);
      testPatternMatch(MCP_SERVER_PATTERNS, 'mcp-server-generic', '@modelcontextprotocol/server', true);
    });

    test('detects filesystem MCP server', () => {
      testPatternMatch(MCP_SERVER_PATTERNS, 'mcp-server-filesystem', 'mcp-server-filesystem', true);
      testPatternMatch(MCP_SERVER_PATTERNS, 'mcp-server-filesystem', '@modelcontextprotocol/server-filesystem', true);
    });

    test('detects GitHub MCP server', () => {
      testPatternMatch(MCP_SERVER_PATTERNS, 'mcp-server-github', 'mcp-server-github', true);
    });

    test('detects Puppeteer MCP server', () => {
      testPatternMatch(MCP_SERVER_PATTERNS, 'mcp-server-puppeteer', 'mcp-server-puppeteer', true);
    });
  });

  describe('MCP Tool Patterns', () => {
    test('detects MCP SDK', () => {
      testPatternMatch(MCP_TOOL_PATTERNS, 'mcp-sdk', '@modelcontextprotocol/sdk', true);
      testPatternMatch(MCP_TOOL_PATTERNS, 'mcp-sdk', 'mcp-python-sdk', true);
    });

    test('detects MCP Client', () => {
      testPatternMatch(MCP_TOOL_PATTERNS, 'mcp-client', 'McpClient', true);
      testPatternMatch(MCP_TOOL_PATTERNS, 'mcp-client', '@modelcontextprotocol/client', true);
    });
  });
});
