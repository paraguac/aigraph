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
  /** Path to CodeQL CLI binary (default: 'codeql' in PATH) */
  codeqlPath?: string;
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
      const childProcess = spawn('codeql', ['version'], {
        timeout: 10000,
        stdio: ['pipe', 'pipe', 'pipe'],
      });

      let stdout = '';
      let stderr = '';

      childProcess.stdout?.on('data', (data) => {
        stdout += data.toString();
      });

      childProcess.stderr?.on('data', (data) => {
        stderr += data.toString();
      });

      childProcess.on('close', (code) => {
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

      childProcess.on('error', (err) => {
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

      // Install query pack dependencies
      await this.installPackDependencies();

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
   * Install CodeQL pack dependencies for all detected languages
   */
  private async installPackDependencies(): Promise<void> {
    const queryPack = this.options.queryPack || this.getDefaultQueryPackPath();
    const languages = this.options.languages || await this.detectLanguages();

    // Install dependencies for each language-specific pack
    for (const lang of languages) {
      const langPack = path.join(queryPack, lang);
      const qlpackPath = path.join(langPack, 'qlpack.yml');
      
      if (fs.existsSync(qlpackPath)) {
        try {
          await this.runCodeQL(['pack', 'install', langPack], `Installing ${lang} pack dependencies`);
        } catch (error) {
          console.warn(`  Warning: Could not install ${lang} pack dependencies: ${(error as Error).message}`);
        }
      }
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
      `--source-root=${this.options.scanPath}`,
      '--overwrite',
    ];

    // Handle multiple languages with --db-cluster
    if (languages.length > 1) {
      args.push('--db-cluster');
      args.push(`--language=${languages.join(',')}`);
    } else {
      args.push(`--language=${languages[0]}`);
    }

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
    const languages = this.options.languages || await this.detectLanguages();

    // If multiple languages, we have a database cluster
    if (languages.length > 1) {
      return this.runQueriesOnCluster(queryPack, resultsPath, languages);
    }

    // Use language-specific query pack for single language
    const langQueryPack = this.getLanguageQueryPackPath(languages[0], queryPack);

    const args = [
      'database', 'analyze',
      this.databasePath,
      langQueryPack,
      '--format=sarifv2.1.0',
      `--output=${resultsPath}`,
    ];

    if (this.options.threads) {
      args.push(`--threads=${this.options.threads}`);
    }

    await this.runCodeQL(args, `Running CodeQL queries for ${languages[0]}`);

    // Read and parse SARIF results
    const sarifContent = await fs.promises.readFile(resultsPath, 'utf-8');
    return JSON.parse(sarifContent) as SarifResult;
  }

  /**
   * Run queries on a database cluster (multiple languages)
   */
  private async runQueriesOnCluster(
    queryPack: string,
    baseResultsPath: string,
    languages: string[]
  ): Promise<SarifResult> {
    const allResults: SarifResult = {
      $schema: 'https://raw.githubusercontent.com/oasis-tcs/sarif-spec/master/Schemata/sarif-schema-2.1.0.json',
      version: '2.1.0',
      runs: []
    };

    for (const lang of languages) {
      const langDbPath = path.join(this.databasePath, lang);
      const langResultsPath = baseResultsPath.replace('.sarif', `-${lang}.sarif`);

      // Check if the database for this language exists
      if (!fs.existsSync(langDbPath)) {
        console.warn(`  Database for ${lang} not found, skipping...`);
        continue;
      }

      // Use language-specific query pack
      const langQueryPack = this.getLanguageQueryPackPath(lang, queryPack);

      const args = [
        'database', 'analyze',
        langDbPath,
        langQueryPack,
        '--format=sarifv2.1.0',
        `--output=${langResultsPath}`,
      ];

      if (this.options.threads) {
        args.push(`--threads=${this.options.threads}`);
      }

      try {
        await this.runCodeQL(args, `Running CodeQL queries for ${lang}`);

        // Read and merge results
        const sarifContent = await fs.promises.readFile(langResultsPath, 'utf-8');
        const langResults = JSON.parse(sarifContent) as SarifResult;
        allResults.runs.push(...langResults.runs);
      } catch (error) {
        console.warn(`  Failed to analyze ${lang}: ${(error as Error).message}`);
      }
    }

    return allResults;
  }

  /**
   * Get the path to language-specific query pack
   */
  private getLanguageQueryPackPath(language: string, baseQueryPack: string): string {
    // Check for language-specific subdirectory
    const langPath = path.join(baseQueryPack, language);
    if (fs.existsSync(path.join(langPath, 'qlpack.yml'))) {
      return langPath;
    }
    // Fall back to base pack (may fail if multi-language)
    return baseQueryPack;
  }

  /**
   * Get the path to the default AIGraph query pack (parent directory containing language subdirs)
   */
  private getDefaultQueryPackPath(): string {
    // Check for query pack in various locations
    // Now we look for the parent directory that contains javascript/ and python/ subdirs
    const possiblePaths = [
      // New location: queries/ at project root
      path.join(__dirname, '../../queries'),
      path.join(__dirname, '../../../queries'),
      path.join(process.cwd(), 'queries'),
    ];

    for (const p of possiblePaths) {
      // Check if this directory has language-specific subdirectories with qlpack.yml
      const jsPackPath = path.join(p, 'javascript', 'qlpack.yml');
      const pyPackPath = path.join(p, 'python', 'qlpack.yml');
      if (fs.existsSync(jsPackPath) || fs.existsSync(pyPackPath)) {
        return p;
      }
    }

    // No local packs found - this will cause an error but at least it's informative
    console.warn('  Warning: No local query packs found in queries/ directory');
    return path.join(process.cwd(), 'queries');
  }

  /**
   * Run a CodeQL command
   */
  private runCodeQL(args: string[], description: string): Promise<void> {
    return new Promise((resolve, reject) => {
      console.log(`  ${description}...`);

      const codeqlPath = this.options.codeqlPath || 'codeql';

      const childProcess = spawn(codeqlPath, args, {
        timeout: (this.options.timeout || 1800) * 1000,
        stdio: ['pipe', 'pipe', 'pipe'],
      });

      let stderr = '';

      // Show progress output for long-running commands
      childProcess.stdout?.on('data', (data) => {
        const output = data.toString().trim();
        if (output && (output.includes('Extracting') || output.includes('Analyzing') || output.includes('%'))) {
          process.stdout.write(`\r    ${output.slice(0, 70).padEnd(70)}`);
        }
      });

      childProcess.stderr?.on('data', (data) => {
        stderr += data.toString();
        // Show progress for database creation
        const output = data.toString().trim();
        if (output && (output.includes('Extracting') || output.includes('Finalizing'))) {
          process.stdout.write(`\r    ${output.slice(0, 70).padEnd(70)}`);
        }
      });

      childProcess.on('close', (code) => {
        process.stdout.write('\r' + ' '.repeat(74) + '\r'); // Clear progress line
        if (code === 0) {
          resolve();
        } else {
          reject(new Error(`CodeQL command failed: ${stderr}`));
        }
      });

      childProcess.on('error', (err) => {
        reject(new Error(`Failed to run CodeQL: ${err.message}`));
      });
    });
  }

  /**
   * Parse SARIF results into detections
   */
  private parseResults(sarif: SarifResult): Detection[] {
    const detections: Detection[] = [];

    for (const run of sarif.runs || []) {
      const rules = new Map(run.tool?.driver?.rules?.map(r => [r.id, r]) || []);

      for (const result of run.results || []) {
        const detection = this.createDetection(result, rules.get(result.ruleId), result.locations?.[0]);
        if (detection) {
          detections.push(detection);
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
    rule: SarifRule | undefined,
    location: SarifLocation | undefined
  ): Detection | null {
    if (!location?.physicalLocation) return null;

    const { category, name, context } = this.parseRuleId(result.ruleId, result.message?.text || '');

    return {
      category,
      name,
      file: location.physicalLocation.artifactLocation.uri,
      line: location.physicalLocation.region.startLine,
      column: location.physicalLocation.region.startColumn,
      snippet: location.physicalLocation.region.snippet?.text || '',
      confidence: this.getConfidenceFromRule(rule),
      context,
      metadata: {
        ruleId: result.ruleId,
        ruleName: rule?.name || '',
      },
    };
  }

  /**
   * Parse rule ID to extract category and name
   */
  private parseRuleId(ruleId: string, message: string): { category: DetectionCategory; name: string; context: DetectionContext } {
    // Parse rule IDs like: aigraph/python/ai-sdk-import, aigraph/js/api-endpoint
    const parts = ruleId.split('/');
    let category: DetectionCategory = 'model';
    let context: DetectionContext = 'code';

    if (ruleId.includes('import') || ruleId.includes('sdk')) {
      category = 'framework';
      context = 'import';
    } else if (ruleId.includes('api-endpoint') || ruleId.includes('http')) {
      category = 'api-endpoint';
    } else if (ruleId.includes('mcp-server')) {
      category = 'mcp-server';
    } else if (ruleId.includes('mcp-tool') || ruleId.includes('mcp-client') || ruleId.includes('mcp-detection')) {
      category = 'mcp-tool';
    } else if (ruleId.includes('env') || ruleId.includes('environment')) {
      category = 'platform';
      context = 'env';
    } else if (ruleId.includes('client-instantiation')) {
      category = 'framework';
      context = 'code';
    }

    // Extract meaningful name from message
    let name = parts[parts.length - 1];
    
    // Try to extract specific module/class names from common message patterns
    // "AI SDK import detected: openai" -> "openai-sdk"
    // "AI client instantiation: new OpenAI()" -> "openai-client"
    // "AI model name detected: gpt-4" -> "gpt-4"
    const importMatch = message.match(/import detected:\s*([^\s(]+)/i);
    const instantiationMatch = message.match(/instantiation:\s*(?:new\s+)?(\w+)/i);
    const modelMatch = message.match(/model name detected:\s*['"]?([^'"]+)['"]?/i);
    const endpointMatch = message.match(/endpoint detected:\s*([^\s]+)/i);
    
    if (importMatch) {
      // Map module names to standardized SDK names
      const moduleName = importMatch[1].toLowerCase().replace(/^@/, '').replace(/\//g, '-');
      name = this.normalizeModuleName(moduleName);
    } else if (instantiationMatch) {
      // Map class names to SDK names
      const className = instantiationMatch[1];
      name = this.normalizeClassName(className);
    } else if (modelMatch) {
      name = modelMatch[1].toLowerCase();
    } else if (endpointMatch) {
      name = this.normalizeEndpointName(endpointMatch[1]);
    }

    return { category, name, context };
  }

  /**
   * Normalize module name to match regex pattern names
   */
  private normalizeModuleName(moduleName: string): string {
    const moduleMap: Record<string, string> = {
      'openai': 'openai-sdk',
      'anthropic-ai-sdk': 'anthropic-sdk',
      'anthropic': 'anthropic-sdk',
      'langchain': 'langchain',
      'langgraph': 'langgraph',
      'google-generative-ai': 'google-generativeai',
      'google-cloud-vertexai': 'google-vertex-ai',
      'ai': 'vercel-ai-sdk',
      'ai-sdk': 'vercel-ai-sdk',
      'modelcontextprotocol-sdk': 'mcp-sdk',
      'ollama': 'ollama',
      'groq-sdk': 'groq',
      'cohere-ai': 'cohere',
      'replicate': 'replicate',
      'together-ai': 'together-ai',
      'mistralai-mistralai': 'mistral',
      'huggingface-inference': 'huggingface',
      'azure-openai': 'azure-openai',
      'aws-sdk-client-bedrock': 'aws-bedrock',
    };
    return moduleMap[moduleName] || moduleName;
  }

  /**
   * Normalize class name to match regex pattern names
   */
  private normalizeClassName(className: string): string {
    const classMap: Record<string, string> = {
      'OpenAI': 'openai-sdk',
      'OpenAIApi': 'openai-sdk',
      'Anthropic': 'anthropic-sdk',
      'AnthropicBedrock': 'anthropic-sdk',
      'ChatOpenAI': 'langchain',
      'ChatAnthropic': 'langchain',
      'ChatGoogleGenerativeAI': 'langchain',
      'ChatVertexAI': 'langchain',
      'ChatGroq': 'langchain',
      'ChatCohere': 'langchain',
      'ChatOllama': 'langchain',
      'GoogleGenerativeAI': 'google-generativeai',
      'GenerativeModel': 'google-generativeai',
      'Groq': 'groq',
      'Together': 'together-ai',
      'Replicate': 'replicate',
      'MistralClient': 'mistral',
      'Mistral': 'mistral',
      'McpServer': 'mcp-server-generic',
      'Server': 'mcp-server-generic',
      'McpClient': 'mcp-client',
      'Ollama': 'ollama',
    };
    return classMap[className] || className.toLowerCase();
  }

  /**
   * Normalize API endpoint to a name
   */
  private normalizeEndpointName(url: string): string {
    if (url.includes('openai.com')) return 'openai-api';
    if (url.includes('anthropic.com')) return 'anthropic-api';
    if (url.includes('googleapis.com')) return 'google-ai-api';
    if (url.includes('openrouter.ai')) return 'openrouter-api';
    if (url.includes('groq.com')) return 'groq-api';
    if (url.includes('together.xyz') || url.includes('together.ai')) return 'together-api';
    if (url.includes('localhost:11434')) return 'ollama-local';
    return 'ai-api-endpoint';
  }

  /**
   * Get confidence level from rule
   */
  private getConfidenceFromRule(rule: SarifRule | undefined): 'high' | 'medium' | 'low' {
    if (!rule) return 'medium';

    const precision = rule.properties?.precision;
    if (precision === 'very-high' || precision === 'high') return 'high';
    if (precision === 'low') return 'low';
    return 'medium';
  }

  /**
   * Cleanup temporary files
   */
  private async cleanup(): Promise<void> {
    if (this.tempDir) {
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
  const scanner = new CodeQLScanner({ scanPath, ...options });
  return scanner.scan();
}
