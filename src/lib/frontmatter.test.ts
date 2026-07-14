import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

import { createdAtError, frontmatterTitle, parseFrontmatter, unquote } from "./frontmatter";

describe("unquote", () => {
  it("strips a matched pair of double or single quotes and records it", () => {
    expect(unquote('"hi"')).toEqual({ value: "hi", quoted: true });
    expect(unquote("'hi'")).toEqual({ value: "hi", quoted: true });
  });

  it("leaves an unquoted or mismatched value untouched", () => {
    expect(unquote("hi")).toEqual({ value: "hi", quoted: false });
    expect(unquote("\"hi'")).toEqual({ value: "\"hi'", quoted: false });
  });
});

describe("parseFrontmatter", () => {
  const post = (fm: string, body = "Body.") => `---\n${fm}\n---\n\n${body}\n`;

  it("parses key: value pairs, stripping quotes", () => {
    const data = parseFrontmatter(post('title: "A Title"\nslug: a-slug\ncreated_at: 2026-07-10'));
    expect(data).not.toBeNull();
    expect(data?.title).toEqual({ value: "A Title", quoted: true });
    expect(data?.slug).toEqual({ value: "a-slug", quoted: false });
  });

  it("tolerates a leading BOM", () => {
    const data = parseFrontmatter("﻿" + post("title: T\nslug: s\ncreated_at: 2026-07-10"));
    expect(data?.title.value).toBe("T");
  });

  it("skips comment and blank lines inside the block", () => {
    const data = parseFrontmatter(post("# a comment\ntitle: T\n\nslug: s"));
    expect(data?.title.value).toBe("T");
    expect(data?.slug.value).toBe("s");
  });

  it("returns null when there is no frontmatter block", () => {
    expect(parseFrontmatter("Just prose.")).toBeNull();
  });
});

describe("frontmatterTitle", () => {
  it("returns the unquoted title, or null when absent/empty", () => {
    expect(frontmatterTitle('---\ntitle: "Hello"\nslug: s\n---\n')).toBe("Hello");
    expect(frontmatterTitle("---\nslug: s\n---\n")).toBeNull();
    expect(frontmatterTitle('---\ntitle: ""\nslug: s\n---\n')).toBeNull();
    expect(frontmatterTitle("no frontmatter")).toBeNull();
  });
});

describe("createdAtError (timezone-unambiguity rule)", () => {
  it("accepts a date-only value", () => {
    expect(createdAtError("2026-07-10")).toBeNull();
  });

  it("accepts a datetime carrying Z or an explicit offset", () => {
    expect(createdAtError("2026-07-10T22:00:00Z")).toBeNull();
    expect(createdAtError("2026-07-10T22:00:00.000Z")).toBeNull();
    expect(createdAtError("2026-07-10T22:00:00-05:00")).toBeNull();
    expect(createdAtError("2026-07-10T22:00:00+0000")).toBeNull();
  });

  it("rejects a timezone-less datetime (the ambiguous case), quoting aside", () => {
    expect(createdAtError("2026-07-10T22:00:00")).toMatch(/time but no timezone/);
    expect(createdAtError("2026-07-10 22:00")).toMatch(/time but no timezone/);
  });

  it("rejects an empty or non-date value", () => {
    expect(createdAtError("")).toMatch(/empty/);
    expect(createdAtError("not-a-date")).toMatch(/not a valid date/);
  });
});

// Authoritative enforcement for hand-authored, committed content: every post's raw created_at must
// satisfy the timezone rule, independent of how js-yaml happens to coerce it at build time. This
// sees the raw frontmatter text (like the studio), so it catches a bare tz-less datetime that would
// resolve to a different date in dev vs. the UTC CI build.
describe("committed blog content obeys the created_at rule", () => {
  const blogDir = fileURLToPath(new URL("../content/blog", import.meta.url));

  function mdxFiles(dir: string): string[] {
    const out: string[] = [];
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
      const full = join(dir, entry.name);
      if (entry.isDirectory()) out.push(...mdxFiles(full));
      else if (entry.isFile() && entry.name.endsWith(".mdx")) out.push(full);
    }
    return out;
  }

  const files = mdxFiles(blogDir);

  it("finds at least one post to check", () => {
    expect(files.length).toBeGreaterThan(0);
  });

  it.each(files)("%s has a timezone-unambiguous created_at", (file) => {
    const data = parseFrontmatter(readFileSync(file, "utf8"));
    expect(data, `${file} has no frontmatter block`).not.toBeNull();
    const createdAt = data?.created_at?.value ?? "";
    expect(createdAtError(createdAt), `${file}: ${createdAtError(createdAt) ?? ""}`).toBeNull();
  });
});
