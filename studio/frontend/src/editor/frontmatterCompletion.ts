// A CodeMirror completion source for the leading `---`…`---` frontmatter block of an MDX post.
// In key position it offers the frontmatter keys (each inserting `key: <value>` with the value as a
// tab stop, and the field's description as the completion info); after a `key:` it offers that
// field's value snippet. The field metadata comes from the shared FRONTMATTER_FIELDS spec
// (@lib/frontmatter) — the very spec the Astro content-collection schema is built from — so the
// editor's hints cannot drift from what the schema actually accepts.
//
// Gating is by document position, not by the syntax tree: `@codemirror/lang-markdown` parses the
// `---` block as ordinary markdown (it doesn't enable YAML frontmatter parsing), so there's no
// reliable node to key off; detecting the leading fenced block from the text is simpler and robust.

import { snippetCompletion, type Completion, type CompletionSource } from "@codemirror/autocomplete";
import { FRONTMATTER_FIELDS, type FrontmatterField } from "../../../../src/lib/frontmatter";

/**
 * Locate the leading frontmatter block's body: the span between the opening `---` line and the
 * closing `---` line (or end-of-doc when the author hasn't closed it yet). Returns null when the
 * source doesn't open with a `---` fence — i.e. there is no frontmatter block to complete inside.
 */
function frontmatterBody(doc: string): { from: number; to: number } | null {
  const bomOffset = doc.charCodeAt(0) === 0xfeff ? 1 : 0;
  const open = /^---[ \t]*\r?\n/.exec(doc.slice(bomOffset));
  if (!open) return null;
  const from = bomOffset + open[0].length;
  const close = /\r?\n---[ \t]*(?:\r?\n|$)/.exec(doc.slice(from));
  const to = close ? from + close.index : doc.length;
  return { from, to };
}

/** The tab-stop value snippet for a field, seeded with its hint (falling back to its example). */
function valueSnippet(field: FrontmatterField): Completion {
  const placeholder = field.valueHint ?? field.example;
  return snippetCompletion(`\${${placeholder}}`, {
    label: field.example,
    type: "text",
    info: field.description,
  });
}

/** The key snippet: inserts `key: <value>` with the value as a tab stop. */
function keySnippet(field: FrontmatterField): Completion {
  const placeholder = field.valueHint ?? field.example;
  return snippetCompletion(`${field.name}: \${${placeholder}}`, {
    label: field.name,
    type: "property",
    detail: field.required ? "required" : "optional",
    info: field.description,
  });
}

export const frontmatterCompletionSource: CompletionSource = (context) => {
  const doc = context.state.doc.toString();
  const body = frontmatterBody(doc);
  if (!body) return null;
  // Fire only inside the block body — never on the `---` fences or in the post body below it.
  if (context.pos < body.from || context.pos > body.to) return null;

  const line = context.state.doc.lineAt(context.pos);
  const before = line.text.slice(0, context.pos - line.from);

  // Value position — after `key:` on this line. Offer that key's value snippet.
  const valueMatch = /^[ \t]*([A-Za-z0-9_-]+)[ \t]*:[ \t]*(.*)$/.exec(before);
  if (valueMatch) {
    const field = FRONTMATTER_FIELDS.find((f) => f.name === valueMatch[1]);
    if (!field) return null;
    const typed = valueMatch[2];
    return { from: context.pos - typed.length, to: context.pos, options: [valueSnippet(field)], validFor: /.*/ };
  }

  // Key position — only whitespace then a partial key so far. Offer the keys, minus those already
  // present on other lines of the block (so it suggests what's still missing).
  const keyMatch = /^[ \t]*([A-Za-z0-9_-]*)$/.exec(before);
  if (!keyMatch) return null;
  const partial = keyMatch[1];
  const present = new Set(
    doc
      .slice(body.from, body.to)
      .split(/\r?\n/)
      .map((l) => /^[ \t]*([A-Za-z0-9_-]+)[ \t]*:/.exec(l)?.[1])
      .filter((k): k is string => !!k && k !== partial),
  );
  const options = FRONTMATTER_FIELDS.filter((f) => !present.has(f.name)).map(keySnippet);
  if (options.length === 0) return null;
  return { from: context.pos - partial.length, to: context.pos, options, validFor: /^[A-Za-z0-9_-]*$/ };
};
