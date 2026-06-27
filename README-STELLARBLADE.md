<div align="center">

![Stellar Blade README Banner](https://img.shields.io/badge/TOOL%20REPAIR%20SKILL-STELLAR%20BLADE%20EDITION-00f0ff?style=for-the-badge&labelColor=0a0a0a&color=00f0ff)

<br/>

<!-- Neon grid decoration -->
<pre style="background:transparent;border:none;color:#00f0ff;font-size:10px;line-height:1;letter-spacing:2px;font-weight:bold;">
╔══════════════════════════════════════════════════════════════╗
║  ████████╗ ██████╗  ██████╗ ██╗     ██████╗ ███████╗██████╗ ║
║  ╚══██╔══╝██╔═══██╗██╔═══██╗██║     ██╔══██╗██╔════╝██╔══██╗║
║     ██║   ██║   ██║██║   ██║██║     ██████╔╝█████╗  ██████╔╝║
║     ██║   ██║   ██║██║   ██║██║     ██╔══██╗██╔══╝  ██╔══██╗║
║     ██║   ╚██████╔╝╚██████╔╝███████╗██║  ██║███████╗██║  ██║║
║     ╚═╝    ╚═════╝  ╚═════╝ ╚══════╝╚═╝  ╚═╝╚══════╝╚═╝  ╚═╝║
╚══════════════════════════════════════════════════════════════╝
</pre>

# HARNESS REPAIR MODULE

### *The harness is not the problem. The harness is the fix.*

<br/>

[![License: MIT](https://img.shields.io/badge/LICENSE-MIT-00f0ff?style=for-the-badge&labelColor=0a0a0a)](LICENSE)
[![Python 3.10+](https://img.shields.io/badge/PYTHON-3.10%2B-00f0ff?style=for-the-badge&labelColor=0a0a0a)]()
[![GitHub](https://img.shields.io/badge/GITHUB-REPO-00f0ff?style=for-the-badge&labelColor=0a0a0a&logo=github)](https://github.com/bojansandhaus/tool-repair-skill-for-hermes-and-opencode)
[![OpenCode](https://img.shields.io/badge/OPENCODE-ADAPTER-ff4080?style=for-the-badge&labelColor=0a0a0a)]()
[![Claude Code](https://img.shields.io/badge/CLAUDE%20CODE-ADAPTER-ff4080?style=for-the-badge&labelColor=0a0a0a)]()
[![Status](https://img.shields.io/badge/STATUS-ACTIVE-00f0ff?style=for-the-badge&labelColor=0a0a0a)]()

<br/>

</div>

---

<div align="center">
<table>
<tr>
<td align="center" width="300"><b>HERMES</b> — Native Python</td>
<td align="center" width="300"><b>OPENCODE</b> — TypeScript Plugin</td>
<td align="center" width="300"><b>CLAUDE CODE</b> — Bash + jq Hooks</td>
</tr>
</table>
</div>

---

<br/>

## // SYSTEM SCAN: CORE INSIGHT

> **CLASSIFICATION: HARNESS PROBLEM**
> When you hear "open model can't do tool calls," that is almost always a **harness problem**, not a model problem.
>
> The harness sits between the model's output and the tool executor. A harness that rejects bad JSON and bounces an error back wastes tokens and degrades the session. A harness that fixes the bad JSON *deterministically* turns a broken model into a functional one in 200 lines of code.
>
> **The model did not change. The harness got more forgiving.**
>
> This is a structured approach based on CommandCode's production-scale discovery that made DeepSeek V4 Pro outperform Opus 4.7 on tool calling. [Read the original post](https://x.com/CommandCodeAI/status/1927626163496718571) | [Watch the deep dive](https://www.youtube.com/watch?v=f61DCDwvFis)

<br/>

## // THREAT ANALYSIS: THE FOUR PATTERNS

Open models (DeepSeek, GLM, Qwen, Kimi) repeat the same JSON formatting mistakes. Each failure cascades through 50+ wasted retry cycles. These are not random — they are four finite, deterministic failure modes.

<br/>

<div align="center">
<table>
<tr>
<th><div align="center">PATTERN</div></th>
<th><div align="center">WHAT THE MODEL SENDS</div></th>
<th><div align="center">WHAT IT SHOULD BE</div></th>
<th><div align="center">REPAIR</div></th>
</tr>
<tr>
<td><b><span style="color:#00f0ff">NULL OMISSION</span></b></td>
<td><code>{"cmd": "ls", "timeout": null}</code></td>
<td><code>{"cmd": "ls"}</code></td>
<td>Delete null-valued keys</td>
</tr>
<tr>
<td><b><span style="color:#00f0ff">STRINGIFIED ARRAY</span></b></td>
<td><code>{"files": "[\"a\",\"b\"]"}</code></td>
<td><code>{"files": ["a", "b"]}</code></td>
<td>Parse string as JSON array</td>
</tr>
<tr>
<td><b><span style="color:#00f0ff">EMPTY OBJECT</span></b></td>
<td><code>{"files": {}}</code></td>
<td><code>{"files": []}</code></td>
<td>Replace {} with []</td>
</tr>
<tr>
<td><b><span style="color:#00f0ff">BARE STRING</span></b></td>
<td><code>{"files": "main.ts"}</code></td>
<td><code>{"files": ["main.ts"]}</code></td>
<td>Wrap in array</td>
</tr>
<tr>
<td style="color:#888"><b>MARKDOWN AUTOLINK</b></td>
<td style="color:#888"><code>{"filePath": "/x/[f.md](http://f.md)"}</code></td>
<td style="color:#888"><code>{"filePath": "/x/f.md"}</code></td>
<td style="color:#888">Unwrap degenerate link</td>
</tr>
</table>
</div>

<br/>

## // ARCHITECTURE: VALIDATE-THEN-REPAIR

```
                         HARNESS BOUNDARY
                             ┌──────┐
    MODEL OUTPUT ───────────▶│PARSE │
       (raw JSON)            │ JSON │
                             └──┬───┘
                                │
                             ┌──▼───┐
                             │SCHEMA│
                             │ VALID│
                             └──┬───┘
                                │
                           ┌────┴────┐
                           │         │
                        ┌──▼──┐  ┌──▼───┐
                        │PASS │  │ FAIL │
                        └──┬──┘  └──┬───┘
                           │        │
                        ┌──▼──┐  ┌──▼──────┐
                        │EXEC │  │ WALK    │
                        │TOOL │  │ ISSUE   │
                        └──┬──┘  │ LIST    │
                           │     └──┬──────┘
                           │        │
                           │     ┌──▼──────┐
                           │     │ APPLY   │
                           │     │ REPAIRS │
                           │     └──┬──────┘
                           │        │
                           │     ┌──▼──────┐
                           │     │RE-VALID │
                           │     └──┬──┬───┘
                           │        │  │
                           │     ┌──▼┐ │
                           │     │PAS│ │FAIL
                           │     └──┬┘ │
                           │        │  │
                        ┌──▼────────▼──▼──┐
                        │ TOOL RESULT     │
                        │ + REPAIR NOTE   │
                        └───────┬─────────┘
                                │
                         ┌──────▼──────┐
                         │ BACK TO     │
                         │ MODEL       │
                         └─────────────┘
```

Everything inside the **HARNESS BOUNDARY** is your agent framework. The model provides raw JSON and receives the result. All repair logic, validation, and correction notes happen at the harness layer.

**Critical rule:** Parse the input as-is first. If it passes the schema, ship it. Valid inputs are never touched. Repairs only fire at paths the validator actually flagged. This prevents silent corruption of legitimate data (e.g. writeFile content that happens to be JSON-shaped).

<br/>

## // WEAPON LOADOUT: COMPONENTS

<br/>

<div align="center">
<table>
<tr>
<th width="200">COMPONENT</th>
<th width="120">STATUS</th>
<th>DESCRIPTION</th>
</tr>
<tr>
<td><b><span style="color:#00f0ff">tool_repair.py</span></b></td>
<td><span style="color:#00f0ff">ONLINE</span></td>
<td>Core Python library. No deps beyond stdlib. 5 repair patterns, schema-aware array fixes, markdown autolink unwrap.</td>
</tr>
<tr>
<td><b><span style="color:#ff4080">Hermes Integration</span></b></td>
<td><span style="color:#00f0ff">ONLINE</span></td>
<td>Patches into <code>sanitize_tool_call_arguments</code> (pre-dispatch) and <code>make_tool_result_message</code> (repair notes via side-channel). Built and tested.</td>
</tr>
<tr>
<td><b><span style="color:#ff4080">OpenCode Adapter</span></b></td>
<td><span style="color:#00f0ff">ONLINE</span></td>
<td>TypeScript plugin using <code>tool.execute.before</code> hook. Cleanest integration — supports direct argument mutation.</td>
</tr>
<tr>
<td><b><span style="color:#ff4080">Claude Code Adapter</span></b></td>
<td><span style="color:#00f0ff">ONLINE</span></td>
<td>Bash + jq hooks via <code>PreToolUse</code>/<code>PostToolUse</code>. Limited — can block but not mutate, costing one turn.</td>
</tr>
<tr>
<td><b><span style="color:#888">Hermes Plugin (draft)</span></b></td>
<td><span style="color:#ffa500">PENDING</span></td>
<td>Blueprint for packaging as proper plugin with telemetry, dashboard, config. Needs <code>pre_tool_call</code> hook with arg mutation support.</td>
</tr>
</table>
</div>

<br/>

## // REPAIR NOTES: THE GAME CHANGER

After every successful repair, append a compact note to the tool result:

```
[Repair note: the "offset" field was null: omitted it.
The schema accepts undefined for optional fields but not null.]
```

The model reads this alongside the successful result and **self-corrects on the next turn**. Without the repair note, open models repeat the same mistake — they are convinced their output is correct and the validator is wrong.

> **The driving analogy:** You can let the learner hit the truck and then explain (waste tokens, break flow, degrade output quality). Or you can stop them before impact, fix the steering, and explain while they're still moving. The model stays in flow and the output quality never drops.

<br/>

## // SAFETY PROTOCOLS

| PROTOCOL | DESCRIPTION |
|----------|-------------|
| **Valid Input Shield** | First step is always "try the input as-is." Only paths that fail validation get repaired. |
| **Non-JSON Isolation** | Repair layer only examines tool call arguments, not tool results, binary content, images, or multimodal data. |
| **Schema-Aware Array Lock** | Array-specific repairs fire only when JSON schema confirms the field expects an array. Without schema, only safe universal repairs run. |
| **Note Deduplication** | Same repair note never appended twice across multiple turns. |

<br/>

## // INSTALLATION SEQUENCE

```
> INITIALIZE REPAIR PROTOCOL
```

### Core Library (any framework)

```bash
cp references/tool_repair.py /your/project/tool_repair.py
```

```python
from tool_repair import repair_function_args

fixed, notes = repair_function_args("readFile", {"path": "/tmp/test.txt", "limit": None})
# fixed = {"path": "/tmp/test.txt"}
# notes = ["[repair: null values removed for optional fields]"]
```

### Hermes Agent

```bash
cp references/tool_repair.py /path/to/hermes/agent/tool_repair.py
```

**Or prompt your agent:**

> Clone `https://github.com/bojansandhaus/tool-repair-skill-for-hermes-and-opencode.git`, copy `references/tool_repair.py` into the Hermes agent directory, and enable `agent.tool_repair: true` in `~/.hermes/config.yaml`.

```yaml
agent:
  tool_repair: true
```

### OpenCode

```bash
cp -r adapters/opencode/* ~/.config/opencode/plugins/
```

**Or prompt your agent:**

> Clone `https://github.com/bojansandhaus/tool-repair-skill-for-hermes-and-opencode.git` and copy the TypeScript plugin from `adapters/opencode/` to `~/.config/opencode/plugins/`.

### Claude Code

```bash
cp adapters/claude-code/*.sh .claude/hooks/
chmod +x .claude/hooks/*.sh
```

**Or prompt your agent:**

> Clone `https://github.com/bojansandhaus/tool-repair-skill-for-hermes-and-opencode.git`, copy the hook scripts from `adapters/claude-code/` to `.claude/hooks/`, make them executable, and add the `pre_tool_use` and `post_tool_use` hook entries to `claude.json`.

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

### Clone the repo

```bash
git clone https://github.com/bojansandhaus/tool-repair-skill-for-hermes-and-opencode.git
cd tool-repair-skill-for-hermes-and-opencode
```

<br/>

## // DEPLOYMENT COUNTERMEASURES: PRODUCTION SCALE

Why four patterns when production systems run 56,000+ repair invariants?

The four universal patterns are the **foundation layer**. Each is model-agnostic and covers the most frequent failures. Over time, as models improve and new ones appear, the invariant count grows and shrinks. The four stay constant.

### Alpha Male Energy

Open models have a specific failure mode: when they receive a validation error, they repeat the same mistake. They are convinced their output is correct and the validator is wrong.

This manifests as **56 consecutive identical bad tool calls** before the model finally changes format. Every one of those round-trips wastes tokens, breaks session flow, and degrades overall output quality.

The repair note pattern is the specific antidote. Give the model a successful result with a one-line note, and it learns instantly. It never enters the defensive loop.

### Inference Capacity Spikes

Tool call error rates spike when inference capacity is under strain. The same model at 2 AM makes zero mistakes. At peak hours, it produces dozens of bad tool calls across all four patterns. This is reproducible across providers and model families.

**Practical takeaway:** if your harness works fine in testing but fails under real usage, you are not seeing a code regression. You are seeing inference capacity strain. The solution is not a tighter schema. The solution is more aggressive repairs or routing to a less loaded inference endpoint. The repair harness is your buffer against shared-infrastructure variance.

<br/>

## // TELEMETRY FEED

The validate-then-repair architecture gives you per-tool, per-model repair counters for free:

```
tool_input_repaired:readFile (model=deepseek-v4-pro, repair=bare-string-wrap)
tool_input_repaired:writeFile (model=deepseek-v4-flash, repair=json-array-parse)
tool_input_repaired:terminal (model=deepseek-v4-flash, repair=null-omit)
tool_input_invalid:terminal (model=deepseek-v4-flash)
```

Watch for:
- **Spikes in repair rate** → model regression
- **Per-tool patterns** → tighten schema hints for that tool
- **Invalid rate vs repair success rate** → missing a repair pattern?

<br/>

## // ROADMAP

| STATUS | TARGET |
|--------|--------|
| ✅ ONLINE | Core repair library (5 pattern fixes) |
| ✅ ONLINE | Hermes integration (sanitize + tool result pipeline) |
| ✅ ONLINE | Repair note side channel (model self-correction) |
| ✅ ONLINE | OpenCode adapter (TypeScript plugin) |
| ✅ ONLINE | Claude Code adapter (bash + jq hooks) |
| ⏳ PENDING | Schema-aware repairs (type inference from JSON schema) |
| ⏳ PENDING | Per-model repair telemetry (dashboard tab) |
| ⏳ PENDING | Model-specific repair profiles (DeepSeek, GLM, Kimi quirks) |

<br/>

## // LICENSE PROTOCOL

MIT. Free to use, modify, and distribute. This is a direct implementation of patterns discovered by the CommandCode team. Credit for the original insight goes to them.

<br/>

---

<div align="center">
<pre style="background:transparent;border:none;color:#00f0ff;font-size:10px;line-height:1;letter-spacing:2px;">
╔══════════════════════════════════════════════════════════════╗
║     ██╗  ██╗ █████╗ ██████╗ ███╗   ██╗███████╗███████╗    ║
║     ██║  ██║██╔══██╗██╔══██╗████╗  ██║██╔════╝██╔════╝    ║
║     ███████║███████║██████╔╝██╔██╗ ██║█████╗  ███████╗    ║
║     ██╔══██║██╔══██║██╔══██╗██║╚██╗██║██╔══╝  ╚════██║    ║
║     ██║  ██║██║  ██║██║  ██║██║ ╚████║███████╗███████║    ║
║     ╚═╝  ╚═╝╚═╝  ╚═╝╚═╝  ╚═╝╚═╝  ╚═══╝╚══════╝╚══════╝    ║
╚══════════════════════════════════════════════════════════════╝
</pre>

<p style="color:#555"><i>This is a harness problem. The harness is where you fix it.</i></p>
</div>
