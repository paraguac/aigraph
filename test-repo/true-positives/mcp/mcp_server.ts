/**
 * MCP Server Implementation - True Positive Test
 * This file demonstrates implementing an MCP server that SHOULD be detected.
 */

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';

// Create MCP server
const server = new Server(
  {
    name: 'test-mcp-server',
    version: '1.0.0',
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// Register tools
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: 'get_data',
        description: 'Get some data',
        inputSchema: {
          type: 'object',
          properties: {
            query: { type: 'string' },
          },
        },
      },
      {
        name: 'process_data',
        description: 'Process data',
        inputSchema: {
          type: 'object',
          properties: {
            data: { type: 'string' },
          },
        },
      },
    ],
  };
});

// Handle tool calls
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;
  
  if (name === 'get_data') {
    return {
      content: [
        {
          type: 'text',
          text: `Data for query: ${args.query}`,
        },
      ],
    };
  }
  
  if (name === 'process_data') {
    return {
      content: [
        {
          type: 'text',
          text: `Processed: ${args.data}`,
        },
      ],
    };
  }
  
  throw new Error(`Unknown tool: ${name}`);
});

// Start server
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('MCP Server running on stdio');
}

main().catch((error) => {
  console.error('Server error:', error);
  process.exit(1);
});
