/**
 * AIGraph Scanner - File Scanner Module
 * 
 * This module handles scanning files for AI-related patterns.
 */

import * as fs from 'fs';
import * as path from 'path';
import fg from 'fast-glob';
import { Detection, DetectionPattern, ScanResults, ScanSummary, DetectionCategory } from '../types';
import { ALL_PATTERNS } from '../patterns';

/**
 * Files and directories to ignore during scanning
 */
const IGNORE_PATTERNS = [
  '**/node_modules/**',
  '**/.git/**',
  '**/dist/**',
  '**/build/**',
  '**/coverage/**',
  '**/*.min.js',
  '**/*.min.css',
  '**/vendor/**',
  '**/.venv/**',
  '**/venv/**',
  '**/__pycache__/**',
  '**/*.pyc',
  '**/package-lock.json',
  '**/yarn.lock',
  '**/pnpm-lock.yaml',
  '**/Pipfile.lock',
  '**/poetry.lock',
  '**/*.map',
  '**/.aigraph-spec.yml',
  '**/.aigraph-spec.yaml',
  '**/.aigraph-spec.json',
];

/**
 * File extensions to scan
 */
const SCAN_EXTENSIONS = [
  '*.py',
  '*.js',
  '*.ts',
  '*.jsx',
  '*.tsx',
  '*.mjs',
  '*.cjs',
  '*.java',
  '*.cs',
  '*.go',
  '*.rb',
  '*.php',
  '*.rs',
  '*.swift',
  '*.kt',
  '*.scala',
  '*.yml',
  '*.yaml',
  '*.json',
  '*.toml',
  '*.md',
  '*.txt',
  '*.env*',
  '*.config.*',
  '*Dockerfile*',
  '*requirements*.txt',
  'package.json',
  'pyproject.toml',
  'Cargo.toml',
  'go.mod',
  'Gemfile',
  'composer.json',
];

/**
 * Scanner class for detecting AI patterns in files
 */
export class FileScanner {
  private patterns: DetectionPattern[];
  private scanPath: string;

  constructor(scanPath: string, patterns: DetectionPattern[] = ALL_PATTERNS) {
    this.scanPath = path.resolve(scanPath);
    this.patterns = patterns;
  }

  /**
   * Get list of files to scan
   */
  async getFilesToScan(): Promise<string[]> {
    const patterns = SCAN_EXTENSIONS.map(ext => `**/${ext}`);
    
    const files = await fg(patterns, {
      cwd: this.scanPath,
      ignore: IGNORE_PATTERNS,
      absolute: true,
      dot: true,
      onlyFiles: true,
    });

    return files;
  }

  /**
   * Scan a single file for patterns
   */
  async scanFile(filePath: string): Promise<Detection[]> {
    const detections: Detection[] = [];
    
    try {
      const content = await fs.promises.readFile(filePath, 'utf-8');
      const lines = content.split('\n');
      const relativePath = path.relative(this.scanPath, filePath);

      for (const pattern of this.patterns) {
        // Check file pattern filter if specified
        if (pattern.filePatterns && pattern.filePatterns.length > 0) {
          const matchesFilePattern = pattern.filePatterns.some((fp: string) => {
            const regex = new RegExp(fp.replace('*', '.*').replace('.', '\\.'));
            return regex.test(filePath);
          });
          if (!matchesFilePattern) continue;
        }

        for (const regex of pattern.patterns) {
          // Reset regex state for global patterns
          regex.lastIndex = 0;
          
          for (let lineNum = 0; lineNum < lines.length; lineNum++) {
            const line = lines[lineNum];
            let match;
            
            // Create a new regex for each line to avoid lastIndex issues
            const lineRegex = new RegExp(regex.source, regex.flags);
            
            while ((match = lineRegex.exec(line)) !== null) {
              detections.push({
                category: pattern.category,
                name: pattern.name,
                file: relativePath,
                line: lineNum + 1,
                column: match.index + 1,
                snippet: this.getSnippet(lines, lineNum),
                confidence: pattern.confidence,
                metadata: pattern.metadata,
              });

              // Break if not global regex to avoid infinite loop
              if (!lineRegex.global) break;
            }
          }
        }
      }
    } catch (error) {
      // Skip files that can't be read (binary files, permission issues, etc.)
      if ((error as NodeJS.ErrnoException).code !== 'ENOENT') {
        console.warn(`Warning: Could not scan file ${filePath}: ${(error as Error).message}`);
      }
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
   * Scan all files in the scan path
   */
  async scan(): Promise<ScanResults> {
    const files = await this.getFilesToScan();
    const allDetections: Detection[] = [];

    for (const file of files) {
      const fileDetections = await this.scanFile(file);
      allDetections.push(...fileDetections);
    }

    // Deduplicate detections (same name, file, and line)
    const uniqueDetections = this.deduplicateDetections(allDetections);

    const summary = this.createSummary(files.length, uniqueDetections);

    return {
      detections: uniqueDetections,
      violations: [], // Violations are determined by policy enforcement
      summary,
    };
  }

  /**
   * Deduplicate detections based on name, file, and line
   */
  private deduplicateDetections(detections: Detection[]): Detection[] {
    const seen = new Set<string>();
    const unique: Detection[] = [];

    for (const detection of detections) {
      const key = `${detection.category}:${detection.name}:${detection.file}:${detection.line}`;
      if (!seen.has(key)) {
        seen.add(key);
        unique.push(detection);
      }
    }

    return unique;
  }

  /**
   * Create a summary of the scan results
   */
  private createSummary(totalFiles: number, detections: Detection[]): ScanSummary {
    const detectionsByCategory: Record<DetectionCategory, number> = {
      'model': 0,
      'framework': 0,
      'platform': 0,
      'mcp-server': 0,
      'mcp-tool': 0,
    };

    const filesWithDetections = new Set<string>();

    for (const detection of detections) {
      detectionsByCategory[detection.category]++;
      filesWithDetections.add(detection.file);
    }

    return {
      totalFiles,
      filesScanned: totalFiles,
      totalDetections: detections.length,
      totalViolations: 0, // Will be updated after policy enforcement
      detectionsByCategory,
      violationsByCategory: {
        'model': 0,
        'framework': 0,
        'platform': 0,
        'mcp-server': 0,
        'mcp-tool': 0,
      },
    };
  }
}
