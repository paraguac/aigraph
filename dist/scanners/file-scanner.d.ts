/**
 * AIGraph Scanner - File Scanner Module
 *
 * This module handles scanning files for AI-related patterns.
 */
import { Detection, DetectionPattern, ScanResults } from '../types';
/**
 * Scanner class for detecting AI patterns in files
 */
export declare class FileScanner {
    private patterns;
    private scanPath;
    constructor(scanPath: string, patterns?: DetectionPattern[]);
    /**
     * Get list of files to scan
     */
    getFilesToScan(): Promise<string[]>;
    /**
     * Scan a single file for patterns
     */
    scanFile(filePath: string): Promise<Detection[]>;
    /**
     * Get a code snippet around the matched line
     */
    private getSnippet;
    /**
     * Scan all files in the scan path
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