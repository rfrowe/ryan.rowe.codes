// Locates an MDX post's leading `---`…`---` frontmatter by document offset. lang-markdown doesn't
// parse YAML frontmatter, so there's no syntax node to key off; detecting the fences from the text is
// simpler. Distinct from @lib/frontmatter's FRONTMATTER_BLOCK, which requires a closing fence: this
// tolerates an unclosed block still being typed (offsets run to the doc end when there's no close).

export interface FrontmatterSpan {
  /** Offset just past the opening `---` fence (start of the block body). */
  from: number;
  /** Offset at the closing fence, or the doc end when the block isn't closed yet. */
  bodyEnd: number;
  /** Offset just past the closing fence, or the doc end when the block isn't closed yet. */
  blockEnd: number;
}

/** The leading frontmatter block's span, or null when the source doesn't open with a `---` fence. */
export function frontmatterSpan(doc: string): FrontmatterSpan | null {
  const bomOffset = doc.charCodeAt(0) === 0xfeff ? 1 : 0;
  const open = /^---[ \t]*\r?\n/.exec(doc.slice(bomOffset));
  if (!open) return null;
  const from = bomOffset + open[0].length;
  const close = /\r?\n---[ \t]*(?:\r?\n|$)/.exec(doc.slice(from));
  const bodyEnd = close ? from + close.index : doc.length;
  const blockEnd = close ? from + close.index + close[0].length : doc.length;
  return { from, bodyEnd, blockEnd };
}
