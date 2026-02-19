"""
MCP SDK Usage - True Positive Test
This file demonstrates MCP SDK usage that SHOULD be detected.
"""

from mcp import ClientSession, StdioServerParameters
from mcp.client.stdio import stdio_client
import asyncio

async def use_mcp_filesystem():
    """Use MCP filesystem server"""
    server_params = StdioServerParameters(
        command="npx",
        args=["-y", "@modelcontextprotocol/server-filesystem", "/tmp"]
    )
    
    async with stdio_client(server_params) as (read, write):
        async with ClientSession(read, write) as session:
            await session.initialize()
            
            # List available tools
            tools = await session.list_tools()
            print(f"Available tools: {tools}")
            
            # Call a tool
            result = await session.call_tool("read_file", {"path": "/tmp/test.txt"})
            return result

async def use_mcp_github():
    """Use MCP GitHub server"""
    server_params = StdioServerParameters(
        command="npx",
        args=["-y", "@modelcontextprotocol/server-github"]
    )
    
    async with stdio_client(server_params) as (read, write):
        async with ClientSession(read, write) as session:
            await session.initialize()
            
            # List repositories
            result = await session.call_tool("list_repos", {"org": "github"})
            return result

async def use_mcp_postgres():
    """Use MCP Postgres server"""
    server_params = StdioServerParameters(
        command="npx",
        args=["-y", "@modelcontextprotocol/server-postgres", "postgresql://localhost/db"]
    )
    
    async with stdio_client(server_params) as (read, write):
        async with ClientSession(read, write) as session:
            await session.initialize()
            
            # Query database
            result = await session.call_tool("query", {
                "sql": "SELECT * FROM users LIMIT 10"
            })
            return result

# MCP server configuration
MCP_SERVERS = {
    "filesystem": "@modelcontextprotocol/server-filesystem",
    "github": "@modelcontextprotocol/server-github",
    "postgres": "@modelcontextprotocol/server-postgres",
    "brave-search": "@modelcontextprotocol/server-brave-search",
    "puppeteer": "@modelcontextprotocol/server-puppeteer"
}

if __name__ == "__main__":
    asyncio.run(use_mcp_filesystem())
