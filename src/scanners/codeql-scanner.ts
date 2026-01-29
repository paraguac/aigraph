/**
 * AIGraph Scanner - CodeQL Integration Module
 * 
 * This module provides integration with CodeQL for AST-based semantic analysis.
 * It can run CodeQL queries and parse results into the AIGraph detection format.
 */

import { spawn } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import { Detection, DetectionCategory, DetectionContext } from '../types';

/**
 * CodeQL SARIF result format
 */
interface SarifResult {
  $schema: string;
  version: string;
  runs: SarifRun[];
}

interface SarifRun {
  tool: {
    driver: {
      name: string;
      rules: SarifRule[];
    };
  };
  results: SarifResultItem[];
}

interface SarifRule {
  id: string;
  name: string;
  shortDescription?: { text: string };
  fullDescription?: { text: string };
  defaultConfiguration?: {
    level: 'none' | 'note' | 'warning' | 'error';
  };
  properties?: {
    tags?: string[];
    precision?: string;
  };
}

interface SarifResultItem {
  ruleId: string;
  ruleIndex: number;
  message: { text: string };
  locations: SarifLocation[];
}

interface SarifLocation {
  physicalLocation: {
    artifactLocation: {
      uri: string;
      uriBaseId?: string;
    };
    region: {
      startLine: number;
      startColumn?: number;
      endLine?: number;
      endColumn?: number;
      snippet?: { text: string };
    };
  };
}

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
export class CodeQLScanner {
  private options: CodeQLScanOptions;
  private tempDir: string;
  private databasePath: string;

  constructor(options: CodeQLScanOptions) {
    this.options = {
      threads: 0,
      timeout: 1800,
      ...options,
    };
    this.tempDir = '';
    this.databasePath = '';
  }

  /**
   * Check if CodeQL CLI is available
   */
  static async checkAvailability(): Promise<CodeQLAvailability> {
    return new Promise((resolve) => {
      const process = spawn('codeql', ['version'], {
        shell: true,
        timeout: 10000,
      });

      let stdout = '';
      let stderr = '';

      process.stdout?.on('data', (data) => {
        stdout += data.toString();
      });

      process.stderr?.on('data', (data) => {
        stderr += data.toString();
      });

      process.on('close', (code) => {
        if (code === 0) {
          const versionMatch = stdout.match(/CodeQL.*?(\d+\.\d+\.\d+)/i);
          resolve({
            available: true,
            version: versionMatch ? versionMatch[1] : 'unknown',
            path: 'codeql',
          });
        } else {
          resolve({
            available: false,
            error: stderr || 'CodeQL CLI not found',
          });
        }
      });

      process.on('error', (err) => {
        resolve({
          available: false,
          error: `CodeQL CLI not found: ${err.message}`,
        });
      });
    });
  }

  /**
   * Run CodeQL analysis and return detections
   */
  async scan(): Promise<Detection[]> {
    // Check CodeQL availability
    const availability = await CodeQLScanner.checkAvailability();
    if (!availability.available) {
      console.warn(`CodeQL not available: ${availability.error}. Falling back to regex-based scanning.`);
      return [];
    }

    try {
      // Create temp directory for database
      this.tempDir = await fs.promises.mkdtemp(path.join(os.tmpdir(), 'aigraph-codeql-'));
      this.databasePath = path.join(this.tempDir, 'db');

      // Detect languages
      const languages = this.options.languages || await this.detectLanguages();
      if (languages.length === 0) {
        console.warn('No supported languages detected for CodeQL analysis');
        return [];
      }

      // Create CodeQL database
      await this.createDatabase(languages);

      // Run queries
      const sarifResults = await this.runQueries();

      // Parse results into detections
      return this.parseResults(sarifResults);
    } finally {
      // Cleanup temp directory
      await this.cleanup();
    }
  }

  /**
   * Detect languages in the scan path
   */
  private async detectLanguages(): Promise<('python' | 'javascript')[]> {
    const languages: ('python' | 'javascript')[] = [];
    
    const checkExtensions = async (dir: string): Promise<void> => {
      try {
        const entries = await fs.promises.readdir(dir, { withFileTypes: true });
        
        for (const entry of entries) {
          if (entry.isDirectory()) {
            // Skip common non-source directories
            if (['node_modules', '.git', 'dist', 'build', '__pycache__', 'venv', '.venv'].includes(entry.name)) {
              continue;
            }
            await checkExtensions(path.join(dir, entry.name));
          } else {
            const ext = path.extname(entry.name).toLowerCase();
            if (['.py'].includes(ext) && !languages.includes('python')) {
              languages.push('python');
            }
            if (['.js', '.ts', '.jsx', '.tsx', '.mjs', '.cjs'].includes(ext) && !languages.includes('javascript')) {
              languages.push('javascript');
            }
          }
          
          // Early exit if we found both
          if (languages.length >= 2) return;
        }
      } catch {
        // Ignore permission errors
      }
    };

    await checkExtensions(this.options.scanPath);
    return languages;
  }

  /**
   * Create CodeQL database for the scan path
   */
  private async createDatabase(languages: string[]): Promise<void> {
    const args = [
      'database', 'create',
      this.databasePath,
      `--language=${languages.join(',')}`,
      `--source-root=${this.options.scanPath}`,
      '--overwrite',
    ];

    if (this.options.threads) {
      args.push(`--threads=${this.options.threads}`);
    }

    if (this.options.ramLimit) {
      args.push(`--ram=${this.options.ramLimit}`);
    }

    await this.runCodeQL(args, 'Creating CodeQL database');
  }

  /**
   * Run CodeQL queries against the database
   */
  private async runQueries(): Promise<SarifResult> {
    const queryPack = this.options.queryPack || this.getDefaultQueryPackPath();
    const resultsPath = path.join(this.tempDir, 'results.sarif');

    const args = [
      'database', 'analyze',
      this.databasePath,
      queryPack,
      '--format=sarifv2.1.0',
      `--output=${resultsPath}`,
    ];

    if (this.options.threads) {
      args.push(`--threads=${this.options.threads}`);
    }

    await this.runCodeQL(args, 'Running CodeQL queries');

    // Read and parse SARIF results
    const sarifContent = await fs.promises.readFile(resultsPath, 'utf-8');
    return JSON.parse(sarifContent) as SarifResult;
  }

  /**
   * Get the path to the default AIGraph query pack
   */
  private getDefaultQueryPackPath(): string {
    // Check for query pack in various locations
    const possiblePaths = [
      path.join(__dirname, '../../codeql/aigraph-queries'),
      path.join(__dirname, '../../../codeql/aigraph-queries'),
      path.join(process.cwd(), 'codeql/aigraph-queries'),
    ];

    for (const p of possiblePaths) {
      if (fs.existsSync(path.join(p, 'qlpack.yml'))) {
        return p;
      }
    }

    // Fall back to installed query pack
    return 'aigraph/ai-detection-queries';
  }

  /**
   * Run a CodeQL command
   */
  private runCodeQL(args: string[], description: string): Promise<void> {
    return new Promise((resolve, reject) => {
      console.log(`  ${description}...`);

      const process = spawn('codeql', args, {
        shell: true,
        timeout: (this.options.timeout || 1800) * 1000,
      });

      let stderr = '';

      process.stderr?.on('data', (data) => {
        stderr += data.toString();
      });

      process.on('close', (code) => {
        if (code === 0) {
          resolve();
        } else {
          reject(new Error(`CodeQL command failed: ${stderr}`));
        }
      });

      process.on('error', (err) => {
        reject(new Error(`Failed to run CodeQL: ${err.message}`));
      });
    });
  }

  /**
   * Parse SARIF results into AIGraph detections
   */
  private parseResults(sarif: SarifResult): Detection[] {
    const detections: Detection[] = [];

    for (const run of sarif.runs) {
      const rules = new Map(run.tool.driver.rules.map(r => [r.id, r]));

      for (const result of run.results) {
        const rule = rules.get(result.ruleId);
        if (!rule) continue;

        for (const location of result.locations) {
          const detection = this.createDetection(result, rule, location);
          if (detection) {
            detections.push(detection);
          }
        }
      }
    }

    return detections;
  }

  /**
   * Create a detection from a SARIF result
   */
  private createDetection(
    result: SarifResultItem,
    rule: SarifRule,
    location: SarifLocation
  ): Detection | null {
    const { category, name, context } = this.parseRuleId(result.ruleId, result.message.text);
    
    const physLoc = location.physicalLocation;
    const filePath = physLoc.artifactLocation.uri;
    const region = physLoc.region;

    // Determine confidence from rule precision
    let confidence: 'high' | 'medium' | 'low' = 'medium';
    if (rule.properties?.precision === 'high') confidence = 'high';
    else if (rule.properties?.precision === 'low') confidence = 'low';

    return {
      category,
      name,
      file: filePath,
      line: region.startLine,
      column: region.startColumn,
      snippet: region.snippet?.text || '',
      confidence,
      context,
      metadata: {
        ruleId: result.ruleId,
        message: result.message.text,
      },
    };
  }

  /**
   * Parse rule ID and message to determine category and name
   */
  private parseRuleId(
    ruleId: string,
    message: string
  ): { category: DetectionCategory; name: string; context: DetectionContext } {
    // Default values
    let category: DetectionCategory = 'framework';
    let name = 'unknown';
    let context: DetectionContext = 'code';

    // Parse category from rule ID
    if (ruleId.includes('ai-sdk-import') || ruleId.includes('dynamic-ai-import')) {
      category = 'framework';
      context = 'import';
    } else if (ruleId.includes('ai-model-name')) {
      category = 'model';
      context = 'string';
    } else if (ruleId.includes('ai-api-endpoint')) {
      category = 'api-endpoint';
      context = 'code';
    } else if (ruleId.includes('ai-client-instantiation')) {
      category = 'framework';
      context = 'code';
    } else if (ruleId.includes('mcp')) {
      category = 'mcp-server';
      context = 'code';
    } else if (ruleId.includes('ai-env-variable')) {
      category = 'platform';
      context = 'env';
    }

    // Extract name from message
    const patterns = [
      /import detected: (\S+)/,
      /model name detected: (\S+)/,
      /client instantiation: (?:new )?(\S+)/,
      /API (?:call|endpoint)[^:]*: (\S+)/,
      /environment variable[^:]*: (\S+)/,
      /module import detected: (\S+)/,
      /package reference: (\S+)/,
    ];

    for (const pattern of patterns) {
      const match = message.match(pattern);
      if (match) {
        name = match[1].replace(/[()]/g, '');
        break;
      }
    }

    // Clean up name
    name = name.replace(/['"`]/g, '');

    return { category, name, context };
  }

  /**
   * Clean up temporary files
   */
  private async cleanup(): Promise<void> {
    if (this.tempDir && fs.existsSync(this.tempDir)) {
      try {
        await fs.promises.rm(this.tempDir, { recursive: true, force: true });
      } catch {
        // Ignore cleanup errors
      }
    }
  }
}

/**
 * Convenience function to run CodeQL scan
 */
export async function runCodeQLScan(scanPath: string, options?: Partial<CodeQLScanOptions>): Promise<Detection[]> {
  const scanner = new CodeQLScanner({
    scanPath,
    ...options,
  });
  return scanner.scan();
}
