import { readFileSync } from "node:fs";
import path from "node:path";

// A link or image whose title is exactly this marks its target `.mmd` file as a diagram:
//   [The studio stack](./studio-stack.mmd "mermaid:")
// Keeping the marker on the link leaves ```mermaid fences meaning "code", so a post can still
// show mermaid source verbatim.
const MARKER = "mermaid:";

/**
 * Replaces `[caption](path.mmd "mermaid:")` references with a lazy-hydrated <Mermaid> island,
 * inlining the `.mmd` file's contents at build time. The component import is injected once into
 * any file that uses one, so a post needs no boilerplate.
 *
 * Reading the `.mmd` here means the dev server doesn't know the post depends on it: editing the
 * `.mmd` alone won't hot-reload until the `.mdx` is touched. A full build always reads it fresh.
 */
export default function remarkMermaid() {
  return (tree, file) => {
    const baseDir = path.dirname(file.path ?? file.history?.[0] ?? file.cwd);
    let used = false;

    const rewrite = parent => {
      if (!Array.isArray(parent.children)) return;
      parent.children = parent.children.map(node => {
        // The reference sits alone in its own paragraph; swap the whole paragraph for the block-level island.
        if (node.type === "paragraph" && node.children.length === 1 && isMermaidRef(node.children[0])) {
          const ref = node.children[0];
          used = true;
          return mermaidElement(loadDiagram(baseDir, ref.url), captionOf(ref));
        }
        rewrite(node);
        return node;
      });
    };
    rewrite(tree);

    if (used) tree.children.unshift(mermaidImport());
  };
}

function isMermaidRef(node) {
  return (node.type === "link" || node.type === "image") && node.title?.trim() === MARKER;
}

function captionOf(node) {
  if (node.type === "image") return node.alt ?? "";
  return node.children.map(child => child.value ?? "").join("");
}

function loadDiagram(baseDir, url) {
  return readFileSync(path.resolve(baseDir, url), "utf8").trim();
}

// <Mermaid client:visible code="<source>" label="<caption>" />. `code` is a literal string
// attribute, so the diagram source (newlines, quotes, braces) passes through verbatim.
function mermaidElement(code, caption) {
  const attributes = [
    { type: "mdxJsxAttribute", name: "client:visible", value: null },
    { type: "mdxJsxAttribute", name: "code", value: code },
  ];
  if (caption) attributes.push({ type: "mdxJsxAttribute", name: "label", value: caption });
  return { type: "mdxJsxFlowElement", name: "Mermaid", attributes, children: [] };
}

// MDX resolves injected JSX from real imports, so hand it both the source text and the estree
// the compiler actually consumes.
function mermaidImport() {
  const source = "@components/Mermaid";
  return {
    type: "mdxjsEsm",
    value: `import Mermaid from "${source}";`,
    data: {
      estree: {
        type: "Program",
        sourceType: "module",
        body: [
          {
            type: "ImportDeclaration",
            specifiers: [{ type: "ImportDefaultSpecifier", local: { type: "Identifier", name: "Mermaid" } }],
            source: { type: "Literal", value: source, raw: JSON.stringify(source) },
          },
        ],
      },
    },
  };
}
