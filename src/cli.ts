#!/usr/bin/env node
/**
 * AIGraph Scanner - Command Line Interface
 * 
 * Scans codebases for AI components using both regex pattern matching
 * and CodeQL AST analysis (when available).
 */

import { scan } from './core';

function printUsage() {
  console.log(`
AIGraph Scanner - Detect AI models, MCP servers/tools, and Agentic AI frameworks

Usage: aigraph-scanner [options] [path-or-repo]

Arguments:
  path-or-repo   Local path to scan OR a public GitHub repository
                 Formats: owner/repo, owner/repo@branch, https://github.com/owner/repo
                 Default: . (current directory)

Options:
  -s, --spec <file>        Path to the policy spec file
                           Default locations: ~/.aigraph-spec.yml, /etc/aigraph/spec.yml
  -f, --format <format>    Output format: json, markdown, text (default: text)
  -q, --quiet              Suppress progress messages, only output results
  --no-fail                Don't exit with error code on violations
  
  Scanning Options:
  --no-codeql              Disable CodeQL analysis (only use regex)
  --no-notebooks           Skip scanning Jupyter notebooks (.ipynb files)
  --no-iac                 Skip scanning Infrastructure as Code files
  --include-comments       Include detections found in comments
  --no-strings             Exclude detections found in string literals
  
  Ignore Options:
  --ignore-dir <dir>       Additional directory to ignore (can be used multiple times)
  --ignore-file <pattern>  Additional file pattern to ignore (can be used multiple times)
  
  -h, --help               Show this help message
  -v, --version            Show version number

Note:
  The scanner automatically uses both regex AND CodeQL (if installed).
  Results from both methods are merged and compared in the output.

Examples:
  aigraph-scanner                             # Scan current directory
  aigraph-scanner ./src                       # Scan src directory
  aigraph-scanner langchain-ai/langchain      # Scan public GitHub repo
  aigraph-scanner -s ~/my-spec.yml ./src      # Use custom spec file
  aigraph-scanner --no-codeql .               # Skip CodeQL, regex only
  aigraph-scanner -f json .                   # Output as JSON
  aigraph-scanner --ignore-dir test .         # Ignore test directories
  aigraph-scanner --no-notebooks .            # Skip Jupyter notebooks
`);
}

function parseArgs(args: string[]): {
  target: string;
  specFile: string | undefined;
  outputFormat: 'json' | 'markdown' | 'text';
  quiet: boolean;
  failOnViolation: boolean;
  showHelp: boolean;
  showVersion: boolean;
  disableCodeQL: boolean;
  scanNotebooks: boolean;
  scanIaC: boolean;
  includeComments: boolean;
  includeStrings: boolean;
  ignoreDirs: string[];
  ignoreFiles: string[];
} {
  const result = {
    target: '.',
    specFile: undefined as string | undefined,
    outputFormat: 'text' as 'json' | 'markdown' | 'text',
    quiet: false,
    failOnViolation: true,
    showHelp: false,
    showVersion: false,
    disableCodeQL: false,
    scanNotebooks: true,
    scanIaC: true,
    includeComments: false,
    includeStrings: true,
    ignoreDirs: [] as string[],
    ignoreFiles: [] as string[],
  };

  const positionalArgs: string[] = [];
  let i = 0;

  while (i < args.length) {
    const arg = args[i];

    if (arg === '-h' || arg === '--help') {
      result.showHelp = true;
    } else if (arg === '-v' || arg === '--version') {
      result.showVersion = true;
    } else if (arg === '-q' || arg === '--quiet') {
      result.quiet = true;
    } else if (arg === '--no-fail') {
      result.failOnViolation = false;
    } else if (arg === '--no-codeql') {
      result.disableCodeQL = true;
    } else if (arg === '--no-notebooks') {
      result.scanNotebooks = false;
    } else if (arg === '--no-iac') {
      result.scanIaC = false;
    } else if (arg === '--include-comments') {
      result.includeComments = true;
    } else if (arg === '--no-strings') {
      result.includeStrings = false;
    } else if (arg === '--ignore-dir') {
      i++;
      if (i >= args.length) {
        console.error(`Error: ${arg} requires a value`);
        process.exit(1);
      }
      result.ignoreDirs.push(args[i]);
    } else if (arg === '--ignore-file') {
      i++;
      if (i >= args.length) {
        console.error(`Error: ${arg} requires a value`);
        process.exit(1);
      }
      result.ignoreFiles.push(args[i]);
    } else if (arg === '-s' || arg === '--spec') {
      i++;
      if (i >= args.length) {
        console.error(`Error: ${arg} requires a value`);
        process.exit(1);
      }
      result.specFile = args[i];
    } else if (arg === '-f' || arg === '--format') {
      i++;
      if (i >= args.length) {
        console.error(`Error: ${arg} requires a value`);
        process.exit(1);
      }
      const format = args[i];
      if (format !== 'json' && format !== 'markdown' && format !== 'text') {
        console.error(`Error: Invalid format "${format}". Must be json, markdown, or text`);
        process.exit(1);
      }
      result.outputFormat = format;
    } else if (arg.startsWith('-')) {
      console.error(`Error: Unknown option "${arg}"`);
      printUsage();
      process.exit(1);
    } else {
      positionalArgs.push(arg);
    }

    i++;
  }

  if (positionalArgs.length > 0) {
    result.target = positionalArgs[0];
  }

  return result;
}

async function main() {
  const args = process.argv.slice(2);
  const options = parseArgs(args);

  // Handle help flag
  if (options.showHelp) {
    printUsage();
    process.exit(0);
  }

  // Handle version flag
  if (options.showVersion) {
    // Read version from package.json - using require for dynamic import at runtime
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const packageJson = require('../package.json') as { version: string };
    console.log(`aigraph-scanner v${packageJson.version}`);
    process.exit(0);
  }

  const log = options.quiet ? function noop() {} : (msg: string) => console.log(msg);

  log('🔍 AIGraph Scanner starting...');

  try {
    const result = await scan({
      target: options.target,
      specFile: options.specFile,
      outputFormat: options.outputFormat,
      failOnViolation: options.failOnViolation,
      disableCodeQL: options.disableCodeQL,
      scanNotebooks: options.scanNotebooks,
      scanIaC: options.scanIaC,
      includeComments: options.includeComments,
      includeStrings: options.includeStrings,
      ignoreDirs: options.ignoreDirs,
      ignoreFiles: options.ignoreFiles,
      log,
    });

    // Output results
    console.log('\n' + result.formattedOutput);

    if (result.hasViolations) {
      log(`⚠️ Found ${result.violationCount} policy violation(s)`);
      if (options.failOnViolation) {
        process.exit(1);
      }
    } else {
      log('✅ No policy violations found');
    }

    log('🎉 AIGraph Scanner completed successfully');
    process.exit(0);
  } catch (error) {
    console.error('Error:', (error as Error).message);
    process.exit(1);
  }
}

main();
