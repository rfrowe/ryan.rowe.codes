// Transport-agnostic Studio MCP tool implementations. `createStudioTools` builds a
// `StudioTools` (studio/shared/services.ts) over injected `{ store, ship, blogRoot,
// conventions }`; `STUDIO_TOOL_SPECS` describes each tool (name/description/zod input
// shape/invoker) once so the in-process (SDK) and HTTP (StreamableHTTP) mounts register
// the identical surface without duplicating schemas. Frozen contracts are only consumed
// here; nothing imports the concrete store/ship modules.

import { readdir, readFile, stat } from "node:fs/promises";
import { basename, join, relative } from "node:path";
import { z } from "zod";
import type { CallToolResult } from "@modelcontextprotocol/sdk/types.js";

import type { ShipService, Store, StudioTools } from "../shared/services";
import type { StudioStore } from "../state/store";
import { STUDIO_TOOLS } from "../shared/mcpTools";
import { frontmatterTitle } from "../../src/lib/frontmatter";
import type {
  DescribeResult,
  GetEditorContextResult,
  OpenPrInput,
  OpenPrResult,
  PostSummary,
  PreviewStatusResult,
  ScaffoldPostInput,
  ScaffoldPostResult,
} from "../shared/mcpTools";

/** MCP server semver reported at `initialize` (shared by both transports). */
export const STUDIO_MCP_VERSION = "0.1.0";

/** Directory (relative to the blog repo root) that holds authored posts. */
const BLOG_CONTENT_DIR = "src/content/blog";

/** Injected dependencies for the tool implementations. */
export interface StudioToolsDeps {
  store: Store;
  ship: ShipService;
  /** Absolute path to the blog repo root. */
  blogRoot: string;
  /** Authoring-conventions briefing (from the blog-authoring skill). */
  conventions: string;
}

/**
 * Construct the transport-agnostic `StudioTools`. `describe` returns the blog briefing +
 * conventions + active path; `getEditorContext`/`previewStatus` delegate to the store;
 * `openPr` delegates to ship behind the confirm gate. `listPosts` scans the content tree;
 * `scaffoldPost` creates a new post (in its own worktree) through the store and makes it active.
 * There is no edit/read-document tool: each open post is an isolated worktree the agent edits
 * directly with the native Read/Edit/Write tools, so no rev-checked mutation gate is needed.
 */
export function createStudioTools(deps: StudioToolsDeps): StudioTools {
  const { store, ship, blogRoot, conventions } = deps;

  return {
    async describe(): Promise<DescribeResult> {
      return {
        blog:
          `Personal Astro + MDX blog rooted at ${blogRoot}. Posts live under ${BLOG_CONTENT_DIR}/ ` +
          `as either <YYYY-MM-DD_slug>.mdx or <YYYY-MM-DD_slug>/post.mdx, and the studio renders the ` +
          `active post in a live preview. Each open post is checked out in its own git worktree, which ` +
          `is your working directory — edit the post's file there directly with the native tools ` +
          `(Read/Edit/Write). Keep the four frontmatter keys (title, slug, headline, created_at) valid ` +
          `so the preview and route stay in sync, and never reformat unrelated lines.`,
        conventions,
        // The worktree file the agent actually operates on (its cwd), not the canonical main-repo
        // path. Mirrors getEditorContext so a "read the open post" follow-up hits the draft copy,
        // not the untouched main tree.
        activePostPath: (store as StudioStore).getActiveWorktree()?.worktreeFilePath ?? store.getActiveDoc()?.path ?? null,
        // Scanned live so a foreign-cwd agent can see the framework, aliases, and reusable
        // components without a local checkout. undefined (dropped from JSON) if unreadable.
        appStructure: await scanAppStructure(blogRoot),
      };
    },

    async getEditorContext(): Promise<GetEditorContextResult> {
      const ctx = store.getEditorContext();
      if (!ctx) return { error: "no-editor-context" };
      // The editor tabs on the canonical (main-repo) path, but the agent's cwd is the active post's
      // worktree and it edits the worktree copy. Return the worktree file path so an agent resolving
      // "here" / "this" edits the file its native tools actually touch, not the untouched main tree.
      // Resolve the worktree that owns ctx.path, not the global active one: during a tab-switch race
      // the editor context can still be the previous post's, and keying off the active worktree would
      // fall through and hand back the untouched main-repo canonical path.
      const wt = (store as StudioStore).getWorktreeFor(ctx.path);
      if (wt) return { ...ctx, path: wt.worktreeFilePath };
      return ctx;
    },

    async listPosts(): Promise<PostSummary[]> {
      return scanPosts(blogRoot);
    },

    async scaffoldPost(input: ScaffoldPostInput): Promise<ScaffoldPostResult> {
      // Create the post file (frontmatter validated and path root-jailed) and make it the active
      // doc via the store, the single mutation path, so the same rev-guard, preview, and
      // watcher-retarget wiring apply. createPost lives on the concrete StudioStore (the frozen
      // Store DI seam intentionally omits it); the sidecar always injects that concrete.
      const result = await (store as StudioStore).createPost(input);
      if (!result.ok) return { ok: false, error: result.error };
      return { ok: true, path: result.path, url: result.url };
    },

    async previewStatus(): Promise<PreviewStatusResult> {
      return store.getPreview();
    },

    async openPr(input: OpenPrInput): Promise<OpenPrResult> {
      // Confirm gate: never push / open a PR on a bare agent call with no human in the loop.
      if (!input.confirm) {
        return {
          ok: false,
          error:
            "open_pr requires human confirmation. Review the diff out-of-band, then call again with " +
            "confirm=true. The studio (not the agent) runs the git/gh ship flow.",
        };
      }
      return ship.openPr(input);
    },
  };
}

// ---- Shared tool registration specs (consumed by inProcess.ts and httpServer.ts) ----

const scaffoldPostInputShape: z.ZodRawShape = {
  title: z.string(),
  slug: z.string(),
  headline: z.string(),
  created_at: z.string(),
};

const openPrInputShape: z.ZodRawShape = {
  branch: z.string(),
  subject: z.string(),
  body: z.string(),
  scope: z.enum(["post", "all"]),
  confirm: z.boolean(),
};

const EMPTY_SHAPE: z.ZodRawShape = {};

/** One MCP tool: registration metadata plus an invoker over a `StudioTools` instance. */
export interface StudioToolSpec {
  /** Bare tool name (namespaced to `mcp__studio__<name>` by the transport). */
  name: string;
  title: string;
  description: string;
  /** Zod raw input shape (empty object for zero-argument tools). */
  inputSchema: z.ZodRawShape;
  /** Validated args in, JSON-serializable result out. */
  invoke: (tools: StudioTools, args: Record<string, unknown>) => Promise<unknown>;
}

export const STUDIO_TOOL_SPECS: StudioToolSpec[] = [
  {
    name: STUDIO_TOOLS.describe,
    title: "Describe blog",
    description:
      "Return a briefing for authoring this blog: what it is, the authoring conventions to follow, " +
      "the path of the post currently open in the studio, and a live app-structure digest scanned at " +
      "call time (framework & key versions, tsconfig path aliases, the reusable-component inventory, and " +
      "the styling/util entry points). Call this first when attaching from a foreign working directory.",
    inputSchema: EMPTY_SHAPE,
    invoke: (tools) => tools.describe(),
  },
  {
    name: STUDIO_TOOLS.getEditorContext,
    title: "Get editor context",
    description:
      "Return the current editor state { path, cursor, selection, viewport } (UTF-16 offsets). Use to " +
      'resolve deictic references like "here" / "this" to concrete offsets before editing the file.',
    inputSchema: EMPTY_SHAPE,
    invoke: (tools) => tools.getEditorContext(),
  },
  {
    name: STUDIO_TOOLS.listPosts,
    title: "List posts",
    description: "List posts found under the blog content tree as { path, title, url }.",
    inputSchema: EMPTY_SHAPE,
    invoke: (tools) => tools.listPosts(),
  },
  {
    name: STUDIO_TOOLS.scaffoldPost,
    title: "Scaffold post",
    description:
      "Create a NEW post from valid frontmatter (title, slug, headline, created_at). Writes " +
      "src/content/blog/<YYYY-MM-DD>_<slug>.mdx (date derived from created_at) into a fresh worktree, " +
      "makes it the active post, and returns { ok: true, path, url }. Fails ({ ok: false, error }) if a " +
      "post already exists at that path or the frontmatter is invalid. Use this to start a post, then " +
      "edit its file in your worktree with the native tools.",
    inputSchema: scaffoldPostInputShape,
    invoke: (tools, args) => tools.scaffoldPost(args as unknown as ScaffoldPostInput),
  },
  {
    name: STUDIO_TOOLS.previewStatus,
    title: "Preview status",
    description:
      "Return the live-preview state: { valid: true, url } when the frontmatter is valid, else " +
      "{ valid: false, url: null, errors }.",
    inputSchema: EMPTY_SHAPE,
    invoke: (tools) => tools.previewStatus(),
  },
  {
    name: STUDIO_TOOLS.openPr,
    title: "Open pull request",
    description:
      "Ask the studio (never the agent) to run the git/gh ship flow and open a PR. Human-gated: fails " +
      "unless confirm=true, which must only be set after a human has reviewed the diff. Commit/PR text " +
      "is human-authored and human-gated.",
    inputSchema: openPrInputShape,
    invoke: (tools, args) => tools.openPr(args as unknown as OpenPrInput),
  },
];

/**
 * Wrap a JSON-serializable tool result into an MCP `CallToolResult`: the value is always
 * carried as pretty JSON text, and mirrored into `structuredContent` when it is a plain
 * object so structured-output clients can consume it directly.
 */
export function toCallToolResult(value: unknown): CallToolResult {
  const result: CallToolResult = {
    content: [{ type: "text", text: JSON.stringify(value, null, 2) }],
  };
  if (value !== null && typeof value === "object" && !Array.isArray(value)) {
    result.structuredContent = value as Record<string, unknown>;
  }
  return result;
}

// ---- listPosts helpers (best-effort content-tree scan) ----

/** Scan `<blogRoot>/src/content/blog` for simple and folder posts. Best-effort; never throws. */
async function scanPosts(blogRoot: string): Promise<PostSummary[]> {
  const root = join(blogRoot, BLOG_CONTENT_DIR);
  let entries;
  try {
    entries = await readdir(root, { withFileTypes: true });
  } catch {
    return [];
  }
  const posts: PostSummary[] = [];
  for (const entry of entries) {
    if (entry.isFile() && entry.name.endsWith(".mdx")) {
      posts.push(await summarize(join(root, entry.name)));
    } else if (entry.isDirectory()) {
      const postPath = join(root, entry.name, "post.mdx");
      if (await isFile(postPath)) posts.push(await summarize(postPath));
    }
  }
  posts.sort((a, b) => a.path.localeCompare(b.path));
  return posts;
}

async function isFile(path: string): Promise<boolean> {
  try {
    return (await stat(path)).isFile();
  } catch {
    return false;
  }
}

async function summarize(path: string): Promise<PostSummary> {
  let title = path;
  try {
    // Shared frontmatter parser: block-aware, BOM-tolerant, and strips a matched quote pair — a
    // small improvement over the old single-line title regex, and the one title source of truth.
    title = frontmatterTitle(await readFile(path, "utf8")) ?? path;
  } catch {
    // fall through to path-as-title
  }
  // URL derivation lives in preview/deriveUrl.ts (another package) and is not injected here;
  // leave null rather than duplicate the frontmatter-to-URL contract.
  return { path, title, url: null };
}

// ---- app-structure digest helpers (best-effort, live repo scan) ----

/** package.json keys worth surfacing (in this order); any `@vanilla-extract/*` is added too. */
const FRAMEWORK_DEP_KEYS = [
  "astro",
  "@astrojs/react",
  "@astrojs/mdx",
  "react",
  "react-dom",
  "astro-expressive-code",
  "@expressive-code/plugin-line-numbers",
  "remark-math",
  "rehype-katex",
  "katex",
  "p5",
  "@p5-wrapper/react",
] as const;

/** Component directory scanned for the reusable-component inventory. */
const COMPONENTS_DIR = "src/components";

/** Cap the component inventory so the digest stays compact; overflow is summarized. */
const COMPONENT_INVENTORY_CAP = 40;

/** Styling/util entry points worth pointing a foreign-cwd agent at, each with a one-line hint. */
const ENTRY_POINTS: ReadonlyArray<{ path: string; hint: string }> = [
  { path: "src/styles/theme.css.ts", hint: "vanilla-extract design tokens (MUI-like palette/spacing/type scale)" },
  { path: "src/styles/theme-utils.ts", hint: "mediaUp/mediaDown/mediaBetween/spacing/transition helpers" },
  { path: "src/lib/useThemeMode.ts", hint: "light/dark theme-mode hook" },
  { path: "src/lib/blog.ts", hint: "formatPostDate (created_at → YYYY-MM-DD)" },
  { path: "src/content.config.ts", hint: "blog collection frontmatter Zod schema" },
];

/**
 * Live, best-effort app-structure digest for a foreign-cwd agent: framework and key versions,
 * tsconfig path aliases, a reusable-component inventory, and the styling/util entry points.
 * Generated by scanning the repo at call time so it cannot drift like hand-written docs.
 * Never throws; returns undefined if nothing could be read (e.g. run outside the repo).
 */
async function scanAppStructure(blogRoot: string): Promise<string | undefined> {
  const sections = (
    await Promise.all([
      scanFrameworkVersions(blogRoot),
      scanPathAliases(blogRoot),
      scanComponentInventory(blogRoot),
      scanEntryPoints(blogRoot),
    ])
  ).filter((s): s is string => Boolean(s));
  return sections.length ? sections.join("\n\n") : undefined;
}

/** Parse a JSON file, returning null on any read/parse failure. */
async function readJsonFile(path: string): Promise<Record<string, unknown> | null> {
  try {
    const parsed: unknown = JSON.parse(await readFile(path, "utf8"));
    return parsed !== null && typeof parsed === "object" ? (parsed as Record<string, unknown>) : null;
  } catch {
    return null;
  }
}

/** Framework and key package versions from `<blogRoot>/package.json`. */
async function scanFrameworkVersions(blogRoot: string): Promise<string | undefined> {
  const pkg = await readJsonFile(join(blogRoot, "package.json"));
  if (!pkg) return undefined;
  const deps: Record<string, string> = {
    ...(pkg.dependencies as Record<string, string> | undefined),
    ...(pkg.devDependencies as Record<string, string> | undefined),
  };
  const picked = FRAMEWORK_DEP_KEYS.filter((key) => deps[key]).map((key) => `${key}@${deps[key]}`);
  for (const key of Object.keys(deps).sort()) {
    if (key.startsWith("@vanilla-extract/")) picked.push(`${key}@${deps[key]}`);
  }
  if (!picked.length) return undefined;
  return ["Framework & key versions:", ...picked.map((p) => `  ${p}`)].join("\n");
}

/** tsconfig `compilerOptions.paths` aliases from `<blogRoot>/tsconfig.json`. */
async function scanPathAliases(blogRoot: string): Promise<string | undefined> {
  const tsconfig = await readJsonFile(join(blogRoot, "tsconfig.json"));
  const paths = (tsconfig?.compilerOptions as { paths?: Record<string, string[]> } | undefined)?.paths;
  if (!paths) return undefined;
  const lines = Object.entries(paths).map(([alias, targets]) => `  ${alias} → ${(targets ?? []).join(", ")}`);
  if (!lines.length) return undefined;
  return ["Path aliases (tsconfig):", ...lines].join("\n");
}

/** Reusable-component inventory: one compact line per `.tsx`/`.astro` under `src/components`. */
async function scanComponentInventory(blogRoot: string): Promise<string | undefined> {
  const root = join(blogRoot, COMPONENTS_DIR);
  let rels: string[];
  try {
    const entries = await readdir(root, { recursive: true, withFileTypes: true });
    rels = entries
      .filter((e) => e.isFile() && (e.name.endsWith(".tsx") || e.name.endsWith(".astro")))
      .map((e) => relative(blogRoot, join(e.parentPath, e.name)))
      .sort();
  } catch {
    return undefined;
  }
  if (!rels.length) return undefined;

  const islands = await scanClientIslands(blogRoot);
  const shown = rels.slice(0, COMPONENT_INVENTORY_CAP);
  const lines = await Promise.all(
    shown.map(async (rel) => {
      const isAstro = rel.endsWith(".astro");
      // Astro components are named by file; React components carry a default export name.
      const name = isAstro ? basename(rel, ".astro") : await extractComponentName(join(blogRoot, rel));
      const island = !isAstro && islands.has(name) ? ", client island" : "";
      return `  ${rel} — ${name} (${isAstro ? "astro" : "react"}${island})`;
    }),
  );
  if (rels.length > COMPONENT_INVENTORY_CAP) {
    lines.push(`  … ${rels.length - COMPONENT_INVENTORY_CAP} more (truncated)`);
  }
  const header =
    `Reusable components (${rels.length} under ${COMPONENTS_DIR}/; co-located post islands ` +
    `live beside their post.mdx):`;
  return [header, ...lines].join("\n");
}

const DEFAULT_DECL_RE = /export\s+default\s+(?:async\s+)?(?:function|class)\s+([A-Za-z_$][\w$]*)/;
const DEFAULT_REF_RE = /export\s+default\s+([A-Za-z_$][\w$]*)\s*;/;

/** Best-effort default-export name of a React component file, falling back to its basename. */
async function extractComponentName(absPath: string): Promise<string> {
  try {
    const text = await readFile(absPath, "utf8");
    const decl = DEFAULT_DECL_RE.exec(text);
    if (decl) return decl[1];
    const ref = DEFAULT_REF_RE.exec(text);
    if (ref && ref[1] !== "function" && ref[1] !== "class") return ref[1];
  } catch {
    // fall through to basename
  }
  return basename(absPath).replace(/\.[^.]+$/, "");
}

// Match a component tag hydrated with a `client:*` directive, e.g. `<HeadlineCycler client:load`.
const CLIENT_ISLAND_RE = /<([A-Z][A-Za-z0-9_]*)\b[^>]*?\bclient:[a-z]+/g;

/** Component names hydrated as client islands anywhere under `src` (`.astro`/`.mdx` usages). */
async function scanClientIslands(blogRoot: string): Promise<Set<string>> {
  const names = new Set<string>();
  let entries;
  try {
    entries = await readdir(join(blogRoot, "src"), { recursive: true, withFileTypes: true });
  } catch {
    return names;
  }
  for (const entry of entries) {
    if (!entry.isFile() || !(entry.name.endsWith(".astro") || entry.name.endsWith(".mdx"))) continue;
    try {
      const text = await readFile(join(entry.parentPath, entry.name), "utf8");
      for (const match of text.matchAll(CLIENT_ISLAND_RE)) names.add(match[1]);
    } catch {
      // skip unreadable file
    }
  }
  return names;
}

/** Styling/util entry points that actually exist on disk, each with a one-line hint. */
async function scanEntryPoints(blogRoot: string): Promise<string | undefined> {
  const present: string[] = [];
  for (const { path, hint } of ENTRY_POINTS) {
    if (await isFile(join(blogRoot, path))) present.push(`  ${path} — ${hint}`);
  }
  if (!present.length) return undefined;
  return ["Styling & util entry points:", ...present].join("\n");
}
