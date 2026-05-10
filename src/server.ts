#!/usr/bin/env node
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';

const VERSION = '0.1.0';

export interface Counts {
  lines: number;
  words: number;
  chars: number;
  code_points: number;
  paragraphs: number;
  bytes: number;
}

export function count(text: string): Counts {
  if (text.length === 0) {
    return { lines: 0, words: 0, chars: 0, code_points: 0, paragraphs: 0, bytes: 0 };
  }
  // `chars` = UTF-16 code units (`length`); `code_points` = unicode CPs.
  const chars = text.length;
  const code_points = [...text].length;
  // Lines: number of `\n`-delimited segments. A trailing newline still
  // counts as ending the previous line; an empty string is 0 lines.
  const lines = text.split('\n').length;
  // Words: runs of non-whitespace.
  const words = (text.match(/\S+/g) ?? []).length;
  // Paragraphs: groups separated by blank lines.
  const paragraphs = text
    .split(/\n\s*\n+/)
    .map((p) => p.trim())
    .filter((p) => p.length > 0).length;
  const bytes = new TextEncoder().encode(text).length;
  return { lines, words, chars, code_points, paragraphs, bytes };
}

const server = new Server(
  { name: 'count', version: VERSION },
  { capabilities: { tools: {} } },
);

const TOOLS = [
  {
    name: 'count',
    description:
      'Count various dimensions of a text: lines, words, chars (UTF-16 units), code_points (Unicode), paragraphs (blank-line-delimited), bytes (UTF-8).',
    inputSchema: {
      type: 'object',
      properties: { text: { type: 'string', description: 'Text to count.' } },
      required: ['text'],
    },
  },
] as const;

server.setRequestHandler(ListToolsRequestSchema, async () => ({ tools: TOOLS }));

server.setRequestHandler(CallToolRequestSchema, async (req) => {
  const { name, arguments: args } = req.params;
  try {
    if (name !== 'count') return errorResult('unknown tool: ' + name);
    const { text } = args as unknown as { text: string };
    return jsonResult(count(text));
  } catch (err) {
    return errorResult('internal error: ' + (err as Error).message);
  }
});

function jsonResult(value: unknown) {
  return { content: [{ type: 'text', text: JSON.stringify(value, null, 2) }] };
}
function errorResult(message: string) {
  return { isError: true, content: [{ type: 'text', text: message }] };
}

// Only start the stdio server when run as a script — not when imported by tests.
if (import.meta.url === `file://${process.argv[1]}`) {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  process.stderr.write(`count MCP server v${VERSION} ready on stdio\n`);
}
