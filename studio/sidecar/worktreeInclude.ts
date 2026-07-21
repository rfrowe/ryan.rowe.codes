// Honors the `.worktreeinclude` convention when the studio creates a post worktree: gitignored files
// the fresh checkout wouldn't otherwise carry (e.g. `.env.local`) are copied in from the launch tree.
// The file at the source root uses `.gitignore` syntax; a path is copied only when it both matches a
// pattern and is gitignored, so tracked files are never duplicated. node_modules is out of scope here
// (large and regenerable; the sidecar symlinks it separately).

import { copyFile as nodeCopyFile, mkdir } from "node:fs/promises";
import path from "node:path";

import type { GitRunner } from "../shared/seams";
import { pathExists } from "./pathExists";

const WORKTREEINCLUDE_FILE = ".worktreeinclude";

// Refused regardless of what a pattern matches: huge/regenerable trees, and the worktrees tree itself
// (copying it into a worktree would recurse). Prefixes are repo-relative, POSIX-separated.
const NEVER_COPY_PREFIXES = ["node_modules/", ".git/", ".worktrees/"];

/** Byte-exact file ops, injectable so the copier is testable without touching disk. */
export interface WorktreeIncludeIo {
  exists(p: string): Promise<boolean>;
  /** Create `dir` and any missing parents. */
  mkdirp(dir: string): Promise<void>;
  copyFile(src: string, dest: string): Promise<void>;
}

const nodeIo: WorktreeIncludeIo = {
  exists(p) {
    return pathExists(p);
  },
  async mkdirp(dir) {
    await mkdir(dir, { recursive: true });
  },
  copyFile: (src, dest) => nodeCopyFile(src, dest),
};

export interface CopyWorktreeIncludesDeps {
  git: GitRunner;
  /** Tree to copy gitignored files out of (the studio's launch root). */
  srcRoot: string;
  /** Freshly-created worktree to copy them into. */
  worktreePath: string;
  io?: WorktreeIncludeIo;
}

/**
 * Copy the gitignored files that `<srcRoot>/.worktreeinclude` selects into a new worktree. Returns the
 * repo-relative paths copied. No-op when the file is absent. Never overwrites a file already in the
 * worktree. Best-effort: a per-file copy error is logged, not thrown, so worktree setup still proceeds.
 */
export async function copyWorktreeIncludes(deps: CopyWorktreeIncludesDeps): Promise<string[]> {
  const { git, srcRoot, worktreePath } = deps;
  const io = deps.io ?? nodeIo;

  const includeFile = path.join(srcRoot, WORKTREEINCLUDE_FILE);
  if (!(await io.exists(includeFile))) return [];

  // Untracked files matching the include patterns. `-o` (others) drops tracked files, so a pattern
  // that names a tracked file selects nothing; `-z` keeps unusual filenames intact.
  const listed = await git.git(["ls-files", "-z", "-o", "-i", "--exclude-from", includeFile], { cwd: srcRoot });
  const candidates = splitNul(listed.stdout);
  if (candidates.length === 0) return [];

  // Keep only the ones git actually ignores. A candidate matching a pattern but not gitignored (say, a
  // new file meant for a commit) is left alone. check-ignore prints the ignored subset, one per line
  // (`-z` there needs `--stdin`, which the runner can't feed); exit 1 means none matched, not an error.
  // `core.quotePath=false` keeps non-ASCII paths unquoted so they match the candidate strings.
  const checked = await git.git(["-c", "core.quotePath=false", "check-ignore", "--", ...candidates], { cwd: srcRoot });
  const ignored = new Set(
    checked.stdout
      .split("\n")
      .map((s) => s.trim())
      .filter((s) => s.length > 0),
  );

  const copied: string[] = [];
  for (const rel of candidates) {
    if (!ignored.has(rel)) continue;
    const posixRel = rel.split(path.sep).join("/");
    if (NEVER_COPY_PREFIXES.some((prefix) => posixRel.startsWith(prefix))) continue;

    const dest = path.join(worktreePath, rel);
    if (await io.exists(dest)) continue;
    try {
      await io.mkdirp(path.dirname(dest));
      await io.copyFile(path.join(srcRoot, rel), dest);
      copied.push(rel);
    } catch (err) {
      console.error(
        `[sidecar] .worktreeinclude: could not copy ${rel} into ${worktreePath}: ${(err as Error).message}`,
      );
    }
  }
  return copied;
}

/** Split a NUL-delimited `-z` git listing into trimmed, non-empty entries. */
function splitNul(out: string): string[] {
  return out
    .split("\0")
    .map((s) => s.trim())
    .filter((s) => s.length > 0);
}
