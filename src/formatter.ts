/**
 * AIGraph Scanner - Output Formatter
 * 
 * Formats scan results for various output formats.
 */

import { ScanResults, Violation, Detection, DetectionCategory } from './types';

/**
 * Format scan results as JSON
 */
export function formatAsJson(results: ScanResults): string {
  return JSON.stringify(results, null, 2);
}

/**
 * Format scan results as Markdown
 */
export function formatAsMarkdown(results: ScanResults): string {
  const lines: string[] = [];

  lines.push('# AIGraph Scan Results\n');

  // Summary
  lines.push('## Summary\n');
  lines.push(`| Metric | Count |`);
  lines.push(`|--------|-------|`);
  lines.push(`| Files Scanned | ${results.summary.filesScanned} |`);
  lines.push(`| Total Detections | ${results.summary.totalDetections} |`);
  lines.push(`| Total Violations | ${results.summary.totalViolations} |`);
  lines.push('');

  // Detections by category
  if (results.summary.totalDetections > 0) {
    lines.push('### Detections by Category\n');
    lines.push(`| Category | Count |`);
    lines.push(`|----------|-------|`);
    
    const categoryLabels: Record<DetectionCategory, string> = {
      'model': 'AI Models',
      'framework': 'AI Frameworks',
      'platform': 'AI Platforms',
      'mcp-server': 'MCP Servers',
      'mcp-tool': 'MCP Tools',
      'api-endpoint': 'API Endpoints',
      'infrastructure': 'Infrastructure',
    };

    for (const [category, label] of Object.entries(categoryLabels)) {
      const count = results.summary.detectionsByCategory[category as DetectionCategory];
      if (count > 0) {
        lines.push(`| ${label} | ${count} |`);
      }
    }
    lines.push('');
  }

  // Violations
  if (results.violations.length > 0) {
    lines.push('## ⚠️ Policy Violations\n');
    
    for (const violation of results.violations) {
      lines.push(`### ${violation.detection.name}\n`);
      lines.push(`- **Category:** ${formatCategory(violation.detection.category)}`);
      lines.push(`- **File:** \`${violation.detection.file}\``);
      lines.push(`- **Line:** ${violation.detection.line}`);
      lines.push(`- **Rule:** ${violation.rule}`);
      lines.push(`- **Message:** ${violation.message}`);
      lines.push('');
      lines.push('```');
      lines.push(violation.detection.snippet);
      lines.push('```');
      lines.push('');
    }
  } else if (results.summary.totalDetections > 0) {
    lines.push('## ✅ No Policy Violations\n');
    lines.push('All detected AI components comply with the configured policies.\n');
  }

  // All Detections
  if (results.detections.length > 0) {
    lines.push('## All Detections\n');
    
    // Group by category
    const byCategory = groupByCategory(results.detections);
    
    for (const [category, detections] of Object.entries(byCategory)) {
      if (detections.length === 0) continue;
      
      lines.push(`### ${formatCategory(category as DetectionCategory)}\n`);
      lines.push(`| Name | File | Line | Confidence |`);
      lines.push(`|------|------|------|------------|`);
      
      for (const detection of detections) {
        lines.push(`| ${detection.name} | \`${detection.file}\` | ${detection.line} | ${detection.confidence} |`);
      }
      lines.push('');
    }
  }

  return lines.join('\n');
}

/**
 * Format scan results as plain text
 */
export function formatAsText(results: ScanResults): string {
  const lines: string[] = [];

  lines.push('=== AIGraph Scan Results ===\n');

  // Summary
  lines.push('SUMMARY');
  lines.push(`  Files Scanned: ${results.summary.filesScanned}`);
  lines.push(`  Total Detections: ${results.summary.totalDetections}`);
  lines.push(`  Total Violations: ${results.summary.totalViolations}`);
  lines.push('');

  // Violations
  if (results.violations.length > 0) {
    lines.push('POLICY VIOLATIONS');
    lines.push('');
    
    for (let i = 0; i < results.violations.length; i++) {
      const violation = results.violations[i];
      lines.push(`[${i + 1}] ${violation.message}`);
      lines.push(`    Category: ${formatCategory(violation.detection.category)}`);
      lines.push(`    Location: ${violation.detection.file}:${violation.detection.line}`);
      lines.push(`    Confidence: ${violation.detection.confidence}`);
      lines.push('');
    }
  } else {
    lines.push('No policy violations found.\n');
  }

  // Detections
  if (results.detections.length > 0) {
    lines.push('ALL DETECTIONS');
    lines.push('');
    
    for (const detection of results.detections) {
      lines.push(`  - ${detection.name} (${formatCategory(detection.category)})`);
      lines.push(`    File: ${detection.file}:${detection.line}`);
    }
    lines.push('');
  }

  return lines.join('\n');
}

/**
 * Format category for display
 */
function formatCategory(category: DetectionCategory): string {
  const labels: Record<DetectionCategory, string> = {
    'model': 'AI Model',
    'framework': 'AI Framework',
    'platform': 'AI Platform',
    'mcp-server': 'MCP Server',
    'mcp-tool': 'MCP Tool',
    'api-endpoint': 'API Endpoint',
    'infrastructure': 'Infrastructure',
  };
  return labels[category];
}

/**
 * Group detections by category
 */
function groupByCategory(detections: Detection[]): Record<DetectionCategory, Detection[]> {
  const result: Record<DetectionCategory, Detection[]> = {
    'model': [],
    'framework': [],
    'platform': [],
    'mcp-server': [],
    'mcp-tool': [],
    'api-endpoint': [],
    'infrastructure': [],
  };

  for (const detection of detections) {
    result[detection.category].push(detection);
  }

  return result;
}

/**
 * Format results based on output format
 */
export function formatResults(
  results: ScanResults, 
  format: 'json' | 'markdown' | 'text'
): string {
  switch (format) {
    case 'json':
      return formatAsJson(results);
    case 'markdown':
      return formatAsMarkdown(results);
    case 'text':
      return formatAsText(results);
    default:
      return formatAsMarkdown(results);
  }
}
