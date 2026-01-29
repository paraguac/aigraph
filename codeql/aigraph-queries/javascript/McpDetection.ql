/**
 * @name MCP Server and Tool Detection (JavaScript/TypeScript)
 * @description Detects Model Context Protocol (MCP) server and tool usage
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
 * MCP-related module patterns
 */
predicate isMcpModule(string moduleName) {
  moduleName = "@modelcontextprotocol/sdk" or
  moduleName.matches("@modelcontextprotocol/%") or
  moduleName.matches("%mcp-server-%") or
  moduleName.matches("%mcp-client%")
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
  name = "StdioServerTransport" or
  name = "SSEServerTransport"
}

/**
 * Known MCP server package patterns
 */
predicate isMcpServerPackage(string name) {
  name.matches("%@modelcontextprotocol/server-filesystem%") or
  name.matches("%@modelcontextprotocol/server-github%") or
  name.matches("%@modelcontextprotocol/server-postgres%") or
  name.matches("%@modelcontextprotocol/server-sqlite%") or
  name.matches("%@modelcontextprotocol/server-brave-search%") or
  name.matches("%@modelcontextprotocol/server-puppeteer%") or
  name.matches("%@modelcontextprotocol/server-memory%") or
  name.matches("%@modelcontextprotocol/server-fetch%") or
  name.matches("%@modelcontextprotocol/server-slack%") or
  name.matches("%@modelcontextprotocol/server-google-drive%") or
  name.matches("%@modelcontextprotocol/server-everything%") or
  name.matches("%@modelcontextprotocol/server-%")
}

// Detect MCP module imports
from ImportDeclaration imp, string moduleName
where 
  moduleName = imp.getImportedPath().getValue() and
  isMcpModule(moduleName)
select imp, "MCP module import detected: " + moduleName

// Detect MCP require calls
from CallExpr call, string moduleName
where
  call.getCalleeName() = "require" and
  moduleName = call.getArgument(0).(StringLiteral).getValue() and
  isMcpModule(moduleName)
select call, "MCP module require detected: " + moduleName

// Detect MCP class instantiations
from NewExpr newExpr, string name
where
  name = newExpr.getCallee().(Identifier).getName() and
  isMcpConstruct(name)
select newExpr, "MCP construct instantiation: " + name

// Detect MCP server package references in strings (e.g., in package.json)
from StringLiteral str, string value
where
  value = str.getValue() and
  isMcpServerPackage(value)
select str, "MCP server package reference: " + value
