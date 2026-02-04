/**
 * AIGraph Scanner - Tests for File Scanner
 */

import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import { FileScanner, FileScannerOptions } from '../src/scanners/file-scanner';
import { Detection } from '../src/types';

describe('File Scanner', () => {
  let tempDir: string;
  
  // Default options to disable CodeQL for faster tests
  const defaultOptions: FileScannerOptions = {
    useCodeQL: false, // Disable CodeQL for unit tests
  };

  beforeEach(async () => {
    // Create a temporary directory for test files
    tempDir = await fs.promises.mkdtemp(path.join(os.tmpdir(), 'aigraph-test-'));
  });

  afterEach(async () => {
    // Clean up temporary directory
    await fs.promises.rm(tempDir, { recursive: true, force: true });
  });

  const createTestFile = async (filename: string, content: string) => {
    const filePath = path.join(tempDir, filename);
    const dir = path.dirname(filePath);
    await fs.promises.mkdir(dir, { recursive: true });
    await fs.promises.writeFile(filePath, content);
    return filePath;
  };

  describe('File Discovery', () => {
    test('finds Python files', async () => {
      await createTestFile('app.py', 'print("hello")');
      await createTestFile('lib/utils.py', 'def helper(): pass');
      
      const scanner = new FileScanner(tempDir, undefined, defaultOptions);
      const files = await scanner.getFilesToScan();
      
      expect(files.length).toBe(2);
      expect(files.some(f => f.endsWith('app.py'))).toBe(true);
      expect(files.some(f => f.endsWith('utils.py'))).toBe(true);
    });

    test('finds JavaScript/TypeScript files', async () => {
      await createTestFile('index.js', 'console.log("hi")');
      await createTestFile('src/app.ts', 'const x = 1');
      await createTestFile('components/Button.tsx', 'export const Button = () => {}');
      
      const scanner = new FileScanner(tempDir, undefined, defaultOptions);
      const files = await scanner.getFilesToScan();
      
      expect(files.length).toBe(3);
    });

    test('ignores node_modules', async () => {
      await createTestFile('index.js', 'console.log("hi")');
      await createTestFile('node_modules/lib/index.js', 'module.exports = {}');
      
      const scanner = new FileScanner(tempDir, undefined, defaultOptions);
      const files = await scanner.getFilesToScan();
      
      expect(files.length).toBe(1);
      expect(files.every(f => !f.includes('node_modules'))).toBe(true);
    });
  });

  describe('Pattern Detection in Files', () => {
    test('detects LangChain import in Python', async () => {
      await createTestFile('app.py', `
from langchain import ChatOpenAI
from langchain.agents import initialize_agent

llm = ChatOpenAI(model="gpt-4")
`);
      
      const scanner = new FileScanner(tempDir, undefined, defaultOptions);
      const results = await scanner.scan();
      
      expect(results.detections.length).toBeGreaterThan(0);
      expect(results.detections.some((d: Detection) => d.name === 'langchain')).toBe(true);
      expect(results.detections.some((d: Detection) => d.name === 'gpt-4')).toBe(true);
    });

    test('detects AWS Bedrock usage', async () => {
      await createTestFile('bedrock.py', `
import boto3

bedrock = boto3.client('bedrock-runtime')
response = bedrock.invoke_model(modelId='amazon.titan-text-express')
`);
      
      const scanner = new FileScanner(tempDir, undefined, defaultOptions);
      const results = await scanner.scan();
      
      expect(results.detections.some((d: Detection) => d.name === 'aws-bedrock')).toBe(true);
    });

    test('detects Azure OpenAI usage', async () => {
      await createTestFile('azure_ai.py', `
from azure.openai import AzureOpenAI

client = AzureOpenAI(
    api_key=os.environ["AZURE_OPENAI_API_KEY"],
)
`);
      
      const scanner = new FileScanner(tempDir, undefined, defaultOptions);
      const results = await scanner.scan();
      
      expect(results.detections.some((d: Detection) => d.name === 'azure-openai')).toBe(true);
    });

    test('detects MCP server in package.json', async () => {
      await createTestFile('package.json', JSON.stringify({
        dependencies: {
          '@modelcontextprotocol/server-filesystem': '^1.0.0',
          '@modelcontextprotocol/sdk': '^0.5.0',
        }
      }, null, 2));
      
      const scanner = new FileScanner(tempDir, undefined, defaultOptions);
      const results = await scanner.scan();
      
      expect(results.detections.some((d: Detection) => d.name === 'mcp-server-filesystem')).toBe(true);
      expect(results.detections.some((d: Detection) => d.name === 'mcp-sdk')).toBe(true);
    });

    test('detects multiple frameworks', async () => {
      await createTestFile('agents.py', `
from langchain import LLMChain
from langgraph.graph import StateGraph
from autogen import AssistantAgent, UserProxyAgent

# Multi-agent setup
`);
      
      const scanner = new FileScanner(tempDir, undefined, defaultOptions);
      const results = await scanner.scan();
      
      expect(results.detections.some((d: Detection) => d.name === 'langchain')).toBe(true);
      expect(results.detections.some((d: Detection) => d.name === 'langgraph')).toBe(true);
      expect(results.detections.some((d: Detection) => d.name === 'autogen')).toBe(true);
    });
  });

  describe('Scan Summary', () => {
    test('provides accurate detection counts', async () => {
      await createTestFile('app.py', `
from langchain import ChatOpenAI
model = "gpt-4"
`);
      await createTestFile('api.py', `
import ollama
`);
      
      const scanner = new FileScanner(tempDir, undefined, defaultOptions);
      const results = await scanner.scan();
      
      expect(results.summary.filesScanned).toBe(2);
      expect(results.summary.totalDetections).toBeGreaterThan(0);
    });

    test('deduplicates same detection on same line', async () => {
      await createTestFile('app.py', `
model = "gpt-4"
`);
      
      const scanner = new FileScanner(tempDir, undefined, defaultOptions);
      const results = await scanner.scan();
      
      const gpt4Detections = results.detections.filter((d: Detection) => 
        d.name === 'gpt-4' && d.line === 2
      );
      
      expect(gpt4Detections.length).toBeLessThanOrEqual(1);
    });
  });
});
