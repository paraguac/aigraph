#!/usr/bin/env node
/**
 * AIGraph Scanner - CLI for testing
 */

import { FileScanner } from './scanners';
import { PolicyEnforcer } from './policy';
import { formatResults } from './formatter';

async function main() {
  const scanPath = process.argv[2] || '.';
  const specFile = process.argv[3] || '.aigraph-spec.yml';
  
  console.log('🔍 AIGraph Scanner starting...');
  console.log(`📁 Scan path: ${scanPath}`);
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
}

main().catch(error => {
  console.error('Error:', error.message);
  process.exit(1);
});
