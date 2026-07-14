// .worktreeinclude copier tests: a fake GitRunner drives the ls-files/check-ignore intersection and
// a fake IO records copies, so the selection and copy rules are exercised without git or a real disk.

import path from "node:path";

import { describe, expect, it } from "vitest";

import type { GitRunner, RunResult } from "../shared/seams";
import { copyWorktreeIncludes, type WorktreeIncludeIo } from "./worktreeInclude";

const SRC = "/repo";
const WT = "/repo/.worktrees/blog/2026-01-01_post";
const INCLUDE_FILE = `${SRC}/.worktreeinclude`;

// ls-files uses `-z` (NUL-delimited); check-ignore prints one path per line.
const nul = (...paths: string[]) => paths.map((p) => `${p}\0`).join("");
const nl = (...paths: string[]) => paths.map((p) => `${p}\n`).join("");

/** Fake GitRunner: ls-files yields the pattern matches, check-ignore the gitignored subset. */
function makeGit(res: { lsFiles?: string; checkIgnore?: string }): { git: GitRunner; calls: string[] } {
  const calls: string[] = [];
  const ok = (stdout: string, code = 0): RunResult => ({ stdout, stderr: "", code });
  const git: GitRunner = {
    async git(args) {
      calls.push(args.join(" "));
      // Match by membership: check-ignore is prefixed with `-c core.quotePath=false`.
      if (args.includes("ls-files")) return ok(res.lsFiles ?? "");
      // check-ignore exits 1 when nothing is ignored; the caller tolerates that.
      if (args.includes("check-ignore")) return ok(res.checkIgnore ?? "", res.checkIgnore ? 0 : 1);
      return ok("");
    },
    async gh() {
      return ok("");
    },
  };
  return { git, calls };
}

/** Fake byte-exact IO over an in-memory set of existing paths. */
function makeIo(existing: Iterable<string> = []) {
  const paths = new Set(existing);
  const copied: Array<{ src: string; dest: string }> = [];
  const mkdirs: string[] = [];
  const io: WorktreeIncludeIo = {
    async exists(p) {
      return paths.has(p);
    },
    async mkdirp(dir) {
      mkdirs.push(dir);
    },
    async copyFile(src, dest) {
      copied.push({ src, dest });
      paths.add(dest);
    },
  };
  return { io, copied, mkdirs };
}

describe("copyWorktreeIncludes", () => {
  it("copies files that both match a pattern and are gitignored, skipping matches git doesn't ignore", async () => {
    const { io, copied, mkdirs } = makeIo([INCLUDE_FILE]);
    // notes.txt matches a pattern but isn't gitignored, so it's excluded by the intersection.
    const { git, calls } = makeGit({ lsFiles: nul(".env.local", "notes.txt"), checkIgnore: nl(".env.local") });

    const result = await copyWorktreeIncludes({ git, srcRoot: SRC, worktreePath: WT, io });

    expect(result).toEqual([".env.local"]);
    expect(copied).toEqual([{ src: `${SRC}/.env.local`, dest: `${WT}/.env.local` }]);
    expect(mkdirs).toContain(WT);
    // The listing is untracked-only (-o) and matched against the .worktreeinclude patterns.
    expect(calls.some((c) => c === `ls-files -z -o -i --exclude-from ${INCLUDE_FILE}`)).toBe(true);
    expect(calls.some((c) => c.includes("check-ignore -- "))).toBe(true);
  });

  it("does nothing (and never touches git) when there is no .worktreeinclude", async () => {
    const { io, copied } = makeIo(); // include file absent
    const { git, calls } = makeGit({ lsFiles: nul(".env.local"), checkIgnore: nl(".env.local") });

    const result = await copyWorktreeIncludes({ git, srcRoot: SRC, worktreePath: WT, io });

    expect(result).toEqual([]);
    expect(copied).toEqual([]);
    expect(calls).toEqual([]);
  });

  it("never overwrites a file already present in the worktree", async () => {
    const { io, copied } = makeIo([INCLUDE_FILE, `${WT}/.env.local`]);
    const { git } = makeGit({ lsFiles: nul(".env.local"), checkIgnore: nl(".env.local") });

    const result = await copyWorktreeIncludes({ git, srcRoot: SRC, worktreePath: WT, io });

    expect(result).toEqual([]);
    expect(copied).toEqual([]);
  });

  it("refuses node_modules and the worktrees tree even when a pattern matches them", async () => {
    const { io, copied } = makeIo([INCLUDE_FILE]);
    const entries = ["node_modules/pkg/index.js", ".worktrees/x/.git", ".env.local"];
    const { git } = makeGit({ lsFiles: nul(...entries), checkIgnore: nl(...entries) });

    const result = await copyWorktreeIncludes({ git, srcRoot: SRC, worktreePath: WT, io });

    expect(result).toEqual([".env.local"]);
    expect(copied.map((c) => c.dest)).toEqual([`${WT}/.env.local`]);
  });

  it("creates nested parent directories for a copied file", async () => {
    const { io, copied, mkdirs } = makeIo([INCLUDE_FILE]);
    const { git } = makeGit({ lsFiles: nul("config/secrets.json"), checkIgnore: nl("config/secrets.json") });

    const result = await copyWorktreeIncludes({ git, srcRoot: SRC, worktreePath: WT, io });

    expect(result).toEqual(["config/secrets.json"]);
    expect(copied).toEqual([{ src: `${SRC}/config/secrets.json`, dest: `${WT}/config/secrets.json` }]);
    expect(mkdirs).toContain(path.join(WT, "config"));
  });
});
