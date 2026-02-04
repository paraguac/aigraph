/**
 * AIGraph Scanner - Output Formatter
 * 
 * Formats scan results for various output formats.
 */

import { ScanResults, Violation, Detection, DetectionCategory, ScanMethodResults } from './types';

/**
 * Format scan results as JSON
 */
export function formatAsJson(results: ScanResults): string {
  return JSON.stringify(results, null, 2);
}

/**
 * Format method comparison summary
 */
function formatMethodComparison(results: ScanResults): string[] {
  const lines: string[] = [];
  
  if (!results.regexResults && !results.codeqlResults) {
    return lines;
  }

  lines.push('┌─────────────────────────────────────────────────────────────────────────────┐');
  lines.push('│ SCANNING METHOD COMPARISON                                                  │');
  lines.push('├──────────────────────────┬───────────────┬───────────────┬─────────────────┤');
  lines.push('│ Method                   │ Status        │ Detections    │ Duration        │');
  lines.push('├──────────────────────────┼───────────────┼───────────────┼─────────────────┤');
  
  if (results.regexResults) {
    const r = results.regexResults;
    const status = r.available ? '✅ Available' : '❌ Failed';
    const count = String(r.detections.length);
    const duration = `${r.duration}ms`;
    lines.push(`│ ${padRight('Regex Pattern Matching', 24)} │ ${padRight(status, 13)} │ ${padRight(count, 13)} │ ${padRight(duration, 15)} │`);
  }
  
  if (results.codeqlResults) {
    const c = results.codeqlResults;
    let status: string;
    if (c.available) {
      status = '✅ Available';
    } else if (c.error?.includes('not found') || c.error?.includes('not available')) {
      status = '⚠️ Not installed';
    } else {
      status = '❌ Failed';
    }
    const count = String(c.detections.length);
    const duration = c.duration > 0 ? `${c.duration}ms` : '-';
    lines.push(`│ ${padRight('CodeQL AST Analysis', 24)} │ ${padRight(status, 13)} │ ${padRight(count, 13)} │ ${padRight(duration, 15)} │`);
  }
  
  lines.push('└──────────────────────────┴───────────────┴───────────────┴─────────────────┘');
  
  // Show CodeQL-only detections if any
  if (results.codeqlResults?.available && results.regexResults) {
    const regexNames = new Set(results.regexResults.detections.map(d => `${d.name}:${d.file}:${d.line}`));
    const codeqlOnly = results.codeqlResults.detections.filter(
      d => !regexNames.has(`${d.name}:${d.file}:${d.line}`)
    );
    
    if (codeqlOnly.length > 0) {
      lines.push('');
      lines.push(`│ ℹ️  CodeQL found ${codeqlOnly.length} additional detection(s) not found by regex`);
    }
  }
  
  // Show if CodeQL is not installed
  if (results.codeqlResults && !results.codeqlResults.available) {
    lines.push('');
    lines.push('│ 💡 Install CodeQL for deeper AST-based analysis: https://codeql.github.com/');
  }
  
  lines.push('');
  
  return lines;
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
 * Format scan results as plain text with tables
 */
export function formatAsText(results: ScanResults): string {
  const lines: string[] = [];

  lines.push('╔══════════════════════════════════════════════════════════════════════════════╗');
  lines.push('║                           AIGraph Scan Results                              ║');
  lines.push('╚══════════════════════════════════════════════════════════════════════════════╝');
  lines.push('');

  // Method Comparison (at the top)
  lines.push(...formatMethodComparison(results));

  // Summary Table
  lines.push('┌─────────────────────────────────────────────────────────────────────────────┐');
  lines.push('│ SUMMARY                                                                     │');
  lines.push('├──────────────────────────┬────────────────────────────────────────────────┤');
  lines.push(`│ Files Scanned            │ ${padRight(String(results.summary.filesScanned), 46)} │`);
  lines.push(`│ Total Detections         │ ${padRight(String(results.summary.totalDetections), 46)} │`);
  lines.push(`│ Total Violations         │ ${padRight(String(results.summary.totalViolations), 46)} │`);
  lines.push('└──────────────────────────┴────────────────────────────────────────────────┘');
  lines.push('');

  // Detections by Category Table
  if (results.summary.totalDetections > 0) {
    lines.push('┌─────────────────────────────────────────────────────────────────────────────┐');
    lines.push('│ DETECTIONS BY CATEGORY                                                      │');
    lines.push('├──────────────────────────┬────────────────────────────────────────────────┤');
    for (const [cat, count] of Object.entries(results.summary.detectionsByCategory)) {
      if (count > 0) {
        lines.push(`│ ${padRight(formatCategory(cat as DetectionCategory), 24)} │ ${padRight(String(count), 46)} │`);
      }
    }
    lines.push('└──────────────────────────┴────────────────────────────────────────────────┘');
    lines.push('');
  }

  // Violations Table
  if (results.violations.length > 0) {
    lines.push('┌─────────────────────────────────────────────────────────────────────────────┐');
    lines.push('│ ⚠️  POLICY VIOLATIONS                                                        │');
    lines.push('├────┬────────────────────┬──────────────────┬────────────────────┬──────────┤');
    lines.push('│ #  │ Name               │ Category         │ File               │ Line     │');
    lines.push('├────┼────────────────────┼──────────────────┼────────────────────┼──────────┤');
    
    for (let i = 0; i < results.violations.length; i++) {
      const v = results.violations[i];
      const num = padRight(String(i + 1), 2);
      const name = truncateAndPad(v.detection.name, 18);
      const cat = truncateAndPad(formatCategory(v.detection.category), 16);
      const file = truncateAndPad(v.detection.file, 18);
      const line = padRight(String(v.detection.line), 8);
      lines.push(`│ ${num} │ ${name} │ ${cat} │ ${file} │ ${line} │`);
    }
    lines.push('└────┴────────────────────┴──────────────────┴────────────────────┴──────────┘');
    lines.push('');
  } else {
    lines.push('┌─────────────────────────────────────────────────────────────────────────────┐');
    lines.push('│ ✅ No policy violations found                                               │');
    lines.push('└─────────────────────────────────────────────────────────────────────────────┘');
    lines.push('');
  }

  // All Detections Table (grouped by category)
  if (results.detections.length > 0) {
    const byCategory = groupByCategory(results.detections);
    
    for (const [category, detections] of Object.entries(byCategory)) {
      if (detections.length === 0) continue;
      
      // Deduplicate by name for cleaner output
      const uniqueNames = new Map<string, { count: number; files: string[]; confidence: string }>();
      for (const d of detections) {
        const existing = uniqueNames.get(d.name);
        if (existing) {
          existing.count++;
          if (!existing.files.includes(d.file)) {
            existing.files.push(d.file);
          }
        } else {
          uniqueNames.set(d.name, { count: 1, files: [d.file], confidence: d.confidence });
        }
      }
      
      lines.push(`┌─────────────────────────────────────────────────────────────────────────────┐`);
      lines.push(`│ ${padRight(formatCategory(category as DetectionCategory).toUpperCase() + 'S', 75)} │`);
      lines.push('├──────────────────────────────┬──────────┬────────────┬─────────────────────┤');
      lines.push('│ Name                         │ Count    │ Confidence │ Files               │');
      lines.push('├──────────────────────────────┼──────────┼────────────┼─────────────────────┤');
      
      for (const [name, info] of uniqueNames) {
        const nameCol = truncateAndPad(name, 28);
        const countCol = padRight(String(info.count), 8);
        const confCol = padRight(info.confidence, 10);
        const filesCol = truncateAndPad(info.files.slice(0, 2).join(', ') + (info.files.length > 2 ? '...' : ''), 19);
        lines.push(`│ ${nameCol} │ ${countCol} │ ${confCol} │ ${filesCol} │`);
      }
      lines.push('└──────────────────────────────┴──────────┴────────────┴─────────────────────┘');
      lines.push('');
    }
  }

  return lines.join('\n');
}

/**
 * Pad string to the right
 */
function padRight(str: string, len: number): string {
  return str.padEnd(len).substring(0, len);
}

/**
 * Truncate and pad string
 */
function truncateAndPad(str: string, len: number): string {
  if (!str) return ''.padEnd(len);
  if (str.length > len) {
    return str.substring(0, len - 2) + '..';
  }
  return str.padEnd(len);
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
