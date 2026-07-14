// sha256 hex helper: the content hash carried in every DocRev. Kept tiny and
// dependency-free so both the store and the file watcher can agree on rev identity.

import { createHash } from "node:crypto";

/** Hex-encoded sha256 of `text`, decoded as UTF-8. */
export function sha256Hex(text: string): string {
  return createHash("sha256").update(text, "utf8").digest("hex");
}
