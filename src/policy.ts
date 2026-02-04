/**
 * AIGraph Scanner - Policy Enforcement Module
 * 
 * This module handles loading spec files and enforcing allow/deny policies.
 */

import * as fs from 'fs';
import * as path from 'path';
import * as yaml from 'js-yaml';
import { 
  AIGraphSpec, 
  Detection, 
  Violation, 
  PolicyRule, 
  DetectionCategory,
  ScanResults 
} from './types';

/**
 * Default spec when no spec file is provided
 */
const DEFAULT_SPEC: AIGraphSpec = {
  version: '1.0',
  policies: {}, // Empty policies means everything is allowed
};

/**
 * Policy Enforcer class
 */
export class PolicyEnforcer {
  private spec: AIGraphSpec;

  constructor(spec: AIGraphSpec = DEFAULT_SPEC) {
    this.spec = spec;
  }

  /**
   * Load spec from a file. If specPath is undefined, returns default spec.
   */
  static async loadSpec(specPath: string | undefined): Promise<AIGraphSpec> {
    if (!specPath) {
      return DEFAULT_SPEC;
    }

    const absolutePath = path.resolve(specPath);
    
    try {
      const content = await fs.promises.readFile(absolutePath, 'utf-8');
      const ext = path.extname(absolutePath).toLowerCase();
      
      let parsed: unknown;
      if (ext === '.json') {
        parsed = JSON.parse(content);
      } else {
        // Default to YAML
        parsed = yaml.load(content);
      }

      return PolicyEnforcer.validateSpec(parsed);
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
        console.log(`Spec file not found at ${specPath}, using default (allow all)`);
        return DEFAULT_SPEC;
      }
      throw new Error(`Failed to load spec file: ${(error as Error).message}`);
    }
  }

  /**
   * Validate and normalize spec structure
   */
  private static validateSpec(parsed: unknown): AIGraphSpec {
    if (!parsed || typeof parsed !== 'object') {
      throw new Error('Invalid spec file: must be an object');
    }

    const spec = parsed as Record<string, unknown>;
    
    return {
      version: String(spec.version || '1.0'),
      policies: PolicyEnforcer.validatePolicies(spec.policies),
    };
  }

  /**
   * Validate policies structure
   */
  private static validatePolicies(policies: unknown): AIGraphSpec['policies'] {
    if (!policies || typeof policies !== 'object') {
      return {};
    }

    const result: AIGraphSpec['policies'] = {};
    const policyObj = policies as Record<string, unknown>;

    const categoryMap: Record<string, keyof AIGraphSpec['policies']> = {
      models: 'models',
      frameworks: 'frameworks',
      platforms: 'platforms',
      mcpServers: 'mcpServers',
      mcpTools: 'mcpTools',
      // Allow kebab-case as well
      'mcp-servers': 'mcpServers',
      'mcp-tools': 'mcpTools',
    };

    for (const [key, mappedKey] of Object.entries(categoryMap)) {
      if (policyObj[key]) {
        result[mappedKey] = PolicyEnforcer.validatePolicyRule(policyObj[key], key);
      }
    }

    return result;
  }

  /**
   * Validate a single policy rule
   */
  private static validatePolicyRule(rule: unknown, name: string): PolicyRule {
    if (!rule || typeof rule !== 'object') {
      throw new Error(`Invalid policy rule for ${name}: must be an object`);
    }

    const ruleObj = rule as Record<string, unknown>;
    const mode = ruleObj.mode as string;

    if (!mode || (mode !== 'allowlist' && mode !== 'denylist')) {
      throw new Error(`Invalid policy rule for ${name}: mode must be 'allowlist' or 'denylist'`);
    }

    const items = ruleObj.items;
    if (!Array.isArray(items)) {
      throw new Error(`Invalid policy rule for ${name}: items must be an array`);
    }

    return {
      mode: mode as 'allowlist' | 'denylist',
      items: items.map(String),
      patterns: Array.isArray(ruleObj.patterns) ? ruleObj.patterns.map(String) : undefined,
    };
  }

  /**
   * Get the policy rule for a detection category
   */
  private getPolicyForCategory(category: DetectionCategory): PolicyRule | undefined {
    const categoryMap: Partial<Record<DetectionCategory, keyof AIGraphSpec['policies']>> = {
      'model': 'models',
      'framework': 'frameworks',
      'platform': 'platforms',
      'mcp-server': 'mcpServers',
      'mcp-tool': 'mcpTools',
      // Note: api-endpoint and infrastructure don't have policy rules yet
    };

    const policyKey = categoryMap[category];
    return policyKey ? this.spec.policies[policyKey] : undefined;
  }

  /**
   * Check if a detection matches a pattern
   */
  private matchesPattern(name: string, patterns: string[]): boolean {
    return patterns.some(pattern => {
      // Support wildcards
      if (pattern.includes('*')) {
        const regex = new RegExp('^' + pattern.replace(/\*/g, '.*') + '$', 'i');
        return regex.test(name);
      }
      // Exact match (case-insensitive)
      return name.toLowerCase() === pattern.toLowerCase();
    });
  }

  /**
   * Check if a detection is allowed
   */
  isAllowed(detection: Detection): { allowed: boolean; rule?: 'denied' | 'not-allowed' } {
    const policy = this.getPolicyForCategory(detection.category);

    // If no policy for this category, allow by default
    if (!policy) {
      return { allowed: true };
    }

    const allPatterns = [
      ...policy.items,
      ...(policy.patterns || []),
    ];

    const matches = this.matchesPattern(detection.name, allPatterns);

    if (policy.mode === 'allowlist') {
      // In allowlist mode, must match to be allowed
      return matches ? { allowed: true } : { allowed: false, rule: 'not-allowed' };
    } else {
      // In denylist mode, must NOT match to be allowed
      return matches ? { allowed: false, rule: 'denied' } : { allowed: true };
    }
  }

  /**
   * Enforce policies on scan results
   */
  enforce(results: ScanResults): ScanResults {
    const violations: Violation[] = [];

    for (const detection of results.detections) {
      const { allowed, rule } = this.isAllowed(detection);

      if (!allowed && rule) {
        violations.push({
          detection,
          rule,
          message: this.createViolationMessage(detection, rule),
        });
      }
    }

    // Update summary with all categories
    const violationsByCategory: Record<DetectionCategory, number> = {
      'model': 0,
      'framework': 0,
      'platform': 0,
      'mcp-server': 0,
      'mcp-tool': 0,
      'api-endpoint': 0,
      'infrastructure': 0,
    };
    
    for (const violation of violations) {
      if (violationsByCategory[violation.detection.category] !== undefined) {
        violationsByCategory[violation.detection.category]++;
      }
    }

    return {
      ...results,
      violations,
      summary: {
        ...results.summary,
        totalViolations: violations.length,
        violationsByCategory,
      },
    };
  }

  /**
   * Create a human-readable violation message
   */
  private createViolationMessage(detection: Detection, rule: 'denied' | 'not-allowed'): string {
    const categoryLabels: Record<DetectionCategory, string> = {
      'model': 'AI model',
      'framework': 'AI framework',
      'platform': 'AI platform',
      'mcp-server': 'MCP server',
      'mcp-tool': 'MCP tool',
      'api-endpoint': 'AI API endpoint',
      'infrastructure': 'AI infrastructure resource',
    };

    const categoryLabel = categoryLabels[detection.category] || detection.category;

    if (rule === 'denied') {
      return `${categoryLabel} "${detection.name}" is explicitly denied by policy`;
    } else {
      return `${categoryLabel} "${detection.name}" is not in the allowlist`;
    }
  }
}
