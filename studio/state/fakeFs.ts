// Shared test doubles for the store tests: an in-memory `Fs` seam and a no-op git result. The two
// store test suites each build their own GitRunner fake and newStore around these.

import type { Fs, RunResult } from "../shared/seams";

/** A successful, empty git result, for stubbing GitRunner calls. */
export const ok: RunResult = { stdout: "", stderr: "", code: 0 };

/** In-memory `Fs` seam exposing its backing map so tests can seed and assert on disk state. */
export interface FakeFs extends Fs {
  store: Map<string, string>;
}

export function makeFs(seed: Record<string, string> = {}): FakeFs {
  const store = new Map(Object.entries(seed));
  return {
    store,
    async readFile(p) {
      const v = store.get(p);
      if (v === undefined) throw new Error(`ENOENT: ${p}`);
      return v;
    },
    async writeFile(p, data) {
      store.set(p, data);
    },
    async exists(p) {
      return store.has(p);
    },
  };
}
