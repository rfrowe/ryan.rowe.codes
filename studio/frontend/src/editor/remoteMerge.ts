// Reconciles a remote write (an agent turn's native-tool edit, or a store-mediated rewrite like
// revert/revertUrl) landing on disk against a buffer that kept diverging locally in the meantime,
// so it doesn't blindly discard whatever the author typed elsewhere in the file while the write
// was in flight.

import { diffLines } from "diff";
import { ChangeSet } from "@codemirror/state";

export interface TextSpan {
  from: number;
  to: number;
  insert: string;
}

/** The single contiguous span where `a` and `b` differ, as a change against `a`. Null if equal. */
export function diffSpan(a: string, b: string): TextSpan | null {
  if (a === b) return null;
  const maxCommon = Math.min(a.length, b.length);
  let prefix = 0;
  while (prefix < maxCommon && a.charCodeAt(prefix) === b.charCodeAt(prefix)) prefix++;
  const maxSuffix = maxCommon - prefix;
  let suffix = 0;
  while (suffix < maxSuffix && a.charCodeAt(a.length - 1 - suffix) === b.charCodeAt(b.length - 1 - suffix)) {
    suffix++;
  }
  return { from: prefix, to: a.length - suffix, insert: b.slice(prefix, b.length - suffix) };
}

/**
 * Every changed span between `a` and `b`, one per line-hunk and each refined to its minimal
 * changed range via `diffSpan`, so two edits on different lines stay independent instead of
 * collapsing into one span that swallows the untouched text between them.
 */
export function diffSpans(a: string, b: string): TextSpan[] {
  const spans: TextSpan[] = [];
  let pos = 0;
  const parts = diffLines(a, b);
  let i = 0;
  while (i < parts.length) {
    if (!parts[i].added && !parts[i].removed) {
      pos += parts[i].value.length;
      i++;
      continue;
    }
    let oldChunk = "";
    let newChunk = "";
    while (i < parts.length && (parts[i].added || parts[i].removed)) {
      if (parts[i].removed) oldChunk += parts[i].value;
      if (parts[i].added) newChunk += parts[i].value;
      i++;
    }
    const refined = diffSpan(oldChunk, newChunk);
    if (refined) spans.push({ from: pos + refined.from, to: pos + refined.to, insert: refined.insert });
    pos += oldChunk.length;
  }
  return spans;
}

/**
 * Reposition a remote write (`base` to `remote`) onto `live`, a buffer that kept diverging from
 * `base` locally, instead of discarding `live`'s edits outright. A collision (both sides changing
 * the same line) concatenates rather than one silently overwriting the other.
 */
export function rebaseRemoteChange(base: string, remote: string, live: string): ChangeSet {
  const remoteSpans = diffSpans(base, remote);
  const remoteChanges = remoteSpans.length ? ChangeSet.of(remoteSpans, base.length) : ChangeSet.empty(base.length);
  const liveSpans = diffSpans(base, live);
  if (!liveSpans.length) return remoteChanges;
  return remoteChanges.map(ChangeSet.of(liveSpans, base.length));
}
