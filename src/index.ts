/**
 * AIGraph Scanner - Library Entry Point
 * 
 * This module exports the core scanning functionality for use as a library.
 */

// Core scanning function
export { scan, ScanOptions, ScanOutput, findSpecFile } from './core';

// Scanners
export { FileScanner, FileScannerOptions } from './scanners';
export { CodeQLScanner, runCodeQLScan } from './scanners';
export { JupyterScanner } from './scanners';
export { IaCScanner, isIaCFile } from './scanners';

// Policy enforcement
export { PolicyEnforcer } from './policy';

// Formatters
export { formatResults, formatAsJson, formatAsMarkdown, formatAsText } from './formatter';

// GitHub repository utilities
export { parseGitHubRepo, cloneGitHubRepo, isGitHubRepoRef } from './github-repo';

// Types
export * from './types';

// Patterns
export { 
  ALL_PATTERNS, 
  MODEL_PATTERNS, 
  FRAMEWORK_PATTERNS, 
  PLATFORM_PATTERNS, 
  MCP_SERVER_PATTERNS, 
  MCP_TOOL_PATTERNS,
  API_ENDPOINT_PATTERNS 
} from './patterns';
