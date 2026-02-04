/**
 * @name MCP Detection
 * @description Detects Model Context Protocol (MCP) server and client usage
 * @kind problem
 * @problem.severity recommendation
 * @id aigraph/javascript/mcp-detection
 * @tags ai
 *       mcp
 *       aigraph
 * @precision high
 */

import javascript

/**
 * Known MCP server package patterns
 */
bindingset[name]
predicate isMcpServerPackage(string name) {
  name.matches("%@modelcontextprotocol/server-%") or
  name.matches("%@modelcontextprotocol/sdk%") or
  name.matches("%mcp-server-%") or
  name.matches("%/mcp/%") or
  name = "@modelcontextprotocol/sdk"
}

// Detect MCP package references in string literals (imports, requires, package.json)
from StringLiteral str, string value
where
  value = str.getValue() and
  isMcpServerPackage(value)
select str, "MCP server package reference: " + value
