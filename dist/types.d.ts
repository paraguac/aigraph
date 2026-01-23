/**
 * AIGraph Scanner - Type Definitions
 */
/**
 * Spec file configuration for allow/deny lists
 */
export interface AIGraphSpec {
    version: string;
    policies: PolicyConfig;
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
 * Detection categories
 */
export type DetectionCategory = 'model' | 'framework' | 'platform' | 'mcp-server' | 'mcp-tool';
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
}
