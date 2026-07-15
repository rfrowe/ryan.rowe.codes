// Completion source offering the blog-authoring recipe snippets from SKILL.md: figures, island
// imports and usage, KaTeX math, fenced code, and the Expressive Code component. Each is a snippetCompletion
// with tab stops, keyed to a memorable label so typing e.g. "figure" or "math" filters to it.
//
// Gated to the MDX body: returns null inside the leading frontmatter block. Templates are plain
// strings, not template literals, so their `${…}` reach snippetCompletion literally as tab stops.

import { snippetCompletion, type Completion, type CompletionSource } from "@codemirror/autocomplete";

/** Offset just past the leading `---`…`---` block, or 0 when the source has no frontmatter. */
function frontmatterEnd(doc: string): number {
  const bomOffset = doc.charCodeAt(0) === 0xfeff ? 1 : 0;
  const open = /^---[ \t]*\r?\n/.exec(doc.slice(bomOffset));
  if (!open) return 0;
  const from = bomOffset + open[0].length;
  const close = /\r?\n---[ \t]*(?:\r?\n|$)/.exec(doc.slice(from));
  return close ? from + close.index + close[0].length : doc.length;
}

const snip = (template: string, label: string, detail: string, info: string): Completion =>
  snippetCompletion(template, { label, detail, info, type: "keyword" });

const RECIPES: Completion[] = [
  snip(
    "![${alt text}](./${image.webp})\n*${caption}*",
    "figure",
    "image + italic caption",
    "Static figure: a committed .webp next to the post, embedded with real alt text and an italic caption line — the blog's figure convention.",
  ),
  snip(
    "import ${Component} from './${component}'",
    "import island",
    "co-located component import",
    "Import a co-located interactive island by relative path with no extension (folder-post convention).",
  ),
  snip(
    "<${Component} client:load />",
    "island (client:load)",
    "hydrate a server-rendered island",
    "client:load — for an island that renders on the server and just needs to hydrate. Prefer this unless the component touches window/canvas at import time.",
  ),
  snip(
    '<${Component} client:only="react" />',
    "island (client:only)",
    "client-only island",
    'client:only="react" — for an island that touches window/canvas at import time (e.g. a p5 renderer) and would crash the static build if imported eagerly.',
  ),
  snip("$${expr}$", "math (inline)", "inline KaTeX", "Inline math via remark-math / rehype-katex."),
  snip("$$\n${expr}\n$$", "math (display)", "display KaTeX", "Display math block via remark-math / rehype-katex."),
  snip(
    "$$\n\\begin{align*}\n${line} \\\\\n\\end{align*}\n$$",
    "math (align)",
    "multi-line aligned KaTeX",
    "Multi-line aligned display math (\\begin{align*} … \\end{align*}).",
  ),
  snip(
    "```${language}\n${code}\n```",
    "code (fenced)",
    "highlighted fenced block",
    "Fenced code block, highlighted at build time by astro-expressive-code. Tag the language; the meta string after it adds extras (title, {1,3} line highlights, showLineNumbers, ins/del).",
  ),
  snip(
    '<Code code={${props.source}} lang="${mdx}" />',
    "Code (runtime string)",
    "Expressive Code component",
    "Expressive Code's <Code> highlights a runtime string, not a literal fence. Import { Code } from 'astro-expressive-code/components'. Pass the code as the code prop (a string); <Code> rejects children. The hello-world quine feeds it props.source.",
  ),
];

export const recipeSnippetSource: CompletionSource = (context) => {
  const doc = context.state.doc.toString();
  if (context.pos < frontmatterEnd(doc)) return null; // the frontmatter region isn't ours
  const word = context.matchBefore(/[A-Za-z][\w-]*/);
  if (!word && !context.explicit) return null; // don't surface on every keystroke with no prefix
  return { from: word ? word.from : context.pos, options: RECIPES, validFor: /^[\w-]*$/ };
};
