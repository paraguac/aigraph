/**
 * AIGraph Scanner - Tests for Policy Enforcement
 */

import { PolicyEnforcer } from '../src/policy';
import { AIGraphSpec, Detection, ScanResults, DetectionCategory } from '../src/types';

describe('Policy Enforcement', () => {
  const createDetection = (
    category: DetectionCategory,
    name: string
  ): Detection => ({
    category,
    name,
    file: 'test.py',
    line: 1,
    snippet: 'test snippet',
    confidence: 'high',
  });

  const createScanResults = (detections: Detection[]): ScanResults => ({
    detections,
    violations: [],
    summary: {
      totalFiles: 1,
      filesScanned: 1,
      totalDetections: detections.length,
      totalViolations: 0,
      detectionsByCategory: {
        'model': 0,
        'framework': 0,
        'platform': 0,
        'mcp-server': 0,
        'mcp-tool': 0,
      },
      violationsByCategory: {
        'model': 0,
        'framework': 0,
        'platform': 0,
        'mcp-server': 0,
        'mcp-tool': 0,
      },
    },
  });

  describe('Allowlist Mode', () => {
    const spec: AIGraphSpec = {
      version: '1.0',
      policies: {
        models: {
          mode: 'allowlist',
          items: ['gpt-4', 'claude'],
        },
      },
    };

    test('allows items in the allowlist', () => {
      const enforcer = new PolicyEnforcer(spec);
      const detection = createDetection('model', 'gpt-4');
      
      const result = enforcer.isAllowed(detection);
      expect(result.allowed).toBe(true);
    });

    test('blocks items not in the allowlist', () => {
      const enforcer = new PolicyEnforcer(spec);
      const detection = createDetection('model', 'llama');
      
      const result = enforcer.isAllowed(detection);
      expect(result.allowed).toBe(false);
      expect(result.rule).toBe('not-allowed');
    });

    test('allows items with wildcard patterns', () => {
      const specWithPatterns: AIGraphSpec = {
        version: '1.0',
        policies: {
          models: {
            mode: 'allowlist',
            items: [],
            patterns: ['gpt-*'],
          },
        },
      };

      const enforcer = new PolicyEnforcer(specWithPatterns);
      const detection = createDetection('model', 'gpt-4-turbo');
      
      const result = enforcer.isAllowed(detection);
      expect(result.allowed).toBe(true);
    });
  });

  describe('Denylist Mode', () => {
    const spec: AIGraphSpec = {
      version: '1.0',
      policies: {
        platforms: {
          mode: 'denylist',
          items: ['ollama', 'lmstudio'],
        },
      },
    };

    test('blocks items in the denylist', () => {
      const enforcer = new PolicyEnforcer(spec);
      const detection = createDetection('platform', 'ollama');
      
      const result = enforcer.isAllowed(detection);
      expect(result.allowed).toBe(false);
      expect(result.rule).toBe('denied');
    });

    test('allows items not in the denylist', () => {
      const enforcer = new PolicyEnforcer(spec);
      const detection = createDetection('platform', 'aws-bedrock');
      
      const result = enforcer.isAllowed(detection);
      expect(result.allowed).toBe(true);
    });
  });

  describe('No Policy (Allow All)', () => {
    const spec: AIGraphSpec = {
      version: '1.0',
      policies: {},
    };

    test('allows all detections when no policy is defined', () => {
      const enforcer = new PolicyEnforcer(spec);
      
      const modelDetection = createDetection('model', 'gpt-4');
      const frameworkDetection = createDetection('framework', 'langchain');
      
      expect(enforcer.isAllowed(modelDetection).allowed).toBe(true);
      expect(enforcer.isAllowed(frameworkDetection).allowed).toBe(true);
    });
  });

  describe('Enforce Method', () => {
    test('creates violations for blocked detections', () => {
      const spec: AIGraphSpec = {
        version: '1.0',
        policies: {
          models: {
            mode: 'allowlist',
            items: ['gpt-4'],
          },
        },
      };

      const enforcer = new PolicyEnforcer(spec);
      const detections = [
        createDetection('model', 'gpt-4'),
        createDetection('model', 'llama'),
        createDetection('model', 'claude'),
      ];

      const results = enforcer.enforce(createScanResults(detections));
      
      expect(results.violations.length).toBe(2);
      expect(results.violations[0].detection.name).toBe('llama');
      expect(results.violations[1].detection.name).toBe('claude');
    });

    test('updates summary with violation counts', () => {
      const spec: AIGraphSpec = {
        version: '1.0',
        policies: {
          frameworks: {
            mode: 'denylist',
            items: ['autogen'],
          },
        },
      };

      const enforcer = new PolicyEnforcer(spec);
      const detections = [
        createDetection('framework', 'autogen'),
        createDetection('framework', 'langchain'),
      ];

      const results = enforcer.enforce(createScanResults(detections));
      
      expect(results.summary.totalViolations).toBe(1);
      expect(results.summary.violationsByCategory['framework']).toBe(1);
    });
  });

  describe('Spec Loading', () => {
    test('returns default spec when file not found', async () => {
      const spec = await PolicyEnforcer.loadSpec('/nonexistent/path/.aigraph-spec.yml');
      
      expect(spec.version).toBe('1.0');
      expect(spec.policies).toEqual({});
    });
  });
});
