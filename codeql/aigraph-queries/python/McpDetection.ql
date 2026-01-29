/**
 * @name MCP Server and Tool Detection
 * @description Detects Model Context Protocol (MCP) server and tool usage
 * @kind problem
 * @problem.severity recommendation
 * @id aigraph/python/mcp-detection
 * @tags ai
 *       mcp
 *       aigraph
 * @precision high
 */

import python
import semmle.python.dataflow.new.DataFlow

/**
 * MCP-related module patterns
 */
predicate isMcpModule(string moduleName) {
  moduleName.matches("mcp%") or
  moduleName.matches("modelcontextprotocol%") or
  moduleName = "mcp" or
  moduleName = "mcp.server" or
  moduleName = "mcp.client" or
  moduleName = "mcp.types" or
  moduleName = "mcp.tool"
}

/**
 * MCP-related class/function names
 */
predicate isMcpConstruct(string name) {
  name = "Server" or
  name = "McpServer" or
  name = "Client" or
  name = "McpClient" or
  name = "Tool" or
  name = "McpTool" or
  name = "Resource" or
  name = "Prompt" or
  name = "stdio_server" or
  name = "sse_server"
}

/**
 * Known MCP server package patterns
 */
predicate isMcpServerPackage(string name) {
  name.matches("%mcp-server-filesystem%") or
  name.matches("%mcp-server-github%") or
  name.matches("%mcp-server-postgres%") or
  name.matches("%mcp-server-sqlite%") or
  name.matches("%mcp-server-brave-search%") or
  name.matches("%mcp-server-puppeteer%") or
  name.matches("%mcp-server-memory%") or
  name.matches("%mcp-server-fetch%") or
  name.matches("%mcp-server-slack%") or
  name.matches("%mcp-server-google-drive%") or
  name.matches("%mcp-server-everything%") or
  name.matches("%mcp-server-%") or
  name.matches("%@modelcontextprotocol/server-%")
}

// Detect MCP module imports
from Import imp, string moduleName
where 
  moduleName = imp.getImportedModuleName() and
  isMcpModule(moduleName)
select imp, "MCP module import detected: " + moduleName

// Detect MCP constructs usage
from Call call, string name
where
  name = call.getFunc().(Name).getId() and
  isMcpConstruct(name)
select call, "MCP construct usage: " + name

// Detect MCP server package references in strings
from StringLiteral str, string value
where
  value = str.getText() and
  isMcpServerPackage(value)
select str, "MCP server package reference: " + value
