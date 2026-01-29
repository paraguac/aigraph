/**
 * AIGraph Scanner - Jupyter Notebook Scanner
 *
 * This module handles scanning Jupyter notebook (.ipynb) files
 * by extracting code cells and scanning them for AI patterns.
 */
import { Detection, DetectionPattern, JupyterNotebook } from '../types';
/**
 * Options for Jupyter notebook scanning
 */
export interface JupyterScanOptions {
    /** Patterns to detect */
    patterns: DetectionPattern[];
    /** Whether to include markdown cells in scanning (default: false) */
    includeMarkdown?: boolean;
}
/**
 * Jupyter Notebook Scanner class
 */
export declare class JupyterScanner {
    private patterns;
    private includeMarkdown;
    constructor(options: JupyterScanOptions);
    /**
     * Check if a file is a Jupyter notebook
     */
    static isNotebook(filePath: string): boolean;
    /**
     * Parse a Jupyter notebook file
     */
    parseNotebook(filePath: string): Promise<JupyterNotebook | null>;
    /**
     * Extract code from notebook cells
     */
    extractCode(notebook: JupyterNotebook): {
        code: string;
        lineOffset: number;
    }[];
    /**
     * Scan a notebook file for patterns
     */
    scanNotebook(filePath: string, basePath: string): Promise<Detection[]>;
    /**
     * Get a code snippet around the matched line
     */
    private getSnippet;
    /**
     * Detect the primary language of a notebook
     */
    static detectNotebookLanguage(notebook: JupyterNotebook): string;
}
/**
 * Convenience function to scan a notebook
 */
export declare function scanJupyterNotebook(filePath: string, basePath: string, patterns: DetectionPattern[]): Promise<Detection[]>;
//# sourceMappingURL=jupyter-scanner.d.ts.map