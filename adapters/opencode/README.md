# Tool Repair - OpenCode Adapter

A plugin that catches the four common JSON formatting mistakes open models make
in tool calls and fixes them before the tool executor sees them. No model
changes needed.

Same patterns as the Hermes tool-repair skill, adapted for OpenCode's plugin
system.

## How It Works

OpenCode has a `tool.execute.before` hook that fires before every tool call.
The handler can mutate `output.args` before dispatch. This plugin intercepts
every tool call, runs the four repair patterns, and applies fixes
deterministically. Repair notes are logged and optionally appended to the
result via `tool.execute.after`.

## Installation

### Option 1: Local plugin (recommended for development)

```bash
# Copy the plugin files
cp -r adapters/opencode/* ~/.config/opencode/plugins/

# Install dependencies (if using the Python bridge)
pip install -r adapters/opencode/requirements.txt
```

### Option 2: npm package

Published as `tool-repair-harness-opencode` (once available).

Add to your `~/.config/opencode/opencode.json`:

```json
{
  "plugin": ["tool-repair-harness-opencode"]
}
```

## Files

| File | Purpose |
|------|---------|
| `plugin.ts` | OpenCode plugin - hooks `tool.execute.before` and `tool.execute.after` |
| `tool_repair.ts` | TypeScript port of the four universal repair patterns |

## The Four Patterns

| Pattern | What the model sends | What it should be |
|---------|---------------------|-------------------|
| Null omission | `{"cmd": "ls", "timeout": null}` | `{"cmd": "ls"}` |
| Stringified array | `{"files": "[\"a\",\"b\"]"}` | `{"files": ["a", "b"]}` |
| Empty object | `{"files": {}}` | `{"files": []}` |
| Bare string | `{"files": "main.ts"}` | `{"files": ["main.ts"]}` |
| Markdown autolink | `{"filePath": "/x/[f.md](http://f.md)"}` | `{"filePath": "/x/f.md"}` |

## Implementation Notes

The TypeScript port is a line-by-line translation of the Python
`tool_repair.py`. Ordering matters: `json-array-parse` must run before
`bare-string-wrap`, otherwise a stringified array `'["a","b"]'` gets wrapped
as `['["a","b"]']`.

Schema-aware repairs (empty-object-to-array, bare-string-wrap) only fire when
the tool schema confirms an array type. Without schema info, only safe
universal repairs run.
