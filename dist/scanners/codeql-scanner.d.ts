/**
 * AIGraph Scanner - CodeQL Integration Module
 *
 * This module provides integration with CodeQL for AST-based semantic analysis.
 * It can run CodeQL queries and parse results into the AIGraph detection format.
 */
import { Detection } from '../types';
/**
 * Options for CodeQL scanning
 */
export interface CodeQLScanOptions {
    /** Path to scan */
    scanPath: string;
    /** Languages to analyze (default: auto-detect) */
    languages?: ('python' | 'javascript' | 'typescript')[];
    /** Path to custom query pack (default: built-in aigraph queries) */
    queryPack?: string;
    /** Number of threads for CodeQL (default: 0 = auto) */
    threads?: number;
    /** RAM limit in MB (default: system available) */
    ramLimit?: number;
    /** Timeout in seconds (default: 1800) */
    timeout?: number;
    /** Whether CodeQL is available (will be checked) */
    codeqlAvailable?: boolean;
}
/**
 * Result of CodeQL availability check
 */
export interface CodeQLAvailability {
    available: boolean;
    version?: string;
    path?: string;
    error?: string;
}
/**
 * CodeQL Scanner class
 */
export declare class CodeQLScanner {
    private options;
    private tempDir;
    private databasePath;
    constructor(options: CodeQLScanOptions);
    /**
     * Check if CodeQL CLI is available
     */
    static checkAvailability(): Promise<CodeQLAvailability>;
    /**
     * Run CodeQL analysis and return detections
     */
    scan(): Promise<Detection[]>;
    /**
     * Detect languages in the scan path
     */
    private detectLanguages;
    /**
     * Create CodeQL database for the scan path
     */
    private createDatabase;
    /**
     * Run CodeQL queries against the database
     */
    private runQueries;
    /**
     * Get the path to the default AIGraph query pack
     */
    private getDefaultQueryPackPath;
    /**
     * Run a CodeQL command
     */
    private runCodeQL;
    /**
     * Parse SARIF results into AIGraph detections
     */
    private parseResults;
    /**
     * Create a detection from a SARIF result
     */
    private createDetection;
    /**
     * Parse rule ID and message to determine category and name
     */
    private parseRuleId;
    /**
     * Clean up temporary files
     */
    private cleanup;
}
/**
 * Convenience function to run CodeQL scan
 */
export declare function runCodeQLScan(scanPath: string, options?: Partial<CodeQLScanOptions>): Promise<Detection[]>;
//# sourceMappingURL=codeql-scanner.d.ts.map