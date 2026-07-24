// Keeps a post worktree's node_modules pointed at the shared repo install when possible, and gives it a
// real one of its own when its package.json needs something the shared tree doesn't have. npm refuses
// to trust a symlinked node_modules root — even a no-op `npm install` unlinks it and reifies a real
// directory in its place — so the moment an agent adds a dependency for a post, that promotion has
// already happened on its own; this only has to decide whether a worktree is owed an install and run
// one, which is also how a freshly checked-out draft branch (one that already committed a dependency
// change, but has no node_modules yet at all) gets its own install instead of an incomplete symlink.

import { existsSync } from "node:fs";
import { readFile as nodeReadFile, symlink as nodeSymlink } from "node:fs/promises";
import path from "node:path";

const DEPENDENCY_FIELDS = ["dependencies", "devDependencies", "optionalDependencies", "overrides"] as const;

/** Byte-exact file ops, injectable so this is testable without touching disk or spawning npm. */
export interface NodeModulesSyncIo {
  exists(p: string): boolean;
  readFile(p: string): Promise<string>;
  symlink(target: string, link: string): Promise<void>;
}

const nodeIo: NodeModulesSyncIo = {
  exists: existsSync,
  readFile: (p) => nodeReadFile(p, "utf8"),
  symlink: (target, link) => nodeSymlink(target, link, "dir"),
};

export interface EnsureNodeModulesDeps {
  /** Post worktree (freshly created or being reactivated) to prepare node_modules for. */
  worktreePath: string;
  /** Repo root whose node_modules gets symlinked in the common (non-diverged) case. */
  repoRoot: string;
  /** Runs `npm install` in `cwd`; injected so tests never spawn a real npm process. */
  runNpmInstall: (cwd: string) => Promise<{ code: number; stderr: string }>;
  io?: NodeModulesSyncIo;
}

/**
 * Ready `<worktreePath>/node_modules` to serve: a symlink to the repo's shared install in the common
 * case, or a real install of its own when the worktree's package.json diverges from the root's. Safe to
 * call repeatedly (e.g. on every post activation) — the diverged branch's `npm install` is a fast no-op
 * once the worktree is already current, and the symlink branch skips once `node_modules` exists.
 */
export async function ensureNodeModules(deps: EnsureNodeModulesDeps): Promise<void> {
  const { worktreePath, repoRoot, runNpmInstall } = deps;
  const io = deps.io ?? nodeIo;
  const link = path.join(worktreePath, "node_modules");

  if (await manifestDiverges(worktreePath, repoRoot, io)) {
    const install = await runNpmInstall(worktreePath);
    if (install.code !== 0) {
      console.error(
        `[sidecar] npm install failed in ${worktreePath} (exit ${install.code})` +
          (install.stderr.trim() ? `: ${install.stderr.trim()}` : ""),
      );
    }
    return;
  }

  if (io.exists(link)) return;
  try {
    await io.symlink(path.join(repoRoot, "node_modules"), link);
  } catch (err) {
    // A race or pre-existing entry is fine; anything else is logged but non-fatal (Astro/agent tooling
    // fails more loudly if deps are missing).
    if ((err as NodeJS.ErrnoException).code !== "EEXIST") {
      console.error(`[sidecar] could not link node_modules into ${worktreePath}: ${(err as Error).message}`);
    }
  }
}

/** True when `worktreePath`'s package.json declares a different dependency graph than `repoRoot`'s. */
export async function manifestDiverges(worktreePath: string, repoRoot: string, io: NodeModulesSyncIo): Promise<boolean> {
  const [worktreePkg, rootPkg] = await Promise.all([
    readPackageJson(path.join(worktreePath, "package.json"), io),
    readPackageJson(path.join(repoRoot, "package.json"), io),
  ]);
  return DEPENDENCY_FIELDS.some(
    (field) => stableStringify(worktreePkg[field]) !== stableStringify(rootPkg[field]),
  );
}

async function readPackageJson(p: string, io: NodeModulesSyncIo): Promise<Record<string, unknown>> {
  if (!io.exists(p)) return {};
  try {
    return JSON.parse(await io.readFile(p));
  } catch {
    return {};
  }
}

/** Sorted-key JSON so two equivalent manifest sections compare equal regardless of key order. */
function stableStringify(value: unknown): string {
  if (Array.isArray(value)) return `[${value.map(stableStringify).join(",")}]`;
  if (value && typeof value === "object") {
    const obj = value as Record<string, unknown>;
    return `{${Object.keys(obj)
      .sort()
      .map((k) => `${JSON.stringify(k)}:${stableStringify(obj[k])}`)
      .join(",")}}`;
  }
  return JSON.stringify(value ?? null);
}
