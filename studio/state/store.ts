// The in-memory mirror of every open post. Each open post is backed by its own git worktree
// (`.claude/worktrees/blog/<YYYY-MM-DD_slug>` on branch `blog/<YYYY-MM-DD_slug>`, keyed by the
// post's date-qualified filename stem so two posts that share a slug on different dates never
// collide, forked from origin/<default>), so sessions never contend over one working tree. The
// store maps open docs by their canonical repo path (`<repoRoot>/src/content/blog/…`, the identity
// the SPA tabs on), tracks one active doc, derives the preview URL, and fans server-to-client
// messages out to subscribers (the WebSocket and the agent-host stream).
//
// Disk (the worktree's on-disk file) is the single source of truth. The editor autosave funnels
// through a mutex so the rev-check and write are one atomic critical section, re-reading disk
// inside it to refuse clobbering an out-of-band edit; disk always wins. The agent edits its
// worktree with native tools (no store mutation gate); the file watcher adopts those writes and
// surfaces them as file.changed{agent}.

import path from "node:path";

import type { ApplyEditResult } from "../shared/mcpTools";
import type { DraftSummary, ServerMessage } from "../shared/protocol";
import type { Fs, GitRunner } from "../shared/seams";
import type { Store } from "../shared/services";
import type { ActiveDoc, DocRev, EditorContext, PreviewState } from "../shared/types";
import type { PostFrontmatter } from "../../src/lib/frontmatter";
import { FRONTMATTER_BLOCK, FRONTMATTER_LINE, frontmatterTitle } from "../../src/lib/frontmatter";
import { postStem, slugFromPath, stemParts } from "../shared/slug";
import { applyEdits, revsEqual } from "./applyEdits";
import { DEFAULT_PREVIEW_BASE, deriveUrl } from "../preview/deriveUrl";
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
 * Records the content hashes the store has just written to disk, so the file watcher can tell its
 * own writes ("self" autosave) apart from genuinely external edits (an external editor) and from
 * the agent's native-tool writes. A small multiset keyed by hash; rapid successive writes each
 * register their own entry and are consumed once when the watcher observes them.
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

  /** Peek whether `hash` is a pending store write, without consuming it (the watcher still needs it). */
  has(hash: string): boolean {
    return this.pending.some((p) => p.hash === hash);
  }
}

/** Relative dir (from repo root) that holds authored posts; the jail for every open post. */
const BLOG_CONTENT_DIR = "src/content/blog";
/** Worktree parent, relative to the repo root (gitignored). One worktree per open post,
 *  keyed by the post's date-qualified filename stem (see `postStem`). */
const WORKTREES_DIR = ".claude/worktrees/blog";

const NO_ACTIVE_PREVIEW: PreviewState = { valid: false, url: null, errors: ["no active document"] };

/** Result of createPost: the resolved (canonical) path + derived URL on success, or a refusal. */
export type CreatePostResult =
  | { ok: true; path: string; url: string; doc: ActiveDoc }
  | { ok: false; error: string };

/** Result of renamePost. */
export type RenamePostResult = { ok: true; path: string } | { ok: false; error: string };

/** PUT /doc outcome (mirrors the frozen PutDocResponse). */
export type WriteResult =
  | { ok: true; rev: DocRev }
  | { ok: false; error: "stale-rev"; currentRev: DocRev };

/** What a destructive op (delete/revert) would discard, for the confirm gate. */
export interface PostLossPreview {
  /** Uncommitted changes (incl. untracked) present in the post's worktree. */
  dirty: boolean;
  /** Count of uncommitted files (for the confirm summary). */
  changedFiles: number;
  /** Commits on the post's branch not yet in origin/<default>. */
  ahead: number;
  /** Unified diff the op would discard. Revert: `git diff HEAD`. Delete: the full delta from the
   *  published base plus synthesized diffs for untracked files. */
  diff: string;
}

/**
 * Whether a post has unshipped work: the single definition of "draft / would lose work on delete".
 * The one source of truth for both the ⌘P dirty badge and the delete-draft confirm gate, so the two
 * can't drift (they must agree: the badge promises exactly what the gate will confirm). Keyed off a
 * "delete"-scoped {@link PostLossPreview}: uncommitted changes or commits not yet on origin.
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
 * The git pathspec (relative to the worktree root) that scopes a post's status/diff/checkout: the
 * file itself for a simple post, or its containing folder for a `.../<stem>/post.mdx` folder post
 * (so co-located assets, sibling `.tsx` and images, are counted and reverted with the post).
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
  return `"${v.replace(/\\/g, "\\\\").replace(/"/g, '\\"')}"`;
}

/**
 * The starter `.mdx` for a new post: valid frontmatter (Zod-satisfying) and a minimal body. No
 * `# H1`, since the BlogPost layout renders the title from frontmatter and a heading here would
 * duplicate it.
 */
function renderNewPost(input: PostFrontmatter): string {
  return [
    "---",
    `title: ${frontmatterScalar(input.title)}`,
    `slug: ${frontmatterScalar(input.slug)}`,
    `headline: ${frontmatterScalar(input.headline)}`,
    `created_at: ${frontmatterScalar(input.created_at)}`,
    "---",
    "",
    "Start writing…",
    "",
  ].join("\n");
}

/** Rewrite the `slug:` value in a frontmatter block, preserving everything else verbatim. */
function rewriteSlug(text: string, newSlug: string): string {
  const src = text.charCodeAt(0) === 0xfeff ? text.slice(1) : text;
  const block = FRONTMATTER_BLOCK.exec(src);
  if (!block) return text;
  const bomOffset = text.length - src.length;
  const blockStart = bomOffset + block.index;
  const bodyStart = blockStart + block[0].indexOf(block[1]);
  const bodyEnd = bodyStart + block[1].length;
  const rewrittenBody = block[1]
    .split(/\r?\n/)
    .map((line) => {
      const pair = FRONTMATTER_LINE.exec(line.trim());
      if (pair && pair[1] === "slug") return line.replace(/(:[ \t]*).*/, `$1${frontmatterScalar(newSlug)}`);
      return line;
    })
    .join("\n");
  return text.slice(0, bodyStart) + rewrittenBody + text.slice(bodyEnd);
}

export interface StoreDeps {
  fs: Fs;
  /** git/gh runner rooted at the repo (worktree add / branch -m / worktree move). */
  git: GitRunner;
  /** Absolute path to the repo root. */
  repoRoot: string;
  /** Default branch worktrees fork from; resolved via `gh` lazily when omitted (tests pass it). */
  defaultBranch?: string;
  /** Preview origin (defaults to the Astro dev server). */
  previewBase?: string;
  /** Prepare a freshly-created/reused worktree (e.g. symlink node_modules). Omitted in tests. */
  prepareWorktree?: (worktreePath: string) => Promise<void>;
  /** Move a file or directory on disk (rename). Omitted in tests that don't exercise rename. */
  movePath?: (from: string, to: string) => Promise<void>;
  /**
   * Stop the preview daemon serving `worktreePath` and await it, called before a delete removes
   * that worktree, so no daemon is left holding the fixed port. Omitted in tests (no astro).
   */
  stopPreview?: (worktreePath: string) => Promise<void>;
  /**
   * Recursively remove a path (rm -rf); used to clear a leftover/husk worktree dir before
   * re-creating it. Omitted in tests that don't exercise the husk self-heal path.
   */
  removePath?: (p: string) => Promise<void>;
}

/** Concrete store: the frozen `Store` plus the multi-doc / worktree surface the sidecar needs. */
export interface StudioStore extends Store {
  /** Hashes of the store's own recent writes; the watcher consults this to classify events. */
  readonly guard: SelfWriteGuard;
  /** Fan a message out to every subscriber (used internally and by the agent-host stream). */
  publish(message: ServerMessage): void;
  /**
   * Open a post by its canonical repo path (ensuring/reusing its worktree) or, if already
   * open, focus it. Announces the switch (file.changed, active, tabs, preview.url) and
   * notifies onActiveChange so the watcher retargets and astro restarts in the worktree.
   */
  openPost(canonicalPath: string): Promise<ActiveDoc>;
  /**
   * Create a new post (`<YYYY-MM-DD>_<slug>.mdx`) in its own worktree from valid frontmatter,
   * make it active, and announce it. Refuses (never overwrites) when a post already exists.
   */
  createPost(input: PostFrontmatter): Promise<CreatePostResult>;
  /**
   * Close a tab, re-focusing another open post if any. A tab with a draft (uncommitted edits or
   * unmerged commits) keeps its worktree/branch on disk for re-open; a clean tab is torn down via
   * the same path as {@link deletePost}, so browsing-then-closing leaves no orphaned worktree.
   */
  closePost(canonicalPath: string): Promise<void>;
  /** Rename the active post's slug: move the file, `git branch -m`, `git worktree move`. */
  renamePost(canonicalPath: string, newSlug: string): Promise<RenamePostResult>;
  /** What deleting / reverting a post would discard (uncommitted files, unmerged commits, diff). */
  postLossPreview(canonicalPath: string, op: "delete" | "revert"): Promise<PostLossPreview>;
  /**
   * Canonical paths of every post with unshipped work (uncommitted changes or commits not yet on
   * origin/<default>; mirrors {@link postWouldLoseWork}), discovered by enumerating the actual git
   * worktrees on disk under `.claude/worktrees/blog`, not the in-memory `open` tab map. This
   * covers open tabs, stray worktrees left over from a failed boot, and worktrees/branches created
   * outside the studio (e.g. on the CLI), so the ⌘P palette's dirty badge can't miss any of them.
   */
  dirtyPostPaths(): Promise<string[]>;
  /**
   * Enumerate `blog/*` draft branches (local and/or remote-tracking) that have NO live worktree and
   * are not open — drafts started elsewhere or left behind, invisible to the open-tabs and main-tree
   * post listings. Offline-safe (reads refs already on disk, never fetches). Each result carries the
   * canonical reopen path, the stem, and where the branch lives; selecting one runs the adopt→open
   * path. Powers the ⌘P palette's draft entries.
   */
  listDrafts(): Promise<DraftSummary[]>;
  /**
   * Delete a draft post: remove its worktree and force-delete its branch (never touches
   * origin/main), re-focusing another open post like close. The active post's preview daemon is
   * stopped (awaited) before the worktree is removed so a lingering daemon can't hold the port.
   */
  deletePost(canonicalPath: string): Promise<DeletePostResult>;
  /** Discard a post's uncommitted edits back to its branch's HEAD; reloads the buffer if it changed. */
  revertPost(canonicalPath: string): Promise<RevertPostResult>;
  /** Persist exact text to the post at `canonicalPath` (autosave); returns new rev or stale-rev. */
  writeByPath(canonicalPath: string, text: string, baseRev: DocRev): Promise<WriteResult>;
  /** The active post as { path, title, branch } (path = canonical) for the tab bar / snapshot; null if none. */
  getActive(): { path: string; title: string; branch: string } | null;
  /** Authoritative open tab set for the `tabs` broadcast. */
  getOpenTabs(): { path: string; title: string }[];
  /** The active post's worktree (for ship + the astro manager); null if none. */
  getActiveWorktree(): ActiveWorktree | null;
  /** The worktree of the open post at `canonicalPath` (not necessarily the active one); null if it
   *  isn't open. Lets a path-scoped consumer resolve the owning worktree even during a switch race. */
  getWorktreeFor(canonicalPath: string): ActiveWorktree | null;
  /** Absolute on-disk file the active post's watcher should follow; null if none. */
  getActiveWatchPath(): string | null;
  /**
   * The open post backing `worktreeFilePath` (its canonical path and current rev), or null. Lets the
   * watcher reconcile against the file's owner even when a tab switch out-lives an agent turn (the
   * watched file may no longer be the active one).
   */
  getDocByWatchPath(worktreeFilePath: string): { path: string; rev: DocRev } | null;
  /** Adopt externally/agent-changed text as the active doc, emitting file.changed{origin}. */
  reloadActive(text: string, origin: "external" | "agent"): Promise<ActiveDoc>;
  /**
   * Adopt externally/agent-changed disk text for the open post backing `worktreeFilePath` (not
   * necessarily the active one), emitting file.changed{origin} for its canonical path; null if no
   * open post backs that file. Used by the watcher so an agent turn's writes still land on the
   * turn's post even after the user switched tabs mid-turn.
   */
  reloadByWatchPath(worktreeFilePath: string, text: string, origin: "external" | "agent"): Promise<ActiveDoc | null>;
  /** Register a callback fired whenever the active post switches; returns an unsubscribe fn. */
  onActiveChange(listener: (info: ActiveChangeInfo) => void): () => void;
}

export function createStore(deps: StoreDeps): StudioStore {
  const { fs, git, repoRoot } = deps;
  const previewBase = deps.previewBase ?? DEFAULT_PREVIEW_BASE;
  const blogContentRoot = path.resolve(repoRoot, BLOG_CONTENT_DIR);
  const worktreesRoot = path.resolve(repoRoot, WORKTREES_DIR);
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

  /** Repo default branch (worktrees fork from origin/<this>). Resolved once via `gh`, then cached. */
  async function defaultBranch(): Promise<string> {
    if (cachedDefaultBranch) return cachedDefaultBranch;
    const res = await git.gh(
      ["repo", "view", "--json", "defaultBranchRef", "-q", ".defaultBranchRef.name"],
      { cwd: repoRoot, timeoutMs: 120_000 },
    );
    const name = res.stdout.trim();
    if (res.code !== 0 || !name) {
      throw new Error(`could not resolve default branch via gh: ${res.stderr.trim() || `exit ${res.code}`}`);
    }
    cachedDefaultBranch = name;
    return name;
  }

  /** Canonicalize + root-jail a path to the blog content tree. Returns null if it escapes. */
  function resolveJailed(candidate: string): string | null {
    const resolved = path.resolve(candidate);
    const rel = path.relative(blogContentRoot, resolved);
    if (rel === "" || rel.startsWith("..") || path.isAbsolute(rel)) return null;
    return resolved;
  }

  /**
   * Whether a post's isolation branch `blog/<stem>` exists locally (`refs/heads`) and/or as a
   * remote-tracking ref (`refs/remotes/origin`). Offline-safe: it reads refs already on disk and
   * never fetches, so `remote` reflects the last-known `origin/*` (possibly stale) rather than a
   * live probe. Used to adopt an existing draft into a worktree and to refuse forking over one.
   */
  async function branchRefs(stem: string): Promise<{ local: boolean; remote: boolean }> {
    const branch = `blog/${stem}`;
    const local = (await git.git(["rev-parse", "--verify", "--quiet", `refs/heads/${branch}`], { cwd: repoRoot })).code === 0;
    const remote =
      (await git.git(["rev-parse", "--verify", "--quiet", `refs/remotes/origin/${branch}`], { cwd: repoRoot })).code === 0;
    return { local, remote };
  }

  /**
   * Refusal message when `blog/<stem>` already exists as a branch (local and/or on origin), so
   * creating or renaming a *new* post into that stem would fork a divergent branch that only
   * collides at push time. Null when the stem is free. The author is pointed at ⌘P, where the
   * existing draft is now adoptable.
   */
  async function draftBranchTaken(stem: string): Promise<string | null> {
    const { local, remote } = await branchRefs(stem);
    if (!local && !remote) return null;
    const where = local && remote ? "locally and on origin" : local ? "locally" : "on origin";
    return `a draft already exists on that slug/date (branch blog/${stem} ${where}); open it from ⌘P instead.`;
  }

  /**
   * Ensure (or reuse) the worktree for post `stem` (its date-qualified filename stem: the unique
   * post identity, not the bare slug, so two posts sharing a slug on different dates never share a
   * worktree/branch). Reuses when the worktree dir already holds a `.git` link (kept across close);
   * otherwise ADOPTS an existing `blog/<stem>` draft branch — the local branch directly, or a
   * remote-only one via `--track` off `origin/blog/<stem>` — so a draft started elsewhere (or left
   * behind) opens instead of being silently forked over into a divergent branch; when there is no
   * branch at all it forks a fresh one off origin/<default>. Returns its paths.
   */
  async function ensureWorktree(stem: string): Promise<{ worktreePath: string; branch: string }> {
    const branch = `blog/${stem}`;
    const worktreePath = path.join(worktreesRoot, stem);

    if (!(await fs.exists(path.join(worktreePath, ".git")))) {
      // Clear any stale registration for a dir that was removed out-of-band.
      await git.git(["worktree", "prune"], { cwd: repoRoot });
      const { local: localExists, remote: remoteExists } = await branchRefs(stem);

      // Self-heal a leftover (husk) directory at `worktreePath`. `astro dev --background` forks a
      // detached daemon (reparented to init); on a hard kill/crash it's orphaned, keeps its cwd on
      // this worktree, and recreates the worktree's `.astro/` cache dir. That leftover (just
      // `.astro/` and a `node_modules` symlink, no valid `.git`) can survive worktree removal and
      // then block `git worktree add` below, since git only accepts an empty existing dir (never a
      // non-empty one, even with --force). Only preserve the dir when a LOCAL branch's worktree
      // registration is what we want back (`git worktree add <path> <branch>`); a remote-only or
      // brand-new branch is checked out fresh, so the dir must be empty — remove it wholesale. If
      // something unexpected (non-cruft) remains in the preserved case, the add fails below and the
      // error surfaces; we never blindly delete real content.
      if (await fs.exists(worktreePath)) {
        if (localExists) {
          await deps.removePath?.(path.join(worktreePath, ".astro"));
          await deps.removePath?.(path.join(worktreePath, "node_modules"));
        } else {
          await deps.removePath?.(worktreePath);
        }
      }

      // Adopt local → adopt remote-only (create a tracking branch) → fork fresh off the default.
      const args = localExists
        ? ["worktree", "add", worktreePath, branch]
        : remoteExists
          ? ["worktree", "add", "--track", "-b", branch, worktreePath, `origin/${branch}`]
          : ["worktree", "add", worktreePath, "-b", branch, `origin/${await defaultBranch()}`];
      const res = await git.git(args, { cwd: repoRoot, timeoutMs: 120_000 });
      if (res.code !== 0) {
        throw new Error(`git worktree add (${stem}) failed: ${res.stderr.trim() || res.stdout.trim() || `exit ${res.code}`}`);
      }
    }

    if (deps.prepareWorktree) await deps.prepareWorktree(worktreePath);
    return { worktreePath, branch };
  }

  /**
   * Absolute paths of every git worktree registered under `worktreesRoot` (the main checkout is
   * excluded — it isn't under that root). Parses `git worktree list --porcelain` blocks (each has a
   * `worktree <path>` line, blank-line separated). Shared by the dirty-scan and draft enumeration.
   */
  async function worktreePathsOnDisk(): Promise<string[]> {
    const listRes = await git.git(["worktree", "list", "--porcelain"], { cwd: repoRoot });
    const wtPaths: string[] = [];
    for (const block of listRes.stdout.split(/\r?\n\r?\n/)) {
      const m = /^worktree (.+)$/m.exec(block);
      if (!m) continue;
      const wtPath = m[1].trim();
      if (wtPath === worktreesRoot || wtPath.startsWith(worktreesRoot + path.sep)) wtPaths.push(wtPath);
    }
    return wtPaths;
  }

  /**
   * The post file path (relative to the repo root) for `stem` on git `ref`, checking the simple
   * (`<stem>.mdx`) then folder (`<stem>/post.mdx`) layout via `git cat-file -e` (reads the ref's
   * tree object; offline-safe, no working tree needed), or null when the branch carries no post
   * file under the blog dir. Lets draft enumeration build the right canonical path before any
   * worktree exists to inspect.
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

  function refreshPreview(): void {
    preview = computePreview(activeDoc());
    publish({ type: "preview.url", preview });
  }

  function publishTabs(): void {
    publish({ type: "tabs", open: getOpenTabs() });
  }

  /**
   * Announce a just-focused active doc, in an order the SPA can bootstrap from: the tab bar first
   * (tabs, active) so the target tab exists, then its buffer (file.changed{external}); the client
   * drops a file.changed for a path it has no tab for, so text arriving before the tab would leave a
   * permanently blank editor. This mirrors the sidecar's onConnection snapshot and the mock. Finally
   * refresh the preview and notify active-change subscribers so the watcher retargets and astro
   * restarts in the new worktree.
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
   * Re-read a post's on-disk file, bumping its in-memory rev only when the bytes actually
   * changed (so re-focusing a tab whose file is unchanged doesn't spuriously banner).
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
   * Guard against clobbering an out-of-band edit the watcher hasn't reconciled yet: re-read
   * the file inside the mutex and compare its hash to what the store last wrote/adopted.
   * Returns an on-disk rev when the bytes diverged (caller rejects as stale-rev), or null when
   * it is safe to write: disk matches our view, or the divergent bytes are our own in-flight write.
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
      // ensureWorktree adopts an existing blog/<stem> draft (local or remote-only) or forks a fresh
      // one off origin/<default>, so an already-authored post materializes in the worktree here even
      // when it isn't in the main checkout — a draft started elsewhere opens rather than failing.
      const { worktreePath, branch } = await ensureWorktree(postStem(jailed));
      const worktreeFilePath = path.join(worktreePath, relPath);
      let text: string;
      try {
        text = await fs.readFile(worktreeFilePath);
      } catch {
        throw new Error(
          `post not found in its worktree (${relPath}). Open an existing post that is committed to ` +
            `origin/${cachedDefaultBranch ?? "the default branch"} or has a blog/<stem> draft branch.`,
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
        // Validate and derive the date/URL with the same parser the live preview and built route
        // use, so the filename date and the served URL cannot drift from each other.
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
        // Refuse if that slug/date already has a draft branch (local or remote-only) with no live
        // worktree: creating here would fork a divergent branch that collides only at push time. The
        // author should adopt the existing draft from ⌘P instead. (`ensureWorktree` would otherwise
        // adopt a local branch — surfacing "a post already exists" — or fork over a remote-only one.)
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
        // The worktree forked from origin/<default>, so this path won't exist there yet; a
        // collision means an existing post, so never overwrite it.
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

      // A clean tab has nothing worth keeping, so closing it runs the exact same teardown as an
      // explicit "Delete draft" (remove the worktree, force-delete the branch); otherwise merely
      // browsing a post and closing it would leave an orphaned worktree behind. A tab carrying a
      // draft (uncommitted edits or unmerged commits) keeps its worktree/branch on disk for re-open.
      // Teardown runs only when there's no work to lose, so (unlike post.delete) no confirm gate.
      if (!postWouldLoseWork(await store.postLossPreview(jailed, "delete"))) {
        await store.deletePost(jailed);
        return;
      }

      open.delete(jailed);
      // Draft present: keep the worktree/branch on disk (reused on re-open). If the closed tab was
      // active, focus another open post (newest by insertion), else clear the active doc.
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

    renamePost(canonicalPath, newSlug) {
      return mutex.runExclusive(async (): Promise<RenamePostResult> => {
        const jailed = resolveJailed(canonicalPath) ?? canonicalPath;
        const doc = open.get(jailed);
        if (!doc) return { ok: false, error: "post is not open" };
        if (!/^[a-z0-9][a-z0-9-]*$/.test(newSlug)) return { ok: false, error: `invalid slug: ${newSlug}` };
        if (newSlug === doc.slug) return { ok: true, path: doc.canonicalPath };
        if (!deps.movePath) return { ok: false, error: "rename is unavailable (no movePath)" };

        // New identities. A simple post `…/<date>_<old>.mdx` renames to `…/<date>_<new>.mdx`; a
        // folder post `…/<date>_<old>/post.mdx` renames to `…/<date>_<new>/post.mdx` (its parent
        // dir moves).
        const isFolder = doc.relPath.endsWith("/post.mdx") || doc.relPath.endsWith(path.sep + "post.mdx");
        const oldName = isFolder ? path.basename(path.dirname(doc.canonicalPath)) : path.basename(doc.canonicalPath, ".mdx");
        const { datePrefix } = stemParts(oldName);
        const newName = `${datePrefix}${newSlug}`;
        const newCanonical = isFolder
          ? path.join(path.dirname(path.dirname(doc.canonicalPath)), newName, "post.mdx")
          : path.join(path.dirname(doc.canonicalPath), `${newName}.mdx`);
        if (open.has(newCanonical)) return { ok: false, error: `a post is already open at that slug` };
        const newRel = path.relative(repoRoot, newCanonical);
        // Branch + worktree key on the full date-qualified stem (`newName`), not the bare slug, so
        // the renamed post keeps its collision-free identity (see `postStem`).
        const newBranch = `blog/${newName}`;
        const newWorktreePath = path.join(worktreesRoot, newName);

        // The unit within the worktree that moves: the folder for a folder post, else the file.
        const oldUnitInWt = isFolder ? path.dirname(doc.worktreeFilePath) : doc.worktreeFilePath;
        const newUnitInWt = isFolder ? path.join(doc.worktreePath, path.dirname(newRel)) : path.join(doc.worktreePath, newRel);
        if (await fs.exists(newUnitInWt)) return { ok: false, error: `a post already exists at ${newRel}` };
        // Refuse if the target stem already has a draft branch (local or remote-only): `git branch -m`
        // would fail on a local collision anyway, and would silently fork over a remote-only one. The
        // author should adopt that draft from ⌘P rather than diverge from it.
        const taken = await draftBranchTaken(newName);
        if (taken) return { ok: false, error: taken };

        // Rename the branch, move the post file/folder, then move the worktree dir to match
        // the new slug. Order matters: move the file while the worktree is still at its old path.
        // A tracked (already-committed) post is renamed via `git mv` so git's index records a
        // rename instead of a delete+add; a brand-new untracked post falls back to a plain
        // filesystem move, since `git mv` errors on paths git doesn't know about.
        const brRes = await git.git(["-C", doc.worktreePath, "branch", "-m", newBranch], { cwd: repoRoot });
        if (brRes.code !== 0) return { ok: false, error: `git branch -m failed: ${brRes.stderr.trim() || `exit ${brRes.code}`}` };
        const tracked =
          (await git.git(["-C", doc.worktreePath, "ls-files", "--error-unmatch", "--", oldUnitInWt], { cwd: repoRoot })).code === 0;
        if (tracked) {
          const mvRes = await git.git(["-C", doc.worktreePath, "mv", oldUnitInWt, newUnitInWt], { cwd: repoRoot });
          if (mvRes.code !== 0) return { ok: false, error: `git mv failed: ${mvRes.stderr.trim() || `exit ${mvRes.code}`}` };
        } else {
          await deps.movePath(oldUnitInWt, newUnitInWt);
        }
        const mvRes = await git.git(["worktree", "move", doc.worktreePath, newWorktreePath], { cwd: repoRoot });
        if (mvRes.code !== 0) {
          return { ok: false, error: `git worktree move failed: ${mvRes.stderr.trim() || `exit ${mvRes.code}`}` };
        }
        if (deps.prepareWorktree) await deps.prepareWorktree(newWorktreePath);

        // Keep the frontmatter slug in step with the filename so the derived URL follows the rename.
        const newWorktreeFilePath = path.join(newWorktreePath, newRel);
        const nextText = rewriteSlug(doc.text, newSlug);
        const nextRev: DocRev = { n: doc.rev.n + 1, hash: sha256Hex(nextText) };
        guard.expect(nextRev.hash, "self");
        await fs.writeFile(newWorktreeFilePath, nextText);

        open.delete(jailed);
        doc.slug = newSlug;
        doc.branch = newBranch;
        doc.canonicalPath = newCanonical;
        doc.relPath = newRel;
        doc.worktreePath = newWorktreePath;
        doc.worktreeFilePath = newWorktreeFilePath;
        doc.text = nextText;
        doc.rev = nextRev;
        doc.title = frontmatterTitle(nextText) ?? doc.title;
        open.set(newCanonical, doc);
        // Announce the rename old→new BEFORE publishActivation's tabs/active/file.changed rebuild, so
        // every client migrates the tab's transcript + session onto the new path first (else the tab
        // is rebuilt fresh at the new path and the conversation is lost). Server-side session re-key
        // is done by the caller (server.ts) via agentHost.renameSessionKey.
        publish({ type: "post.renamed", oldPath: jailed, newPath: newCanonical, title: doc.title, branch: doc.branch });
        publishActivation(doc);
        return { ok: true, path: newCanonical };
      });
    },

    async postLossPreview(canonicalPath, op) {
      const jailed = resolveJailed(canonicalPath) ?? canonicalPath;
      const doc = open.get(jailed);
      if (!doc) return { dirty: false, changedFiles: 0, ahead: 0, diff: "" };
      const cwd = doc.worktreePath;
      const pathspec = postUnitPathspec(doc.relPath);

      if (op === "revert") {
        // Revert restores tracked files to HEAD; the preview is exactly `git diff HEAD` (what the
        // restore discards). Scoped to the whole blog content dir (not just this post's pathspec),
        // with rename detection (-M): a per-post pathspec hides the old path's half of a staged
        // rename (`git mv`), so git can't pair it with the new path's addition and shows "new file"
        // instead of a rename. A dedicated per-post worktree only ever changes this one post, so
        // widening the scope to the blog dir is equivalent while letting -M pair renames. Untracked
        // files have no HEAD state and are left alone, so they don't count here (they're the
        // province of delete).
        const names = await git.git(["diff", "-M", "HEAD", "--name-only", "--", BLOG_CONTENT_DIR], { cwd });
        const changedFiles = names.stdout.split("\n").filter((l) => l.trim().length > 0).length;
        const diffRes = await git.git(["diff", "-M", "HEAD", "--", BLOG_CONTENT_DIR], { cwd });
        return { dirty: changedFiles > 0, changedFiles, ahead: 0, diff: diffRes.stdout };
      }

      // delete: everything lost = uncommitted files (incl. untracked) plus commits ahead of the base.
      // `--untracked-files=all` (not the porcelain default) so an untracked subdirectory is listed as
      // its individual files rather than collapsing to a single entry; otherwise its files are
      // undercounted and the per-file add-diff below (git diff --no-index chokes on a directory) is
      // skipped, so the confirm dialog under-reports what the delete will destroy.
      const statusRes = await git.git(
        ["-c", "core.quotePath=false", "status", "--porcelain", "--untracked-files=all", "--", pathspec],
        { cwd },
      );
      const statusLines = statusRes.stdout.split("\n").filter((l) => l.trim().length > 0);
      const changedFiles = statusLines.length;

      let ahead = 0;
      let base: string | null = null;
      try {
        base = await defaultBranch();
        const revRes = await git.git(["rev-list", "--count", `origin/${base}..HEAD`], { cwd });
        if (revRes.code === 0) ahead = Number.parseInt(revRes.stdout.trim() || "0", 10) || 0;
      } catch {
        // Base unresolved (offline / no gh): can't count unmerged commits, so report 0 rather than
        // blocking the delete on a network call. The tracked-delta diff below is skipped too.
      }

      // Build the "what delete discards" diff: the tracked delta from the published base (captures
      // both committed-but-unmerged and uncommitted edits), plus a synthesized add-diff for each
      // untracked file; a brand-new post is entirely untracked and invisible to plain `git diff`.
      // Like the revert diff above, this is scoped to the whole blog content dir with -M so a
      // staged rename pairs instead of showing "new file".
      const parts: string[] = [];
      if (base) {
        const tracked = await git.git(
          ["-c", "core.quotePath=false", "diff", "-M", `origin/${base}`, "--", BLOG_CONTENT_DIR],
          { cwd },
        );
        if (tracked.stdout.trim().length > 0) parts.push(tracked.stdout);
      }
      for (const line of statusLines) {
        if (!line.startsWith("??")) continue;
        let p = line.slice(3);
        if (p.startsWith('"') && p.endsWith('"')) p = p.slice(1, -1);
        // `--no-index` exits non-zero when the files differ (always, vs /dev/null); the diff we want
        // is on stdout regardless, so the exit code is intentionally ignored.
        const added = await git.git(["diff", "--no-index", "--", "/dev/null", p], { cwd });
        if (added.stdout.trim().length > 0) parts.push(added.stdout);
      }
      return { dirty: changedFiles > 0, changedFiles, ahead, diff: parts.join("\n") };
    },

    async dirtyPostPaths() {
      // Enumerate the worktrees actually on disk (not the in-memory `open` map), so open tabs, stray
      // worktrees from a failed boot, and worktrees created outside the studio are all covered.
      const wtPaths = await worktreePathsOnDisk();

      const canonicalPaths: string[] = [];
      for (const wtPath of wtPaths) {
        // Uncommitted, mirroring postLossPreview's delete-scope status check.
        const statusRes = await git.git(
          ["-c", "core.quotePath=false", "status", "--porcelain", "--", BLOG_CONTENT_DIR],
          { cwd: wtPath },
        );
        const uncommittedNonEmpty = statusRes.stdout.trim().length > 0;

        // Ahead of the published base, mirroring postLossPreview's offline-safe fallback: any
        // thrown error (no gh / offline) or nonzero exit just means "can't tell", so report 0
        // rather than blocking the dirty scan on a network call.
        let ahead = 0;
        try {
          const base = await defaultBranch();
          const revRes = await git.git(["rev-list", "--count", `origin/${base}..HEAD`], { cwd: wtPath });
          if (revRes.code === 0) ahead = Number.parseInt(revRes.stdout.trim() || "0", 10) || 0;
        } catch {
          // offline / no gh: treat as 0, as above.
        }

        if (!uncommittedNonEmpty && ahead === 0) continue;

        // Map the dirty worktree to its post's canonical (repoRoot-based) path, the identity tabs
        // and the palette key on, via the worktree's dir name (its stem).
        const stem = path.basename(wtPath);
        let canonical: string | null = null;
        if (await fs.exists(path.join(wtPath, BLOG_CONTENT_DIR, `${stem}.mdx`))) {
          canonical = path.join(repoRoot, BLOG_CONTENT_DIR, `${stem}.mdx`);
        } else if (await fs.exists(path.join(wtPath, BLOG_CONTENT_DIR, stem, "post.mdx"))) {
          canonical = path.join(repoRoot, BLOG_CONTENT_DIR, stem, "post.mdx");
        }
        // Else: can't resolve which post this worktree backs, so skip it.
        if (canonical) canonicalPaths.push(canonical);
      }
      return [...new Set(canonicalPaths)];
    },

    async listDrafts() {
      // Enumerate blog/* branches both locally and on origin (remote-tracking). Offline-safe: reads
      // refs already on disk; a stale origin/* is possible (no fetch), the accepted tradeoff for not
      // blocking on the network. A branch with no post file under the blog dir is skipped, not guessed.
      const localStems = await refStems(["for-each-ref", "--format=%(refname)", "refs/heads/blog"], "refs/heads/blog/");
      const remoteStems = await refStems(
        ["for-each-ref", "--format=%(refname)", "refs/remotes/origin/blog"],
        "refs/remotes/origin/blog/",
      );

      // A "draft w/o worktree" is one whose stem has neither a live worktree on disk nor an open tab.
      const liveStems = new Set((await worktreePathsOnDisk()).map((p) => path.basename(p)));
      const openStems = new Set([...open.values()].map((d) => postStem(d.canonicalPath)));

      const drafts: DraftSummary[] = [];
      for (const stem of new Set([...localStems, ...remoteStems])) {
        if (liveStems.has(stem) || openStems.has(stem)) continue;
        const isLocal = localStems.has(stem);
        const isRemote = remoteStems.has(stem);
        const ref = isLocal ? `blog/${stem}` : `origin/blog/${stem}`;
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

      // Stop the preview daemon serving this worktree first, and await it: a `git worktree remove`
      // that races a still-running daemon would leave it orphaned in a deleted dir, holding the
      // fixed port so the next post's preview can't bind. Best-effort: removal proceeds regardless.
      try {
        await deps.stopPreview?.(worktreePath);
      } catch {
        /* stop failed; still attempt removal */
      }

      // Drop the tab and re-focus another post like close, before removal, so onActiveChange
      // retargets the watcher and restarts astro in a surviving worktree rather than the one we're
      // deleting.
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
      // the branch (-D: it may hold commits not merged to origin/<default>). origin is never touched.
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

    async revertPost(canonicalPath) {
      const jailed = resolveJailed(canonicalPath) ?? canonicalPath;
      const doc = open.get(jailed);
      if (!doc) return { ok: false, error: "post is not open" };
      const pathspec = postUnitPathspec(doc.relPath);

      // Restore tracked files under the post to HEAD, discarding uncommitted edits. Untracked files
      // (e.g. a never-committed new post) have no HEAD state and are intentionally left as-is.
      const coRes = await git.git(["checkout", "HEAD", "--", pathspec], { cwd: doc.worktreePath });
      if (coRes.code !== 0) {
        return { ok: false, error: `git checkout failed: ${coRes.stderr.trim() || `exit ${coRes.code}`}` };
      }

      const text = await fs.readFile(doc.worktreeFilePath);
      const hash = sha256Hex(text);
      if (hash === doc.rev.hash) return { ok: true, reverted: false };
      // The checkout wrote the file behind the store's back; announce the hash so the file watcher
      // treats its own event as our write (no "external" reload banner). Broadcast as "agent" so the
      // editor replaces its buffer with the clean text rather than raising a keep-mine banner.
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
