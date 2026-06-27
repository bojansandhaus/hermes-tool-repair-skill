# Tool Repair - Claude Code Adapter

Claude Code's hook system fires shell scripts at lifecycle events, but
**PreToolUse cannot modify tool arguments** - it can only block the call.
This makes Claude Code the most limited of the three adapters for
deterministic repair.

## How It Works

Two hooks, two strategies:

### PreToolUse (block on detection)

The `pre_tool_use.sh` script reads the incoming tool call, checks for the
four common patterns (null fields, stringified arrays, empty objects,
markdown auto-links), and blocks the call with a helpful message if it finds
one. The model sees the message and retries with corrected format.

This wastes a turn but prevents the bad call from reaching the tool executor.

### PostToolUse (telemetry)

The `post_tool_use.sh` script inspects every successful tool call for
repairable patterns and logs them to `~/.claude/tool-repair-telemetry.log`.
This builds a per-session picture of the model's common mistakes without
interrupting the flow.

## Installation

```bash
# Copy hooks
cp adapters/claude-code/pre_tool_use.sh .claude/hooks/pre_tool_use.sh
cp adapters/claude-code/post_tool_use.sh .claude/hooks/post_tool_use.sh
chmod +x .claude/hooks/*.sh
```

Add to `claude.json` in your project root:

```json
{
  "hooks": {
    "pre_tool_use": {
      "matcher": "*",
      "command": "bash .claude/hooks/pre_tool_use.sh"
    },
    "post_tool_use": {
      "matcher": "*",
      "command": "bash .claude/hooks/post_tool_use.sh"
    }
  }
}
```

## Limitations

| Limitation | Impact |
|------------|--------|
| Cannot mutate args in PreToolUse | Block + retry wastes a turn |
| No side-channel for repair notes | Model doesn't learn from PostToolUse |
| jq required | Must be installed (common but not universal) |

For proper arg mutation, use the Hermes or OpenCode adapter instead. Claude
Code would need a `pre_tool_use` hook that supports returning modified args.

## Telemetry

Logs to `~/.claude/tool-repair-telemetry.log` in this format:

```
[2026-06-27T07:30:00Z] readFile |null=(limit) stringified=(files)| error=false
[2026-06-27T07:31:00Z] writeFile |autolink=(filePath)| error=false
```

Each line: timestamp, tool name, detected patterns + their fields, whether
the tool returned an error.
