// Re-queries git as the single source of truth on every git-live doorbell ring and publishes one
// git.state snapshot (publish-on-change: a ring that changes nothing publishes nothing). Read-only;
// mutating flows (ship, update, rebase) live in their own services.
//
// posts = union of open tabs, on-disk worktrees, and this session's branch-namespace refs (local
// and origin), so a closed, branch-only post (pushed from another session, never checked out here)
// still reports real ahead/unpushed/incoming/behind; only uncommitted needs a worktree.
//
// uncommitted always re-runs `git status`, never memoized by ref/index state: a plain unstaged
// edit moves neither, so any such cache would report clean forever once first computed that way.
// The doorbell only watches .git, so this still needs a poke() (wired elsewhere) to react to an
// edit with no git operation alongside it.

import path from "node:path";
import { realpath, stat } from "node:fs/promises";

import type { GitRunner, GitWatcher } from "../shared/seams";
import type { FetchResponse, GitPostState, GitPrimaryState, GitState, RebaseState } from "../shared/protocol";
import type { StudioStore } from "../state/store";
import { BLOG_CONTENT_DIR, originRefExists } from "./diffService";
import { parseConflictedPaths } from "./gitOps";
import { postStem } from "../shared/slug";

// git fetch is the one place the sidecar reaches origin over the network; give it more headroom
// than a local git call (mirrors ship's push timeout).
const NETWORK_TIMEOUT_MS = 120_000;

export interface GitStatusServiceDeps {
  git: GitRunner;
  store: StudioStore;
  repoRoot: string;
  sessionBranch: string;
  watcher: GitWatcher;
  publish: (state: GitState) => void;
}

export interface GitStatusService {
  /** Re-query recipe: worktree list + for-each-ref + per-worktree status, memoized. No side effects. */
  snapshot(): Promise<GitState>;
  /** Publish an initial snapshot, then one more on every doorbell ring (publish-on-change). */
  start(): void;
  /** `git fetch --prune origin` (refs only, global; F2), then one recompute-and-publish so every
   *  post's behind/incoming reflects the fetched refs with no per-post follow-up call. A fetch
   *  already in flight makes this a no-op rather than running two overlapping fetches. */
  fetch(): Promise<FetchResponse>;
  /** F4: report `stem`'s conflicted rebase as agent-owned ("resolving") until cleared, then
   *  republish. Git plumbing alone can't tell a resolving rebase from a merely conflicted one, since
   *  the on-disk rebase-merge/rebase-apply marker looks identical either way; a rebase that isn't
   *  actually conflicted (marker gone) never shows "resolving" regardless of this flag. */
  setResolving(stem: string, resolving: boolean): void;
}

interface WorktreeEntry {
  path: string;
  headSha: string;
}

/** Parse `git worktree list --porcelain` into one entry per worktree. */
function parseWorktreeList(porcelain: string): WorktreeEntry[] {
  const entries: WorktreeEntry[] = [];
  for (const block of porcelain.split(/\r?\n\r?\n/)) {
    const pathMatch = /^worktree (.+)$/m.exec(block);
    const headMatch = /^HEAD (.+)$/m.exec(block);
    if (pathMatch && headMatch) entries.push({ path: pathMatch[1].trim(), headSha: headMatch[1].trim() });
  }
  return entries;
}

/** Parse `git for-each-ref --format=%(refname) %(objectname)` into stem to sha, under `prefix`. */
function parseRefShas(output: string, prefix: string): Map<string, string> {
  const shas = new Map<string, string>();
  for (const line of output.split(/\r?\n/)) {
    const [ref, sha] = line.trim().split(" ");
    if (ref?.startsWith(`${prefix}/`) && sha) shas.set(ref.slice(prefix.length + 1), sha);
  }
  return shas;
}

function branchFor(seg: string, stem: string): string {
  return seg ? `${seg}/blog/${stem}` : `blog/${stem}`;
}

/** `<left> ...<right>` commit counts, in that order, resolved against the object store directly
 *  (works for any ref/sha, so a post with no worktree is counted the same way as one with one). */
async function leftRightCount(git: GitRunner, cwd: string, left: string, right: string): Promise<[number, number]> {
  const res = await git.git(["rev-list", "--left-right", "--count", `${left}...${right}`], { cwd });
  const [l, r] = res.stdout.trim().split(/\s+/).map((n) => Number.parseInt(n, 10) || 0);
  return [l ?? 0, r ?? 0];
}

/** The post's relative unit path (simple `.mdx` or folder `post.mdx`) as of `ref`, or null if
 *  neither exists there yet (a branch with no commit touching the post file). */
async function postRelPath(git: GitRunner, cwd: string, ref: string, stem: string): Promise<string | null> {
  for (const rel of [`${BLOG_CONTENT_DIR}/${stem}.mdx`, `${BLOG_CONTENT_DIR}/${stem}/post.mdx`]) {
    if ((await git.git(["cat-file", "-e", `${ref}:${rel}`], { cwd })).code === 0) return rel;
  }
  return null;
}

export function createGitStatusService(deps: GitStatusServiceDeps): GitStatusService {
  const { git, store, repoRoot, sessionBranch, watcher, publish } = deps;

  // A fetch this service itself kicked off; guards against two overlapping `git fetch`s and backs
  // the button's spinner (git.state.fetch.inFlight) reactively, with no client-side flag needed.
  let inFlight = false;

  // Stems the F4 conflict resolver has an agent turn in flight for; overrides a conflicted rebase to
  // "resolving" in computePosts (see setResolving's own doc for why this can't be derived from git).
  const resolvingStems = new Set<string>();

  /** FETCH_HEAD's mtime (git.state.fetch.at): null before this repo has ever fetched. Read fresh
   *  every snapshot, not just after fetch(), so a prior session's fetch still shows on restart. */
  async function fetchHeadMtime(): Promise<number | null> {
    const res = await git.git(["rev-parse", "--path-format=absolute", "--git-path", "FETCH_HEAD"], { cwd: repoRoot });
    if (res.code !== 0) return null;
    try {
      return (await stat(res.stdout.trim())).mtimeMs;
    } catch {
      return null; // never fetched: FETCH_HEAD doesn't exist yet.
    }
  }

  // No memoization: a plain unstaged edit moves neither HEAD nor the index, so any cache keyed on
  // those would go stale the moment someone types. Every invocation already runs with
  // GIT_OPTIONAL_LOCKS=0 (see gitRunner.ts), so this read never writes back to worktrees/*/index
  // and can't re-ring the doorbell.
  async function computeUncommitted(worktreePath: string): Promise<boolean> {
    const res = await git.git(["status", "--porcelain=v2", "--branch"], { cwd: worktreePath });
    return res.stdout.split(/\r?\n/).some((line) => line.length > 0 && !line.startsWith("#"));
  }

  /** Whether `worktreePath` is mid-rebase: `rebase-merge`/`rebase-apply` under its own git-dir (a
   *  linked worktree's own, never the shared common dir). gitOps.update() only ever leaves one of
   *  these behind on a genuine conflict (any other failure aborts before returning), so finding one
   *  here always means "conflicted" — F4 (dgb.12) owns advancing conflicted -> resolving -> idle. */
  async function computeRebaseState(worktreePath: string): Promise<RebaseState> {
    for (const marker of ["rebase-merge", "rebase-apply"]) {
      const res = await git.git(["rev-parse", "--path-format=absolute", "--git-path", marker], { cwd: worktreePath });
      if (res.code !== 0) continue;
      try {
        await stat(res.stdout.trim());
      } catch {
        continue; // marker path doesn't exist on disk: not mid-rebase via this backend.
      }
      const statusRes = await git.git(["-c", "core.quotePath=false", "status", "--porcelain"], { cwd: worktreePath });
      return { phase: "conflicted", conflictedFiles: parseConflictedPaths(statusRes.stdout) };
    }
    return { phase: "idle", conflictedFiles: [] };
  }

  async function rootBase(): Promise<string> {
    return (await originRefExists(git, repoRoot, sessionBranch)) ? `origin/${sessionBranch}` : sessionBranch;
  }

  async function computePrimary(): Promise<GitPrimaryState> {
    const headRes = await git.git(["rev-parse", "--abbrev-ref", "HEAD"], { cwd: repoRoot });
    const headName = headRes.stdout.trim();
    const headSha = (await git.git(["rev-parse", "--short", "HEAD"], { cwd: repoRoot })).stdout.trim();
    const head = headRes.code === 0 && headName && headName !== "HEAD" ? headName : headSha;
    const onOrigin = await originRefExists(git, repoRoot, sessionBranch);
    const [behind, ahead] = onOrigin ? await leftRightCount(git, repoRoot, `origin/${sessionBranch}`, "HEAD") : [0, 0];
    // Display label for the root worktree's own branch, not the target-node label (always
    // sessionBranch): origin/<branch> when in sync with or behind origin, else the bare name.
    const ref = onOrigin && ahead === 0 ? `origin/${sessionBranch}` : head;
    return { sessionBranch, head, rootMoved: head !== sessionBranch, ref, headSha, onOrigin, ahead, behind, worktree: repoRoot };
  }

  async function computePosts(base: string): Promise<GitPostState[]> {
    const seg = await store.sessionNamespaceSeg();
    const localPrefix = seg ? `refs/heads/${seg}/blog` : "refs/heads/blog";
    const remotePrefix = seg ? `refs/remotes/origin/${seg}/blog` : "refs/remotes/origin/blog";

    const [localRefsRes, remoteRefsRes, worktreeListRes] = await Promise.all([
      git.git(["for-each-ref", "--format=%(refname) %(objectname)", localPrefix], { cwd: repoRoot }),
      git.git(["for-each-ref", "--format=%(refname) %(objectname)", remotePrefix], { cwd: repoRoot }),
      git.git(["worktree", "list", "--porcelain"], { cwd: repoRoot }),
    ]);
    const localShas = parseRefShas(localRefsRes.stdout, localPrefix);
    const remoteShas = parseRefShas(remoteRefsRes.stdout, remotePrefix);

    // `git worktree list` resolves symlinks in its paths (e.g. macOS's /var -> /private/var);
    // resolve the nominal root the same way before comparing, or every worktree would look foreign.
    const worktreesRoot = await realpath(await store.sessionWorktreesRoot()).catch(() => null);
    const worktreeByStem = new Map<string, WorktreeEntry>();
    if (worktreesRoot) {
      for (const wt of parseWorktreeList(worktreeListRes.stdout)) {
        if (wt.path === worktreesRoot || wt.path.startsWith(`${worktreesRoot}${path.sep}`)) {
          worktreeByStem.set(path.basename(wt.path), wt);
        }
      }
    }

    const openByStem = new Map(store.getOpenTabs().map((t) => [postStem(t.path), t.path]));
    const stems = new Set([...localShas.keys(), ...remoteShas.keys(), ...worktreeByStem.keys(), ...openByStem.keys()]);

    const posts = await Promise.all(
      [...stems].map(async (stem): Promise<GitPostState | null> => {
        const branch = branchFor(seg, stem);
        const worktree = worktreeByStem.get(stem) ?? null;
        const hasWorktree = worktree !== null;
        const onRemote = remoteShas.has(stem);
        const openPath = openByStem.get(stem) ?? null;

        // The tip ref for this post's own counts: its worktree HEAD when checked out here, else its
        // own remote when only pushed, else the bare local ref (no worktree, never pushed).
        const localTip = hasWorktree ? worktree.headSha : localShas.has(stem) ? branch : null;
        const tip = localTip ?? (onRemote ? `origin/${branch}` : null);
        if (!tip) return null; // stem present only as an open tab with neither a worktree nor a ref: nothing to report.

        const [behind, ahead] = await leftRightCount(git, repoRoot, base, tip);
        let unpushed = 0;
        let incoming = 0;
        if (localTip && onRemote) [incoming, unpushed] = await leftRightCount(git, repoRoot, `origin/${branch}`, localTip);
        else if (localTip) unpushed = ahead; // never pushed: every ahead commit is unpushed.

        const uncommitted = hasWorktree ? await computeUncommitted(worktree.path) : null;
        const computedRebase = hasWorktree
          ? await computeRebaseState(worktree.path)
          : { phase: "idle" as const, conflictedFiles: [] };
        const rebase: RebaseState =
          computedRebase.phase === "conflicted" && resolvingStems.has(stem)
            ? { ...computedRebase, phase: "resolving" }
            : computedRebase;

        const rel = openPath ? path.relative(repoRoot, openPath) : await postRelPath(git, repoRoot, tip, stem);
        if (!rel) return null; // no commit has touched the post file yet on any resolvable ref.

        return {
          path: openPath ?? path.join(repoRoot, rel),
          stem,
          branch,
          open: openPath !== null,
          hasWorktree,
          onRemote,
          inRoot: ahead === 0,
          ahead,
          unpushed,
          incoming,
          behind,
          uncommitted,
          rebase,
        };
      }),
    );
    return posts.filter((p): p is GitPostState => p !== null).sort((a, b) => a.stem.localeCompare(b.stem));
  }

  async function snapshot(): Promise<GitState> {
    const base = await rootBase();
    const [primary, posts, at] = await Promise.all([computePrimary(), computePosts(base), fetchHeadMtime()]);
    return { primary, posts, fetch: { inFlight, at } };
  }

  let lastPublished: string | null = null;
  let pending: Promise<void> = Promise.resolve();
  let queued = false;

  async function recomputeAndPublish(): Promise<void> {
    const state = await snapshot();
    const serialized = JSON.stringify(state);
    if (serialized === lastPublished) return;
    lastPublished = serialized;
    publish(state);
  }

  function schedule(): void {
    // A ring that arrives while a recompute is already queued is covered by that pending pass.
    if (queued) return;
    queued = true;
    pending = pending.then(async () => {
      queued = false;
      try {
        await recomputeAndPublish();
      } catch (err) {
        // A rejected pass (a transient git failure) must not leave `pending` permanently rejected:
        // every later schedule() would chain onto it with no handler and never run again.
        console.error("[gitStatus] recompute failed:", err instanceof Error ? err.message : err);
      }
    });
  }

  async function fetchOrigin(): Promise<FetchResponse> {
    if (inFlight) return { ok: true }; // already running; the caller's button/shortcut was a no-op.
    inFlight = true;
    let result: FetchResponse;
    try {
      await recomputeAndPublish(); // the spinner (git.state.fetch.inFlight) shows before the network call.
      const res = await git.git(["fetch", "--prune", "origin"], { cwd: repoRoot, timeoutMs: NETWORK_TIMEOUT_MS });
      result = res.code === 0 ? { ok: true } : { ok: false, error: res.stderr.trim() || `git fetch exited ${res.code}` };
    } catch (err) {
      result = { ok: false, error: err instanceof Error ? err.message : "git fetch failed" };
    }
    inFlight = false;
    try {
      await recomputeAndPublish(); // refs may have moved; every post's behind/incoming and `at` follow.
    } catch (err) {
      // A failed recompute here must not mask the fetch's own result; log it instead (mirrors schedule()).
      console.error("[gitStatus] post-fetch recompute failed:", err instanceof Error ? err.message : err);
    }
    return result;
  }

  return {
    snapshot,
    start() {
      watcher.onChange(schedule);
      schedule();
    },
    fetch: fetchOrigin,
    setResolving(stem, resolving) {
      if (resolving) resolvingStems.add(stem);
      else resolvingStems.delete(stem);
      schedule(); // no ref moves for this flag alone, so the doorbell won't republish on its own.
    },
  };
}
