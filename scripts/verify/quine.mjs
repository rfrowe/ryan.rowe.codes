import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = path.resolve(fileURLToPath(new URL(".", import.meta.url)), "..", "..");

const HELLO_WORLD_MDX = path.join(repoRoot, "src/content/blog/2022-03-11_hello-world.mdx");
const HELLO_WORLD_PATH = "/blog/2022-03-12/hello-world";

/**
 * The quine now renders the post's FULL source, frontmatter included (the route passes the
 * `?raw` file bytes as `source`, not the frontmatter-stripped `entry.body`), matching the
 * pre-migration site. So the expected text is simply the raw file, with only trailing
 * newlines normalised away (react-syntax-highlighter drops the final newline; nothing else
 * is touched, so a dropped line / collapsed whitespace / missing frontmatter still fails).
 */
export function getExpectedQuineSource(mdxPath) {
  return readFileSync(mdxPath, "utf-8").replace(/\n+$/, "");
}

/**
 * The quine's `CodeBlock` (src/components/mdx/CodeBlock.tsx) renders via
 * react-syntax-highlighter with `showLineNumbers`, which injects a
 * `.react-syntax-highlighter-line-number` span at the start of every line, interleaved as
 * a sibling of the line's own text/token nodes directly under `<code>` -- not wrapped in
 * a per-line container. Line-number spans carry no text of their own beyond the digit, so
 * removing them from a clone and reading `textContent` reconstructs the original
 * multi-line source exactly (each line's own spans/text nodes already include their
 * trailing newline).
 */
async function extractRenderedCodeText(page) {
  return page.evaluate(() => {
    const code = document.querySelector("pre code");
    if (!code) return null;
    const clone = code.cloneNode(true);
    clone.querySelectorAll(".react-syntax-highlighter-line-number").forEach(el => el.remove());
    return clone.textContent;
  });
}

/**
 * Navigates to the local hello-world post and asserts the quine's rendered code block
 * textContent is *exactly* equal to the post's own frontmatter-stripped source. A
 * tolerance-based pixel diff could pass despite a dropped line, collapsed whitespace, or
 * an encoding slip -- this is the exact check the plan calls for.
 */
export async function runQuineCheck(browser, localBaseUrl) {
  const expected = getExpectedQuineSource(HELLO_WORLD_MDX);

  const page = await browser.newPage();
  try {
    await page.goto(`${localBaseUrl}${HELLO_WORLD_PATH}`, { waitUntil: "networkidle" });
    await page.waitForSelector("pre code");
    const actualRaw = await extractRenderedCodeText(page);
    const actual = actualRaw == null ? null : actualRaw.replace(/\n+$/, "");

    const pass = actual === expected;
    let firstDiffIndex = -1;
    if (!pass && actual != null) {
      const len = Math.min(actual.length, expected.length);
      for (let i = 0; i < len; i++) {
        if (actual[i] !== expected[i]) {
          firstDiffIndex = i;
          break;
        }
      }
      if (firstDiffIndex === -1) firstDiffIndex = len;
    }

    return {
      pass,
      expectedLength: expected.length,
      actualLength: actual?.length ?? null,
      firstDiffIndex,
      expectedSnippet: firstDiffIndex >= 0 ? expected.slice(Math.max(0, firstDiffIndex - 40), firstDiffIndex + 40) : null,
      actualSnippet: firstDiffIndex >= 0 && actual != null ? actual.slice(Math.max(0, firstDiffIndex - 40), firstDiffIndex + 40) : null,
    };
  } finally {
    await page.close();
  }
}
