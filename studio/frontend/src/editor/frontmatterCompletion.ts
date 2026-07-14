// A CodeMirror completion source for an MDX post's leading `---`…`---` frontmatter block. In key
// position it offers the keys; after a `key:` it offers that field's value snippet. Metadata comes
// from the shared FRONTMATTER_FIELDS spec (@lib/frontmatter) that the Astro schema is built from, so
// the hints can't drift from what the schema accepts.
//
// Gating is by document position, not the syntax tree: lang-markdown doesn't parse YAML frontmatter,
// so there's no node to key off; detecting the leading fence from the text is simpler.

import { snippetCompletion, type Completion, type CompletionSource } from "@codemirror/autocomplete";
import { FRONTMATTER_FIELDS, type FrontmatterField } from "../../../../src/lib/frontmatter";

/**
 * The frontmatter body: the span between the opening `---` and closing `---` (or end-of-doc if not
 * yet closed). Null when the source doesn't open with a `---` fence.
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
  // Fire only inside the block body, not on the `---` fences or the post body below.
  if (context.pos < body.from || context.pos > body.to) return null;

  const line = context.state.doc.lineAt(context.pos);
  const before = line.text.slice(0, context.pos - line.from);

  // Value position: after `key:` on this line. Offer that key's value snippet.
  const valueMatch = /^[ \t]*([A-Za-z0-9_-]+)[ \t]*:[ \t]*(.*)$/.exec(before);
  if (valueMatch) {
    const field = FRONTMATTER_FIELDS.find((f) => f.name === valueMatch[1]);
    if (!field) return null;
    const typed = valueMatch[2];
    return { from: context.pos - typed.length, to: context.pos, options: [valueSnippet(field)], validFor: /.*/ };
  }

  // Key position: whitespace then a partial key. Offer the keys not already present in the block.
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
