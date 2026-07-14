// Slug helpers for the SPA. Re-exported from the pure, import-free shared module
// (studio/shared/slug.ts) so the browser, the sidecar store, and the MCP tools all derive a post's
// slug/stem identically. Kept as a thin re-export so the frontend's existing `./slug` imports
// (TabBar, NewPostDialog, CommandPalette) don't churn.

export { kebabSlug, postStem, slugFromPath, stemParts } from "../../shared/slug";
