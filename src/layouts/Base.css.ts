import { style } from "@vanilla-extract/css";

// Full-height flex column: nav + a centered `<main>` that spaces its children apart
// vertically. BlogPost.astro opts children out of the centering per-child via `alignSelf`.

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
