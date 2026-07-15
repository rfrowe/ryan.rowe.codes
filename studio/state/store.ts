// In-memory mirror of every open post. Each post gets its own git worktree (branch blog/<stem>,
// keyed by the date-qualified filename stem so a shared slug on different dates can't collide), so
// sessions never contend over one working tree. Docs are keyed by canonical repo path.
//
// Disk is the source of truth. Autosave funnels through a mutex so the rev-check and write are one
// critical section that re-reads disk to refuse clobbering an out-of-band edit. The agent writes
// its worktree with native tools; the watcher adopts those as file.changed{agent}.

import path from "node:path";

import type { ApplyEditResult } from "../shared/mcpTools";
import type { DraftSummary, ServerMessage } from "../shared/protocol";
import type { Fs, GitRunner } from "../shared/seams";
import type { Store } from "../shared/services";
import type { ActiveDoc, DocRev, EditorContext, PreviewState } from "../shared/types";
import type { PostFrontmatter } from "../../src/lib/frontmatter";
import { FRONTMATTER_BLOCK, FRONTMATTER_LINE, frontmatterTitle } from "../../src/lib/frontmatter";
import { isValidSlug, postStem, slugFromPath, stemParts } from "../shared/slug";
import { applyEdits, revsEqual } from "./applyEdits";
import { DEFAULT_PREVIEW_BASE, deriveUrl } from "../preview/deriveUrl";
import { BLOG_CONTENT_DIR, computeDiffAgainstRef, computeWorkingTreeDiff, type DiffScope } from "../sidecar/diffService";
import { sha256Hex } from "../sidecar/hash";

/** Serializes async mutations so a rev-check and its write can't be interleaved. */
class Mutex {
  private tail: Promise<unknown> = Promise.resolve();

  runExclusive<T>(fn: () => Promise<T>): Promise<T> {
    const run = this.tail.then(fn, fn);
    // Swallow rejections on the chain itself so one failed section doesn't wedge the queue.
    this.tail = run.then(
      () => undefined,
      () => undefined,
    );
    return run;
  }
}

/**
 * Records hashes the store just wrote so the watcher can tell its own writes ("self" autosave, or
 * the agent's native-tool writes) apart from external edits. A multiset consumed once on observe.
 */
export class SelfWriteGuard {
  private pending: Array<{ hash: string; origin: "self" | "agent" }> = [];
  private readonly cap: number;

  constructor(cap = 32) {
    this.cap = cap;
  }

  /** Announce a hash the store is about to write. */
  expect(hash: string, origin: "self" | "agent"): void {
    this.pending.push({ hash, origin });
    if (this.pending.length > this.cap) this.pending.shift();
  }

  /** If `hash` was a store write, consume it and return its origin; else null (external). */
  consume(hash: string): "self" | "agent" | null {
    const i = this.pending.findIndex((p) => p.hash === hash);
    if (i < 0) return null;
    const [entry] = this.pending.splice(i, 1);
    return entry.origin;
  }

  /** Whether `hash` is a pending store write, without consuming it. */
  has(hash: string): boolean {
    return this.pending.some((p) => p.hash === hash);
  }
}

/**
 * Worktree parent dir, relative to the repo root (the same `.worktrees` tree dev-session worktrees
 * live in). Post worktrees live under `<base>/<prefixSeg>/blog/<stem>`: `<base>/blog/<stem>` for a
 * primary session (empty prefix) and `<base>/<sanitized-branch>/blog/<stem>` for a non-primary one, so
 * simultaneous studios on different branches never share a dir. One worktree per post, keyed by its
 * stem (the dir basename stays the stem).
 */
const WORKTREES_BASE = ".worktrees";

/**
 * Sanitize a branch name into a single path/ref segment: git refs can't contain `:` `~` `^` `?` `*`
 * `[` `\` or spaces, and `/` would nest under an existing branch ref, so everything outside
 * `[A-Za-z0-9._-]` collapses to `-` (and leading/trailing separators are trimmed). `feat/worktree`
 * becomes `feat-worktree`. Empty input (or an all-invalid name) falls back to `wt`.
 */
export function sanitizeBranchSegment(branch: string): string {
  const seg = branch.replace(/[^A-Za-z0-9._-]+/g, "-").replace(/^[-.]+|[-.]+$/g, "");
  return seg.length > 0 ? seg : "wt";
}

const NO_ACTIVE_PREVIEW: PreviewState = { valid: false, url: null, errors: ["no active document"] };

/** Result of createPost: the resolved (canonical) path + derived URL on success, or a refusal. */
export type CreatePostResult =
  | { ok: true; path: string; url: string; doc: ActiveDoc }
  | { ok: false; error: string };

/** Result of renamePost / completeRename. */
export type RenamePostResult = { ok: true; path: string } | { ok: false; error: string };

/** A rename target: a new slug, optionally a new date. Tab-bar rename supplies only a slug; a
 *  Complete-rename derives both from the post's frontmatter. */
export type RenameTarget = { slug: string; date?: string };

/** PUT /doc outcome (mirrors the frozen PutDocResponse). */
export type WriteResult =
  | { ok: true; rev: DocRev }
  | { ok: false; error: "stale-rev"; currentRev: DocRev };

/** What a destructive op (delete/revert) would discard, for the confirm gate. */
export interface PostLossPreview {
  /** Uncommitted changes (incl. untracked) present in the post's worktree. */
  dirty: boolean;
  /** Count of uncommitted files. */
  changedFiles: number;
  /** Commits on the post's branch not yet in origin/<default>. */
  ahead: number;
  /** Unified diff the op would discard. Revert: `git diff HEAD`. Delete: the full delta from the
   *  published base plus synthesized diffs for untracked files. */
  diff: string;
  /** The scope this preview reflects: always "all" for delete (never partial); for revert, the
   *  caller's requested scope, or the sidecar's own pick when the request left it unspecified. */
  scope: DiffScope;
}

/**
 * Whether a post has unshipped work. Shared by the ⌘P dirty badge and the delete-draft confirm gate
 * so the two can't drift. Keyed off a "delete"-scoped {@link PostLossPreview}.
 */
export function postWouldLoseWork(preview: PostLossPreview): boolean {
  return preview.dirty || preview.ahead > 0;
}

/** deletePost outcome. */
export type DeletePostResult = { ok: true } | { ok: false; error: string };

/** revertPost outcome; `reverted` is false when there was nothing uncommitted to discard. */
export type RevertPostResult = { ok: true; reverted: boolean } | { ok: false; error: string };

/** The active post's worktree, handed to the ship flow and the sidecar's astro manager. */
export interface ActiveWorktree {
  slug: string;
  branch: string;
  worktreePath: string;
  worktreeFilePath: string;
  /** Path of the post relative to the repo root, e.g. `src/content/blog/<name>.mdx`. */
  relPath: string;
  /** The canonical (main-repo) path the SPA tabs on. */
  canonicalPath: string;
}

/** Fired when the active post changes so the watcher retargets and astro restarts in the worktree. */
export interface ActiveChangeInfo {
  canonicalPath: string;
  worktreePath: string;
  worktreeFilePath: string;
}

/** One open post: its identity, its backing worktree, and the in-memory mirror of its text. */
interface OpenDoc {
  slug: string;
  branch: string;
  /** Canonical (main-repo) path; the SPA's tab key and the frontend-facing `path`. */
  canonicalPath: string;
  /** Path relative to the repo root (shared between the main repo and the worktree layout). */
  relPath: string;
  worktreePath: string;
  /** The actual on-disk file the editor autosaves and the watcher watches. */
  worktreeFilePath: string;
  text: string;
  rev: DocRev;
  title: string;
}

/**
 * The git pathspec scoping a post's status/diff/checkout: the file for a simple post, or its folder
 * for a `<stem>/post.mdx` folder post (so co-located assets are counted and reverted with it).
 */
function postUnitPathspec(relPath: string): string {
  const isFolder = relPath.endsWith("/post.mdx") || relPath.endsWith(`${path.sep}post.mdx`);
  return isFolder ? path.dirname(relPath) : relPath;
}

/** True when `v` can be emitted as a bare YAML plain scalar (no quoting needed). */
function isPlainScalar(v: string): boolean {
  if (v === "" || v !== v.trim()) return false;
  if (/^[-?:,[\]{}#&*!|>'"%@`]/.test(v)) return false; // leading YAML indicator
  if (/:\s/.test(v) || /\s#/.test(v)) return false; // "key: value" / " # comment" ambiguity
  return true;
}

/** Render a frontmatter scalar: bare when safe, else a double-quoted string with escapes. */
function frontmatterScalar(v: string): string {
  if (isPlainScalar(v)) return v;
  return quotedScalar(v);
}

/**
 * Render an always-double-quoted YAML string. Used for `created_at`, which must stay quoted so
 * Astro keeps it a string and preserves its timezone offset; an unquoted ISO value is coerced to an
 * offset-less `Date` the content schema rejects (see `src/content.config.ts`).
 */
function quotedScalar(v: string): string {
  return `"${v.replace(/\\/g, "\\\\").replace(/"/g, '\\"')}"`;
}

/**
 * The starter `.mdx` for a new post: valid frontmatter and a minimal body. No `# H1`, since the
 * BlogPost layout renders the title from frontmatter.
 */
function renderNewPost(input: PostFrontmatter): string {
  return [
    "---",
    `title: ${frontmatterScalar(input.title)}`,
    `slug: ${frontmatterScalar(input.slug)}`,
    `headline: ${frontmatterScalar(input.headline)}`,
    // created_at is always quoted so Astro's YAML parser keeps it a string (offset preserved).
    `created_at: ${quotedScalar(input.created_at)}`,
    "---",
    "",
    "Start writing…",
    "",
  ].join("\n");
}

/**
 * Rewrite one frontmatter `key:` value in place, preserving everything else verbatim. `quote` forces
 * a double-quoted value (for `created_at`, so YAML preserves its timezone offset).
 */
function rewriteFrontmatterValue(text: string, key: string, value: string, quote = false): string {
  const src = text.charCodeAt(0) === 0xfeff ? text.slice(1) : text;
  const block = FRONTMATTER_BLOCK.exec(src);
  if (!block) return text;
  const bomOffset = text.length - src.length;
  const blockStart = bomOffset + block.index;
  const bodyStart = blockStart + block[0].indexOf(block[1]);
  const bodyEnd = bodyStart + block[1].length;
  const render = quote ? quotedScalar : frontmatterScalar;
  const rewrittenBody = block[1]
    .split(/\r?\n/)
    .map((line) => {
      const pair = FRONTMATTER_LINE.exec(line.trim());
      if (pair && pair[1] === key) return line.replace(/(:[ \t]*).*/, `$1${render(value)}`);
      return line;
    })
    .join("\n");
  return text.slice(0, bodyStart) + rewrittenBody + text.slice(bodyEnd);
}

export interface StoreDeps {
  fs: Fs;
  /** git/gh runner rooted at the repo (worktree add / branch -m / worktree move). */
  git: GitRunner;
  repoRoot: string;
  /**
   * The branch the studio was launched on (`git rev-parse --abbrev-ref HEAD` in the repo root), i.e.
   * the "primary" branch: new post worktrees fork from its local tip, ship targets it, and (when it
   * differs from the repo default) its sanitized name namespaces every post branch/worktree so
   * studios on different branches don't collide.
   */
  sessionBranch: string;
  /**
   * Repo default branch, used only to decide whether this is a primary session (no branch prefix).
   * Resolved lazily (offline-first: `origin/HEAD`, then `gh`, then `main`) when omitted; tests pass it.
   */
  defaultBranch?: string;
  /**
   * Git ref a new post's worktree forks from. Defaults to the local {@link sessionBranch} tip, so
   * worktrees carry the session branch's committed studio changes for preview/LSP. Override via
   * STUDIO_FORK_BASE for an explicit base.
   */
  forkBase?: string;
  /** Preview origin (defaults to the Astro dev server). */
  previewBase?: string;
  /** Prepare a freshly-created/reused worktree (e.g. symlink node_modules). Omitted in tests. */
  prepareWorktree?: (worktreePath: string) => Promise<void>;
  /** Move a file or directory on disk (rename). Omitted in tests that don't exercise rename. */
  movePath?: (from: string, to: string) => Promise<void>;
  /** Stop the preview daemon serving `worktreePath` before a delete removes it, so no daemon is
   *  left holding the fixed port. Omitted in tests. */
  stopPreview?: (worktreePath: string) => Promise<void>;
  /** Recursively remove a path (rm -rf); clears a leftover husk worktree dir before re-creating it.
   *  Omitted in tests. */
  removePath?: (p: string) => Promise<void>;
}

/** Concrete store: the frozen `Store` plus the multi-doc / worktree surface the sidecar needs. */
export interface StudioStore extends Store {
  /** Hashes of the store's own recent writes; the watcher consults this to classify events. */
  readonly guard: SelfWriteGuard;
  /** Fan a message out to every subscriber. */
  publish(message: ServerMessage): void;
  /**
   * Open a post by its canonical repo path (ensuring/reusing its worktree), or focus it if already
   * open. Announces the switch and notifies onActiveChange so the watcher/astro retarget.
   */
  openPost(canonicalPath: string): Promise<ActiveDoc>;
  /**
   * Create a new post in its own worktree, make it active, and announce it. Refuses (never
   * overwrites) when a post already exists.
   */
  createPost(input: PostFrontmatter): Promise<CreatePostResult>;
  /**
   * Close a tab, re-focusing another open post if any. A draft keeps its worktree/branch for
   * re-open; a clean tab is torn down like {@link deletePost}, leaving no orphaned worktree.
   */
  closePost(canonicalPath: string): Promise<void>;
  /**
   * Rename a post to a new slug (and optionally date): move the file, branch, and worktree, and for
   * a tab-bar rename rewrite the frontmatter slug to match. Emits `post.renamed` then re-activates.
   * Refuses when the target stem collides with an open tab, an on-disk file, or a draft branch.
   */
  renamePost(canonicalPath: string, target: RenameTarget): Promise<RenamePostResult>;
  /**
   * Resolve a frontmatter/filename desync by renaming the file/worktree/branch to match the post's
   * frontmatter. Like {@link renamePost} but leaves the frontmatter untouched (already the truth).
   * Refuses when the derivation is invalid or the target stem is taken.
   */
  completeRename(canonicalPath: string): Promise<RenamePostResult>;
  /**
   * Resolve a desync from the filename side (inverse of {@link completeRename}): rewrite the
   * frontmatter so its derived URL matches the filename/branch stem. An ordinary uncommitted edit,
   * broadcast to the editor. A no-op when already in sync.
   */
  revertUrl(canonicalPath: string): Promise<RenamePostResult>;
  /**
   * What deleting / reverting a post would discard (uncommitted files, unmerged commits, diff).
   * `scope` only affects `"revert"` (post-only vs. the whole worktree); delete always discards the
   * whole worktree, so it has nothing to choose. Omit `scope` on a revert to have it picked
   * automatically ("all" when there's more than just the post, else "post"); the resolved value comes
   * back on {@link PostLossPreview.scope}.
   */
  postLossPreview(canonicalPath: string, op: "delete" | "revert", scope?: DiffScope): Promise<PostLossPreview>;
  /**
   * Scan the on-disk worktrees (not the in-memory `open` map, so strays from a failed boot or the CLI
   * are covered) for two overlapping sets of canonical paths: `dirty` = any unshipped work (uncommitted
   * edits or commits ahead of the base; mirrors {@link postWouldLoseWork}), and `uncommitted` = only
   * those with uncommitted edits (the ones "Revert to clean" can actually discard).
   */
  scanDirtyPosts(): Promise<{ dirty: string[]; uncommitted: string[] }>;
  /**
   * Enumerate `blog/*` draft branches with no live worktree and not open: drafts started elsewhere
   * or left behind. Offline-safe (reads refs on disk, never fetches). Powers the ⌘P palette's draft
   * entries; selecting one runs the adopt-then-open path.
   */
  listDrafts(): Promise<DraftSummary[]>;
  /**
   * Delete a draft post: remove its worktree and force-delete its branch (never touches origin),
   * re-focusing another open post like close. The preview daemon is stopped first so it can't hold
   * the port.
   */
  deletePost(canonicalPath: string): Promise<DeletePostResult>;
  /** Discard a post's uncommitted edits back to its branch's HEAD (post-only, or the whole worktree
   *  for `scope: "all"`); reloads the buffer if it changed. Callers pass the scope
   *  {@link StudioStore.postLossPreview} resolved, so the checkout matches what was previewed. */
  revertPost(canonicalPath: string, scope: DiffScope): Promise<RevertPostResult>;
  /** Persist exact text to the post at `canonicalPath` (autosave); returns new rev or stale-rev. */
  writeByPath(canonicalPath: string, text: string, baseRev: DocRev): Promise<WriteResult>;
  /** The active post as { path, title, branch } (path = canonical) for the tab bar / snapshot; null if none. */
  getActive(): { path: string; title: string; branch: string } | null;
  /**
   * The active post's frontmatter/filename name-sync status: `synced:false` with the expected/current
   * stems when they differ. The ship flow reads it to refuse a desynced post.
   */
  getActiveNameSync(): { synced: boolean; expectedStem?: string; currentStem?: string };
  /** Authoritative open tab set for the `tabs` broadcast. */
  getOpenTabs(): { path: string; title: string }[];
  /** The active post's worktree (for ship + the astro manager); null if none. */
  getActiveWorktree(): ActiveWorktree | null;
  /** The worktree of the open post at `canonicalPath` (not necessarily active); null if not open.
   *  Resolves the owning worktree even during a switch race. */
  getWorktreeFor(canonicalPath: string): ActiveWorktree | null;
  /**
   * Worktree file backing the open post at `canonicalPath` (not necessarily the active one); null if
   * it isn't open. The canonical-to-worktree companion to {@link getDocByWatchPath}: the LSP bridge
   * rewrites a browser's `textDocument.uri` to the worktree path TS resolves against. Path-keyed so a
   * tab-switch race can't misattribute a URI.
   */
  getWorktreeFilePath(canonicalPath: string): string | null;
  /** Absolute on-disk file the active post's watcher should follow; null if none. */
  getActiveWatchPath(): string | null;
  /**
   * The open post backing `worktreeFilePath` (its canonical path and rev), or null. Lets the watcher
   * reconcile against the file's owner when a tab switch out-lives an agent turn.
   */
  getDocByWatchPath(worktreeFilePath: string): { path: string; rev: DocRev } | null;
  /** Adopt externally/agent-changed text as the active doc, emitting file.changed{origin}. */
  reloadActive(text: string, origin: "external" | "agent"): Promise<ActiveDoc>;
  /**
   * Adopt disk text for the open post backing `worktreeFilePath` (not necessarily active), emitting
   * file.changed{origin}; null if no open post backs it. Lets an agent turn's writes land on the
   * turn's post even after a mid-turn tab switch.
   */
  reloadByWatchPath(worktreeFilePath: string, text: string, origin: "external" | "agent"): Promise<ActiveDoc | null>;
  /**
   * Adopt an in-worktree layout flip for the open post backing `oldWorktreeFilePath`: the agent
   * restructured a simple `<stem>.mdx` post into a folder `<stem>/post.mdx` (or back) to co-locate a
   * component. Same post (stem, branch, and worktree all unchanged), new file location, so re-key the
   * doc to `newWorktreeFilePath`, adopt its text, and emit `post.renamed` then a buffer re-seed so the
   * tab (with its transcript/session) follows. Null when no open post backs the old path, nothing
   * flipped, or the new file isn't readable.
   */
  relayout(oldWorktreeFilePath: string, newWorktreeFilePath: string, origin: "external" | "agent"): Promise<ActiveDoc | null>;
  /** Register a callback fired whenever the active post switches; returns an unsubscribe fn. */
  onActiveChange(listener: (info: ActiveChangeInfo) => void): () => void;
  /**
   * Absolute parent dir this session's post worktrees live under (`<repo>/.worktrees[/<seg>]/blog`).
   * Session-scoped by the branch prefix; the sidecar's Astro manager uses it to clear stray daemons.
   */
  sessionWorktreesRoot(): Promise<string>;
}

export function createStore(deps: StoreDeps): StudioStore {
  const { fs, git, repoRoot, sessionBranch } = deps;
  const previewBase = deps.previewBase ?? DEFAULT_PREVIEW_BASE;
  const blogContentRoot = path.resolve(repoRoot, BLOG_CONTENT_DIR);
  const mutex = new Mutex();
  const guard = new SelfWriteGuard();
  const listeners = new Set<(message: ServerMessage) => void>();
  const activeChangeListeners = new Set<(info: ActiveChangeInfo) => void>();

  const open = new Map<string, OpenDoc>();
  let activePath: string | null = null;
  let editorContext: EditorContext | null = null;
  let preview: PreviewState = NO_ACTIVE_PREVIEW;
  let cachedDefaultBranch: string | undefined = deps.defaultBranch;

  function publish(message: ServerMessage): void {
    // Copy first: a listener may unsubscribe during iteration.
    for (const listener of [...listeners]) listener(message);
  }

  function activeDoc(): OpenDoc | null {
    return activePath ? (open.get(activePath) ?? null) : null;
  }

  /** Project an open doc to the ActiveWorktree shape (ship, the astro manager, MCP path translation). */
  function worktreeOf(doc: OpenDoc): ActiveWorktree {
    return {
      slug: doc.slug,
      branch: doc.branch,
      worktreePath: doc.worktreePath,
      worktreeFilePath: doc.worktreeFilePath,
      relPath: doc.relPath,
      canonicalPath: doc.canonicalPath,
    };
  }

  /**
   * Repo default branch, used only to decide whether this is a primary session. Resolved once then
   * cached, offline-first: `origin/HEAD` (set at clone, no network), then `gh`, then `main` as a last
   * resort, so the prefix decision and fork base never hard-fail offline.
   */
  async function defaultBranch(): Promise<string> {
    if (cachedDefaultBranch) return cachedDefaultBranch;
    const sym = await git.git(["symbolic-ref", "--short", "refs/remotes/origin/HEAD"], { cwd: repoRoot });
    const symName = sym.stdout.trim().replace(/^origin\//, "");
    if (sym.code === 0 && symName) return (cachedDefaultBranch = symName);
    const res = await git.gh(
      ["repo", "view", "--json", "defaultBranchRef", "-q", ".defaultBranchRef.name"],
      { cwd: repoRoot, timeoutMs: 120_000 },
    );
    const name = res.stdout.trim();
    if (res.code === 0 && name) return (cachedDefaultBranch = name);
    return (cachedDefaultBranch = "main");
  }

  /**
   * This session's branch-namespace segment: `""` for a primary session (session branch == repo
   * default), else the sanitized session branch. Resolved once (needs the default branch), then cached.
   */
  let cachedPrefixSeg: string | undefined;
  async function prefixSeg(): Promise<string> {
    if (cachedPrefixSeg !== undefined) return cachedPrefixSeg;
    const def = await defaultBranch();
    cachedPrefixSeg = sessionBranch === def ? "" : sanitizeBranchSegment(sessionBranch);
    return cachedPrefixSeg;
  }

  /** A post's isolation branch: `blog/<stem>` (primary) or `<seg>/blog/<stem>` (non-primary). */
  async function branchFor(stem: string): Promise<string> {
    const seg = await prefixSeg();
    return seg ? `${seg}/blog/${stem}` : `blog/${stem}`;
  }

  /** Absolute parent dir this session's worktrees live under (`<repo>/.worktrees[/<seg>]/blog`). */
  async function worktreesRoot(): Promise<string> {
    return path.join(repoRoot, WORKTREES_BASE, await prefixSeg(), "blog");
  }

  /** Absolute worktree dir for post `stem` (basename stays the stem). */
  async function worktreePathFor(stem: string): Promise<string> {
    return path.join(await worktreesRoot(), stem);
  }

  /**
   * The ref a post branch's unshipped commits are measured against: `origin/<sessionBranch>` when that
   * remote-tracking ref exists (what ship targets), else the local session branch (the fork point).
   * Offline-safe: reads refs on disk, never fetches.
   */
  async function aheadBase(): Promise<string> {
    const hasRemote =
      (await git.git(["rev-parse", "--verify", "--quiet", `refs/remotes/origin/${sessionBranch}`], { cwd: repoRoot }))
        .code === 0;
    return hasRemote ? `origin/${sessionBranch}` : sessionBranch;
  }

  /** Canonicalize + root-jail a path to the blog content tree. Returns null if it escapes. */
  function resolveJailed(candidate: string): string | null {
    const resolved = path.resolve(candidate);
    const rel = path.relative(blogContentRoot, resolved);
    if (rel === "" || rel.startsWith("..") || path.isAbsolute(rel)) return null;
    return resolved;
  }

  /**
   * Whether `blog/<stem>` exists locally and/or as a remote-tracking ref. Offline-safe: reads refs
   * on disk, never fetches, so `remote` may be stale. Used to adopt an existing draft and to refuse
   * forking over one.
   */
  async function branchRefs(stem: string): Promise<{ local: boolean; remote: boolean }> {
    const branch = await branchFor(stem);
    const local = (await git.git(["rev-parse", "--verify", "--quiet", `refs/heads/${branch}`], { cwd: repoRoot })).code === 0;
    const remote =
      (await git.git(["rev-parse", "--verify", "--quiet", `refs/remotes/origin/${branch}`], { cwd: repoRoot })).code === 0;
    return { local, remote };
  }

  /**
   * Refusal message when `blog/<stem>` already exists, so creating/renaming a new post into that
   * stem would fork a divergent branch that only collides at push time. Null when the stem is free.
   */
  async function draftBranchTaken(stem: string): Promise<string | null> {
    const { local, remote } = await branchRefs(stem);
    if (!local && !remote) return null;
    const where = local && remote ? "locally and on origin" : local ? "locally" : "on origin";
    return `a draft already exists on that slug/date (branch ${await branchFor(stem)} ${where}); open it from ⌘P instead.`;
  }

  /**
   * Ensure (or reuse) the worktree for post `stem`. Reuses when the dir already holds a `.git` link;
   * else adopts an existing draft branch (local directly, remote-only via `--track`) so a draft
   * started elsewhere opens instead of being forked over; else forks fresh off the local session branch.
   */
  async function ensureWorktree(stem: string): Promise<{ worktreePath: string; branch: string }> {
    const branch = await branchFor(stem);
    const worktreePath = await worktreePathFor(stem);

    if (!(await fs.exists(path.join(worktreePath, ".git")))) {
      // Clear any stale registration for a dir that was removed out-of-band.
      await git.git(["worktree", "prune"], { cwd: repoRoot });
      const { local: localExists, remote: remoteExists } = await branchRefs(stem);

      // Self-heal a husk dir: an orphaned `astro dev` daemon can recreate `.astro/` (plus a
      // node_modules symlink, no valid `.git`) after worktree removal, and git's `worktree add`
      // rejects a non-empty existing dir. Preserve the dir only to re-register a local branch; a
      // remote-only or fresh branch is checked out clean, so remove it wholesale.
      if (await fs.exists(worktreePath)) {
        if (localExists) {
          await deps.removePath?.(path.join(worktreePath, ".astro"));
          await deps.removePath?.(path.join(worktreePath, "node_modules"));
        } else {
          await deps.removePath?.(worktreePath);
        }
      }

      // Adopt local, then adopt remote-only (create a tracking branch), then fork fresh off the base
      // (forkBase override, else the local session-branch tip).
      const args = localExists
        ? ["worktree", "add", worktreePath, branch]
        : remoteExists
          ? ["worktree", "add", "--track", "-b", branch, worktreePath, `origin/${branch}`]
          : ["worktree", "add", worktreePath, "-b", branch, deps.forkBase ?? sessionBranch];
      const res = await git.git(args, { cwd: repoRoot, timeoutMs: 120_000 });
      if (res.code !== 0) {
        throw new Error(`git worktree add (${stem}) failed: ${res.stderr.trim() || res.stdout.trim() || `exit ${res.code}`}`);
      }
    }

    if (deps.prepareWorktree) await deps.prepareWorktree(worktreePath);
    return { worktreePath, branch };
  }

  /**
   * Absolute paths of every git worktree registered under `worktreesRoot` (excludes the main
   * checkout). Parses `git worktree list --porcelain`. Shared by the dirty-scan and draft enumeration.
   */
  async function worktreePathsOnDisk(): Promise<string[]> {
    const root = await worktreesRoot();
    const listRes = await git.git(["worktree", "list", "--porcelain"], { cwd: repoRoot });
    const wtPaths: string[] = [];
    for (const block of listRes.stdout.split(/\r?\n\r?\n/)) {
      const m = /^worktree (.+)$/m.exec(block);
      if (!m) continue;
      const wtPath = m[1].trim();
      if (wtPath === root || wtPath.startsWith(root + path.sep)) wtPaths.push(wtPath);
    }
    return wtPaths;
  }

  /**
   * The post file path (repo-relative) for `stem` on git `ref`, checking the simple then folder
   * layout via `git cat-file -e`, or null when the branch carries no post file. Lets draft
   * enumeration build the canonical path before any worktree exists.
   */
  async function draftUnitRel(ref: string, stem: string): Promise<string | null> {
    const candidates = [`${BLOG_CONTENT_DIR}/${stem}.mdx`, `${BLOG_CONTENT_DIR}/${stem}/post.mdx`];
    for (const rel of candidates) {
      if ((await git.git(["cat-file", "-e", `${ref}:${rel}`], { cwd: repoRoot })).code === 0) return rel;
    }
    return null;
  }

  /** Run a `for-each-ref` and return the set of stems, stripping `prefix` from each refname. */
  async function refStems(args: string[], prefix: string): Promise<Set<string>> {
    const res = await git.git(args, { cwd: repoRoot });
    const stems = new Set<string>();
    for (const line of res.stdout.split(/\r?\n/)) {
      const ref = line.trim();
      if (ref.startsWith(prefix)) stems.add(ref.slice(prefix.length));
    }
    return stems;
  }

  function computePreview(doc: OpenDoc | null): PreviewState {
    if (!doc) return NO_ACTIVE_PREVIEW;
    const result = deriveUrl(doc.text, { base: previewBase });
    return result.valid ? { valid: true, url: result.url } : { valid: false, url: null, errors: result.errors };
  }

  /** The canonical path a post at `doc` would take if renamed to stem `newName` (simple vs folder). */
  function targetCanonicalFor(doc: OpenDoc, newName: string): string {
    const isFolder = doc.relPath.endsWith("/post.mdx") || doc.relPath.endsWith(path.sep + "post.mdx");
    return isFolder
      ? path.join(path.dirname(path.dirname(doc.canonicalPath)), newName, "post.mdx")
      : path.join(path.dirname(doc.canonicalPath), `${newName}.mdx`);
  }

  /**
   * The active-post name-sync status: whether the frontmatter-derived stem matches the
   * filename/branch stem. Synced when there's no active post or the frontmatter is invalid (the
   * preview-error path owns that). `canComplete` is false only for the sync-knowable collision (an
   * open tab at the target stem); a file or draft-branch collision surfaces on the rename attempt.
   */
  function computeNameSync(doc: OpenDoc | null): Extract<ServerMessage, { type: "post.namesync" }> {
    if (!doc) return { type: "post.namesync", synced: true };
    const derived = deriveUrl(doc.text, { base: previewBase });
    if (!derived.valid) return { type: "post.namesync", synced: true };
    const expectedStem = `${derived.date}_${derived.slug}`;
    const currentStem = postStem(doc.canonicalPath);
    if (expectedStem === currentStem) return { type: "post.namesync", synced: true };
    const openCollision = open.has(targetCanonicalFor(doc, expectedStem));
    return {
      type: "post.namesync",
      synced: false,
      expectedStem,
      currentStem,
      canComplete: !openCollision,
      reason: openCollision ? `a post is already open at ${expectedStem}` : undefined,
    };
  }

  function refreshPreview(): void {
    const doc = activeDoc();
    preview = computePreview(doc);
    publish({ type: "preview.url", preview });
    // Name-sync rides the same cadence as preview.url and is active-post-scoped.
    publish(computeNameSync(doc));
  }

  function publishTabs(): void {
    publish({ type: "tabs", open: getOpenTabs() });
  }

  /**
   * Announce a just-focused active doc in an order the SPA can bootstrap from: tab bar first (tabs,
   * active) so the target tab exists, then its buffer (file.changed), since the client drops a
   * file.changed for a path it has no tab for. Then refresh the preview and notify active-change
   * subscribers so the watcher/astro retarget.
   */
  function publishActivation(doc: OpenDoc): void {
    activePath = doc.canonicalPath;
    publishTabs();
    publish({ type: "active", path: doc.canonicalPath, title: doc.title, branch: doc.branch });
    publish({ type: "file.changed", path: doc.canonicalPath, text: doc.text, rev: doc.rev, origin: "external" });
    refreshPreview();
    const info: ActiveChangeInfo = {
      canonicalPath: doc.canonicalPath,
      worktreePath: doc.worktreePath,
      worktreeFilePath: doc.worktreeFilePath,
    };
    for (const listener of [...activeChangeListeners]) listener(info);
  }

  /**
   * Re-read a post's on-disk file, bumping its rev only when the bytes changed (so re-focusing an
   * unchanged tab doesn't spuriously banner).
   */
  async function reloadFromDisk(doc: OpenDoc): Promise<OpenDoc> {
    const text = await fs.readFile(doc.worktreeFilePath);
    const hash = sha256Hex(text);
    if (hash === doc.rev.hash) return doc;
    doc.text = text;
    doc.rev = { n: doc.rev.n + 1, hash };
    doc.title = frontmatterTitle(text) ?? path.basename(doc.canonicalPath);
    return doc;
  }

  /**
   * Guard against clobbering an out-of-band edit: re-read the file and compare its hash to what the
   * store last wrote. Returns an on-disk rev when the bytes diverged (caller rejects as stale-rev),
   * or null when safe (disk matches, or the divergence is our own in-flight write).
   */
  async function diskDivergedRev(doc: OpenDoc): Promise<DocRev | null> {
    const onDisk = await fs.readFile(doc.worktreeFilePath);
    const onDiskHash = sha256Hex(onDisk);
    if (onDiskHash === doc.rev.hash) return null;
    if (guard.has(onDiskHash)) return null;
    return { n: doc.rev.n, hash: onDiskHash };
  }

  function getOpenTabs(): { path: string; title: string }[] {
    return [...open.values()].map((d) => ({ path: d.canonicalPath, title: d.title }));
  }

  /**
   * The shared rename body (no mutex; callers hold it), driving both renames. Moves the file/folder
   * (`git mv` when tracked, else plain move), renames the branch and worktree to the new stem, then
   * for a slug-driven rename rewrites the frontmatter slug to match. Refuses on a target-stem
   * collision (open tab, on-disk file, or draft branch). Emits `post.renamed` before re-activating.
   */
  async function renameInternal(
    doc: OpenDoc,
    target: RenameTarget,
    opts: { fromFrontmatter: boolean },
  ): Promise<RenamePostResult> {
    if (!isValidSlug(target.slug)) return { ok: false, error: `invalid slug: ${target.slug}` };
    if (!deps.movePath) return { ok: false, error: "rename is unavailable (no movePath)" };

    // A simple post renames the `.mdx`; a folder post moves its parent dir (`<stem>/post.mdx`).
    const isFolder = doc.relPath.endsWith("/post.mdx") || doc.relPath.endsWith(path.sep + "post.mdx");
    const oldName = isFolder ? path.basename(path.dirname(doc.canonicalPath)) : path.basename(doc.canonicalPath, ".mdx");
    // A Complete-rename supplies the frontmatter date; a tab-bar rename keeps the current date prefix.
    const datePrefix = target.date ? `${target.date}_` : stemParts(oldName).datePrefix;
    const newName = `${datePrefix}${target.slug}`;
    const oldCanonical = doc.canonicalPath;
    if (newName === oldName) return { ok: true, path: oldCanonical }; // nothing to do

    const newCanonical = targetCanonicalFor(doc, newName);
    if (open.has(newCanonical)) return { ok: false, error: `a post is already open at that slug` };
    const newRel = path.relative(repoRoot, newCanonical);
    // Branch + worktree key on the full stem (`newName`), not the bare slug, keeping the post's
    // collision-free identity (and this session's branch prefix).
    const newBranch = await branchFor(newName);
    const newWorktreePath = await worktreePathFor(newName);

    // The unit within the worktree that moves: the folder for a folder post, else the file.
    const oldUnitInWt = isFolder ? path.dirname(doc.worktreeFilePath) : doc.worktreeFilePath;
    const newUnitInWt = isFolder ? path.join(doc.worktreePath, path.dirname(newRel)) : path.join(doc.worktreePath, newRel);
    if (await fs.exists(newUnitInWt)) return { ok: false, error: `a post already exists at ${newRel}` };
    // Refuse if the target stem already has a draft branch: `git branch -m` fails on a local
    // collision and would silently fork over a remote-only one.
    const taken = await draftBranchTaken(newName);
    if (taken) return { ok: false, error: taken };

    // Rename the branch, move the file/folder, then move the worktree dir. Order matters: move the
    // file while the worktree is still at its old path. A tracked post uses `git mv` so the index
    // records a rename; an untracked post falls back to a plain move.
    const brRes = await git.git(["-C", doc.worktreePath, "branch", "-m", newBranch], { cwd: repoRoot });
    if (brRes.code !== 0) return { ok: false, error: `git branch -m failed: ${brRes.stderr.trim() || `exit ${brRes.code}`}` };
    const tracked =
      (await git.git(["-C", doc.worktreePath, "ls-files", "--error-unmatch", "--", oldUnitInWt], { cwd: repoRoot })).code === 0;
    if (tracked) {
      const mvRes = await git.git(["-C", doc.worktreePath, "mv", oldUnitInWt, newUnitInWt], { cwd: repoRoot });
      if (mvRes.code !== 0) return { ok: false, error: `git mv failed: ${mvRes.stderr.trim() || `exit ${mvRes.code}`}` };
    } else {
      await deps.movePath!(oldUnitInWt, newUnitInWt);
    }
    // Stop the preview daemon before relocating the worktree: `astro dev` holds the dir (and its
    // port) open, and moving it out from under the daemon leaves it serving a moved path.
    try {
      await deps.stopPreview?.(doc.worktreePath);
    } catch {
      /* best-effort: the move + restart below proceed regardless */
    }
    const wtMvRes = await git.git(["worktree", "move", doc.worktreePath, newWorktreePath], { cwd: repoRoot });
    if (wtMvRes.code !== 0) {
      return { ok: false, error: `git worktree move failed: ${wtMvRes.stderr.trim() || `exit ${wtMvRes.code}`}` };
    }
    // Drop the moved `.astro` cache: it holds a content module keyed on the old filename, so Astro
    // throws "Cannot find module" for the renamed post until it regenerates on restart.
    await deps.removePath?.(path.join(newWorktreePath, ".astro"));
    if (deps.prepareWorktree) await deps.prepareWorktree(newWorktreePath);

    const newWorktreeFilePath = path.join(newWorktreePath, newRel);
    // Slug-driven rename: rewrite the frontmatter slug to match the new filename. Complete-rename:
    // leave the text as-is (the frontmatter is already the truth).
    const nextText = opts.fromFrontmatter ? doc.text : rewriteFrontmatterValue(doc.text, "slug", target.slug);
    const nextRev: DocRev = { n: doc.rev.n + 1, hash: sha256Hex(nextText) };
    guard.expect(nextRev.hash, "self");
    await fs.writeFile(newWorktreeFilePath, nextText);

    open.delete(oldCanonical);
    doc.slug = target.slug;
    doc.branch = newBranch;
    doc.canonicalPath = newCanonical;
    doc.relPath = newRel;
    doc.worktreePath = newWorktreePath;
    doc.worktreeFilePath = newWorktreeFilePath;
    doc.text = nextText;
    doc.rev = nextRev;
    doc.title = frontmatterTitle(nextText) ?? doc.title;
    open.set(newCanonical, doc);
    // Announce the rename before publishActivation rebuilds tabs, so clients migrate the tab's
    // transcript/session onto the new path first (else the conversation is lost). Server-side
    // session re-key is the caller's job.
    publish({ type: "post.renamed", oldPath: oldCanonical, newPath: newCanonical, title: doc.title, branch: doc.branch });
    publishActivation(doc);
    return { ok: true, path: newCanonical };
  }

  /** The open post whose worktree file is `worktreeFilePath` (may not be the active one). */
  function docByWatchPath(worktreeFilePath: string): OpenDoc | null {
    for (const d of open.values()) if (d.worktreeFilePath === worktreeFilePath) return d;
    return null;
  }

  /** Adopt disk text for the open post backing `worktreeFilePath`, emitting file.changed{origin};
   *  null if no open post backs that file. Shared by the watcher's reloadByWatchPath and revert. */
  function reloadByWatchPathImpl(
    worktreeFilePath: string,
    text: string,
    origin: "external" | "agent",
  ): Promise<ActiveDoc | null> {
    return mutex.runExclusive(async () => {
      const doc = docByWatchPath(worktreeFilePath);
      if (!doc) return null;
      doc.text = text;
      doc.rev = { n: doc.rev.n + 1, hash: sha256Hex(text) };
      doc.title = frontmatterTitle(text) ?? doc.title;
      publish({ type: "file.changed", path: doc.canonicalPath, text: doc.text, rev: doc.rev, origin });
      // Preview follows the active post; only refresh when this file is the active one.
      if (doc.canonicalPath === activePath) refreshPreview();
      return { path: doc.canonicalPath, text: doc.text, rev: doc.rev };
    });
  }

  /** Persist exact text to the open post at `canonicalPath` (autosave); shared by writeByPath/writeActive. */
  function writeByPathImpl(canonicalPath: string, text: string, baseRev: DocRev): Promise<WriteResult> {
    return mutex.runExclusive(async (): Promise<WriteResult> => {
      const jailed = resolveJailed(canonicalPath) ?? canonicalPath;
      const doc = open.get(jailed);
      // The editor only ever autosaves an open post; treat an unknown path as a stale write.
      if (!doc) return { ok: false, error: "stale-rev", currentRev: { n: 0, hash: "" } };
      if (!revsEqual(doc.rev, baseRev)) {
        return { ok: false, error: "stale-rev", currentRev: doc.rev };
      }
      const diverged = await diskDivergedRev(doc);
      if (diverged) return { ok: false, error: "stale-rev", currentRev: diverged };
      const nextRev: DocRev = { n: doc.rev.n + 1, hash: sha256Hex(text) };
      guard.expect(nextRev.hash, "self");
      await fs.writeFile(doc.worktreeFilePath, text);
      doc.text = text;
      doc.rev = nextRev;
      doc.title = frontmatterTitle(text) ?? doc.title;
      // The SPA is the source of this text (it sent the PUT), so no file.changed echo; refresh
      // the preview only when this is the active post.
      if (doc.canonicalPath === activePath) refreshPreview();
      return { ok: true, rev: nextRev };
    });
  }

  const store: StudioStore = {
    guard,
    publish,

    getActiveDoc() {
      const doc = activeDoc();
      return doc ? { path: doc.canonicalPath, text: doc.text, rev: doc.rev } : null;
    },

    getActive() {
      const doc = activeDoc();
      return doc ? { path: doc.canonicalPath, title: doc.title, branch: doc.branch } : null;
    },

    getActiveNameSync() {
      const m = computeNameSync(activeDoc());
      return { synced: m.synced, expectedStem: m.expectedStem, currentStem: m.currentStem };
    },

    getOpenTabs,

    getActiveWatchPath() {
      return activeDoc()?.worktreeFilePath ?? null;
    },

    getDocByWatchPath(worktreeFilePath) {
      const doc = docByWatchPath(worktreeFilePath);
      return doc ? { path: doc.canonicalPath, rev: doc.rev } : null;
    },

    getActiveWorktree() {
      const doc = activeDoc();
      return doc ? worktreeOf(doc) : null;
    },

    getWorktreeFor(canonicalPath) {
      const doc = open.get(resolveJailed(canonicalPath) ?? canonicalPath);
      return doc ? worktreeOf(doc) : null;
    },

    getWorktreeFilePath(canonicalPath) {
      const doc = open.get(resolveJailed(canonicalPath) ?? canonicalPath);
      return doc ? doc.worktreeFilePath : null;
    },

    async openPost(canonicalPath) {
      const jailed = resolveJailed(canonicalPath);
      if (!jailed) throw new Error(`openPost: path is not under the blog content root: ${canonicalPath}`);

      // Already open: focus it (re-read disk to pick up any background external edit).
      const existing = open.get(jailed);
      if (existing) {
        await reloadFromDisk(existing);
        publishActivation(existing);
        return { path: existing.canonicalPath, text: existing.text, rev: existing.rev };
      }

      const slug = slugFromPath(jailed);
      const relPath = path.relative(repoRoot, jailed);
      // ensureWorktree adopts an existing draft or forks fresh, so an already-authored post
      // materializes here even when it isn't in the main checkout.
      const { worktreePath, branch } = await ensureWorktree(postStem(jailed));
      const worktreeFilePath = path.join(worktreePath, relPath);
      let text: string;
      try {
        text = await fs.readFile(worktreeFilePath);
      } catch {
        throw new Error(
          `post not found in its worktree (${relPath}). Open an existing post that is committed on the ` +
            `primary branch (${sessionBranch}) or has a ${await branchFor(postStem(jailed))} draft branch.`,
        );
      }
      const doc: OpenDoc = {
        slug,
        branch,
        canonicalPath: jailed,
        relPath,
        worktreePath,
        worktreeFilePath,
        text,
        rev: { n: 1, hash: sha256Hex(text) },
        title: frontmatterTitle(text) ?? path.basename(jailed),
      };
      open.set(jailed, doc);
      publishActivation(doc);
      return { path: doc.canonicalPath, text: doc.text, rev: doc.rev };
    },

    createPost(input) {
      return mutex.runExclusive(async (): Promise<CreatePostResult> => {
        const text = renderNewPost(input);
        // Derive the date/URL with the same parser the preview and built route use, so the filename
        // and served URL can't drift.
        const derived = deriveUrl(text, { base: previewBase });
        if (!derived.valid) {
          return { ok: false, error: `invalid frontmatter: ${derived.errors.join("; ")}` };
        }
        const fileName = `${derived.date}_${derived.slug}.mdx`;
        const canonicalPath = resolveJailed(path.join(blogContentRoot, fileName));
        if (!canonicalPath) {
          return { ok: false, error: `post path escapes the blog content root: ${fileName}` };
        }
        if (open.has(canonicalPath)) {
          return { ok: false, error: `a post is already open at ${path.relative(blogContentRoot, canonicalPath)}` };
        }
        // Refuse if that slug/date already has a draft branch: creating here would fork a divergent
        // branch that only collides at push time.
        const taken = await draftBranchTaken(postStem(canonicalPath));
        if (taken) return { ok: false, error: taken };

        const slug = slugFromPath(canonicalPath);
        const relPath = path.relative(repoRoot, canonicalPath);
        let worktreePath: string;
        let branch: string;
        try {
          ({ worktreePath, branch } = await ensureWorktree(postStem(canonicalPath)));
        } catch (err) {
          return { ok: false, error: err instanceof Error ? err.message : "worktree setup failed" };
        }
        const worktreeFilePath = path.join(worktreePath, relPath);
        // The worktree forked from the primary branch, so a collision here means an existing post;
        // never overwrite.
        if (await fs.exists(worktreeFilePath)) {
          return { ok: false, error: `a post already exists at ${relPath}` };
        }
        const rev: DocRev = { n: 1, hash: sha256Hex(text) };
        guard.expect(rev.hash, "self");
        await fs.writeFile(worktreeFilePath, text);
        const doc: OpenDoc = {
          slug,
          branch,
          canonicalPath,
          relPath,
          worktreePath,
          worktreeFilePath,
          text,
          rev,
          title: input.title,
        };
        open.set(canonicalPath, doc);
        publishActivation(doc);
        return { ok: true, path: canonicalPath, url: derived.url, doc: { path: canonicalPath, text, rev } };
      });
    },

    async closePost(canonicalPath) {
      const jailed = resolveJailed(canonicalPath) ?? canonicalPath;
      if (!open.has(jailed)) return;

      // A clean tab has nothing to keep, so closing it tears down like "Delete draft" (else browsing
      // then closing would orphan a worktree). A draft keeps its worktree/branch for re-open. No
      // confirm gate, since there's no work to lose.
      if (!postWouldLoseWork(await store.postLossPreview(jailed, "delete"))) {
        await store.deletePost(jailed);
        return;
      }

      open.delete(jailed);
      // Draft present: keep the worktree/branch on disk. If the closed tab was active, focus another
      // open post (newest), else clear the active doc.
      if (activePath === jailed) {
        const next = [...open.values()].at(-1) ?? null;
        if (next) {
          await reloadFromDisk(next);
          publishActivation(next);
        } else {
          activePath = null;
          publishTabs();
          refreshPreview();
        }
      } else {
        publishTabs();
      }
    },

    renamePost(canonicalPath, target) {
      return mutex.runExclusive(async (): Promise<RenamePostResult> => {
        const doc = open.get(resolveJailed(canonicalPath) ?? canonicalPath);
        if (!doc) return { ok: false, error: "post is not open" };
        // Slug-driven rename: rewrite the frontmatter slug to match the new filename (never desync).
        return renameInternal(doc, target, { fromFrontmatter: false });
      });
    },

    completeRename(canonicalPath) {
      return mutex.runExclusive(async (): Promise<RenamePostResult> => {
        const doc = open.get(resolveJailed(canonicalPath) ?? canonicalPath);
        if (!doc) return { ok: false, error: "post is not open" };
        // Derive the target from the post's frontmatter (the truth); make the filename match it.
        // Leave the text alone.
        const derived = deriveUrl(doc.text, { base: previewBase });
        if (!derived.valid) {
          return { ok: false, error: `cannot complete rename: the frontmatter is invalid (${derived.errors.join("; ")})` };
        }
        return renameInternal(doc, { slug: derived.slug, date: derived.date }, { fromFrontmatter: true });
      });
    },

    revertUrl(canonicalPath) {
      return mutex.runExclusive(async (): Promise<RenamePostResult> => {
        const doc = open.get(resolveJailed(canonicalPath) ?? canonicalPath);
        if (!doc) return { ok: false, error: "post is not open" };
        // The filename/branch is the truth here: rewrite the frontmatter so its derived URL matches
        // the filename stem (inverse of completeRename). Only rewrite fields that differ.
        const { datePrefix, slug: fnSlug } = stemParts(postStem(doc.canonicalPath));
        const fnDate = datePrefix ? datePrefix.replace(/[_-]$/, "") : "";
        const derived = deriveUrl(doc.text, { base: previewBase });
        let text = doc.text;
        if (fnSlug && !(derived.valid && derived.slug === fnSlug)) {
          text = rewriteFrontmatterValue(text, "slug", fnSlug);
        }
        if (fnDate && !(derived.valid && derived.date === fnDate)) {
          text = rewriteFrontmatterValue(text, "created_at", fnDate, true);
        }
        if (text === doc.text) return { ok: true, path: doc.canonicalPath }; // already in sync
        const nextRev: DocRev = { n: doc.rev.n + 1, hash: sha256Hex(text) };
        // Announce as an agent-origin write so the editor replaces its buffer with the rewritten
        // frontmatter (like revert), rather than raising a keep-mine banner.
        guard.expect(nextRev.hash, "agent");
        await fs.writeFile(doc.worktreeFilePath, text);
        doc.text = text;
        doc.rev = nextRev;
        doc.title = frontmatterTitle(text) ?? doc.title;
        publish({ type: "file.changed", path: doc.canonicalPath, text, rev: nextRev, origin: "agent" });
        refreshPreview();
        return { ok: true, path: doc.canonicalPath };
      });
    },

    async postLossPreview(canonicalPath, op, scope) {
      const jailed = resolveJailed(canonicalPath) ?? canonicalPath;
      const doc = open.get(jailed);
      if (!doc) return { dirty: false, changedFiles: 0, ahead: 0, diff: "", scope: scope ?? "post" };
      const cwd = doc.worktreePath;

      if (op === "revert") {
        // Revert restores tracked files to HEAD; untracked files have no HEAD state and are left to
        // delete, so they're excluded from both the diff and the count.
        if (scope) {
          const { diff, changedFiles } = await computeWorkingTreeDiff(git, cwd, scope);
          return { dirty: changedFiles > 0, changedFiles, ahead: 0, diff, scope };
        }
        // No scope requested (the first preview for this post, before any dialog is open): default to
        // "all" when there's more to revert than just the post, else "post", the narrower, more
        // precise pathspec.
        const [all, post] = await Promise.all([computeWorkingTreeDiff(git, cwd, "all"), computeWorkingTreeDiff(git, cwd, "post")]);
        const resolved: DiffScope = all.changedFiles > post.changedFiles ? "all" : "post";
        const chosen = resolved === "all" ? all : post;
        return { dirty: chosen.changedFiles > 0, changedFiles: chosen.changedFiles, ahead: 0, diff: chosen.diff, scope: resolved };
      }

      // delete: destroys the whole worktree (git worktree remove + branch -D), so the preview always
      // covers everything in it: uncommitted and untracked files, plus commits the base doesn't have
      // yet, never just this post. `scope` is a revert-only choice; delete has nothing to choose.
      let ahead = 0;
      let base: string | null = null;
      try {
        base = await aheadBase();
        const revRes = await git.git(["rev-list", "--count", `${base}..HEAD`], { cwd });
        if (revRes.code === 0) ahead = Number.parseInt(revRes.stdout.trim() || "0", 10) || 0;
      } catch {
        // Base unresolved (offline / no gh): can't count unmerged commits, so report 0 rather than
        // blocking the delete on a network call. The base-relative diff below is skipped too.
      }
      const { diff, changedFiles } = await computeDiffAgainstRef(git, cwd, base, "all");
      return { dirty: changedFiles > 0, changedFiles, ahead, diff, scope: "all" };
    },

    async scanDirtyPosts() {
      // Enumerate the worktrees actually on disk (not the in-memory `open` map), so open tabs, stray
      // worktrees from a failed boot, and worktrees created outside the studio are all covered.
      const wtPaths = await worktreePathsOnDisk();

      const dirty: string[] = [];
      const uncommitted: string[] = [];
      for (const wtPath of wtPaths) {
        // Uncommitted, unscoped like postLossPreview's delete/revert-all check: a change outside the
        // blog dir (e.g. an agent edit to astro.config.mjs) must still mark the post dirty, or the tab
        // menu disables "Revert to clean" and hides "Delete draft" for a worktree that isn't clean.
        const statusRes = await git.git(["-c", "core.quotePath=false", "status", "--porcelain"], { cwd: wtPath });
        const uncommittedNonEmpty = statusRes.stdout.trim().length > 0;

        // Ahead of the base, with postLossPreview's offline-safe fallback: any error or nonzero exit
        // means "can't tell", so report 0 rather than block on the network.
        let ahead = 0;
        try {
          const base = await aheadBase();
          const revRes = await git.git(["rev-list", "--count", `${base}..HEAD`], { cwd: wtPath });
          if (revRes.code === 0) ahead = Number.parseInt(revRes.stdout.trim() || "0", 10) || 0;
        } catch {
          // offline / no gh: treat as 0, as above.
        }

        if (!uncommittedNonEmpty && ahead === 0) continue;

        // Map the dirty worktree to its post's canonical path via the worktree's dir name (its stem).
        const stem = path.basename(wtPath);
        let canonical: string | null = null;
        if (await fs.exists(path.join(wtPath, BLOG_CONTENT_DIR, `${stem}.mdx`))) {
          canonical = path.join(repoRoot, BLOG_CONTENT_DIR, `${stem}.mdx`);
        } else if (await fs.exists(path.join(wtPath, BLOG_CONTENT_DIR, stem, "post.mdx"))) {
          canonical = path.join(repoRoot, BLOG_CONTENT_DIR, stem, "post.mdx");
        }
        // Else: can't resolve which post this worktree backs, so skip it.
        if (!canonical) continue;
        dirty.push(canonical);
        // Only posts with uncommitted edits are revertable; a clean-but-ahead post has nothing for
        // "Revert to clean" to discard.
        if (uncommittedNonEmpty) uncommitted.push(canonical);
      }
      return { dirty: [...new Set(dirty)], uncommitted: [...new Set(uncommitted)] };
    },

    async listDrafts() {
      // Enumerate this session's draft branches locally and on origin, scoped to its own namespace
      // (`[<seg>/]blog/*`) so a non-primary session never lists or adopts another session's drafts.
      // Offline-safe: reads refs on disk (a stale origin/* is the accepted tradeoff). A branch with no
      // post file is skipped, not guessed.
      const seg = await prefixSeg();
      const localRoot = seg ? `refs/heads/${seg}/blog` : "refs/heads/blog";
      const remoteRoot = seg ? `refs/remotes/origin/${seg}/blog` : "refs/remotes/origin/blog";
      const localStems = await refStems(["for-each-ref", "--format=%(refname)", localRoot], `${localRoot}/`);
      const remoteStems = await refStems(["for-each-ref", "--format=%(refname)", remoteRoot], `${remoteRoot}/`);

      // A "draft w/o worktree" is one whose stem has neither a live worktree on disk nor an open tab.
      const liveStems = new Set((await worktreePathsOnDisk()).map((p) => path.basename(p)));
      const openStems = new Set([...open.values()].map((d) => postStem(d.canonicalPath)));

      const drafts: DraftSummary[] = [];
      for (const stem of new Set([...localStems, ...remoteStems])) {
        if (liveStems.has(stem) || openStems.has(stem)) continue;
        const isLocal = localStems.has(stem);
        const isRemote = remoteStems.has(stem);
        const ref = isLocal ? await branchFor(stem) : `origin/${await branchFor(stem)}`;
        const rel = await draftUnitRel(ref, stem);
        if (!rel) continue;
        drafts.push({
          path: path.join(repoRoot, rel),
          stem,
          origin: isLocal && isRemote ? "both" : isLocal ? "local" : "remote",
        });
      }
      drafts.sort((a, b) => a.stem.localeCompare(b.stem));
      return drafts;
    },

    async deletePost(canonicalPath) {
      const jailed = resolveJailed(canonicalPath) ?? canonicalPath;
      const doc = open.get(jailed);
      if (!doc) return { ok: false, error: "post is not open" };
      const { worktreePath, branch } = doc;

      // Stop the preview daemon first and await it: a `git worktree remove` racing a running daemon
      // leaves it orphaned in a deleted dir, holding the port. Best-effort: removal proceeds anyway.
      try {
        await deps.stopPreview?.(worktreePath);
      } catch {
        /* stop failed; still attempt removal */
      }

      // Drop the tab and re-focus another post before removal, so onActiveChange retargets astro to
      // a surviving worktree rather than the one being deleted.
      open.delete(jailed);
      if (activePath === jailed) {
        const next = [...open.values()].at(-1) ?? null;
        if (next) {
          await reloadFromDisk(next);
          publishActivation(next);
        } else {
          activePath = null;
          publishTabs();
          refreshPreview();
        }
      } else {
        publishTabs();
      }

      // Remove the worktree (--force: it carries the draft's uncommitted changes) then force-delete
      // the branch (-D: it may hold commits not merged to the primary branch). origin is never touched.
      const rmRes = await git.git(["worktree", "remove", "--force", worktreePath], { cwd: repoRoot });
      if (rmRes.code !== 0) {
        return { ok: false, error: `git worktree remove failed: ${rmRes.stderr.trim() || `exit ${rmRes.code}`}` };
      }
      const brRes = await git.git(["branch", "-D", branch], { cwd: repoRoot });
      if (brRes.code !== 0) {
        return { ok: false, error: `git branch -D failed: ${brRes.stderr.trim() || `exit ${brRes.code}`}` };
      }
      return { ok: true };
    },

    async revertPost(canonicalPath, scope) {
      const jailed = resolveJailed(canonicalPath) ?? canonicalPath;
      const doc = open.get(jailed);
      if (!doc) return { ok: false, error: "post is not open" };
      // "post" restores just this post; "all" restores the whole worktree (`.`, run with cwd at its
      // root). Either way, untracked files (e.g. a never-committed new post) have no HEAD state and
      // are intentionally left as-is.
      const pathspec = scope === "all" ? "." : postUnitPathspec(doc.relPath);

      const coRes = await git.git(["checkout", "HEAD", "--", pathspec], { cwd: doc.worktreePath });
      if (coRes.code !== 0) {
        return { ok: false, error: `git checkout failed: ${coRes.stderr.trim() || `exit ${coRes.code}`}` };
      }

      const text = await fs.readFile(doc.worktreeFilePath);
      const hash = sha256Hex(text);
      if (hash === doc.rev.hash) return { ok: true, reverted: false };
      // The checkout wrote the file behind the store's back; announce the hash so the watcher treats
      // it as our write, and broadcast "agent" so the editor adopts the clean text.
      guard.expect(hash, "agent");
      await reloadByWatchPathImpl(doc.worktreeFilePath, text, "agent");
      return { ok: true, reverted: true };
    },

    onActiveChange(listener) {
      activeChangeListeners.add(listener);
      return () => {
        activeChangeListeners.delete(listener);
      };
    },

    sessionWorktreesRoot: worktreesRoot,

    writeByPath: writeByPathImpl,

    writeActive(text, baseRev) {
      const doc = activeDoc();
      if (!doc) return Promise.reject(new Error("writeActive: no active document"));
      return writeByPathImpl(doc.canonicalPath, text, baseRev);
    },

    applyEdit(input) {
      // Part of the frozen `Store` contract. The agent edits its worktree with native tools rather
      // than mutating through the store, so this only ever touches the active post.
      return mutex.runExclusive(async (): Promise<ApplyEditResult> => {
        const doc = activeDoc();
        if (!doc) return { ok: false, error: "no-active-document" };
        const jailed = resolveJailed(input.path);
        if (!jailed || jailed !== doc.canonicalPath) return { ok: false, error: "path-not-allowed" };
        if (!revsEqual(doc.rev, input.rev)) return { ok: false, error: "stale-rev", currentRev: doc.rev };
        const diverged = await diskDivergedRev(doc);
        if (diverged) return { ok: false, error: "stale-rev", currentRev: diverged };
        const applied = applyEdits(doc.text, input.edits);
        if (!applied.ok) return { ok: false, error: applied.error };
        const nextRev: DocRev = { n: doc.rev.n + 1, hash: sha256Hex(applied.text) };
        guard.expect(nextRev.hash, "agent");
        await fs.writeFile(doc.worktreeFilePath, applied.text);
        doc.text = applied.text;
        doc.rev = nextRev;
        publish({ type: "file.changed", path: doc.canonicalPath, text: doc.text, rev: doc.rev, origin: "agent" });
        refreshPreview();
        return { ok: true, rev: doc.rev };
      });
    },

    reloadActive(text, origin) {
      return mutex.runExclusive(async () => {
        const doc = activeDoc();
        if (!doc) throw new Error("reloadActive: no active document");
        doc.text = text;
        doc.rev = { n: doc.rev.n + 1, hash: sha256Hex(text) };
        doc.title = frontmatterTitle(text) ?? doc.title;
        publish({ type: "file.changed", path: doc.canonicalPath, text: doc.text, rev: doc.rev, origin });
        refreshPreview();
        return { path: doc.canonicalPath, text: doc.text, rev: doc.rev };
      });
    },

    reloadByWatchPath: reloadByWatchPathImpl,

    relayout(oldWorktreeFilePath, newWorktreeFilePath, origin) {
      return mutex.runExclusive(async (): Promise<ActiveDoc | null> => {
        const doc = docByWatchPath(oldWorktreeFilePath);
        if (!doc) return null;
        let text: string;
        try {
          text = await fs.readFile(newWorktreeFilePath);
        } catch {
          // The alternate layout vanished mid-flip; the watcher retries on its next event.
          return null;
        }
        // The worktree is unchanged, so the new file's repo-relative path is its offset within it.
        const newRel = path.relative(doc.worktreePath, newWorktreeFilePath);
        const newCanonical = path.join(repoRoot, newRel);
        // Not actually a flip, or the target path is already an open tab: nothing to migrate.
        if (newCanonical === doc.canonicalPath || open.has(newCanonical)) return null;

        const oldCanonical = doc.canonicalPath;
        const wasActive = activePath === oldCanonical;
        open.delete(oldCanonical);
        doc.canonicalPath = newCanonical;
        doc.relPath = newRel;
        doc.worktreeFilePath = newWorktreeFilePath;
        doc.text = text;
        doc.rev = { n: doc.rev.n + 1, hash: sha256Hex(text) };
        doc.title = frontmatterTitle(text) ?? doc.title;
        open.set(newCanonical, doc);
        if (wasActive) activePath = newCanonical;

        // Migrate the tab (transcript/session/permissions) onto the new path before the tabs +
        // file.changed that re-seed its buffer, exactly like renameInternal. No worktree moved, so
        // nothing retargets: astro already serves this worktree and the watch set covers both layouts.
        publish({ type: "post.renamed", oldPath: oldCanonical, newPath: newCanonical, title: doc.title, branch: doc.branch });
        publishTabs();
        if (wasActive) publish({ type: "active", path: newCanonical, title: doc.title, branch: doc.branch });
        publish({ type: "file.changed", path: newCanonical, text: doc.text, rev: doc.rev, origin });
        if (wasActive) refreshPreview();
        return { path: newCanonical, text: doc.text, rev: doc.rev };
      });
    },

    getEditorContext() {
      return editorContext;
    },

    setEditorContext(ctx) {
      editorContext = ctx;
    },

    getPreview() {
      return preview;
    },

    subscribe(listener) {
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    },
  };

  return store;
}
