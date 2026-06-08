# count-mcp

[![npm](https://img.shields.io/npm/v/@mukundakatta/count-mcp.svg)](https://www.npmjs.com/package/@mukundakatta/count-mcp)
[![mcp](https://img.shields.io/badge/protocol-MCP-blue.svg)](https://modelcontextprotocol.io)

MCP server: counts for text — lines, words, characters, code points,
paragraphs, byte length.

## Tool: `count`

```json
{ "text": "Hello world.\n\nSecond paragraph 🌍." }
```

→

```json
{ "lines": 3, "words": 5, "chars": 34, "code_points": 33, "paragraphs": 2, "bytes": 36 }
```

## Configure

```json
{ "mcpServers": { "count": { "command": "npx", "args": ["-y", "@mukundakatta/count-mcp"] } } }
```

MIT.
