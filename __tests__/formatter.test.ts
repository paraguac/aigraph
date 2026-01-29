/**
 * AIGraph Scanner - Tests for Output Formatter
 */

import { formatAsJson, formatAsMarkdown, formatAsText, formatResults } from '../src/formatter';
import { ScanResults, Detection, Violation } from '../src/types';

describe('Output Formatter', () => {
  const createMockResults = (
    detections: Partial<Detection>[] = [],
    violations: Partial<Violation>[] = []
  ): ScanResults => ({
    detections: detections.map(d => ({
      category: 'model',
      name: 'gpt-4',
      file: 'test.py',
      line: 1,
      snippet: '> 1: model = "gpt-4"',
      confidence: 'high',
      ...d,
    })) as Detection[],
    violations: violations.map(v => ({
      detection: {
        category: 'model',
        name: 'llama',
        file: 'test.py',
        line: 1,
        snippet: '> 1: model = "llama"',
        confidence: 'high',
      },
      rule: 'not-allowed',
      message: 'AI model "llama" is not in the allowlist',
      ...v,
    })) as Violation[],
    summary: {
      totalFiles: 10,
      filesScanned: 10,
      totalDetections: detections.length,
      totalViolations: violations.length,
      detectionsByCategory: {
        'model': detections.filter(d => (d.category || 'model') === 'model').length,
        'framework': detections.filter(d => d.category === 'framework').length,
        'platform': detections.filter(d => d.category === 'platform').length,
        'mcp-server': detections.filter(d => d.category === 'mcp-server').length,
        'mcp-tool': detections.filter(d => d.category === 'mcp-tool').length,
        'api-endpoint': detections.filter(d => d.category === 'api-endpoint').length,
        'infrastructure': detections.filter(d => d.category === 'infrastructure').length,
      },
      violationsByCategory: {
        'model': violations.length,
        'framework': 0,
        'platform': 0,
        'mcp-server': 0,
        'mcp-tool': 0,
        'api-endpoint': 0,
        'infrastructure': 0,
      },
    },
  });

  describe('JSON Format', () => {
    test('outputs valid JSON', () => {
      const results = createMockResults([{ name: 'gpt-4' }]);
      const output = formatAsJson(results);
      
      const parsed = JSON.parse(output);
      expect(parsed.detections).toHaveLength(1);
      expect(parsed.summary.filesScanned).toBe(10);
    });

    test('includes all detections and violations', () => {
      const results = createMockResults(
        [{ name: 'gpt-4' }, { name: 'claude' }],
        [{ detection: { name: 'llama' } as Detection }]
      );
      const output = formatAsJson(results);
      
      const parsed = JSON.parse(output);
      expect(parsed.detections).toHaveLength(2);
      expect(parsed.violations).toHaveLength(1);
    });
  });

  describe('Markdown Format', () => {
    test('includes summary table', () => {
      const results = createMockResults([{ name: 'gpt-4' }]);
      const output = formatAsMarkdown(results);
      
      expect(output).toContain('# AIGraph Scan Results');
      expect(output).toContain('## Summary');
      expect(output).toContain('Files Scanned');
      expect(output).toContain('Total Detections');
    });

    test('shows violations with details', () => {
      const results = createMockResults([], [{
        detection: {
          category: 'model',
          name: 'llama',
          file: 'test.py',
          line: 5,
          snippet: '> 5: model = "llama"',
          confidence: 'high',
        } as Detection,
        rule: 'not-allowed',
        message: 'AI model "llama" is not in the allowlist',
      }]);
      const output = formatAsMarkdown(results);
      
      expect(output).toContain('Policy Violations');
      expect(output).toContain('llama');
      expect(output).toContain('not-allowed');
      expect(output).toContain('test.py');
    });

    test('shows no violations message when clean', () => {
      const results = createMockResults([{ name: 'gpt-4' }], []);
      const output = formatAsMarkdown(results);
      
      expect(output).toContain('No Policy Violations');
    });

    test('groups detections by category', () => {
      const results = createMockResults([
        { category: 'model', name: 'gpt-4' },
        { category: 'framework', name: 'langchain' },
      ]);
      const output = formatAsMarkdown(results);
      
      expect(output).toContain('AI Model');
      expect(output).toContain('AI Framework');
    });
  });

  describe('Text Format', () => {
    test('outputs plain text summary', () => {
      const results = createMockResults([{ name: 'gpt-4' }]);
      const output = formatAsText(results);
      
      expect(output).toContain('=== AIGraph Scan Results ===');
      expect(output).toContain('SUMMARY');
      expect(output).toContain('Files Scanned: 10');
    });

    test('lists violations with numbered entries', () => {
      const results = createMockResults([], [{
        detection: { name: 'llama' } as Detection,
        message: 'AI model "llama" is not in the allowlist',
      }]);
      const output = formatAsText(results);
      
      expect(output).toContain('POLICY VIOLATIONS');
      expect(output).toContain('[1]');
      expect(output).toContain('llama');
    });

    test('shows no violations message when clean', () => {
      const results = createMockResults([{ name: 'gpt-4' }], []);
      const output = formatAsText(results);
      
      expect(output).toContain('No policy violations found');
    });
  });

  describe('Format Selection', () => {
    test('formatResults selects correct formatter', () => {
      const results = createMockResults();
      
      const jsonOutput = formatResults(results, 'json');
      const markdownOutput = formatResults(results, 'markdown');
      const textOutput = formatResults(results, 'text');
      
      expect(() => JSON.parse(jsonOutput)).not.toThrow();
      expect(markdownOutput).toContain('#');
      expect(textOutput).toContain('===');
    });
  });
});
