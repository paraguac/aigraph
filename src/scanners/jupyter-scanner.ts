/**
 * AIGraph Scanner - Jupyter Notebook Scanner
 * 
 * This module handles scanning Jupyter notebook (.ipynb) files
 * by extracting code cells and scanning them for AI patterns.
 */

import * as fs from 'fs';
import * as path from 'path';
import { Detection, DetectionPattern, JupyterNotebook, JupyterCell } from '../types';

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
export class JupyterScanner {
  private patterns: DetectionPattern[];
  private includeMarkdown: boolean;

  constructor(options: JupyterScanOptions) {
    this.patterns = options.patterns;
    this.includeMarkdown = options.includeMarkdown || false;
  }

  /**
   * Check if a file is a Jupyter notebook
   */
  static isNotebook(filePath: string): boolean {
    return path.extname(filePath).toLowerCase() === '.ipynb';
  }

  /**
   * Parse a Jupyter notebook file
   */
  async parseNotebook(filePath: string): Promise<JupyterNotebook | null> {
    try {
      const content = await fs.promises.readFile(filePath, 'utf-8');
      const notebook = JSON.parse(content);

      // Validate notebook structure
      if (!notebook.cells || !Array.isArray(notebook.cells)) {
        console.warn(`Invalid notebook structure: ${filePath}`);
        return null;
      }

      return {
        cells: notebook.cells.map((cell: Record<string, unknown>) => ({
          cell_type: cell.cell_type as 'code' | 'markdown' | 'raw',
          source: Array.isArray(cell.source) ? cell.source : [cell.source as string],
          metadata: cell.metadata as Record<string, unknown>,
        })),
        metadata: notebook.metadata || {},
      };
    } catch (error) {
      console.warn(`Failed to parse notebook ${filePath}: ${(error as Error).message}`);
      return null;
    }
  }

  /**
   * Extract code from notebook cells
   */
  extractCode(notebook: JupyterNotebook): { code: string; lineOffset: number }[] {
    const codeBlocks: { code: string; lineOffset: number }[] = [];
    let currentLine = 1;

    for (const cell of notebook.cells) {
      if (cell.cell_type === 'code' || (this.includeMarkdown && cell.cell_type === 'markdown')) {
        const code = cell.source.join('');
        codeBlocks.push({
          code,
          lineOffset: currentLine,
        });
      }

      // Track line numbers across cells
      currentLine += cell.source.length;
    }

    return codeBlocks;
  }

  /**
   * Scan a notebook file for patterns
   */
  async scanNotebook(filePath: string, basePath: string): Promise<Detection[]> {
    const notebook = await this.parseNotebook(filePath);
    if (!notebook) {
      return [];
    }

    const detections: Detection[] = [];
    const relativePath = path.relative(basePath, filePath);
    const codeBlocks = this.extractCode(notebook);

    let cellIndex = 0;
    for (const cell of notebook.cells) {
      if (cell.cell_type !== 'code' && !(this.includeMarkdown && cell.cell_type === 'markdown')) {
        cellIndex++;
        continue;
      }

      const code = cell.source.join('');
      const lines = code.split('\n');
      const codeBlock = codeBlocks.find(b => b.code === code);
      const lineOffset = codeBlock?.lineOffset || 1;

      for (const pattern of this.patterns) {
        // Check file pattern filter
        if (pattern.filePatterns && pattern.filePatterns.length > 0) {
          const matchesFilePattern = pattern.filePatterns.some(fp => 
            fp === '*.ipynb' || fp === '*.py' || filePath.match(new RegExp(fp.replace('*', '.*')))
          );
          if (!matchesFilePattern) continue;
        }

        for (const regex of pattern.patterns) {
          for (let lineNum = 0; lineNum < lines.length; lineNum++) {
            const line = lines[lineNum];
            const lineRegex = new RegExp(regex.source, regex.flags);
            let match;

            while ((match = lineRegex.exec(line)) !== null) {
              detections.push({
                category: pattern.category,
                name: pattern.name,
                file: `${relativePath}[cell ${cellIndex + 1}]`,
                line: lineOffset + lineNum,
                column: match.index + 1,
                snippet: this.getSnippet(lines, lineNum),
                confidence: pattern.confidence,
                context: 'code',
                metadata: {
                  ...pattern.metadata,
                  cellType: cell.cell_type,
                  cellIndex: String(cellIndex + 1),
                },
              });

              if (!lineRegex.global) break;
            }
          }
        }
      }

      cellIndex++;
    }

    return detections;
  }

  /**
   * Get a code snippet around the matched line
   */
  private getSnippet(lines: string[], lineNum: number, context: number = 1): string {
    const start = Math.max(0, lineNum - context);
    const end = Math.min(lines.length - 1, lineNum + context);

    return lines.slice(start, end + 1)
      .map((line, idx) => {
        const actualLine = start + idx + 1;
        const prefix = actualLine === lineNum + 1 ? '>' : ' ';
        return `${prefix} ${actualLine}: ${line}`;
      })
      .join('\n');
  }

  /**
   * Detect the primary language of a notebook
   */
  static detectNotebookLanguage(notebook: JupyterNotebook): string {
    // Check metadata for language info
    const metadata = notebook.metadata as Record<string, unknown>;
    
    if (metadata.language_info) {
      const langInfo = metadata.language_info as Record<string, unknown>;
      if (langInfo.name) {
        return langInfo.name as string;
      }
    }

    if (metadata.kernelspec) {
      const kernelspec = metadata.kernelspec as Record<string, unknown>;
      if (kernelspec.language) {
        return kernelspec.language as string;
      }
    }

    // Default to Python (most common for Jupyter)
    return 'python';
  }
}

/**
 * Convenience function to scan a notebook
 */
export async function scanJupyterNotebook(
  filePath: string,
  basePath: string,
  patterns: DetectionPattern[]
): Promise<Detection[]> {
  const scanner = new JupyterScanner({ patterns });
  return scanner.scanNotebook(filePath, basePath);
}
