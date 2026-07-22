// The sessions service's scope filtering: the picker opens narrowed to the active post's worktree
// and widens to every session on demand. The SDK's `listSessions` is stubbed; only the pure
// cwd-based scoping and its no-active-post fallback are exercised here.

import { describe, expect, it } from "vitest";
import type { listSessions } from "@anthropic-ai/claude-agent-sdk";

import { createSessionsService } from "./sessions";

const WORKTREE = "/repo/.worktrees/blog/2026-07-10_a-post";

function info(sessionId: string, cwd: string, lastModified: number) {
  return { sessionId, summary: sessionId, firstPrompt: "hi", lastModified, fileSize: 10, cwd };
}

/** A `listSessions` stub returning a fixed set regardless of the dir it's asked for. */
function fakeList(infos: ReturnType<typeof info>[]): typeof listSessions {
  return (async () => infos) as unknown as typeof listSessions;
}

// mtimes descend so the expected order is stable through toPickerViewModel's sort.
const ALL = [
  info("s-post", WORKTREE, 3),
  info("s-root", "/repo", 2),
  info("s-other", "/repo/.worktrees/blog/other-post", 1),
];

describe("createSessionsService scope", () => {
  it('"post" scope narrows to the active worktree', async () => {
    const svc = createSessionsService({
      blogRepoDir: "/repo",
      getActiveWorktreePath: () => WORKTREE,
      listSessionsImpl: fakeList(ALL),
    });
    expect((await svc.list("post")).map((s) => s.sessionId)).toEqual(["s-post"]);
  });

  it('"all" scope returns every session', async () => {
    const svc = createSessionsService({
      blogRepoDir: "/repo",
      getActiveWorktreePath: () => WORKTREE,
      listSessionsImpl: fakeList(ALL),
    });
    expect((await svc.list("all")).map((s) => s.sessionId)).toEqual(["s-post", "s-root", "s-other"]);
  });

  it('"post" scope falls back to everything when no post is open', async () => {
    const svc = createSessionsService({
      blogRepoDir: "/repo",
      getActiveWorktreePath: () => null,
      listSessionsImpl: fakeList(ALL),
    });
    expect(await svc.list("post")).toHaveLength(3);
  });
});
