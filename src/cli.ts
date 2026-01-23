#!/usr/bin/env node
/**
 * AIGraph Scanner - Command Line Interface
 * 
 * This CLI allows running the AIGraph scanner from anywhere,
 * not just as a GitHub Action.
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
  -s, --spec <file>      Path to the spec file (default: .aigraph-spec.yml)
  -f, --format <format>  Output format: json, markdown, text (default: text)
  -q, --quiet            Suppress progress messages, only output results
  --no-fail              Don't exit with error code on violations
  -h, --help             Show this help message
  -v, --version          Show version number

Examples:
  aigraph-scanner                             # Scan current directory
  aigraph-scanner ./src                       # Scan src directory
  aigraph-scanner langchain-ai/langchain      # Scan public GitHub repo
  aigraph-scanner openai/openai-python@main   # Scan specific branch
  aigraph-scanner -s custom-spec.yml ./src    # Use custom spec file
  aigraph-scanner -f json .                   # Output as JSON
  aigraph-scanner -q -f json .                # Quiet mode with JSON output
`);
}

function parseArgs(args: string[]): {
  target: string;
  specFile: string;
  outputFormat: 'json' | 'markdown' | 'text';
  quiet: boolean;
  failOnViolation: boolean;
  showHelp: boolean;
  showVersion: boolean;
} {
  const result = {
    target: '.',
    specFile: '.aigraph-spec.yml',
    outputFormat: 'text' as 'json' | 'markdown' | 'text',
    quiet: false,
    failOnViolation: true,
    showHelp: false,
    showVersion: false,
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
