/**
 * AIGraph Scanner - Type Definitions
 */
/**
 * Spec file configuration for allow/deny lists
 */
export interface AIGraphSpec {
    version: string;
    policies: PolicyConfig;
    ignore?: IgnoreConfig;
}
export interface PolicyConfig {
    models?: PolicyRule;
    frameworks?: PolicyRule;
    platforms?: PolicyRule;
    mcpServers?: PolicyRule;
    mcpTools?: PolicyRule;
}
export interface PolicyRule {
    mode: 'allowlist' | 'denylist';
    items: string[];
    patterns?: string[];
}
/**
 * Ignore configuration for excluding files/directories from scanning
 */
export interface IgnoreConfig {
    /** Directories to ignore (e.g., ['test', '__tests__', 'spec']) */
    directories?: string[];
    /** File patterns to ignore (e.g., ['*.test.ts', '*.spec.js']) */
    files?: string[];
    /** Glob patterns to ignore */
    patterns?: string[];
}
/**
 * Detection categories
 */
export type DetectionCategory = 'model' | 'framework' | 'platform' | 'mcp-server' | 'mcp-tool' | 'api-endpoint' | 'infrastructure';
/**
 * Context type for detections - helps filter false positives
 */
export type DetectionContext = 'code' | 'comment' | 'string' | 'import' | 'config' | 'env' | 'unknown';
/**
 * A single detection found in the codebase
 */
export interface Detection {
    category: DetectionCategory;
    name: string;
    file: string;
    line: number;
    column?: number;
    snippet: string;
    confidence: 'high' | 'medium' | 'low';
    /** Context where detection was found - helps identify false positives */
    context?: DetectionContext;
    metadata?: Record<string, string>;
}
/**
 * A policy violation
 */
export interface Violation {
    detection: Detection;
    rule: 'denied' | 'not-allowed';
    message: string;
}
/**
 * Scan results
 */
export interface ScanResults {
    detections: Detection[];
    violations: Violation[];
    summary: ScanSummary;
    /** Results from regex-only scanning */
    regexResults?: ScanMethodResults;
    /** Results from CodeQL scanning (if available) */
    codeqlResults?: ScanMethodResults;
}
/**
 * Results from a specific scanning method
 */
export interface ScanMethodResults {
    method: 'regex' | 'codeql';
    available: boolean;
    detections: Detection[];
    duration: number;
    error?: string;
}
export interface ScanSummary {
    totalFiles: number;
    filesScanned: number;
    totalDetections: number;
    totalViolations: number;
    detectionsByCategory: Record<DetectionCategory, number>;
    violationsByCategory: Record<DetectionCategory, number>;
}
/**
 * Scanner configuration
 */
export interface ScannerConfig {
    scanPath: string;
    specFile: string;
    failOnViolation: boolean;
    outputFormat: 'json' | 'markdown' | 'text';
    githubRepo?: string;
    /** Additional directories to ignore */
    ignoreDirectories?: string[];
    /** Additional file patterns to ignore */
    ignoreFiles?: string[];
    /** Whether to include detections from comments (default: false) */
    includeComments?: boolean;
    /** Whether to include detections from string literals (default: true) */
    includeStrings?: boolean;
    /** Whether to use CodeQL for AST-based analysis (default: auto-detect) */
    useCodeQL?: boolean;
    /** Whether to scan Jupyter notebooks (default: true) */
    scanNotebooks?: boolean;
    /** Whether to scan IaC files (default: true) */
    scanIaC?: boolean;
}
/**
 * Pattern definition for detection
 */
export interface DetectionPattern {
    category: DetectionCategory;
    name: string;
    patterns: RegExp[];
    filePatterns?: string[];
    confidence: 'high' | 'medium' | 'low';
    metadata?: Record<string, string>;
    /** Context where this pattern should be detected */
    contexts?: DetectionContext[];
}
/**
 * Jupyter Notebook structure
 */
export interface JupyterNotebook {
    cells: JupyterCell[];
    metadata: Record<string, unknown>;
}
export interface JupyterCell {
    cell_type: 'code' | 'markdown' | 'raw';
    source: string[];
    metadata?: Record<string, unknown>;
}
/**
 * Infrastructure as Code resource
 */
export interface IaCResource {
    type: string;
    name: string;
    provider: string;
    properties: Record<string, unknown>;
    file: string;
    line: number;
}
