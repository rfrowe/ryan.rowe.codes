// MDX-aware highlighting on top of the markdown base. MDX adds a lot of grammar; the pieces that
// otherwise render as plain markdown here are top-level ESM (import/export) statements, {…}
// expressions, and multi-line JSX opening tags. We recognize just those and hand each range to the
// real TSX parser via parseMixed, so TS/JSX keywords, strings, and identifiers highlight. Single-
// line and inline JSX stay on the markdown base's tag handling, and everything else stays markdown.
// This is deliberately a thin layer, not a full MDX grammar.

import { parseMixed } from "@lezer/common";
import { markdown, markdownLanguage } from "@codemirror/lang-markdown";
import type { MarkdownConfig } from "@lezer/markdown";
import { tsxLanguage } from "@codemirror/lang-javascript";
import type { LanguageSupport } from "@codemirror/language";

const BRACE_OPEN = 123; // {
const BRACE_CLOSE = 125; // }

// A line starting with `import`/`export` opens an ESM block that runs to the next blank line.
const esm: MarkdownConfig = {
  defineNodes: [{ name: "MDXESM", block: true }],
  parseBlock: [
    {
      name: "MDXESM",
      parse(cx, line) {
        if (line.indent >= 4 || !/^(import|export)\b/.test(line.text.slice(line.pos))) return false;
        const from = cx.lineStart + line.pos;
        let to = cx.lineStart + line.text.length;
        while (cx.nextLine()) {
          if (!/\S/.test(line.text)) break; // blank line ends the ESM run
          to = cx.lineStart + line.text.length;
        }
        cx.addElement(cx.elt("MDXESM", from, to));
        return true;
      },
    },
  ],
};

// A balanced {…} run in text is an MDX expression (covers {props.source} and {/* comments */}).
// Depth-counting isn't string-aware, so a brace inside a string literal can mis-close; acceptable
// for a highlighter. Runs after the built-in inline parsers, so braces inside `code` or <tags/>
// (consumed by InlineCode/HTMLTag first) aren't treated as expressions.
const expression: MarkdownConfig = {
  defineNodes: [{ name: "MDXExpression" }],
  parseInline: [
    {
      name: "MDXExpression",
      parse(cx, next, pos) {
        if (next !== BRACE_OPEN) return -1;
        let depth = 0;
        for (let i = pos; i < cx.end; i++) {
          const ch = cx.char(i);
          if (ch === BRACE_OPEN) depth++;
          else if (ch === BRACE_CLOSE && --depth === 0) return cx.addElement(cx.elt("MDXExpression", pos, i + 1));
        }
        return -1;
      },
    },
  ],
};

// A JSX opening tag that spans multiple lines (a prop per line, blank lines between) would be cut
// by markdown's blank-line block break. When a `<Tag` doesn't close on its first line, consume
// through to the `>` that ends the opening tag, honoring {…} expressions and strings so a `>`
// inside an attribute (or a blank line) doesn't cut it short, and hand the range to TSX. Single-
// line tags fall through to the markdown base's inline handling.
const jsxFlow: MarkdownConfig = {
  defineNodes: [{ name: "MDXJsxFlow", block: true }],
  parseBlock: [
    {
      name: "MDXJsxFlow",
      before: "HTMLBlock",
      parse(cx, line) {
        if (line.indent >= 4 || !/^<[A-Za-z][\w.:-]*(?:[\s/>]|$)/.test(line.text.slice(line.pos))) return false;
        let brace = 0;
        let quote = "";
        const openTagEnd = (text: string, start: number): number => {
          for (let i = start; i < text.length; i++) {
            const c = text[i];
            if (quote) {
              if (c === quote && text[i - 1] !== "\\") quote = "";
            } else if (c === '"' || c === "'" || c === "`") {
              quote = c;
            } else if (c === "{") {
              brace++;
            } else if (c === "}" && brace > 0) {
              brace--;
            } else if (c === ">" && brace === 0) {
              return cx.lineStart + i;
            }
          }
          return -1;
        };
        // Single-line tag: leave it to the markdown base, unchanged.
        if (openTagEnd(line.text, line.pos) >= 0) return false;
        const from = cx.lineStart + line.pos;
        let end = -1;
        // Bound the lookahead so an unterminated tag (e.g. mid-typing) can't consume the rest of
        // the document; a real multi-line opening tag closes within a handful of lines.
        for (let scanned = 0; end < 0 && scanned < 40 && cx.nextLine(); scanned++) end = openTagEnd(line.text, 0);
        // End at the opening tag's `>`; any text after it on that line stays plain, not folded into
        // TSX (which would treat trailing prose as JS and error).
        cx.addElement(cx.elt("MDXJsxFlow", from, end < 0 ? cx.prevLineEnd() : end + 1));
        cx.nextLine();
        return true;
      },
    },
  ],
};

// Delegate the JS-ish ranges to the TSX grammar; markdown keeps everything else.
const NEST_TO_TSX = new Set(["MDXESM", "MDXExpression", "MDXJsxFlow"]);
const nestJs: MarkdownConfig = {
  wrap: parseMixed((node) => (NEST_TO_TSX.has(node.type.name) ? { parser: tsxLanguage.parser } : null)),
};

/** The markdown (GFM) language with MDX's ESM, expression, and JSX-tag constructs highlighted via TSX. */
export function mdx(): LanguageSupport {
  return markdown({ base: markdownLanguage, extensions: [esm, expression, jsxFlow, nestJs] });
}
