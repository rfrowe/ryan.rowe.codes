// Typed REST client for the sidecar web face. Every DTO comes from the frozen
// wire protocol (studio/shared/protocol.ts); this module invents no shapes.

import type {
  BranchesResponse,
  DiffResponse,
  DirtyPostsResponse,
  FetchResponse,
  PostsResponse,
  PutDocRequest,
  PutDocResponse,
  SaveDraftRequest,
  SaveDraftResponse,
  SessionsResponse,
  ShipRequest,
  ShipResponse,
} from "../../shared/protocol";
import { REST_BASE, authHeaders } from "./config";

function endpoint(path: string, query?: Record<string, string>): string {
  const u = new URL(path, REST_BASE);
  if (query) for (const [k, v] of Object.entries(query)) u.searchParams.set(k, v);
  return u.toString();
}

async function asJson<T>(res: Response): Promise<T> {
  // The sidecar returns typed bodies for both success and handled-error cases
  // (e.g. stale-rev, ship violations), so we parse regardless of status.
  return (await res.json()) as T;
}

/** Autosave: persist exact buffer text against a base rev. */
export async function putDoc(req: PutDocRequest): Promise<PutDocResponse> {
  const res = await fetch(endpoint("/doc"), {
    method: "PUT",
    headers: { "content-type": "application/json", ...authHeaders() },
    body: JSON.stringify(req),
  });
  return asJson<PutDocResponse>(res);
}

/** Working-tree diff for the ship / save-draft review pane. `path` targets a specific open post;
 *  omitted, the diff follows the active post. */
export async function getDiff(scope: "post" | "all" = "post", path?: string): Promise<DiffResponse> {
  const res = await fetch(endpoint("/diff", path ? { scope, path } : { scope }), { headers: { ...authHeaders() } });
  return asJson<DiffResponse>(res);
}

/** Prior Claude Code sessions for the picker. `scope: "post"` narrows to the active post's worktree. */
export async function getSessions(scope: "post" | "all" = "post"): Promise<SessionsResponse> {
  const res = await fetch(endpoint("/sessions", { scope }), { headers: { ...authHeaders() } });
  return asJson<SessionsResponse>(res);
}

/** All existing blog posts (open or not) for the ⌘-switcher. */
export async function getPosts(): Promise<PostsResponse> {
  const res = await fetch(endpoint("/posts"), { headers: { ...authHeaders() } });
  return asJson<PostsResponse>(res);
}

/** Open posts with unshipped changes, for the ⌘P palette's dirty badge. */
export async function getDirtyPosts(): Promise<DirtyPostsResponse> {
  const res = await fetch(endpoint("/posts/dirty"), { headers: { ...authHeaders() } });
  return asJson<DirtyPostsResponse>(res);
}

/** Every blog/* branch's local/remote/stale status, for the ⌘P palette's status chips. */
export async function getBranchStatuses(): Promise<BranchesResponse> {
  const res = await fetch(endpoint("/posts/branches"), { headers: { ...authHeaders() } });
  return asJson<BranchesResponse>(res);
}

/** Studio-run ship flow (diff, branch, commit, push, PR). Requires `confirm`. */
export async function ship(req: ShipRequest): Promise<ShipResponse> {
  const res = await fetch(endpoint("/ship"), {
    method: "POST",
    headers: { "content-type": "application/json", ...authHeaders() },
    body: JSON.stringify(req),
  });
  return asJson<ShipResponse>(res);
}

/** Fetch from origin (`git fetch --prune`); the sidecar republishes the active post's divergence. */
export async function fetchRemote(): Promise<FetchResponse> {
  const res = await fetch(endpoint("/fetch"), { method: "POST", headers: { ...authHeaders() } });
  return asJson<FetchResponse>(res);
}

/** Studio-run save-draft flow (commit + push the post's branch, no PR). Requires `confirm`. */
export async function saveDraft(req: SaveDraftRequest): Promise<SaveDraftResponse> {
  const res = await fetch(endpoint("/save-draft"), {
    method: "POST",
    headers: { "content-type": "application/json", ...authHeaders() },
    body: JSON.stringify(req),
  });
  return asJson<SaveDraftResponse>(res);
}
