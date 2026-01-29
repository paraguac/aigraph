/**
 * AIGraph Scanner - File Scanner Module
 *
 * This module handles scanning files for AI-related patterns.
 * Enhanced with context awareness, CodeQL integration, Jupyter notebook support,
 * and Infrastructure as Code scanning.
 */
import { Detection, DetectionPattern, ScanResults, IgnoreConfig } from '../types';
/**
 * Scanner options
 */
export interface FileScannerOptions {
    /** Additional ignore patterns */
    ignoreConfig?: IgnoreConfig;
    /** Whether to use CodeQL for AST-based analysis */
    useCodeQL?: boolean;
    /** Whether to scan Jupyter notebooks */
    scanNotebooks?: boolean;
    /** Whether to scan IaC files */
    scanIaC?: boolean;
    /** Whether to include detections from comments */
    includeComments?: boolean;
    /** Whether to include detections from string literals */
    includeStrings?: boolean;
}
/**
 * Scanner class for detecting AI patterns in files
 */
export declare class FileScanner {
    private patterns;
    private scanPath;
    private options;
    private jupyterScanner;
    private iacScanner;
    constructor(scanPath: string, patterns?: DetectionPattern[], options?: FileScannerOptions);
    /**
     * Build ignore patterns from config
     */
    private buildIgnorePatterns;
    /**
     * Get list of files to scan
     */
    getFilesToScan(): Promise<string[]>;
    /**
     * Detect the context of a match (code, comment, string, etc.)
     */
    private detectContext;
    /**
     * Scan a single file for patterns
     */
    scanFile(filePath: string): Promise<Detection[]>;
    /**
     * Get a code snippet around the matched line
     */
    private getSnippet;
    /**
     * Scan all files in the scan path, optionally using CodeQL
     */
    scan(): Promise<ScanResults>;
    /**
     * Deduplicate detections based on name, file, and line
     */
    private deduplicateDetections;
    /**
     * Create a summary of the scan results
     */
    private createSummary;
}
//# sourceMappingURL=file-scanner.d.ts.map