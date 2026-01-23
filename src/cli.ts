#!/usr/bin/env node
/**
 * AIGraph Scanner - CLI for testing
 */

import { FileScanner } from './scanners';
import { PolicyEnforcer } from './policy';
import { formatResults } from './formatter';
import { parseGitHubRepo, cloneGitHubRepo, isGitHubRepoRef, CloneResult } from './github-repo';

function printUsage() {
  console.log(`
Usage: aigraph-scanner [path-or-repo] [spec-file]

Arguments:
  path-or-repo   Local path to scan OR a public GitHub repository
                 Formats: owner/repo, owner/repo@branch, https://github.com/owner/repo
  spec-file      Path to the spec file (default: .aigraph-spec.yml)

Examples:
  aigraph-scanner .                           # Scan current directory
  aigraph-scanner ./src                       # Scan src directory
  aigraph-scanner langchain-ai/langchain      # Scan public GitHub repo
  aigraph-scanner openai/openai-python@main   # Scan specific branch
  aigraph-scanner . custom-spec.yml           # Use custom spec file
`);
}

async function main() {
  const args = process.argv.slice(2);
  
  // Handle help flag
  if (args.includes('--help') || args.includes('-h')) {
    printUsage();
    process.exit(0);
  }

  const pathOrRepo = args[0] || '.';
  const specFile = args[1] || '.aigraph-spec.yml';
  
  let scanPath = pathOrRepo;
  let cloneResult: CloneResult | undefined;
  
  console.log('🔍 AIGraph Scanner starting...');

  try {
    // Check if the argument is a GitHub repo reference
    if (isGitHubRepoRef(pathOrRepo)) {
      console.log(`🌐 GitHub repository: ${pathOrRepo}`);
      console.log('📥 Cloning repository...');
      
      const repoRef = parseGitHubRepo(pathOrRepo);
      cloneResult = await cloneGitHubRepo(repoRef);
      scanPath = cloneResult.path;
      
      console.log(`✅ Repository cloned successfully`);
    } else {
      console.log(`📁 Scan path: ${scanPath}`);
    }
    
    console.log(`📋 Spec file: ${specFile}`);

    // Load policy spec
    console.log('📜 Loading policy spec...');
    const spec = await PolicyEnforcer.loadSpec(specFile);
    const enforcer = new PolicyEnforcer(spec);

    // Scan files
    console.log('🔎 Scanning files for AI components...');
    const scanner = new FileScanner(scanPath);
    const scanResults = await scanner.scan();

    console.log(`📊 Found ${scanResults.detections.length} detections in ${scanResults.summary.filesScanned} files`);

    // Enforce policies
    console.log('⚖️ Enforcing policies...');
    const results = enforcer.enforce(scanResults);

    // Output results
    const output = formatResults(results, 'text');
    console.log('\n' + output);

    if (results.violations.length > 0) {
      console.log(`⚠️ Found ${results.violations.length} policy violation(s)`);
      process.exit(1);
    } else {
      console.log('✅ No policy violations found');
      process.exit(0);
    }
  } finally {
    // Clean up cloned repository if any
    if (cloneResult) {
      await cloneResult.cleanup();
    }
  }
}

main().catch(error => {
  console.error('Error:', error.message);
  process.exit(1);
});
