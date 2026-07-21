import { access } from "node:fs/promises";

/** Whether `p` exists and is accessible on disk. */
export async function pathExists(p: string): Promise<boolean> {
  try {
    await access(p);
    return true;
  } catch {
    return false;
  }
}
