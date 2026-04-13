/**
 * Buildev MCP Server
 * Exposes visual builder tools to AI models (Claude, etc)
 */

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";

const server = new Server(
  {
    name: "buildev-mcp",
    version: "0.1.0",
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

/**
 * Listado de herramientas disponibles para la IA.
 */
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: "get_page_ast",
        description: "Obtiene el AST JSON completo de una página de Buildev.",
        inputSchema: {
          type: "object",
          properties: {
            pageId: { type: "string" },
          },
          required: ["pageId"],
        },
      },
      {
        name: "apply_style_to_node",
        description: "Aplica estilos CSS a un nodo específico del AST.",
        inputSchema: {
          type: "object",
          properties: {
            nodeId: { type: "string" },
            styles: { type: "object", additionalProperties: { type: "string" } },
          },
          required: ["nodeId", "styles"],
        },
      },
    ],
  };
});

/**
 * Ejecución de herramientas.
 */
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  switch (name) {
    case "get_page_ast":
      return {
        content: [{ type: "text", text: "AST data requested for " + args?.pageId }],
      };
    case "apply_style_to_node":
      return {
        content: [{ type: "text", text: `Applied styles to ${args?.nodeId}` }],
      };
    default:
      throw new Error("Tool not found");
  }
});

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
}

main().catch((error) => {
  console.error("Server error:", error);
  process.exit(1);
});
