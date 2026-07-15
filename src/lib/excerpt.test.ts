import { describe, expect, it } from "vitest";
import { excerpt } from "./excerpt";

describe("excerpt", () => {
  it("keeps plain prose intact and collapses whitespace", () => {
    expect(excerpt("First line.\n\nSecond   line.")).toBe("First line. Second line.");
  });

  it("drops MDX import/export statements", () => {
    const body = "import CodeBlock from '@components/mdx/CodeBlock'\n\nReal prose here.";
    expect(excerpt(body)).toBe("Real prose here.");
  });

  it("strips JSX and HTML tags but keeps their inner text", () => {
    expect(excerpt('An <abbr title="Content Management System">CMS</abbr> post.')).toBe("An CMS post.");
    expect(excerpt("Prose.\n\n<CubeCard client:only=\"react\" />")).toBe("Prose.");
  });

  it("reduces markdown links to their text and drops images", () => {
    expect(excerpt("See [Astro](https://astro.build) docs.")).toBe("See Astro docs.");
    expect(excerpt("![alt](/x.png)\n\nCaption follows.")).toBe("Caption follows.");
  });

  it("removes inline and display math", () => {
    expect(excerpt("A cube where $-1 \\le x \\le 1$ holds.")).toBe("A cube where holds.");
    expect(excerpt("Intro.\n\n$$\nf(x) = x^2\n$$\n\nOutro.")).toBe("Intro. Outro.");
  });

  it("strips fenced code, headings, blockquotes, and list markers", () => {
    const body = "# Title\n\n> a quote\n\n- one\n- two\n\n```js\nconst x = 1;\n```\n\nAfter code.";
    expect(excerpt(body)).toBe("Title a quote one two After code.");
  });

  it("truncates on a word boundary with an ellipsis, leaving short bodies whole", () => {
    const short = "A short post.";
    expect(excerpt(short, 240)).toBe(short);

    const long = "one two three four five six";
    // A 12-char budget lands mid-"three"; the word boundary trims back to "one two".
    expect(excerpt(long, 12)).toBe("one two…");
  });

  it("returns an empty string when there is no prose to preview", () => {
    expect(excerpt("import Thing from './thing'\n\n<Thing client:load />")).toBe("");
  });
});
