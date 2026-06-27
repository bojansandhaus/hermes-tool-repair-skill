/**
 * plugin.ts — OpenCode plugin for deterministic tool-call repair.
 *
 * Hooks into `tool.execute.before` to catch the four common JSON formatting
 * mistakes open models make and fix them before the tool executor sees them.
 *
 * Installation:
 *   Place this file and tool_repair.ts in ~/.config/opencode/plugins/
 *   or publish as an npm package and add to your opencode.json.
 *
 * Reference:
 *   https://opencode.ai/docs/plugins
 */

import { repairFunctionArgs } from "./tool_repair";

/** Plugin context from OpenCode. */
interface PluginContext {
  project: any;
  client: any;
  $: any;
  directory: string;
  worktree: string;
}

/** Shape of the tool.execute.before input. */
interface ToolExecuteInput {
  tool: string;
  args: Record<string, unknown>;
  id?: string;
}

/** Shape of the tool.execute.before output (mutated by hook). */
interface ToolExecuteOutput {
  tool: string;
  args: Record<string, unknown>;
  repairNotes?: string[];
}

/** Shape of the tool.execute.after output. */
interface ToolExecuteAfterOutput {
  tool: string;
  args: Record<string, unknown>;
  result: unknown;
  repairNotes?: string[];
}

/**
 * OpenCode plugin that repairs tool call arguments before dispatch.
 *
 * Operates as a closure: repair notes generated in `tool.execute.before`
 * are stashed and appended in `tool.execute.after`.
 */
export const ToolRepairPlugin = async (
  ctx: PluginContext,
): Promise<{
  "tool.execute.before": (
    input: ToolExecuteInput,
    output: ToolExecuteOutput,
  ) => Promise<void>;
  "tool.execute.after": (
    input: ToolExecuteInput,
    output: ToolExecuteAfterOutput,
  ) => Promise<void>;
}> => {
  // Stash repair notes between before and after hooks
  const pendingNotes = new Map<string, string[]>();

  console.log("[tool-repair] Plugin initialized — intercepting tool calls");

  return {
    "tool.execute.before": async (input, output) => {
      const toolName = output.tool;
      const args = output.args ?? {};

      const [fixedArgs, notes] = repairFunctionArgs(toolName, args);

      if (notes.length > 0) {
        // Mutate args in place so the tool receives the fixed version
        output.args = fixedArgs;

        // Stash notes for the after hook
        const stashKey = input.id ?? toolName;
        pendingNotes.set(stashKey, notes);

        console.log(
          `[tool-repair] Repaired ${toolName}: ${notes.join("; ")}`,
        );
      }
    },

    "tool.execute.after": async (input, output) => {
      const stashKey = input.id ?? output.tool;
      const notes = pendingNotes.get(stashKey);
      if (notes && notes.length > 0) {
        // Attach repair notes to the output so the model sees them
        output.repairNotes = notes;
        pendingNotes.delete(stashKey);
      }
    },
  };
};
