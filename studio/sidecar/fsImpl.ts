// The `Fs` seam backed by the real filesystem (node:fs/promises). Injected into the
// store and file watcher so their logic stays unit-testable against an in-memory fake.

import { access, readFile, writeFile } from "node:fs/promises";
import type { Fs } from "../shared/seams";

export const nodeFs: Fs = {
  readFile(path) {
    return readFile(path, "utf8");
  },
  async writeFile(path, data) {
    await writeFile(path, data, "utf8");
  },
  async exists(path) {
    try {
      await access(path);
      return true;
    } catch {
      return false;
    }
  },
};
