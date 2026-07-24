// Typed REST client for the sidecar web face. Every DTO comes from the frozen
// wire protocol (studio/shared/protocol.ts); this module invents no shapes.

import type {
  DiffResponse,
  FetchResponse,
  PostsResponse,
  PutDocRequest,
  PutDocResponse,
  RebaseAbortResponse,
  SaveDraftRequest,
  SaveDraftResponse,
  SessionsResponse,
  ShipRequest,
  ShipResponse,
  UpdateResponse,
  UpdateRootResponse,
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

/** What a delete or revert would discard, for the destructive-confirm dialog. `scope` narrows a
 *  revert preview; omitted, the sidecar picks one ("all" when there's more than just the post, else
 *  "post") and echoes its choice back on `DiffResponse.scope`. Delete ignores scope entirely. */
export async function getLossPreview(op: "delete" | "revert", path: string, scope?: "post" | "all"): Promise<DiffResponse> {
  const query: Record<string, string> = { op, path };
  if (scope) query.scope = scope;
  const res = await fetch(endpoint("/diff", query), { headers: { ...authHeaders() } });
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

/** Studio-run ship flow (diff, branch, commit, push, PR). Requires `confirm`. */
export async function ship(req: ShipRequest): Promise<ShipResponse> {
  const res = await fetch(endpoint("/ship"), {
    method: "POST",
    headers: { "content-type": "application/json", ...authHeaders() },
    body: JSON.stringify(req),
  });
  return asJson<ShipResponse>(res);
}

/** Fetch from origin (`git fetch --prune`); the sidecar republishes git.state off the fetched refs. */
export async function fetchRemote(): Promise<FetchResponse> {
  const res = await fetch(endpoint("/fetch"), { method: "POST", headers: { ...authHeaders() } });
  return asJson<FetchResponse>(res);
}

/** The explicit "Update root from origin" affordance: ff's the root when clean, else reports the
 *  divergence (`confirm: false`) so the caller can re-request with `confirm: true` to rebase onto it. */
export async function updateRoot(confirm: boolean): Promise<UpdateRootResponse> {
  const res = await fetch(endpoint("/update-root"), {
    method: "POST",
    headers: { "content-type": "application/json", ...authHeaders() },
    body: JSON.stringify({ confirm }),
  });
  return asJson<UpdateRootResponse>(res);
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

/** Update/Pull (F3): fetch the post's base then rebase onto it. Opens a closed post first. */
export async function update(path: string): Promise<UpdateResponse> {
  const res = await fetch(endpoint("/update"), {
    method: "POST",
    headers: { "content-type": "application/json", ...authHeaders() },
    body: JSON.stringify({ path }),
  });
  return asJson<UpdateResponse>(res);
}

/** Abort an in-progress rebase (F6), returning the post to its pre-update tip. */
export async function rebaseAbort(path: string): Promise<RebaseAbortResponse> {
  const res = await fetch(endpoint("/rebase-abort"), {
    method: "POST",
    headers: { "content-type": "application/json", ...authHeaders() },
    body: JSON.stringify({ path }),
  });
  return asJson<RebaseAbortResponse>(res);
}

/** F6 for root: abort an in-progress root rebase, returning it to its pre-update tip. */
export async function abortUpdateRoot(): Promise<RebaseAbortResponse> {
  const res = await fetch(endpoint("/rebase-abort-root"), { method: "POST", headers: { ...authHeaders() } });
  return asJson<RebaseAbortResponse>(res);
}
