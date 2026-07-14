// In-process Studio MCP mount for the embedded agent host. Wraps the shared tool specs in
// `createSdkMcpServer` and `tool(...)` so they run in the same process as the sidecar's
// `query()`. The returned value is placed directly at
// `query({ options: { mcpServers: { studio: <this> } } })`.

import { createSdkMcpServer, tool } from "@anthropic-ai/claude-agent-sdk";
import type { McpSdkServerConfigWithInstance } from "@anthropic-ai/claude-agent-sdk";

import type { StudioTools } from "../shared/services";
import { STUDIO_MCP_SERVER_NAME } from "../shared/mcpTools";
import { STUDIO_MCP_VERSION, STUDIO_TOOL_SPECS, toCallToolResult } from "./tools";

/**
 * Build the in-process Studio MCP server. `instructions` (the conventions briefing) is
 * surfaced to the model at MCP `initialize`; pass the authoring-conventions digest.
 */
export function createInProcessMcp(
  tools: StudioTools,
  instructions?: string,
): McpSdkServerConfigWithInstance {
  const toolDefs = STUDIO_TOOL_SPECS.map((spec) =>
    tool(spec.name, spec.description, spec.inputSchema, async (args) =>
      toCallToolResult(await spec.invoke(tools, args as Record<string, unknown>)),
    ),
  );

  return createSdkMcpServer({
    name: STUDIO_MCP_SERVER_NAME,
    version: STUDIO_MCP_VERSION,
    instructions,
    tools: toolDefs,
    // The studio surface is small and always relevant; never defer it behind tool search.
    alwaysLoad: true,
  });
}
