// Byte-faithful edit application and rev equality. Pure.

import type { DocRev, TextEdit } from "../shared/types";

export type ApplyEditsResult =
  | { ok: true; text: string }
  | { ok: false; error: "overlap" | "out-of-range" };

/**
 * Apply `edits` to `text`. All offsets are against the original text (not cumulative).
 * - Overlapping edits return { ok:false, error:"overlap" }.
 * - Any offset outside [0, text.length], or from > to, returns { ok:false, error:"out-of-range" }.
 * - On success, edits are composed so earlier regions are unaffected by later inserts.
 * No normalization of `text` (byte/char-faithful).
 */
export function applyEdits(text: string, edits: readonly TextEdit[]): ApplyEditsResult {
  const len = text.length;

  // Validate every edit against the original text before touching anything.
  for (const { from, to } of edits) {
    if (
      !Number.isInteger(from) ||
      !Number.isInteger(to) ||
      from < 0 ||
      to > len ||
      from > to
    ) {
      return { ok: false, error: "out-of-range" };
    }
  }

  // Sort a copy so composition is independent of the input array's order. Ties on
  // `from` order by `to` (shorter/empty range first) for a deterministic sweep.
  const sorted = [...edits].sort((a, b) => a.from - b.from || a.to - b.to);

  // Non-touching regions only: a later edit starting before the previous edit's end
  // is an overlap. Adjacent edits (prev.to === next.from) are allowed.
  for (let i = 1; i < sorted.length; i++) {
    if (sorted[i].from < sorted[i - 1].to) {
      return { ok: false, error: "overlap" };
    }
  }

  // Sweep left to right, copying the untouched gaps verbatim (byte/char-faithful).
  let result = "";
  let cursor = 0;
  for (const { from, to, insert } of sorted) {
    result += text.slice(cursor, from);
    result += insert;
    cursor = to;
  }
  result += text.slice(cursor);

  return { ok: true, text: result };
}

/** Rev equality gating stale writes: compare both the counter and the content hash. */
export function revsEqual(a: DocRev, b: DocRev): boolean {
  return a.n === b.n && a.hash === b.hash;
}
