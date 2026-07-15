// In-browser mock of the sidecar's REST + WS face, so the SPA runs with no real backend. Enable with
// a `?mock` query flag or VITE_STUDIO_MOCK. installMock() patches fetch and WebSocket but only
// intercepts sidecar traffic (REST_BASE/WS_BASE); everything else (Vite HMR, the preview iframe) is
// delegated to the real implementations, so it's safe to install in dev. It speaks the frozen wire
// protocol and is tab-aware: it seeds open posts, an MCP inventory, and not-yet-open posts (for ⌘P),
// and services the full tab lifecycle and mcp.setEnabled.

import type { AgentState, DocRev, PermissionDecision, PermissionMode, PreviewState } from "../../shared/types";
import type { ClientMessage, DraftSummary, PostSummaryDTO, PutDocRequest, PutDocResponse, ServerMessage } from "../../shared/protocol";
import type { SessionListItem } from "../../sessions/pickerViewModel";
import type { SaveDraftRequest, SaveDraftResponse, ShipRequest, ShipResponse } from "../../shared/protocol";
import { REST_BASE, WS_BASE } from "./config";

// ---- mock enable check ----
export function isMockEnabled(): boolean {
  const env = import.meta.env.VITE_STUDIO_MOCK;
  if (env === "1" || env === "true") return true;
  try {
    return new URLSearchParams(window.location.search).has("mock");
  } catch {
    return false;
  }
}

// ---- fixtures ----
const REPO = "/Users/ryanrowe/indeed/rfrowe/ryan.rowe.codes";
const CONTENT = `${REPO}/src/content/blog`;

/** File path for a folder post `YYYY-MM-DD_slug/post.mdx`. */
function postPath(date: string, slug: string): string {
  return `${CONTENT}/${date}_${slug}/post.mdx`;
}
/** Astro dev URL a valid post previews at (`/blog/<date>/<slug>`). */
function previewUrl(date: string, slug: string): string {
  return `http://localhost:4321/blog/${date}/${slug}`;
}

function frontmatter(title: string, slug: string, date: string, headline: string): string {
  // created_at is quoted (mirrors the real studio) so Astro's YAML keeps it a string.
  return `---\ntitle: ${title}\nslug: ${slug}\ncreated_at: "${date}"\nheadline: ${headline}\n---\n\n`;
}

const SKYLINE_MDX =
  frontmatter("Aligning a Skyline", "aligning-a-skyline", "2026-07-10", "teaching a horizon to stand up straight") +
  `The photo was almost right. The buildings leaned a few degrees off true, the way
a hand-held frame always does, and the eye kept snagging on it.

![A city skyline, subtly rotated](./skyline.webp)
*The raw frame, before any correction.*

So I wrote a small script to find the dominant vertical lines and rotate the
image until they stood up straight.
`;

const CACHE_MDX =
  frontmatter("The Shape of a Cache", "the-shape-of-a-cache", "2026-06-22", "what a good hit rate quietly hides") +
  `A cache is mostly a bet about the future: that what you asked for once, you will
ask for again soon. The hit rate is how often the bet pays off — but the number
alone hides the *shape* of the misses.

Two caches can share a 92% hit rate and behave nothing alike. One misses at
random; the other misses in bursts, at exactly the moments you can least afford it.
`;

// Not-yet-open posts, so ⌘P (GET /posts) and "open an existing post" have something.
const CLOSED_POSTS: PostSummaryDTO[] = [
  {
    path: postPath("2026-05-03", "a-grammar-of-diagrams"),
    title: "A Grammar of Diagrams",
    url: previewUrl("2026-05-03", "a-grammar-of-diagrams"),
  },
  {
    path: postPath("2022-03-11", "algorithmic-art"),
    title: "Algorithmic Art",
    url: previewUrl("2022-03-11", "algorithmic-art"),
  },
];

// Draft branches with no live worktree, for the ⌘P palette. One local, one remote-only.
const MOCK_DRAFTS: { summary: DraftSummary; title: string }[] = [
  {
    summary: { path: postPath("2026-04-18", "a-half-written-idea"), stem: "2026-04-18_a-half-written-idea", origin: "local" },
    title: "A Half-Written Idea",
  },
  {
    summary: { path: postPath("2026-02-02", "notes-from-a-plane"), stem: "2026-02-02_notes-from-a-plane", origin: "remote" },
    title: "Notes From a Plane",
  },
];

const SAMPLE_DIFF = `diff --git a/src/content/blog/2026-07-10_aligning-a-skyline/post.mdx b/src/content/blog/2026-07-10_aligning-a-skyline/post.mdx
index 1111111..2222222 100644
--- a/src/content/blog/2026-07-10_aligning-a-skyline/post.mdx
+++ b/src/content/blog/2026-07-10_aligning-a-skyline/post.mdx
@@ -7,6 +7,8 @@
 # Aligning a Skyline

+**TL;DR** — detect the dominant verticals, then rotate until they are truly plumb.
+
 The photo was almost right. The buildings leaned a few degrees off true, the way
 a hand-held frame always does, and the eye kept snagging on it.
`;

const SAMPLE_SESSIONS: SessionListItem[] = [
  {
    sessionId: "mock-sess-blog-001",
    title: "Draft the skyline post",
    mtime: Date.now() - 1000 * 60 * 12,
    sizeBytes: 48_120,
    repoPath: REPO,
  },
  {
    sessionId: "mock-sess-build-002",
    title: "Build the skyline-align script (numpy + PIL)",
    mtime: Date.now() - 1000 * 60 * 60 * 3,
    sizeBytes: 191_004,
    repoPath: "/Users/ryanrowe/projects/skyline-align",
  },
  {
    sessionId: "mock-sess-blog-003",
    title: "(untitled)",
    mtime: Date.now() - 1000 * 60 * 60 * 26,
    sizeBytes: null,
    repoPath: REPO,
  },
];

// MCP inventory spanning every status the popover renders: connected, needs-auth, disabled.
const MOCK_MCP: { name: string; status: string; enabled: boolean }[] = [
  { name: "studio", status: "connected", enabled: true },
  { name: "chrome-devtools", status: "connected", enabled: true },
  { name: "context7", status: "needs-auth", enabled: true },
  { name: "playwright", status: "disabled", enabled: false },
];

// ---- rev helper (mock hash, not sha256) ----
function makeRev(n: number, text: string): DocRev {
  let h = 0x811c9dc5;
  for (let i = 0; i < text.length; i++) {
    h ^= text.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return { n, hash: (h >>> 0).toString(16).padStart(8, "0") };
}

// The post's isolation branch, mirroring the sidecar: `blog/<date-qualified stem>`.
function branchFromPath(path: string): string {
  const base = path.replace(/\/post\.mdx$/, "").replace(/\.mdx$/, "");
  return `blog/${base.split("/").pop() ?? ""}`;
}

// One open post's live state. agent is per-post (each tab has its own session), so a rename carries
// the session with the post and ?mock exercises the post.renamed transcript migration.
interface MockDoc {
  path: string;
  title: string;
  branch: string;
  text: string;
  rev: DocRev;
  preview: PreviewState;
  agent: AgentState;
}

function makeDoc(path: string, title: string, text: string, preview: PreviewState): MockDoc {
  return { path, title, branch: branchFromPath(path), text, rev: makeRev(1, text), preview, agent: { sessionId: null, mode: "new" } };
}

// ---- shared mock state ----
class MockBackend {
  // Every doc the mock knows about, keyed by path (open, created, and previously-opened).
  private readonly docs = new Map<string, MockDoc>();
  // Ordered open tab set (paths). Titles come from `docs`.
  private open: string[] = [];
  private activePath: string;
  private mcp = MOCK_MCP.map((s) => ({ ...s }));
  private mode: PermissionMode = "auto";
  // Resolver for an in-flight demo permission prompt, awaiting the author's answer.
  private pendingPerm: ((decision: PermissionDecision) => void) | null = null;
  // Demo the approve/deny card once per page session, then stop.
  private permDemoed = false;
  private readonly sockets = new Set<MockWebSocket>();

  constructor() {
    const skyline = makeDoc(
      postPath("2026-07-10", "aligning-a-skyline"),
      "Aligning a Skyline",
      SKYLINE_MDX,
      { valid: true, url: previewUrl("2026-07-10", "aligning-a-skyline") },
    );
    const cache = makeDoc(
      postPath("2026-06-22", "the-shape-of-a-cache"),
      "The Shape of a Cache",
      CACHE_MDX,
      { valid: true, url: previewUrl("2026-06-22", "the-shape-of-a-cache") },
    );
    this.docs.set(skyline.path, skyline);
    this.docs.set(cache.path, cache);
    this.open = [skyline.path, cache.path];
    this.activePath = skyline.path;
  }

  register(socket: MockWebSocket): void {
    this.sockets.add(socket);
    // Bootstrap the just-connected client with the full state.
    socket.deliver(this.tabsMsg());
    socket.deliver(this.mcpMsg());
    socket.deliver({ type: "mode.status", mode: this.mode });
    // Label the status chip "mock" so it's obvious no real sidecar/git is behind this session.
    socket.deliver({ type: "studio.branch", ref: "mock", worktree: "/repo/ryan.rowe.codes (mock)" });
    this.deliverActive(socket);
    const active = this.docs.get(this.activePath);
    if (active?.agent.sessionId) socket.deliver({ type: "session", sessionId: active.agent.sessionId, mode: active.agent.mode });
  }

  unregister(socket: MockWebSocket): void {
    this.sockets.delete(socket);
  }

  private broadcast(msg: ServerMessage): void {
    for (const s of this.sockets) s.deliver(msg);
  }

  private tabsMsg(): ServerMessage {
    return { type: "tabs", open: this.open.map((p) => ({ path: p, title: this.docs.get(p)?.title ?? p })) };
  }

  private mcpMsg(): ServerMessage {
    return { type: "mcp.status", servers: this.mcp.map((s) => ({ ...s })) };
  }

  // Push the active post's active, doc, preview, and name-sync to one socket (or all). Mirrors the
  // sidecar: switching the active post is always followed by its file, preview, and name-sync.
  private deliverActive(target?: MockWebSocket): void {
    const doc = this.docs.get(this.activePath);
    if (!doc) return;
    const send = (m: ServerMessage) => (target ? target.deliver(m) : this.broadcast(m));
    send({ type: "active", path: doc.path, title: doc.title, branch: doc.branch });
    send({ type: "file.changed", path: doc.path, text: doc.text, rev: doc.rev, origin: "external" });
    send({ type: "preview.url", preview: doc.preview });
    send(this.nameSyncMsg(doc));
  }

  // Name-sync for a doc: compare the frontmatter-derived stem to the path stem. A bad slug/date is
  // reported synced so the preview-error path owns it. Lets ?mock reproduce the desync banner.
  private nameSyncMsg(doc: MockDoc): ServerMessage {
    const slug = doc.text.match(/^slug:\s*(.+?)\s*$/m)?.[1]?.replace(/^['"]|['"]$/g, "") ?? "";
    const date = (doc.text.match(/^created_at:\s*(.+?)\s*$/m)?.[1]?.replace(/^['"]|['"]$/g, "") ?? "").slice(0, 10);
    const [pathDate, pathSlug] = splitPath(doc.path);
    if (!/^[a-z0-9][a-z0-9-]*$/.test(slug) || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      return { type: "post.namesync", synced: true };
    }
    const expectedStem = `${date}_${slug}`;
    const currentStem = `${pathDate}_${pathSlug}`;
    if (expectedStem === currentStem) return { type: "post.namesync", synced: true };
    const targetPath = postPath(date, slug);
    const openCollision = targetPath !== doc.path && this.open.includes(targetPath);
    return {
      type: "post.namesync",
      synced: false,
      expectedStem,
      currentStem,
      canComplete: !openCollision,
      reason: openCollision ? `a post is already open at ${expectedStem}` : undefined,
    };
  }

  // ---- REST ----
  putDoc(req: PutDocRequest): PutDocResponse {
    const doc = this.docs.get(req.path);
    if (!doc) return { ok: false, error: "stale-rev", currentRev: makeRev(1, "") };
    if (req.baseRev.n !== doc.rev.n) return { ok: false, error: "stale-rev", currentRev: doc.rev };
    doc.text = req.text;
    doc.rev = makeRev(doc.rev.n + 1, req.text);
    // Re-broadcast name-sync so editing the frontmatter slug/date raises/clears the banner live.
    if (doc.path === this.activePath) this.broadcast(this.nameSyncMsg(doc));
    return { ok: true, rev: doc.rev };
  }

  diff(): { status: string; diff: string } {
    return { status: " M src/content/blog/2026-07-10_aligning-a-skyline/post.mdx", diff: SAMPLE_DIFF };
  }

  sessions(): SessionListItem[] {
    return SAMPLE_SESSIONS;
  }

  posts(): PostSummaryDTO[] {
    // Open posts plus the not-yet-open bag, deduped.
    const openSummaries: PostSummaryDTO[] = this.open.map((p) => {
      const d = this.docs.get(p)!;
      return { path: d.path, title: d.title, url: d.preview.valid ? d.preview.url : null };
    });
    const openPaths = new Set(this.open);
    return [...openSummaries, ...CLOSED_POSTS.filter((p) => !openPaths.has(p.path))];
  }

  dirtyStatus(): { dirty: string[]; uncommitted: string[] } {
    // Every open post carries unshipped work (exercises the dirty badge/dot); only the active post is
    // treated as having uncommitted edits, so "Revert to clean" is enabled there and disabled on the
    // other open tabs (exercises both states in dev).
    return { dirty: [...this.open], uncommitted: this.open.includes(this.activePath) ? [this.activePath] : [] };
  }

  drafts(): DraftSummary[] {
    // Draft branches with no worktree: drop any adopted (opened) this session.
    return MOCK_DRAFTS.filter((d) => !this.open.includes(d.summary.path)).map((d) => d.summary);
  }

  ship(req: ShipRequest): ShipResponse {
    if (!req.confirm) return { ok: false, error: "confirmation required" };
    return { ok: true, prUrl: "https://github.com/rfrowe/ryan.rowe.codes/pull/42" };
  }

  saveDraft(req: SaveDraftRequest): SaveDraftResponse {
    if (!req.confirm) return { ok: false, error: "confirmation required" };
    const path = req.path ?? this.activePath;
    return { ok: true, branch: branchFromPath(path), committed: true, pushed: true, noop: false };
  }

  // ---- WS client messages ----
  handle(socket: MockWebSocket, msg: ClientMessage): void {
    switch (msg.type) {
      case "prompt":
        void this.runTurn(msg.promptId, msg.text);
        break;
      case "resolveDirective":
        void this.runTurn(msg.promptId, `resolve directive: ${msg.instruction}`);
        break;
      case "cancel":
        this.broadcast({ type: "done", promptId: msg.promptId, stopReason: "cancelled" });
        break;
      case "session.select": {
        // The selection applies to the active post's session.
        const agent: AgentState = { sessionId: msg.sessionId ?? `mock-${msg.mode}-${Date.now().toString(36)}`, mode: msg.mode };
        const doc = this.docs.get(this.activePath);
        if (doc) doc.agent = agent;
        this.broadcast({ type: "session", sessionId: agent.sessionId!, mode: agent.mode });
        break;
      }
      case "editor.state":
        // Cursor tracking is not modelled by the mock.
        break;
      case "post.open":
        this.openPost(msg.requestId, msg.path);
        break;
      case "post.create":
        this.createPost(msg.requestId, msg.title, msg.slug, msg.headline, msg.created_at);
        break;
      case "post.close":
        this.closePost(msg.requestId, msg.path);
        break;
      case "post.rename":
        this.renamePost(msg.requestId, msg.path, msg.newSlug);
        break;
      case "post.completeRename":
        this.completeRename(msg.requestId, msg.path);
        break;
      case "post.revertUrl":
        this.revertUrl(msg.requestId, msg.path);
        break;
      case "post.delete":
        this.deletePost(msg.requestId, msg.path, msg.confirm);
        break;
      case "post.revert":
        this.revertPost(msg.requestId, msg.path, msg.confirm);
        break;
      case "mcp.setEnabled":
        this.setMcpEnabled(msg.server, msg.enabled);
        break;
      case "mode.set":
        this.mode = msg.mode;
        this.broadcast({ type: "mode.status", mode: this.mode });
        break;
      case "permission.response":
        this.pendingPerm?.(msg.decision);
        this.pendingPerm = null;
        break;
    }
  }

  private openPost(requestId: string, path: string): void {
    // Adopt a known-but-closed post (or an existing draft branch) into docs on first open.
    if (!this.docs.has(path)) {
      const closed = CLOSED_POSTS.find((p) => p.path === path);
      const draft = MOCK_DRAFTS.find((d) => d.summary.path === path);
      const known = closed ?? (draft ? { path, title: draft.title } : null);
      if (!known) {
        this.broadcast({ type: "post.result", requestId, ok: false, error: `unknown post: ${path}` });
        return;
      }
      const [date, slug] = splitPath(known.path);
      // No `# H1`: the BlogPost layout renders the title from frontmatter (matches renderNewPost).
      this.docs.set(
        path,
        makeDoc(path, known.title, frontmatter(known.title, slug, date, "") + "Start writing…\n", {
          valid: true,
          url: previewUrl(date, slug),
        }),
      );
    }
    if (!this.open.includes(path)) {
      this.open.push(path);
      this.broadcast(this.tabsMsg());
    }
    this.activePath = path;
    this.deliverActive();
    this.broadcast({ type: "post.result", requestId, ok: true, path });
  }

  private createPost(requestId: string, title: string, slug: string, headline: string, date: string): void {
    const path = postPath(date, slug);
    if (this.docs.has(path)) {
      this.broadcast({ type: "post.result", requestId, ok: false, error: `a post already exists at ${slug}` });
      return;
    }
    // No `# H1`: the BlogPost layout renders the title from frontmatter (matches renderNewPost).
    const text = frontmatter(title, slug, date, headline) + "Start writing…\n";
    this.docs.set(path, makeDoc(path, title, text, { valid: true, url: previewUrl(date, slug) }));
    this.open.push(path);
    this.activePath = path;
    this.broadcast(this.tabsMsg());
    this.deliverActive();
    this.broadcast({ type: "post.result", requestId, ok: true, path });
  }

  private closePost(requestId: string, path: string): void {
    const at = this.open.indexOf(path);
    if (at === -1) {
      this.broadcast({ type: "post.result", requestId, ok: true, path });
      return;
    }
    this.open.splice(at, 1);
    const wasActive = this.activePath === path;
    this.broadcast(this.tabsMsg());
    if (wasActive) {
      const next = this.open[at] ?? this.open[at - 1] ?? this.open[0] ?? null;
      if (next) {
        this.activePath = next;
        this.deliverActive();
      }
    }
    this.broadcast({ type: "post.result", requestId, ok: true, path });
  }

  private renamePost(requestId: string, path: string, newSlug: string): void {
    const doc = this.docs.get(path);
    if (!doc) {
      this.broadcast({ type: "post.result", requestId, ok: false, error: `unknown post: ${path}` });
      return;
    }
    // Tab-bar rename: keep the current date, rewrite the frontmatter slug to match the new filename.
    const [date] = splitPath(path);
    this.relocateDoc(requestId, path, date, newSlug, true);
  }

  private completeRename(requestId: string, path: string): void {
    const doc = this.docs.get(path);
    if (!doc) {
      this.broadcast({ type: "post.result", requestId, ok: false, error: `unknown post: ${path}` });
      return;
    }
    // Derive the target from the post's own frontmatter; leave the text alone.
    const slug = doc.text.match(/^slug:\s*(.+?)\s*$/m)?.[1]?.replace(/^['"]|['"]$/g, "") ?? "";
    const date = (doc.text.match(/^created_at:\s*(.+?)\s*$/m)?.[1]?.replace(/^['"]|['"]$/g, "") ?? "").slice(0, 10);
    if (!/^[a-z0-9][a-z0-9-]*$/.test(slug) || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      this.broadcast({ type: "post.result", requestId, ok: false, error: "cannot complete rename: invalid frontmatter" });
      return;
    }
    this.relocateDoc(requestId, path, date, slug, false);
  }

  // Inverse of completeRename: rewrite the frontmatter (slug + created_at) to match the filename stem.
  // An ordinary edit (agent-origin file.changed).
  private revertUrl(requestId: string, path: string): void {
    const doc = this.docs.get(path);
    if (!doc) {
      this.broadcast({ type: "post.result", requestId, ok: false, error: `unknown post: ${path}` });
      return;
    }
    const [fnDate, fnSlug] = splitPath(doc.path);
    doc.text = doc.text.replace(/^slug:.*$/m, `slug: ${fnSlug}`).replace(/^created_at:.*$/m, `created_at: "${fnDate}"`);
    doc.rev = makeRev(doc.rev.n + 1, doc.text);
    this.broadcast({ type: "file.changed", path: doc.path, text: doc.text, rev: doc.rev, origin: "agent" });
    this.broadcast(this.nameSyncMsg(doc));
    this.broadcast({ type: "post.result", requestId, ok: true, path });
  }

  // Move the doc at oldPath to the stem `<date>_<slug>` (rewriting the frontmatter slug only for a
  // tab-bar rename), then broadcast post.renamed, tabs, active. Shared by tab-bar rename and Complete-rename.
  private relocateDoc(requestId: string, oldPath: string, date: string, slug: string, rewriteFrontmatter: boolean): void {
    const doc = this.docs.get(oldPath)!;
    const nextPath = postPath(date, slug);
    if (nextPath !== oldPath && this.docs.has(nextPath)) {
      this.broadcast({ type: "post.result", requestId, ok: false, error: `a post already exists at ${slug}` });
      return;
    }
    doc.path = nextPath;
    doc.branch = branchFromPath(nextPath);
    if (rewriteFrontmatter) doc.text = doc.text.replace(/^slug:.*$/m, `slug: ${slug}`);
    doc.rev = makeRev(doc.rev.n + 1, doc.text);
    doc.preview = { valid: true, url: previewUrl(date, slug) };
    this.docs.delete(oldPath);
    this.docs.set(nextPath, doc);
    this.open = this.open.map((p) => (p === oldPath ? nextPath : p));
    if (this.activePath === oldPath) this.activePath = nextPath;
    // Announce the rename before the tabs/active rebuild so the client migrates the tab's transcript
    // + session onto the new path (doc.agent already moved with the doc object above).
    this.broadcast({ type: "post.renamed", oldPath, newPath: nextPath, title: doc.title, branch: doc.branch });
    this.broadcast(this.tabsMsg());
    this.deliverActive();
    this.broadcast({ type: "post.result", requestId, ok: true, path: nextPath });
  }

  // A synthetic "what would be lost" diff for the confirm dialog (real diffs come from git in the
  // sidecar), so the gate is demoable.
  private lossDiff(path: string): string {
    const [, slug] = splitPath(path);
    return [
      `diff --git a/src/content/blog/${slug}.mdx b/src/content/blog/${slug}.mdx`,
      "index 1111111..2222222 100644",
      `--- a/src/content/blog/${slug}.mdx`,
      `+++ b/src/content/blog/${slug}.mdx`,
      "@@ -1,3 +1,3 @@",
      "-Start writing…",
      "+A few unsaved edits that this action would discard.",
    ].join("\n");
  }

  private deletePost(requestId: string, path: string, confirm: boolean): void {
    if (!this.docs.has(path)) {
      this.broadcast({ type: "post.result", requestId, ok: true, path });
      return;
    }
    if (!confirm) {
      this.broadcast({ type: "post.confirm", requestId, op: "delete", path, changedFiles: 1, ahead: 0, diff: this.lossDiff(path) });
      return;
    }
    const at = this.open.indexOf(path);
    if (at !== -1) this.open.splice(at, 1);
    this.docs.delete(path);
    const wasActive = this.activePath === path;
    this.broadcast(this.tabsMsg());
    if (wasActive) {
      const next = this.open[at] ?? this.open[at - 1] ?? this.open[0] ?? null;
      if (next) {
        this.activePath = next;
        this.deliverActive();
      }
    }
    this.broadcast({ type: "post.result", requestId, ok: true, path });
  }

  private revertPost(requestId: string, path: string, confirm: boolean): void {
    const doc = this.docs.get(path);
    if (!doc) {
      this.broadcast({ type: "post.result", requestId, ok: false, error: `unknown post: ${path}` });
      return;
    }
    if (!confirm) {
      this.broadcast({ type: "post.confirm", requestId, op: "revert", path, changedFiles: 1, ahead: 0, diff: this.lossDiff(path) });
      return;
    }
    // Restore to a clean baseline and push it (origin "agent", so the buffer is replaced, no banner).
    doc.rev = makeRev(doc.rev.n + 1, doc.text);
    this.broadcast({ type: "file.changed", path: doc.path, text: doc.text, rev: doc.rev, origin: "agent" });
    this.broadcast({ type: "post.result", requestId, ok: true, path });
  }

  private setMcpEnabled(server: string, enabled: boolean): void {
    this.mcp = this.mcp.map((s) =>
      s.name === server ? { ...s, enabled, status: enabled ? "connected" : "disabled" } : s,
    );
    this.broadcast(this.mcpMsg());
  }

  // Emit a permission.request and resolve when the SPA answers (the approve/deny demo).
  private askPermission(
    promptId: string,
    toolName: string,
    input: unknown,
    meta: { title?: string; reason?: string },
  ): Promise<PermissionDecision> {
    const requestId = `mock-perm-${Date.now().toString(36)}`;
    return new Promise<PermissionDecision>((resolve) => {
      this.pendingPerm = resolve;
      this.broadcast({ type: "permission.request", promptId, requestId, toolName, input, ...meta });
    });
  }

  // Simulate a streamed agent turn that edits the active doc through the sanctioned path.
  private async runTurn(promptId: string, text: string): Promise<void> {
    const doc = this.docs.get(this.activePath);
    if (!doc) return;
    const say = (t: string) => this.broadcast({ type: "assistant.delta", promptId, text: t });
    await delay(120);
    say("On it — ");
    await delay(160);
    say("reading the active document and ");
    await delay(160);
    say("applying a focused edit.");
    await delay(150);

    // Demo the approve/deny card once per session: ask for a build the mode won't auto-approve.
    if (!this.permDemoed) {
      this.permDemoed = true;
      const decision = await this.askPermission(
        promptId,
        "Bash",
        { command: "npm run build" },
        { title: "Run `npm run build`?", reason: "A shell command the current mode won't auto-approve." },
      );
      if (decision === "deny") {
        this.broadcast({ type: "assistant.message", promptId, text: "Understood — skipping the build; I'll just apply the edit." });
      }
    }

    const toolUseId = `mock-tool-${Date.now().toString(36)}`;
    this.broadcast({ type: "tool.start", promptId, toolUseId, name: "mcp__studio__apply_edit", input: { path: doc.path, note: text } });
    await delay(300);

    // Insert a TL;DR after the frontmatter (posts have no H1: the layout renders the title from it).
    const fm = doc.text.match(/^---\r?\n[\s\S]*?\r?\n---\r?\n/)?.[0];
    if (fm) {
      const insertAt = doc.text.indexOf(fm) + fm.length;
      const insertion = "\n**TL;DR** — detect the dominant verticals, then rotate until they are truly plumb.\n";
      doc.text = doc.text.slice(0, insertAt) + insertion + doc.text.slice(insertAt);
      doc.rev = makeRev(doc.rev.n + 1, doc.text);
    }
    this.broadcast({ type: "tool.end", promptId, toolUseId, isError: false, resultPreview: "ok — 1 edit applied" });
    this.broadcast({ type: "file.changed", path: doc.path, text: doc.text, rev: doc.rev, origin: "agent" });
    await delay(120);
    this.broadcast({ type: "preview.url", preview: doc.preview });
    this.broadcast({ type: "assistant.message", promptId, text: "Added a one-sentence TL;DR at the top of the post and left the rest untouched." });
    await delay(80);
    this.broadcast({ type: "done", promptId, stopReason: "end_turn" });
  }
}

/** `[date, slug]` from a folder-post path (`.../YYYY-MM-DD_slug/post.mdx`). */
function splitPath(path: string): [string, string] {
  const m = path.match(/\/(\d{4}-\d{2}-\d{2})_([^/]+)\/post\.mdx$/);
  return m ? [m[1], m[2]] : ["2026-01-01", "post"];
}

function delay(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

const backend = new MockBackend();

// ---- mock WebSocket ----
type WsEventName = "open" | "message" | "close" | "error";

class MockWebSocket {
  static readonly CONNECTING = 0;
  static readonly OPEN = 1;
  static readonly CLOSING = 2;
  static readonly CLOSED = 3;

  readonly CONNECTING = 0;
  readonly OPEN = 1;
  readonly CLOSING = 2;
  readonly CLOSED = 3;

  readyState = 0;
  onopen: ((ev: Event) => void) | null = null;
  onmessage: ((ev: MessageEvent) => void) | null = null;
  onclose: ((ev: CloseEvent) => void) | null = null;
  onerror: ((ev: Event) => void) | null = null;

  private readonly listeners: Record<WsEventName, Set<(ev: unknown) => void>> = {
    open: new Set(),
    message: new Set(),
    close: new Set(),
    error: new Set(),
  };

  constructor(url: string | URL, protocols?: string | string[]) {
    const href = typeof url === "string" ? url : url.toString();
    if (!href.startsWith(WS_BASE)) {
      // Not sidecar traffic (e.g. Vite HMR); hand back a real socket. Forward the subprotocol too, or
      // Vite HMR's `new WebSocket(url, "vite-hmr")` loses it and reconnection dies.
      return new RealWebSocket(url, protocols) as unknown as MockWebSocket;
    }
    setTimeout(() => {
      this.readyState = MockWebSocket.OPEN;
      this.fire("open", new Event("open"));
      backend.register(this);
    }, 0);
  }

  send(data: string): void {
    if (this.readyState !== MockWebSocket.OPEN) return;
    let msg: ClientMessage;
    try {
      msg = JSON.parse(data) as ClientMessage;
    } catch {
      return;
    }
    backend.handle(this, msg);
  }

  close(): void {
    if (this.readyState === MockWebSocket.CLOSED) return;
    this.readyState = MockWebSocket.CLOSED;
    backend.unregister(this);
    this.fire("close", { code: 1000, reason: "", wasClean: true } as unknown as CloseEvent);
  }

  addEventListener(name: WsEventName, fn: (ev: unknown) => void): void {
    this.listeners[name]?.add(fn);
  }
  removeEventListener(name: WsEventName, fn: (ev: unknown) => void): void {
    this.listeners[name]?.delete(fn);
  }

  /** Backend to client push. */
  deliver(msg: ServerMessage): void {
    if (this.readyState !== MockWebSocket.OPEN) return;
    const ev = { data: JSON.stringify(msg) } as MessageEvent;
    this.fire("message", ev);
  }

  private fire(name: WsEventName, ev: Event | MessageEvent | CloseEvent): void {
    const handler =
      name === "open" ? this.onopen : name === "message" ? this.onmessage : name === "close" ? this.onclose : this.onerror;
    (handler as ((e: unknown) => void) | null)?.(ev);
    for (const fn of this.listeners[name]) fn(ev);
  }
}

// ---- install ----
let installed = false;
let RealWebSocket: typeof WebSocket;

export function installMock(): void {
  if (installed) return;
  installed = true;

  RealWebSocket = globalThis.WebSocket;
  const realFetch: typeof fetch = globalThis.fetch.bind(globalThis);

  globalThis.WebSocket = MockWebSocket as unknown as typeof WebSocket;

  globalThis.fetch = async (input: RequestInfo | URL, init?: RequestInit): Promise<Response> => {
    const url = typeof input === "string" ? input : input instanceof URL ? input.toString() : input.url;
    if (!url.startsWith(REST_BASE)) return realFetch(input, init);

    const method = (init?.method ?? (input instanceof Request ? input.method : "GET")).toUpperCase();
    const path = new URL(url).pathname;
    const body = init?.body ? JSON.parse(String(init.body)) : undefined;

    const ok = (data: unknown, status = 200): Response =>
      new Response(JSON.stringify(data), { status, headers: { "content-type": "application/json" } });

    if (path === "/health") return ok({ ok: true });
    if (method === "PUT" && path === "/doc") return ok(backend.putDoc(body as PutDocRequest));
    if (method === "GET" && path === "/diff") return ok(backend.diff());
    if (method === "GET" && path === "/sessions") return ok({ sessions: backend.sessions() });
    if (method === "GET" && path === "/posts") return ok({ posts: backend.posts() });
    if (method === "GET" && path === "/posts/dirty") return ok(backend.dirtyStatus());
    if (method === "GET" && path === "/posts/drafts") return ok({ drafts: backend.drafts() });
    if (method === "POST" && path === "/ship") return ok(backend.ship(body as ShipRequest));
    if (method === "POST" && path === "/save-draft") return ok(backend.saveDraft(body as SaveDraftRequest));

    return ok({ error: `mock: no route for ${method} ${path}` }, 404);
  };

  console.info("[studio] mock backend installed (REST + WS intercepted on :4319)");
}
