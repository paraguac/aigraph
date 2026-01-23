/**
 * AIGraph Scanner - GitHub Action Entry Point
 */

import * as core from '@actions/core';
import { FileScanner } from './scanners';
import { PolicyEnforcer } from './policy';
import { formatResults } from './formatter';
import { ScannerConfig } from './types';

/**
 * Get action inputs
 */
function getInputs(): ScannerConfig {
  return {
    specFile: core.getInput('spec-file') || '.aigraph-spec.yml',
    scanPath: core.getInput('scan-path') || '.',
    failOnViolation: core.getInput('fail-on-violation') !== 'false',
    outputFormat: (core.getInput('output-format') || 'markdown') as 'json' | 'markdown' | 'text',
  };
}

/**
 * Main action runner
 */
async function run(): Promise<void> {
  try {
    core.info('🔍 AIGraph Scanner starting...');
    
    const config = getInputs();
    
    core.info(`📁 Scan path: ${config.scanPath}`);
    core.info(`📋 Spec file: ${config.specFile}`);
    core.info(`📊 Output format: ${config.outputFormat}`);

    // Load policy spec
    core.info('📜 Loading policy spec...');
    const spec = await PolicyEnforcer.loadSpec(config.specFile);
    const enforcer = new PolicyEnforcer(spec);

    // Scan files
    core.info('🔎 Scanning files for AI components...');
    const scanner = new FileScanner(config.scanPath);
    const scanResults = await scanner.scan();

    core.info(`📊 Found ${scanResults.detections.length} detections in ${scanResults.summary.filesScanned} files`);

    // Enforce policies
    core.info('⚖️ Enforcing policies...');
    const results = enforcer.enforce(scanResults);

    // Output results
    const formattedOutput = formatResults(results, config.outputFormat);
    
    // Write to summary
    if (config.outputFormat === 'markdown') {
      await core.summary.addRaw(formattedOutput).write();
    }

    // Log to console
    core.info('\n' + formattedOutput);

    // Set outputs
    core.setOutput('violations-found', results.violations.length > 0 ? 'true' : 'false');
    core.setOutput('violations-count', results.violations.length.toString());
    core.setOutput('scan-results', JSON.stringify(results));

    // Handle violations
    if (results.violations.length > 0) {
      core.warning(`⚠️ Found ${results.violations.length} policy violation(s)`);
      
      // Create annotations for violations
      for (const violation of results.violations) {
        core.warning(violation.message, {
          file: violation.detection.file,
          startLine: violation.detection.line,
        });
      }

      if (config.failOnViolation) {
        core.setFailed(`Found ${results.violations.length} policy violation(s)`);
        return;
      }
    } else {
      core.info('✅ No policy violations found');
    }

    core.info('🎉 AIGraph Scanner completed successfully');
  } catch (error) {
    core.setFailed(`Action failed: ${(error as Error).message}`);
  }
}

// Run the action
run();
