/**
 * AIGraph Scanner - Core Module
 * 
 * This module provides the core scanning functionality for the CLI tool.
 * 
 * Enhanced with CodeQL integration, Jupyter notebook support,
 * Infrastructure as Code scanning, and configurable ignore patterns.
 * 
 * Both regex and CodeQL scanning are run by default (when CodeQL is available).
 */

import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import { FileScanner, FileScannerOptions } from './scanners';
import { PolicyEnforcer } from './policy';
import { formatResults } from './formatter';
import { parseGitHubRepo, cloneGitHubRepo, isGitHubRepoRef, CloneResult } from './github-repo';
import { ScannerConfig, ScanResults, IgnoreConfig } from './types';

/**
 * Default spec file locations to check (in order of priority)
 */
const SPEC_FILE_LOCATIONS = [
  '.aigraph-spec.yml',
  '.aigraph-spec.yaml',
  path.join(os.homedir(), '.aigraph-spec.yml'),
  path.join(os.homedir(), '.aigraph-spec.yaml'),
  path.join(os.homedir(), '.config', 'aigraph', 'spec.yml'),
  '/etc/aigraph/spec.yml',
  '/etc/aigraph/spec.yaml',
];

/**
 * Find the spec file by checking default locations
 */
export function findSpecFile(basePath: string = '.'): string | undefined {
  // Check local paths relative to basePath first
  for (const location of SPEC_FILE_LOCATIONS) {
    const fullPath = location.startsWith('/') || location.startsWith(os.homedir())
      ? location
      : path.join(basePath, location);
    
    if (fs.existsSync(fullPath)) {
      return fullPath;
    }
  }
  return undefined;
}

/**
 * Options for running the scanner
 */
export interface ScanOptions {
  /** Path to scan or GitHub repo reference (e.g., 'owner/repo' or 'owner/repo@branch') */
  target: string;
  /** Path to the spec file (auto-detected if not provided) */
  specFile?: string;
  /** Output format (default: 'text') */
  outputFormat?: 'json' | 'markdown' | 'text';
  /** Whether to fail on violation (default: true) */
  failOnViolation?: boolean;
  /** Optional logging function */
  log?: (message: string) => void;
  /** Whether to disable CodeQL analysis (default: false - CodeQL runs if available) */
  disableCodeQL?: boolean;
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
 * // Scan a local directory (uses both regex and CodeQL if available)
 * const result = await scan({ target: './my-project' });
 * console.log(result.formattedOutput);
 * 
 * // Scan a GitHub repository
 * const result = await scan({ target: 'owner/repo@main' });
 * console.log(result.results.violations);
 * 
 * // Disable CodeQL (regex only)
 * const result = await scan({ target: '.', disableCodeQL: true });
 * 
 * // Ignore test directories
 * const result = await scan({ target: '.', ignoreDirs: ['test', '__tests__'] });
 * ```
 */
export async function scan(options: ScanOptions): Promise<ScanOutput> {
  const {
    target,
    specFile,
    outputFormat = 'text',
    log = function noop() {},
    disableCodeQL = false,
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

    // Find spec file (auto-detect if not provided)
    const resolvedSpecFile = specFile || findSpecFile(scanPath);
    if (resolvedSpecFile) {
      log(`📋 Spec file: ${resolvedSpecFile}`);
    } else {
      log('📋 No spec file found, using defaults');
    }

    // Load policy spec
    log('📜 Loading policy spec...');
    const spec = await PolicyEnforcer.loadSpec(resolvedSpecFile);
    const enforcer = new PolicyEnforcer(spec);

    // Build ignore config
    const ignoreConfig: IgnoreConfig = {
      directories: [...ignoreDirs, ...(spec.ignore?.directories || [])],
      files: [...ignoreFiles, ...(spec.ignore?.files || [])],
      patterns: spec.ignore?.patterns || [],
    };

    // Build scanner options - CodeQL runs by default unless disabled
    const useCodeQL = !disableCodeQL;
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
    log('  Running regex pattern matching...');
    if (useCodeQL) {
      log('  Running CodeQL AST analysis (if available)...');
    } else {
      log('  CodeQL disabled, using regex only');
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
