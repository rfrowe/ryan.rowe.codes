// Coverage for the two MDX completion sources against a real EditorState and CompletionContext.
// Verifies gating (frontmatter vs body) and the offered options.

import { describe, expect, it } from "vitest";
import { EditorState } from "@codemirror/state";
import { CompletionContext, type CompletionResult } from "@codemirror/autocomplete";
import { frontmatterCompletionSource } from "./frontmatterCompletion";
import { recipeSnippetSource } from "./recipeSnippets";

/** Run a completion source at byte offset `pos` over `doc`; returns its result (or null). */
function completeAt(
  source: typeof frontmatterCompletionSource,
  doc: string,
  pos: number,
  explicit = false,
): CompletionResult | null {
  const state = EditorState.create({ doc });
  const result = source(new CompletionContext(state, pos, explicit));
  // The sources are synchronous, so the result is never a Promise here.
  return result as CompletionResult | null;
}

const labels = (r: CompletionResult | null): string[] => (r ? r.options.map((o) => o.label) : []);

describe("frontmatterCompletionSource", () => {
  it("offers all four keys in key position inside the block", () => {
    const doc = "---\n\n---\n\nbody\n";
    const pos = doc.indexOf("\n\n") + 1; // the blank line between the fences
    expect(labels(completeAt(frontmatterCompletionSource, doc, pos)).sort()).toEqual(
      ["created_at", "headline", "slug", "title"],
    );
  });

  it("omits a key already present elsewhere in the block", () => {
    const doc = "---\ntitle: Hi\n\n---\n\nbody\n";
    const pos = doc.indexOf("\n\n---") + 1; // the blank line after the title line
    expect(labels(completeAt(frontmatterCompletionSource, doc, pos))).not.toContain("title");
  });

  it("offers the value snippet after `created_at:`", () => {
    const doc = "---\ncreated_at: \n---\n";
    const pos = doc.indexOf("created_at: ") + "created_at: ".length;
    const r = completeAt(frontmatterCompletionSource, doc, pos);
    expect(r?.options).toHaveLength(1);
    expect(r?.options[0].label).toBe("2026-07-10"); // the field's example value
  });

  it("does not fire in the post body", () => {
    const doc = "---\ntitle: Hi\n---\n\nsome body text\n";
    const pos = doc.indexOf("body");
    expect(completeAt(frontmatterCompletionSource, doc, pos)).toBeNull();
  });
});

describe("recipeSnippetSource", () => {
  it("offers the blog recipes in the body when a word is being typed", () => {
    const doc = "---\ntitle: Hi\n---\n\nfig";
    const r = completeAt(recipeSnippetSource, doc, doc.length);
    expect(labels(r)).toContain("figure");
    expect(labels(r)).toContain("math (inline)");
    expect(labels(r)).toContain("island (client:only)");
  });

  it("is gated out of the frontmatter block", () => {
    const doc = "---\ntitle: Hi\n---\n\nbody\n";
    const pos = doc.indexOf("title");
    expect(completeAt(recipeSnippetSource, doc, pos)).toBeNull();
  });

  it("stays quiet on an empty word unless explicitly invoked", () => {
    const doc = "---\ntitle: Hi\n---\n\n";
    expect(completeAt(recipeSnippetSource, doc, doc.length, false)).toBeNull();
    expect(labels(completeAt(recipeSnippetSource, doc, doc.length, true)).length).toBeGreaterThan(0);
  });
});
