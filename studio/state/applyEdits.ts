// Rev equality. Pure.

import type { DocRev } from "../shared/types";

/** Rev equality gating stale writes: compare both the counter and the content hash. */
export function revsEqual(a: DocRev, b: DocRev): boolean {
  return a.n === b.n && a.hash === b.hash;
}
