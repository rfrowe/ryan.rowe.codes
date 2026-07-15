/**
 * Derive a plain-text preview from an MDX post body for the blog index. Frontmatter is already
 * gone from `entry.body`; this strips the remaining MDX/Markdown surface (code, math, ESM imports,
 * JSX, inline markup) down to readable prose, so a listing shows a clean sentence, not raw syntax.
 */

const DEFAULT_MAX_CHARS = 240;

export function excerpt(body: string, maxChars = DEFAULT_MAX_CHARS): string {
  const text = body
    .replace(/```[\s\S]*?```/g, " ") // fenced code blocks
    .replace(/\$\$[\s\S]*?\$\$/g, " ") // display math
    .replace(/^[ \t]*(?:import|export)\b.*$/gm, "") // MDX ESM statements
    .replace(/^\s{0,3}(?:-{3,}|\*{3,}|_{3,})[ \t]*$/gm, " ") // thematic breaks
    .replace(/<[^>]*>/g, " ") // JSX/HTML tags, keeping any inner text
    .replace(/!\[[^\]]*\]\([^)]*\)/g, " ") // images
    .replace(/\[([^\]]+)\]\([^)]*\)/g, "$1") // links reduce to their text
    .replace(/^\s{0,3}#{1,6}[ \t]+/gm, "") // ATX heading markers
    .replace(/^\s{0,3}>[ \t]?/gm, "") // blockquote markers
    .replace(/^\s*(?:[-*+]|\d+\.)[ \t]+/gm, "") // list markers
    .replace(/`+/g, "") // inline-code backticks
    .replace(/\$[^$\n]*\$/g, " ") // inline math
    .replace(/[*~]/g, "") // emphasis markers (underscores left alone for identifiers)
    .replace(/\s+/g, " ") // collapse all whitespace to single spaces
    .trim();

  return truncate(text, maxChars);
}

function truncate(text: string, maxChars: number): string {
  if (text.length <= maxChars) return text;
  const head = text.slice(0, maxChars);
  // Break on the last word boundary so the preview never clips mid-word.
  const lastSpace = head.lastIndexOf(" ");
  const clipped = (lastSpace > 0 ? head.slice(0, lastSpace) : head).replace(/[\s.,;:!?]+$/, "");
  return `${clipped}…`;
}
