/**
 * AIGraph Scanner - Output Formatter
 *
 * Formats scan results for various output formats.
 */
import { ScanResults } from './types';
/**
 * Format scan results as JSON
 */
export declare function formatAsJson(results: ScanResults): string;
/**
 * Format scan results as Markdown
 */
export declare function formatAsMarkdown(results: ScanResults): string;
/**
 * Format scan results as plain text with tables
 */
export declare function formatAsText(results: ScanResults): string;
/**
 * Format results based on output format
 */
export declare function formatResults(results: ScanResults, format: 'json' | 'markdown' | 'text'): string;
