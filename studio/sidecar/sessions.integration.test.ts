// Real-API integration test for the session picker. Reproduces a bug where every session the studio
// itself creates was invisible in both "post" and "all" scope: sessions.ts asked the SDK's
// listSessions to exclude "programmatic" sessions (the terminal/IDE-picker convention), but a
// query()-driven turn — exactly how the studio runs every agent turn — is itself an "sdk-ts"
// entrypoint the SDK classifies as programmatic. Unlike sessions.test.ts (which stubs listSessions
// entirely), this drives the real SDK end to end: a real turn writes a real on-disk transcript, then
// the unmocked createSessionsService/listSessions have to actually find it.
//
// Gated behind a funded key and STUDIO_E2E_AGENT=1, the same convention as the Playwright agent
// journey in studio/e2e/, so this never spends credits in ordinary CI or local runs.

import { existsSync, mkdtempSync, readFileSync, realpathSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";

import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { query } from "@anthropic-ai/claude-agent-sdk";

import { createSessionsService } from "./sessions";

function readKey(): string | null {
  const f = process.env.STUDIO_E2E_KEY_FILE || "/tmp/anthropic_key.txt";
  try {
    return existsSync(f) ? readFileSync(f, "utf8").trim() || null : null;
  } catch {
    return null;
  }
}

const key = readKey();
const RUN_AGENT = !!key && process.env.STUDIO_E2E_AGENT === "1";

describe.skipIf(!RUN_AGENT)("createSessionsService against a real SDK session", () => {
  let dir: string;

  beforeAll(async () => {
    process.env.ANTHROPIC_API_KEY = key as string;
    // realpath: the SDK records a session's cwd by its real path, and macOS's tmpdir is itself a
    // symlink (/var -> /private/var) — comparing against the non-realpath'd dir would never match.
    dir = realpathSync(mkdtempSync(path.join(tmpdir(), "sessions-integration-")));
    // Cheapest real turn that still produces a transcript: low effort, minimal prompt, no tool use.
    for await (const _msg of query({
      prompt: "Reply with exactly the word: pong",
      options: { cwd: dir, model: "claude-sonnet-5", effort: "low", permissionMode: "bypassPermissions" },
    })) {
      // Draining the stream is all this needs — the transcript it leaves on disk is the fixture.
    }
  }, 60_000);

  afterAll(() => {
    rmSync(dir, { recursive: true, force: true });
  });

  it("surfaces the studio's own session in both post and all scope", async () => {
    const sessions = createSessionsService({ blogRepoDir: dir, getActiveWorktreePath: () => dir });

    expect(await sessions.list("post")).not.toHaveLength(0);
    expect(await sessions.list("all")).not.toHaveLength(0);
  });
});
