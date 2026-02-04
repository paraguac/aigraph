/**
 * @name MCP Detection
 * @description Detects Model Context Protocol (MCP) server and client usage
 * @kind problem
 * @problem.severity recommendation
 * @id aigraph/python/mcp-detection
 * @tags ai
 *       mcp
 *       aigraph
 * @precision high
 */

import python

/**
 * Known MCP server package patterns
 */
bindingset[name]
predicate isMcpServerPackage(string name) {
  name.matches("%mcp-server-%") or
  name.matches("%mcp%") or
  name.matches("%modelcontextprotocol%") or
  name = "mcp" or
  name = "mcp.server" or
  name = "mcp.client"
}

// Detect MCP package references in string literals
from StringLiteral str, string value
where
  value = str.getText() and
  isMcpServerPackage(value)
select str, "MCP server package reference: " + value
