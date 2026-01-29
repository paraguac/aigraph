/**
 * AIGraph Scanner - Core Module
 * 
 * This module provides the core scanning functionality that can be used
 * independently of the GitHub Action context. Use this for CLI or library usage.
 * 
 * Enhanced with CodeQL integration, Jupyter notebook support,
 * Infrastructure as Code scanning, and configurable ignore patterns.
 */

import { FileScanner, FileScannerOptions } from './scanners';
import { PolicyEnforcer } from './policy';
import { formatResults } from './formatter';
import { parseGitHubRepo, cloneGitHubRepo, isGitHubRepoRef, CloneResult } from './github-repo';
import { ScannerConfig, ScanResults, IgnoreConfig } from './types';

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
  /** Whether to use CodeQL for AST-based analysis */
  useCodeQL?: boolean;
  /** Whether to scan Jupyter notebooks (default: true) */
  scanNotebooks?: boolean;
  /** Whether to scan IaC files (default: true) */
  scanIaC?: boolean;
  /** Whether to include detections from comments (default: false) */
  includeComments?: boolean;
  /** Whether to include detections from strings (default: true) */
  includeStrings?: boolean;
  /** Additional directories to ignore */
  ignoreDirs?: string[];
  /** Additional file patterns to ignore */
  ignoreFiles?: string[];
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
 * 
 * // Use CodeQL for deeper analysis
 * const result = await scan({ target: '.', useCodeQL: true });
 * 
 * // Ignore test directories
 * const result = await scan({ target: '.', ignoreDirs: ['test', '__tests__'] });
 * ```
 */
export async function scan(options: ScanOptions): Promise<ScanOutput> {
  const {
    target,
    specFile = '.aigraph-spec.yml',
    outputFormat = 'text',
    log = function noop() {},
    useCodeQL = false,
    scanNotebooks = true,
    scanIaC = true,
    includeComments = false,
    includeStrings = true,
    ignoreDirs = [],
    ignoreFiles = [],
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

    // Build ignore config
    const ignoreConfig: IgnoreConfig = {
      directories: [...ignoreDirs, ...(spec.ignore?.directories || [])],
      files: [...ignoreFiles, ...(spec.ignore?.files || [])],
      patterns: spec.ignore?.patterns || [],
    };

    // Build scanner options
    const scannerOptions: FileScannerOptions = {
      useCodeQL,
      scanNotebooks,
      scanIaC,
      includeComments,
      includeStrings,
      ignoreConfig,
    };

    // Scan files
    log('🔎 Scanning files for AI components...');
    if (useCodeQL) {
      log('  Using CodeQL for AST-based analysis...');
    }
    if (scanNotebooks) {
      log('  Including Jupyter notebooks...');
    }
    if (scanIaC) {
      log('  Including Infrastructure as Code files...');
    }
    
    const scanner = new FileScanner(scanPath, undefined, scannerOptions);
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
export { FileScanner, FileScannerOptions } from './scanners';
export { CodeQLScanner, runCodeQLScan } from './scanners';
export { JupyterScanner, scanJupyterNotebook } from './scanners';
export { IaCScanner, scanIaCFile, isIaCFile } from './scanners';
export { PolicyEnforcer } from './policy';
export { formatResults, formatAsJson, formatAsMarkdown, formatAsText } from './formatter';
export { parseGitHubRepo, cloneGitHubRepo, isGitHubRepoRef } from './github-repo';
export * from './types';
export { ALL_PATTERNS, MODEL_PATTERNS, FRAMEWORK_PATTERNS, PLATFORM_PATTERNS, MCP_SERVER_PATTERNS, MCP_TOOL_PATTERNS, API_ENDPOINT_PATTERNS } from './patterns';
