/**
 * tool_repair.ts — TypeScript port of the universal tool-call repair patterns.
 *
 * Ported from the Python tool_repair.py. Same four deterministic fixes,
 * same ordering constraints, same safety guards.
 *
 * Usage:
 *   import { repairFunctionArgs } from "./tool_repair";
 *   const [fixed, notes] = repairFunctionArgs("readFile", { limit: null });
 *   // fixed = {}, notes = ["null values removed for optional fields"]
 */

/** Describes what a single repair changed. */
export interface RepairNote {
  field: string;
  message: string;
}

/**
 * Apply the four universal repair patterns to a tool-call arguments dict.
 *
 * @param functionName  Name of the tool being called (for telemetry/logging).
 * @param functionArgs  Parsed JSON arguments object (mutated in place).
 * @param toolSchema    Optional JSON Schema object for type-aware repairs.
 * @returns             [fixedArgs, notes] — the repaired args and any notes.
 */
export function repairFunctionArgs(
  functionName: string,
  functionArgs: Record<string, unknown>,
  toolSchema?: Record<string, unknown> | null,
): [Record<string, unknown>, string[]] {
  const notes: string[] = [];

  // Order matters: json-array-parse BEFORE bare-string-wrap
  applyNullOmit(functionArgs, notes);
  applyJsonArrayParse(functionArgs, notes);
  applyMarkdownAutolinkUnwrap(functionArgs, notes);

  // Schema-aware repairs (need to know if field expects array)
  if (toolSchema) {
    applyEmptyObjectToArray(functionArgs, toolSchema, notes);
    applyBareStringWrap(functionArgs, toolSchema, notes);
  }

  return [functionArgs, notes];
}

// ---------------------------------------------------------------------------
// Pattern 1: Null-Omit — delete keys whose value is null
// ---------------------------------------------------------------------------
function applyNullOmit(
  args: Record<string, unknown>,
  notes: string[],
): void {
  const nullKeys: string[] = [];
  for (const [key, value] of Object.entries(args)) {
    if (value === null) {
      nullKeys.push(key);
    }
  }
  for (const key of nullKeys) {
    delete args[key];
  }
  if (nullKeys.length > 0) {
    notes.push(
      `null values removed for optional fields: ${nullKeys.join(", ")}`,
    );
  }
}

// ---------------------------------------------------------------------------
// Pattern 2: Json-Array-Parse — parse stringified JSON arrays
// ---------------------------------------------------------------------------
function applyJsonArrayParse(
  args: Record<string, unknown>,
  notes: string[],
): void {
  for (const [key, value] of Object.entries(args)) {
    if (typeof value === "string") {
      const trimmed = value.trim();
      if (trimmed.startsWith("[") && trimmed.endsWith("]")) {
        try {
          const parsed = JSON.parse(trimmed);
          if (Array.isArray(parsed)) {
            args[key] = parsed;
            notes.push(`string values parsed as arrays: ${key}`);
          }
        } catch {
          // Not valid JSON — leave as-is
        }
      }
    }
  }
}

// ---------------------------------------------------------------------------
// Pattern 3: Markdown Autolink Unwrap — fix paths that leaked auto-links
// ---------------------------------------------------------------------------
function applyMarkdownAutolinkUnwrap(
  args: Record<string, unknown>,
  notes: string[],
): void {
  // Match patterns like: [filename.md](http://filename.md)
  // Only when link text matches the URL's path component (sans protocol)
  const autoLinkRe = /\[([^\]]+)\]\(https?:\/\/[^/]+\/\1\)/g;

  for (const [key, value] of Object.entries(args)) {
    if (typeof value === "string") {
      const original = value;
      const fixed = value.replace(autoLinkRe, "$1");
      if (fixed !== original) {
        args[key] = fixed;
        notes.push(`markdown auto-link unwrapped in: ${key}`);
      }
    }
  }
}

// ---------------------------------------------------------------------------
// Pattern 4: Empty-Object-To-Array — replace {} with [] when schema expects
//            an array (schema-aware)
// ---------------------------------------------------------------------------
function applyEmptyObjectToArray(
  args: Record<string, unknown>,
  schema: Record<string, unknown>,
  notes: string[],
): void {
  const schemaPaths = extractSchemaArrayPaths(schema);
  for (const [key, value] of Object.entries(args)) {
    if (
      schemaPaths.has(key) &&
      typeof value === "object" &&
      value !== null &&
      !Array.isArray(value) &&
      Object.keys(value).length === 0
    ) {
      args[key] = [];
      notes.push(`empty objects replaced with empty arrays: ${key}`);
    }
  }
}

// ---------------------------------------------------------------------------
// Pattern 5: Bare-String-Wrap — wrap bare string in array when schema
//            expects an array (schema-aware)
// ---------------------------------------------------------------------------
function applyBareStringWrap(
  args: Record<string, unknown>,
  schema: Record<string, unknown>,
  notes: string[],
): void {
  const schemaPaths = extractSchemaArrayPaths(schema);
  for (const [key, value] of Object.entries(args)) {
    if (schemaPaths.has(key) && typeof value === "string") {
      args[key] = [value];
      notes.push(`bare strings wrapped as single-element arrays: ${key}`);
    }
  }
}

// ---------------------------------------------------------------------------
// Helper: extract field names that are typed as arrays in a JSON Schema
// ---------------------------------------------------------------------------
function extractSchemaArrayPaths(
  schema: Record<string, unknown>,
): Set<string> {
  const paths = new Set<string>();

  const properties = (schema as any).properties;
  if (!properties) return paths;

  for (const [key, prop] of Object.entries(properties)) {
    if ((prop as any).type === "array") {
      paths.add(key);
    }
  }

  return paths;
}
