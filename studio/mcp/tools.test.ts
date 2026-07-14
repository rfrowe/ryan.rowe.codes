import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

import { createStudioTools } from "./tools";
import type { ShipService, Store } from "../shared/services";

// The digest is scanned live from the real repo, so point blogRoot at it (repo root, two up from studio/mcp).
const REPO_ROOT = fileURLToPath(new URL("../..", import.meta.url));

// describe() reads store.getActiveWorktree() (preferred) then store.getActiveDoc(); ship is unused.
// Minimal fakes satisfy the seams; no active post, so activePostPath resolves to null.
const store = { getActiveWorktree: () => null, getActiveDoc: () => null } as unknown as Store;
const ship = {} as unknown as ShipService;

function tools(blogRoot: string) {
  return createStudioTools({ store, ship, blogRoot, conventions: "CONVENTIONS-MARKER" });
}

describe("describe — app-structure digest", () => {
  it("passes through conventions and the (empty) active path", async () => {
    const result = await tools(REPO_ROOT).describe();
    expect(result.conventions).toBe("CONVENTIONS-MARKER");
    expect(result.activePostPath).toBeNull();
    expect(typeof result.blog).toBe("string");
  });

  it("surfaces framework versions and tsconfig path aliases", async () => {
    const { appStructure } = await tools(REPO_ROOT).describe();
    expect(appStructure).toBeDefined();
    const digest = appStructure ?? "";
    expect(digest).toContain("Framework & key versions:");
    expect(digest).toMatch(/astro@/);
    expect(digest).toContain("@astrojs/react@");
    expect(digest).toContain("@astrojs/mdx@");
    expect(digest).toMatch(/@vanilla-extract\//);
    expect(digest).toContain("Path aliases (tsconfig):");
    expect(digest).toContain("@components/*");
    expect(digest).toContain("@layouts/*");
  });

  it("inventories reusable components and flags client islands", async () => {
    const { appStructure } = await tools(REPO_ROOT).describe();
    const digest = appStructure ?? "";
    expect(digest).toContain("Reusable components (");
    // React component with a default export, hydrated via client:load in index.astro.
    expect(digest).toMatch(/HeadlineCycler\.tsx — HeadlineCycler \(react, client island\)/);
    // Astro components are named by file and are not islands.
    expect(digest).toMatch(/nav\/Nav\.astro — Nav \(astro\)/);
    // A React component that is not hydrated directly must not be flagged as an island.
    expect(digest).toMatch(/ConsoleTypist\.tsx — ConsoleTypist \(react\)/);
  });

  it("lists styling/util entry points", async () => {
    const { appStructure } = await tools(REPO_ROOT).describe();
    const digest = appStructure ?? "";
    expect(digest).toContain("Styling & util entry points:");
    expect(digest).toContain("src/styles/theme.css.ts");
    expect(digest).toContain("src/content.config.ts");
  });

  it("omits the digest when run outside the repo (best-effort, no throw)", async () => {
    const result = await tools("/nonexistent/blog/root/xyz").describe();
    expect(result.appStructure).toBeUndefined();
    // Optional field dropped from the serialized shape; existing consumers unaffected.
    expect(JSON.parse(JSON.stringify(result))).not.toHaveProperty("appStructure");
  });
});
