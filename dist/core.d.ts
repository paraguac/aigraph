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
import { ScanResults } from './types';
/**
 * Find the spec file by checking default locations
 */
export declare function findSpecFile(basePath?: string): string | undefined;
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
export declare function scan(options: ScanOptions): Promise<ScanOutput>;
export { FileScanner, FileScannerOptions } from './scanners';
export { CodeQLScanner, runCodeQLScan } from './scanners';
export { JupyterScanner, scanJupyterNotebook } from './scanners';
export { IaCScanner, scanIaCFile, isIaCFile } from './scanners';
export { PolicyEnforcer } from './policy';
export { formatResults, formatAsJson, formatAsMarkdown, formatAsText } from './formatter';
export { parseGitHubRepo, cloneGitHubRepo, isGitHubRepoRef } from './github-repo';
export * from './types';
export { ALL_PATTERNS, MODEL_PATTERNS, FRAMEWORK_PATTERNS, PLATFORM_PATTERNS, MCP_SERVER_PATTERNS, MCP_TOOL_PATTERNS, API_ENDPOINT_PATTERNS } from './patterns';
