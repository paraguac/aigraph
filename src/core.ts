/**
 * AIGraph Scanner - Core Module
 * 
 * This module provides the core scanning functionality that can be used
 * independently of the GitHub Action context. Use this for CLI or library usage.
 */

import { FileScanner } from './scanners';
import { PolicyEnforcer } from './policy';
import { formatResults } from './formatter';
import { parseGitHubRepo, cloneGitHubRepo, isGitHubRepoRef, CloneResult } from './github-repo';
import { ScannerConfig, ScanResults } from './types';

/**
 * Options for running the scanner
 */
export interface ScanOptions {
  /** Path to scan or GitHub repo reference (e.g., 'owner/repo' or 'owner/repo@branch') */
  target: string;
  /** Path to the spec file (default: '.aigraph-spec.yml') */
  specFile?: string;
  /** Output format (default: 'text') */
  outputFormat?: 'json' | 'markdown' | 'text';
  /** Whether to fail on violation (default: true) */
  failOnViolation?: boolean;
  /** Optional logging function */
  log?: (message: string) => void;
}

/**
 * Result of running the scanner
 */
export interface ScanOutput {
  /** The scan results */
  results: ScanResults;
  /** Formatted output string */
  formattedOutput: string;
  /** Whether there were violations */
  hasViolations: boolean;
  /** Number of violations */
  violationCount: number;
}

/**
 * Run the AIGraph scanner on a target path or GitHub repository.
 * 
 * This is the main entry point for programmatic usage of the scanner.
 * 
 * @example
 * ```typescript
 * import { scan } from 'aigraph-scanner';
 * 
 * // Scan a local directory
 * const result = await scan({ target: './my-project' });
 * console.log(result.formattedOutput);
 * 
 * // Scan a GitHub repository
 * const result = await scan({ target: 'owner/repo@main' });
 * console.log(result.results.violations);
 * ```
 */
export async function scan(options: ScanOptions): Promise<ScanOutput> {
  const {
    target,
    specFile = '.aigraph-spec.yml',
    outputFormat = 'text',
    log = () => {},
  } = options;

  let scanPath = target;
  let cloneResult: CloneResult | undefined;

  try {
    // Check if the target is a GitHub repo reference
    if (isGitHubRepoRef(target)) {
      log(`🌐 GitHub repository: ${target}`);
      log('📥 Cloning repository...');

      const repoRef = parseGitHubRepo(target);
      cloneResult = await cloneGitHubRepo(repoRef);
      scanPath = cloneResult.path;

      log('✅ Repository cloned successfully');
    } else {
      log(`📁 Scan path: ${scanPath}`);
    }

    log(`📋 Spec file: ${specFile}`);

    // Load policy spec
    log('📜 Loading policy spec...');
    const spec = await PolicyEnforcer.loadSpec(specFile);
    const enforcer = new PolicyEnforcer(spec);

    // Scan files
    log('🔎 Scanning files for AI components...');
    const scanner = new FileScanner(scanPath);
    const scanResults = await scanner.scan();

    log(`📊 Found ${scanResults.detections.length} detections in ${scanResults.summary.filesScanned} files`);

    // Enforce policies
    log('⚖️ Enforcing policies...');
    const results = enforcer.enforce(scanResults);

    // Format output
    const formattedOutput = formatResults(results, outputFormat);

    return {
      results,
      formattedOutput,
      hasViolations: results.violations.length > 0,
      violationCount: results.violations.length,
    };
  } finally {
    // Clean up cloned repository if any
    if (cloneResult) {
      await cloneResult.cleanup();
    }
  }
}

// Re-export commonly used types and classes for library usage
export { FileScanner } from './scanners';
export { PolicyEnforcer } from './policy';
export { formatResults, formatAsJson, formatAsMarkdown, formatAsText } from './formatter';
export { parseGitHubRepo, cloneGitHubRepo, isGitHubRepoRef } from './github-repo';
export * from './types';
export { ALL_PATTERNS, MODEL_PATTERNS, FRAMEWORK_PATTERNS, PLATFORM_PATTERNS, MCP_SERVER_PATTERNS, MCP_TOOL_PATTERNS } from './patterns';
