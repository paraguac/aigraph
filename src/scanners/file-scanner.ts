/**
 * AIGraph Scanner - File Scanner Module
 * 
 * This module handles scanning files for AI-related patterns.
 * Enhanced with context awareness, CodeQL integration, Jupyter notebook support,
 * and Infrastructure as Code scanning.
 */

import * as fs from 'fs';
import * as path from 'path';
import fg from 'fast-glob';
import { Detection, DetectionPattern, ScanResults, ScanSummary, DetectionCategory, DetectionContext, IgnoreConfig, ScanMethodResults } from '../types';
import { ALL_PATTERNS } from '../patterns';
import { CodeQLScanner, CodeQLScanOptions } from './codeql-scanner';
import { JupyterScanner } from './jupyter-scanner';
import { IaCScanner, isIaCFile } from './iac-scanner';

/**
 * Files and directories to ignore during scanning
 */
const DEFAULT_IGNORE_PATTERNS = [
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
  // Exclude markdown files to reduce false positives
  '**/*.md',
  '**/README*',
  '**/CHANGELOG*',
  '**/LICENSE*',
  '**/CONTRIBUTING*',
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
  // Jupyter notebooks
  '*.ipynb',
  // Infrastructure as Code
  '*.tf',
  '*.tfvars',
  'docker-compose*.yml',
  'docker-compose*.yaml',
  'compose.yml',
  'compose.yaml',
  'chart.yaml',
  'values.yaml',
];

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
export class FileScanner {
  private patterns: DetectionPattern[];
  private scanPath: string;
  private options: FileScannerOptions;
  private jupyterScanner: JupyterScanner;
  private iacScanner: IaCScanner;

  constructor(
    scanPath: string, 
    patterns: DetectionPattern[] = ALL_PATTERNS,
    options: FileScannerOptions = {}
  ) {
    this.scanPath = path.resolve(scanPath);
    this.patterns = patterns;
    this.options = {
      scanNotebooks: true,
      scanIaC: true,
      includeComments: false,
      includeStrings: true,
      ...options,
    };
    this.jupyterScanner = new JupyterScanner({ patterns });
    this.iacScanner = new IaCScanner();
  }

  /**
   * Build ignore patterns from config
   */
  private buildIgnorePatterns(): string[] {
    const patterns = [...DEFAULT_IGNORE_PATTERNS];
    
    if (this.options.ignoreConfig) {
      const config = this.options.ignoreConfig;
      
      // Add directory ignores
      if (config.directories) {
        for (const dir of config.directories) {
          patterns.push(`**/${dir}/**`);
        }
      }
      
      // Add file pattern ignores
      if (config.files) {
        for (const file of config.files) {
          patterns.push(`**/${file}`);
        }
      }
      
      // Add glob pattern ignores
      if (config.patterns) {
        patterns.push(...config.patterns);
      }
    }
    
    return patterns;
  }

  /**
   * Get list of files to scan
   */
  async getFilesToScan(): Promise<string[]> {
    const patterns = SCAN_EXTENSIONS.map(ext => `**/${ext}`);
    const ignorePatterns = this.buildIgnorePatterns();
    
    const files = await fg(patterns, {
      cwd: this.scanPath,
      ignore: ignorePatterns,
      absolute: true,
      dot: true,
      onlyFiles: true,
    });

    return files;
  }

  /**
   * Detect the context of a match (code, comment, string, etc.)
   */
  private detectContext(line: string, matchIndex: number, filePath: string): DetectionContext {
    const ext = path.extname(filePath).toLowerCase();
    const trimmedLine = line.trim();
    
    // Check for comment patterns based on language
    const singleLineComments = ['#', '//', '--', ';', '%'];
    const multiLineCommentStarts = ['/*', '"""', "'''", '<!--'];
    
    // Python/Ruby/Shell comments
    if (['.py', '.rb', '.sh', '.bash', '.yml', '.yaml'].includes(ext)) {
      if (trimmedLine.startsWith('#')) return 'comment';
    }
    
    // JavaScript/TypeScript/Java/C# comments
    if (['.js', '.ts', '.jsx', '.tsx', '.java', '.cs', '.go', '.rs', '.swift', '.kt'].includes(ext)) {
      if (trimmedLine.startsWith('//')) return 'comment';
      if (trimmedLine.startsWith('/*') || trimmedLine.startsWith('*')) return 'comment';
    }
    
    // Check if match is inside a string before the comment
    const beforeMatch = line.substring(0, matchIndex);
    const quoteCount = (beforeMatch.match(/['"]/g) || []).length;
    if (quoteCount % 2 === 1) {
      return 'string';
    }
    
    // Check for import statements
    if (trimmedLine.match(/^(import|from|require|using)\s/)) {
      return 'import';
    }
    
    // Check for environment variable patterns
    if (line.includes('process.env') || line.includes('os.environ') || line.includes('getenv')) {
      return 'env';
    }
    
    // Config files
    if (['.yml', '.yaml', '.json', '.toml', '.env'].some(e => filePath.endsWith(e))) {
      return 'config';
    }
    
    return 'code';
  }

  /**
   * Scan a single file for patterns
   */
  async scanFile(filePath: string): Promise<Detection[]> {
    const detections: Detection[] = [];
    const ext = path.extname(filePath).toLowerCase();
    
    // Handle Jupyter notebooks separately
    if (ext === '.ipynb' && this.options.scanNotebooks) {
      return this.jupyterScanner.scanNotebook(filePath, this.scanPath);
    }
    
    // Handle IaC files separately
    if (isIaCFile(filePath) && this.options.scanIaC) {
      return this.iacScanner.scanFile(filePath, this.scanPath);
    }
    
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
              // Detect context
              const context = this.detectContext(line, match.index, filePath);
              
              // Skip comments if not included
              if (context === 'comment' && !this.options.includeComments) {
                if (!lineRegex.global) break;
                continue;
              }
              
              // Skip strings if not included
              if (context === 'string' && !this.options.includeStrings) {
                if (!lineRegex.global) break;
                continue;
              }
              
              detections.push({
                category: pattern.category,
                name: pattern.name,
                file: relativePath,
                line: lineNum + 1,
                column: match.index + 1,
                snippet: this.getSnippet(lines, lineNum),
                confidence: pattern.confidence,
                context,
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
   * Scan all files in the scan path using both regex and CodeQL methods
   * Always attempts both methods and reports comparison
   */
  async scan(): Promise<ScanResults> {
    const files = await this.getFilesToScan();
    let allDetections: Detection[] = [];
    
    // Track results from each method
    const regexResults: ScanMethodResults = {
      method: 'regex',
      available: true,
      detections: [],
      duration: 0,
    };
    
    const codeqlResults: ScanMethodResults = {
      method: 'codeql',
      available: false,
      detections: [],
      duration: 0,
    };

    // Run regex-based scanning
    const regexStart = Date.now();
    for (const file of files) {
      const fileDetections = await this.scanFile(file);
      regexResults.detections.push(...fileDetections);
    }
    regexResults.duration = Date.now() - regexStart;
    allDetections.push(...regexResults.detections);

    // Run CodeQL scanning if enabled
    if (this.options.useCodeQL !== false) {
      const codeqlStart = Date.now();
      try {
        const codeqlScanner = new CodeQLScanner({ scanPath: this.scanPath });
        const codeqlDetections = await codeqlScanner.scan();
        codeqlResults.available = true;
        codeqlResults.detections = codeqlDetections;
        codeqlResults.duration = Date.now() - codeqlStart;
        
        if (codeqlDetections.length > 0) {
          allDetections.push(...codeqlDetections);
        }
      } catch (error) {
        codeqlResults.duration = Date.now() - codeqlStart;
        codeqlResults.error = (error as Error).message;
        // CodeQL not available or failed - that's okay, we have regex results
      }
    }

    // Deduplicate detections (same name, file, and line)
    const uniqueDetections = this.deduplicateDetections(allDetections);

    const summary = this.createSummary(files.length, uniqueDetections);

    return {
      detections: uniqueDetections,
      violations: [], // Violations are determined by policy enforcement
      summary,
      regexResults,
      codeqlResults,
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
      'api-endpoint': 0,
      'infrastructure': 0,
    };

    const filesWithDetections = new Set<string>();

    for (const detection of detections) {
      if (detectionsByCategory[detection.category] !== undefined) {
        detectionsByCategory[detection.category]++;
      }
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
        'api-endpoint': 0,
        'infrastructure': 0,
      },
    };
  }
}
