/**
 * AIGraph Scanner - Output Formatter
 * 
 * Formats scan results for various output formats with side-by-side comparison.
 */

import { ScanResults, Violation, Detection, DetectionCategory, ScanMethodResults } from './types';

/**
 * Format scan results as JSON
 */
export function formatAsJson(results: ScanResults): string {
  return JSON.stringify(results, null, 2);
}

/**
 * Group detections by name and aggregate counts
 */
function aggregateDetections(detections: Detection[]): Map<string, { count: number; files: string[]; confidence: string }> {
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
  return uniqueNames;
}

/**
 * Get detections unique to CodeQL (not found by regex)
 */
function getCodeQLOnlyDetections(results: ScanResults): Detection[] {
  if (!results.codeqlResults?.available || !results.regexResults) {
    return [];
  }
  const regexSet = new Set(results.regexResults.detections.map(d => `${d.name}:${d.file}:${d.line}`));
  return results.codeqlResults.detections.filter(
    d => !regexSet.has(`${d.name}:${d.file}:${d.line}`)
  );
}

/**
 * Get detections unique to Regex (not found by CodeQL)
 */
function getRegexOnlyDetections(results: ScanResults): Detection[] {
  if (!results.codeqlResults?.available || !results.regexResults) {
    return results.regexResults?.detections || [];
  }
  const codeqlSet = new Set(results.codeqlResults.detections.map(d => `${d.name}:${d.file}:${d.line}`));
  return results.regexResults.detections.filter(
    d => !codeqlSet.has(`${d.name}:${d.file}:${d.line}`)
  );
}

/**
 * Get common detections (found by both methods)
 */
function getCommonDetections(results: ScanResults): Detection[] {
  if (!results.codeqlResults?.available || !results.regexResults) {
    return [];
  }
  const codeqlSet = new Set(results.codeqlResults.detections.map(d => `${d.name}:${d.file}:${d.line}`));
  return results.regexResults.detections.filter(
    d => codeqlSet.has(`${d.name}:${d.file}:${d.line}`)
  );
}

/**
 * Format method comparison summary
 */
function formatMethodComparison(results: ScanResults): string[] {
  const lines: string[] = [];
  
  if (!results.regexResults && !results.codeqlResults) {
    return lines;
  }

  lines.push('┌───────────────────────────────────────────────────────────────────────────────────────────┐');
  lines.push('│ SCANNING METHOD COMPARISON                                                                │');
  lines.push('├──────────────────────────────┬───────────────┬───────────────┬─────────────┬─────────────┤');
  lines.push('│ Method                       │ Status        │ Total Found   │ Unique      │ Duration    │');
  lines.push('├──────────────────────────────┼───────────────┼───────────────┼─────────────┼─────────────┤');
  
  const regexOnly = getRegexOnlyDetections(results);
  const codeqlOnly = getCodeQLOnlyDetections(results);
  const common = getCommonDetections(results);
  
  if (results.regexResults) {
    const r = results.regexResults;
    const status = r.available ? '✅ Available' : '❌ Failed';
    const count = String(r.detections.length);
    const unique = String(regexOnly.length);
    const duration = `${r.duration}ms`;
    lines.push(`│ ${padRight('Regex Pattern Matching', 28)} │ ${padRight(status, 13)} │ ${padRight(count, 13)} │ ${padRight(unique, 11)} │ ${padRight(duration, 11)} │`);
  }
  
  if (results.codeqlResults) {
    const c = results.codeqlResults;
    let status: string;
    if (c.available) {
      status = '✅ Available';
    } else if (c.error?.includes('not found') || c.error?.includes('not available')) {
      status = '⚠️ Skipped';
    } else {
      status = '❌ Failed';
    }
    const count = c.available ? String(c.detections.length) : '-';
    const unique = c.available ? String(codeqlOnly.length) : '-';
    const duration = c.duration > 0 ? `${c.duration}ms` : '-';
    lines.push(`│ ${padRight('CodeQL AST Analysis', 28)} │ ${padRight(status, 13)} │ ${padRight(count, 13)} │ ${padRight(unique, 11)} │ ${padRight(duration, 11)} │`);
  }
  
  lines.push('├──────────────────────────────┴───────────────┴───────────────┴─────────────┴─────────────┤');
  
  // Show overlap info
  if (results.codeqlResults?.available && results.regexResults) {
    lines.push(`│ Found by both: ${padRight(String(common.length), 10)} | Regex only: ${padRight(String(regexOnly.length), 10)} | CodeQL only: ${padRight(String(codeqlOnly.length), 18)} │`);
  }
  
  lines.push('└───────────────────────────────────────────────────────────────────────────────────────────┘');
  
  // Show if CodeQL is not installed
  if (results.codeqlResults && !results.codeqlResults.available) {
    lines.push('');
    lines.push('💡 Install CodeQL for deeper AST-based analysis: https://codeql.github.com/');
  }
  
  lines.push('');
  
  return lines;
}

/**
 * Format side-by-side detection comparison table
 */
function formatSideBySideDetections(results: ScanResults): string[] {
  const lines: string[] = [];
  
  if (!results.regexResults || !results.codeqlResults?.available) {
    return lines;
  }

  lines.push('┌─────────────────────────────────────────────────────────────────────────────────────────────┐');
  lines.push('│ SIDE-BY-SIDE COMPARISON BY CATEGORY                                                        │');
  lines.push('├──────────────────────┬─────────────────────────────────┬─────────────────────────────────┤');
  lines.push('│ Category             │ Regex Detections                │ CodeQL Detections               │');
  lines.push('├──────────────────────┼─────────────────────────────────┼─────────────────────────────────┤');

  const regexByCategory = groupByCategory(results.regexResults.detections);
  const codeqlByCategory = groupByCategory(results.codeqlResults.detections);

  const categoryLabels: Record<DetectionCategory, string> = {
    'model': 'AI Models',
    'framework': 'AI Frameworks',
    'platform': 'AI Platforms',
    'mcp-server': 'MCP Servers',
    'mcp-tool': 'MCP Tools',
    'api-endpoint': 'API Endpoints',
    'infrastructure': 'Infrastructure',
  };

  for (const [cat, label] of Object.entries(categoryLabels)) {
    const regexCount = regexByCategory[cat as DetectionCategory]?.length || 0;
    const codeqlCount = codeqlByCategory[cat as DetectionCategory]?.length || 0;
    
    if (regexCount > 0 || codeqlCount > 0) {
      const regexNames = aggregateDetections(regexByCategory[cat as DetectionCategory] || []);
      const codeqlNames = aggregateDetections(codeqlByCategory[cat as DetectionCategory] || []);
      
      const regexSummary = Array.from(regexNames.keys()).slice(0, 2).join(', ') + (regexNames.size > 2 ? '...' : '');
      const codeqlSummary = Array.from(codeqlNames.keys()).slice(0, 2).join(', ') + (codeqlNames.size > 2 ? '...' : '');
      
      lines.push(`│ ${padRight(label, 20)} │ ${padRight(`${regexCount} (${regexSummary})`, 31)} │ ${padRight(`${codeqlCount} (${codeqlSummary})`, 31)} │`);
    }
  }
  
  lines.push('└──────────────────────┴─────────────────────────────────┴─────────────────────────────────┘');
  lines.push('');
  
  return lines;
}

/**
 * Format unique findings from each method
 */
function formatUniqueFindings(results: ScanResults): string[] {
  const lines: string[] = [];
  
  if (!results.regexResults || !results.codeqlResults?.available) {
    return lines;
  }

  const regexOnly = getRegexOnlyDetections(results);
  const codeqlOnly = getCodeQLOnlyDetections(results);
  
  // CodeQL-only findings
  if (codeqlOnly.length > 0) {
    lines.push('┌─────────────────────────────────────────────────────────────────────────────────────────────┐');
    lines.push('│ 🔍 CODEQL-ONLY DETECTIONS (AST analysis found these that regex missed)                      │');
    lines.push('├──────────────────────────────┬──────────┬───────────────────────────────────────────────────┤');
    lines.push('│ Name                         │ Count    │ Files                                             │');
    lines.push('├──────────────────────────────┼──────────┼───────────────────────────────────────────────────┤');
    
    const aggregated = aggregateDetections(codeqlOnly);
    for (const [name, info] of Array.from(aggregated.entries()).slice(0, 10)) {
      const fileList = info.files.slice(0, 2).join(', ') + (info.files.length > 2 ? '...' : '');
      lines.push(`│ ${padRight(name, 28)} │ ${padRight(String(info.count), 8)} │ ${padRight(fileList, 49)} │`);
    }
    if (aggregated.size > 10) {
      lines.push(`│ ${padRight('... and ' + (aggregated.size - 10) + ' more', 28)} │ ${padRight('', 8)} │ ${padRight('', 49)} │`);
    }
    lines.push('└──────────────────────────────┴──────────┴───────────────────────────────────────────────────┘');
    lines.push('');
  }
  
  // Regex-only findings (if CodeQL is available but didn't find these)
  if (regexOnly.length > 0 && results.codeqlResults.available) {
    lines.push('┌─────────────────────────────────────────────────────────────────────────────────────────────┐');
    lines.push('│ 📝 REGEX-ONLY DETECTIONS (pattern matching found these, CodeQL may have missed)            │');
    lines.push('├──────────────────────────────┬──────────┬───────────────────────────────────────────────────┤');
    lines.push('│ Name                         │ Count    │ Files                                             │');
    lines.push('├──────────────────────────────┼──────────┼───────────────────────────────────────────────────┤');
    
    const aggregated = aggregateDetections(regexOnly);
    for (const [name, info] of Array.from(aggregated.entries()).slice(0, 10)) {
      const fileList = info.files.slice(0, 2).join(', ') + (info.files.length > 2 ? '...' : '');
      lines.push(`│ ${padRight(name, 28)} │ ${padRight(String(info.count), 8)} │ ${padRight(fileList, 49)} │`);
    }
    if (aggregated.size > 10) {
      lines.push(`│ ${padRight('... and ' + (aggregated.size - 10) + ' more', 28)} │ ${padRight('', 8)} │ ${padRight('', 49)} │`);
    }
    lines.push('└──────────────────────────────┴──────────┴───────────────────────────────────────────────────┘');
    lines.push('');
  }
  
  return lines;
}

/**
 * Format scan results as Markdown
 */
export function formatAsMarkdown(results: ScanResults): string {
  const lines: string[] = [];

  lines.push('# AIGraph Scan Results\n');

  // Method Comparison
  if (results.regexResults || results.codeqlResults) {
    lines.push('## Scanning Methods Comparison\n');
    
    const regexOnly = getRegexOnlyDetections(results);
    const codeqlOnly = getCodeQLOnlyDetections(results);
    const common = getCommonDetections(results);
    
    lines.push('| Method | Status | Total Found | Unique | Duration |');
    lines.push('|--------|--------|-------------|--------|----------|');
    
    if (results.regexResults) {
      const status = results.regexResults.available ? '✅ Available' : '❌ Failed';
      lines.push(`| Regex Pattern Matching | ${status} | ${results.regexResults.detections.length} | ${regexOnly.length} | ${results.regexResults.duration}ms |`);
    }
    
    if (results.codeqlResults) {
      const status = results.codeqlResults.available ? '✅ Available' : '⚠️ Skipped';
      const count = results.codeqlResults.available ? results.codeqlResults.detections.length : '-';
      const unique = results.codeqlResults.available ? codeqlOnly.length : '-';
      const duration = results.codeqlResults.duration > 0 ? `${results.codeqlResults.duration}ms` : '-';
      lines.push(`| CodeQL AST Analysis | ${status} | ${count} | ${unique} | ${duration} |`);
    }
    
    if (results.codeqlResults?.available) {
      lines.push('');
      lines.push(`**Overlap:** ${common.length} detections found by both methods`);
    }
    lines.push('');
  }

  // Side-by-side by category
  if (results.regexResults && results.codeqlResults?.available) {
    lines.push('### Detections by Category (Side-by-Side)\n');
    lines.push('| Category | Regex | CodeQL |');
    lines.push('|----------|-------|--------|');
    
    const regexByCategory = groupByCategory(results.regexResults.detections);
    const codeqlByCategory = groupByCategory(results.codeqlResults.detections);
    
    const categoryLabels: Record<DetectionCategory, string> = {
      'model': 'AI Models',
      'framework': 'AI Frameworks',
      'platform': 'AI Platforms',
      'mcp-server': 'MCP Servers',
      'mcp-tool': 'MCP Tools',
      'api-endpoint': 'API Endpoints',
      'infrastructure': 'Infrastructure',
    };

    for (const [cat, label] of Object.entries(categoryLabels)) {
      const regexCount = regexByCategory[cat as DetectionCategory]?.length || 0;
      const codeqlCount = codeqlByCategory[cat as DetectionCategory]?.length || 0;
      if (regexCount > 0 || codeqlCount > 0) {
        lines.push(`| ${label} | ${regexCount} | ${codeqlCount} |`);
      }
    }
    lines.push('');
  }

  // Summary
  lines.push('## Summary\n');
  lines.push(`| Metric | Count |`);
  lines.push(`|--------|-------|`);
  lines.push(`| Files Scanned | ${results.summary.filesScanned} |`);
  lines.push(`| Total Detections (Combined) | ${results.summary.totalDetections} |`);
  lines.push(`| Total Violations | ${results.summary.totalViolations} |`);
  lines.push('');

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

  // Unique findings sections
  if (results.codeqlResults?.available && results.regexResults) {
    const codeqlOnly = getCodeQLOnlyDetections(results);
    const regexOnly = getRegexOnlyDetections(results);
    
    if (codeqlOnly.length > 0) {
      lines.push('## 🔍 CodeQL-Only Detections\n');
      lines.push('*These were found by AST analysis but not by regex patterns:*\n');
      lines.push('| Name | Count | Files |');
      lines.push('|------|-------|-------|');
      const aggregated = aggregateDetections(codeqlOnly);
      for (const [name, info] of Array.from(aggregated.entries()).slice(0, 15)) {
        const fileList = info.files.slice(0, 2).join(', ') + (info.files.length > 2 ? '...' : '');
        lines.push(`| ${name} | ${info.count} | ${fileList} |`);
      }
      lines.push('');
    }
    
    if (regexOnly.length > 0) {
      lines.push('## 📝 Regex-Only Detections\n');
      lines.push('*These were found by pattern matching:*\n');
      lines.push('| Name | Count | Files |');
      lines.push('|------|-------|-------|');
      const aggregated = aggregateDetections(regexOnly);
      for (const [name, info] of Array.from(aggregated.entries()).slice(0, 15)) {
        const fileList = info.files.slice(0, 2).join(', ') + (info.files.length > 2 ? '...' : '');
        lines.push(`| ${name} | ${info.count} | ${fileList} |`);
      }
      lines.push('');
    }
  }

  // All Detections
  if (results.detections.length > 0) {
    lines.push('## All Detections (Combined)\n');
    
    const byCategory = groupByCategory(results.detections);
    
    for (const [category, detections] of Object.entries(byCategory)) {
      if (detections.length === 0) continue;
      
      lines.push(`### ${formatCategory(category as DetectionCategory)}\n`);
      lines.push(`| Name | File | Line | Confidence |`);
      lines.push(`|------|------|------|------------|`);
      
      for (const detection of detections.slice(0, 20)) {
        lines.push(`| ${detection.name} | \`${detection.file}\` | ${detection.line} | ${detection.confidence} |`);
      }
      if (detections.length > 20) {
        lines.push(`| *... and ${detections.length - 20} more* | | | |`);
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

  lines.push('╔═══════════════════════════════════════════════════════════════════════════════════════════╗');
  lines.push('║                              AIGraph Scan Results                                         ║');
  lines.push('╚═══════════════════════════════════════════════════════════════════════════════════════════╝');
  lines.push('');

  // Method Comparison (at the top)
  lines.push(...formatMethodComparison(results));

  // Side-by-side comparison
  lines.push(...formatSideBySideDetections(results));

  // Summary Table
  lines.push('┌─────────────────────────────────────────────────────────────────────────────────────────────┐');
  lines.push('│ SUMMARY                                                                                     │');
  lines.push('├──────────────────────────────┬────────────────────────────────────────────────────────────┤');
  lines.push(`│ Files Scanned                │ ${padRight(String(results.summary.filesScanned), 58)} │`);
  lines.push(`│ Total Detections (Combined)  │ ${padRight(String(results.summary.totalDetections), 58)} │`);
  lines.push(`│ Total Violations             │ ${padRight(String(results.summary.totalViolations), 58)} │`);
  lines.push('└──────────────────────────────┴────────────────────────────────────────────────────────────┘');
  lines.push('');

  // Violations Table
  if (results.violations.length > 0) {
    lines.push('┌─────────────────────────────────────────────────────────────────────────────────────────────┐');
    lines.push('│ ⚠️  POLICY VIOLATIONS                                                                        │');
    lines.push('├────┬────────────────────────┬──────────────────┬──────────────────────────┬────────────────┤');
    lines.push('│ #  │ Name                   │ Category         │ File                     │ Line           │');
    lines.push('├────┼────────────────────────┼──────────────────┼──────────────────────────┼────────────────┤');
    
    for (let i = 0; i < results.violations.length; i++) {
      const v = results.violations[i];
      const num = padRight(String(i + 1), 2);
      const name = truncateAndPad(v.detection.name, 22);
      const cat = truncateAndPad(formatCategory(v.detection.category), 16);
      const file = truncateAndPad(v.detection.file, 24);
      const line = padRight(String(v.detection.line), 14);
      lines.push(`│ ${num} │ ${name} │ ${cat} │ ${file} │ ${line} │`);
    }
    lines.push('└────┴────────────────────────┴──────────────────┴──────────────────────────┴────────────────┘');
    lines.push('');
  } else {
    lines.push('┌─────────────────────────────────────────────────────────────────────────────────────────────┐');
    lines.push('│ ✅ No policy violations found                                                               │');
    lines.push('└─────────────────────────────────────────────────────────────────────────────────────────────┘');
    lines.push('');
  }

  // Unique findings
  lines.push(...formatUniqueFindings(results));

  // All Detections Table (grouped by category)
  if (results.detections.length > 0) {
    lines.push('┌─────────────────────────────────────────────────────────────────────────────────────────────┐');
    lines.push('│ ALL DETECTIONS (COMBINED)                                                                   │');
    lines.push('└─────────────────────────────────────────────────────────────────────────────────────────────┘');
    lines.push('');
    
    const byCategory = groupByCategory(results.detections);
    
    for (const [category, detections] of Object.entries(byCategory)) {
      if (detections.length === 0) continue;
      
      const uniqueNames = aggregateDetections(detections);
      
      lines.push('┌─────────────────────────────────────────────────────────────────────────────────────────────┐');
      lines.push(`│ ${padRight(formatCategory(category as DetectionCategory).toUpperCase() + 'S', 87)} │`);
      lines.push('├──────────────────────────────────┬──────────┬────────────┬───────────────────────────────┤');
      lines.push('│ Name                             │ Count    │ Confidence │ Files                         │');
      lines.push('├──────────────────────────────────┼──────────┼────────────┼───────────────────────────────┤');
      
      for (const [name, info] of uniqueNames) {
        const nameCol = truncateAndPad(name, 32);
        const countCol = padRight(String(info.count), 8);
        const confCol = padRight(info.confidence, 10);
        const filesCol = truncateAndPad(info.files.slice(0, 2).join(', ') + (info.files.length > 2 ? '...' : ''), 29);
        lines.push(`│ ${nameCol} │ ${countCol} │ ${confCol} │ ${filesCol} │`);
      }
      lines.push('└──────────────────────────────────┴──────────┴────────────┴───────────────────────────────┘');
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
