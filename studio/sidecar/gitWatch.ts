// Concrete GitWatcher. Delegates to the studio-agnostic git-live library, so this is the one file
// in the sidecar that knows createGitLive exists; everything else depends on the GitWatcher seam.

import { createGitLive } from "../git-live";
import type { GitWatcher } from "../shared/seams";

export function createGitWatch(repoRoot: string): GitWatcher {
  return createGitLive({ repoRoot });
}
