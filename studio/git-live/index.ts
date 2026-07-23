// Public entry point for the git-live doorbell library. See gitLive.ts for the watch model and
// debounce, and resolveCommonGitDir.ts for how the watched directory is resolved.

export { createGitLive, type GitLive, type GitLiveOptions } from "./gitLive";
export { resolveCommonGitDir } from "./resolveCommonGitDir";
