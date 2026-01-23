/**
 * AIGraph Scanner - Tests for Core Module
 */

import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import { scan, ScanOptions, ScanOutput } from '../src/core';

describe('Core Module', () => {
  let tempDir: string;

  beforeEach(async () => {
    // Create a temporary directory for test files
    tempDir = await fs.promises.mkdtemp(path.join(os.tmpdir(), 'aigraph-core-test-'));
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

  describe('scan function', () => {
    test('scans a local directory and returns results', async () => {
      await createTestFile('app.py', `
from langchain import ChatOpenAI
model = "gpt-4"
`);
      
      const result = await scan({
        target: tempDir,
        outputFormat: 'json',
      });

      expect(result.results).toBeDefined();
      expect(result.formattedOutput).toBeDefined();
      expect(result.results.detections.length).toBeGreaterThan(0);
      expect(result.results.detections.some(d => d.name === 'langchain')).toBe(true);
      expect(result.results.detections.some(d => d.name === 'gpt-4')).toBe(true);
    });

    test('returns violations when spec file has policies', async () => {
      await createTestFile('app.py', `
model = "gpt-4"
`);
      await createTestFile('.aigraph-spec.yml', `
version: "1.0"
policies:
  models:
    mode: allowlist
    items:
      - gpt-3.5
`);
      
      const result = await scan({
        target: tempDir,
        specFile: path.join(tempDir, '.aigraph-spec.yml'),
        outputFormat: 'text',
      });

      expect(result.hasViolations).toBe(true);
      expect(result.violationCount).toBeGreaterThan(0);
      expect(result.results.violations.some(v => v.detection.name === 'gpt-4')).toBe(true);
    });

    test('supports different output formats', async () => {
      await createTestFile('app.py', `
model = "gpt-4"
`);
      
      const jsonResult = await scan({
        target: tempDir,
        outputFormat: 'json',
      });
      
      const textResult = await scan({
        target: tempDir,
        outputFormat: 'text',
      });
      
      const markdownResult = await scan({
        target: tempDir,
        outputFormat: 'markdown',
      });

      // JSON output should be valid JSON
      expect(() => JSON.parse(jsonResult.formattedOutput)).not.toThrow();
      
      // Text output should contain plain text summary
      expect(textResult.formattedOutput).toContain('AIGraph Scan Results');
      
      // Markdown output should contain markdown headers
      expect(markdownResult.formattedOutput).toContain('# AIGraph Scan Results');
    });

    test('log function is called with progress messages', async () => {
      await createTestFile('app.py', `print("hello")`);
      
      const logMessages: string[] = [];
      
      await scan({
        target: tempDir,
        log: (msg) => logMessages.push(msg),
      });

      expect(logMessages.length).toBeGreaterThan(0);
      expect(logMessages.some(m => m.includes('Scan path'))).toBe(true);
      expect(logMessages.some(m => m.includes('Scanning files'))).toBe(true);
    });

    test('returns no violations when all detections are allowed', async () => {
      await createTestFile('app.py', `
model = "gpt-4"
`);
      await createTestFile('.aigraph-spec.yml', `
version: "1.0"
policies:
  models:
    mode: allowlist
    items:
      - gpt-4
`);
      
      const result = await scan({
        target: tempDir,
        specFile: path.join(tempDir, '.aigraph-spec.yml'),
      });

      expect(result.hasViolations).toBe(false);
      expect(result.violationCount).toBe(0);
    });
  });
});
