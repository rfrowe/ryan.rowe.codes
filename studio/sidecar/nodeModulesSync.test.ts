// node_modules readiness tests: a fake IO holds in-memory package.json contents and symlink calls, and
// a fake npm-install spy records invocations, so the divergence check and the symlink-vs-install
// decision are exercised without touching disk or spawning a real npm.

import { describe, expect, it, vi } from "vitest";

import { ensureNodeModules, manifestDiverges, type NodeModulesSyncIo } from "./nodeModulesSync";

const ROOT = "/repo";
const WT = "/repo/.worktrees/blog/2026-01-01_post";

/** Fake byte-exact IO over an in-memory map of file contents; a path "exists" once it has content. */
function makeIo(files: Record<string, string> = {}) {
  const contents = new Map(Object.entries(files));
  const symlinks: Array<{ target: string; link: string }> = [];
  const io: NodeModulesSyncIo = {
    exists(p) {
      return contents.has(p);
    },
    async readFile(p) {
      const content = contents.get(p);
      if (content === undefined) throw new Error(`ENOENT: ${p}`);
      return content;
    },
    async symlink(target, link) {
      symlinks.push({ target, link });
      contents.set(link, "");
    },
  };
  return { io, symlinks, contents };
}

const pkg = (deps: Record<string, unknown>) => JSON.stringify(deps);

describe("manifestDiverges", () => {
  it("is false when both package.jsons declare the same dependencies", async () => {
    const { io } = makeIo({
      [`${WT}/package.json`]: pkg({ dependencies: { astro: "^7.0.0" } }),
      [`${ROOT}/package.json`]: pkg({ dependencies: { astro: "^7.0.0" } }),
    });
    expect(await manifestDiverges(WT, ROOT, io)).toBe(false);
  });

  it("ignores key order", async () => {
    const { io } = makeIo({
      [`${WT}/package.json`]: pkg({ dependencies: { react: "^19.0.0", astro: "^7.0.0" } }),
      [`${ROOT}/package.json`]: pkg({ dependencies: { astro: "^7.0.0", react: "^19.0.0" } }),
    });
    expect(await manifestDiverges(WT, ROOT, io)).toBe(false);
  });

  it("is true when the worktree declares an extra dependency", async () => {
    const { io } = makeIo({
      [`${WT}/package.json`]: pkg({ dependencies: { astro: "^7.0.0", "framer-motion": "^12.0.0" } }),
      [`${ROOT}/package.json`]: pkg({ dependencies: { astro: "^7.0.0" } }),
    });
    expect(await manifestDiverges(WT, ROOT, io)).toBe(true);
  });

  it("is true when a shared dependency's version differs", async () => {
    const { io } = makeIo({
      [`${WT}/package.json`]: pkg({ devDependencies: { vite: "^8.2.0" } }),
      [`${ROOT}/package.json`]: pkg({ devDependencies: { vite: "^8.1.4" } }),
    });
    expect(await manifestDiverges(WT, ROOT, io)).toBe(true);
  });

  it("is false when neither declares the field at all", async () => {
    const { io } = makeIo({
      [`${WT}/package.json`]: pkg({ dependencies: { astro: "^7.0.0" } }),
      [`${ROOT}/package.json`]: pkg({ dependencies: { astro: "^7.0.0" } }),
    });
    expect(await manifestDiverges(WT, ROOT, io)).toBe(false);
  });

  it("treats a missing package.json on both sides as declaring nothing", async () => {
    const { io } = makeIo();
    expect(await manifestDiverges(WT, ROOT, io)).toBe(false);
  });
});

describe("ensureNodeModules", () => {
  it("symlinks to the shared install when the manifests match and no node_modules exists yet", async () => {
    const { io, symlinks } = makeIo({
      [`${WT}/package.json`]: pkg({ dependencies: { astro: "^7.0.0" } }),
      [`${ROOT}/package.json`]: pkg({ dependencies: { astro: "^7.0.0" } }),
    });
    const runNpmInstall = vi.fn();

    await ensureNodeModules({ worktreePath: WT, repoRoot: ROOT, runNpmInstall, io });

    expect(symlinks).toEqual([{ target: `${ROOT}/node_modules`, link: `${WT}/node_modules` }]);
    expect(runNpmInstall).not.toHaveBeenCalled();
  });

  it("does nothing when the manifests match and node_modules already exists", async () => {
    const { io, symlinks } = makeIo({
      [`${WT}/package.json`]: pkg({ dependencies: { astro: "^7.0.0" } }),
      [`${ROOT}/package.json`]: pkg({ dependencies: { astro: "^7.0.0" } }),
      [`${WT}/node_modules`]: "",
    });
    const runNpmInstall = vi.fn();

    await ensureNodeModules({ worktreePath: WT, repoRoot: ROOT, runNpmInstall, io });

    expect(symlinks).toEqual([]);
    expect(runNpmInstall).not.toHaveBeenCalled();
  });

  it("runs npm install in the worktree instead of symlinking when the manifest diverges", async () => {
    const { io, symlinks } = makeIo({
      [`${WT}/package.json`]: pkg({ dependencies: { astro: "^7.0.0", "framer-motion": "^12.0.0" } }),
      [`${ROOT}/package.json`]: pkg({ dependencies: { astro: "^7.0.0" } }),
    });
    const runNpmInstall = vi.fn().mockResolvedValue({ code: 0, stderr: "" });

    await ensureNodeModules({ worktreePath: WT, repoRoot: ROOT, runNpmInstall, io });

    expect(runNpmInstall).toHaveBeenCalledWith(WT);
    expect(symlinks).toEqual([]);
  });

  it("still resolves (without throwing) when npm install fails", async () => {
    const { io } = makeIo({
      [`${WT}/package.json`]: pkg({ dependencies: { "framer-motion": "^12.0.0" } }),
      [`${ROOT}/package.json`]: pkg({ dependencies: {} }),
    });
    const runNpmInstall = vi.fn().mockResolvedValue({ code: 1, stderr: "boom" });
    const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    await expect(ensureNodeModules({ worktreePath: WT, repoRoot: ROOT, runNpmInstall, io })).resolves.toBeUndefined();
    expect(errorSpy).toHaveBeenCalledWith(expect.stringContaining("boom"));

    errorSpy.mockRestore();
  });
});
