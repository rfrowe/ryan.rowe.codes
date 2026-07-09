import { style } from "@vanilla-extract/css";

/**
 * Reproduces the pre-migration `PageTemplate` (src/components/layout/template.tsx):
 * a full-height flex column holding the nav + a centered `<main>` that spaces its
 * children apart vertically. `BlogPost.astro` overrides `alignItems` per-child via
 * `alignSelf` rather than here, since only post pages needed `stretch`.
 */

export const container = style({
  minHeight: "100vh",
  display: "flex",
  flexDirection: "column",
});

export const main = style({
  flexGrow: 1,
  display: "flex",
  flexDirection: "column",
  justifyContent: "space-between",
  alignItems: "center",
});
