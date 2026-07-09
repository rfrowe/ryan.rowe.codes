/**
 * Phase 8 verification config: the explicit old (live Gatsby) -> new (local Astro) URL
 * map, capture matrix (viewports x theme states), and shared tolerance knobs.
 *
 * The URL map is explicit rather than derived (e.g. "same path on both hosts") because
 * the migration deliberately changed post URLs from `/blog/<slug>` to
 * `/blog/<created_at-date>/<slug>` (see `src/lib/blog.ts`); a naive same-path diff would
 * compare the live post against the new site's 404 page for every post pair.
 */

export const LIVE_ORIGIN = "https://ryan.rowe.codes";

/** name -> { live: path on LIVE_ORIGIN, local: path on the local preview server } */
export const URL_PAIRS = [
  { name: "index", live: "/", local: "/" },
  { name: "algorithmic-art", live: "/blog/algorithmic-art", local: "/blog/2017-01-01/algorithmic-art" },
  { name: "hello-world", live: "/blog/hello-world", local: "/blog/2022-03-12/hello-world" },
];

export const VIEWPORTS = [
  { name: "375", width: 375, height: 1200 },
  { name: "768", width: 768, height: 1200 },
  { name: "1280", width: 1280, height: 1200 },
];

/**
 * Theme states per the plan: two system-driven states plus a persisted override that
 * exercises the distinct "explicit localStorage wins over OS preference" code path on
 * both sites (pre-migration `ThemeModeProvider` and the ported no-flash script both read
 * the same `themeMode` localStorage key -- see `src/styles/theme-script.ts`).
 *
 * `toggled-override` deliberately picks a system scheme (dark) and an override that
 * diverges from it (light), so the state is distinguishable from both pure-system states.
 */
export const THEME_STATES = [
  { name: "system-light", colorScheme: "light", overrideMode: null },
  { name: "system-dark", colorScheme: "dark", overrideMode: null },
  { name: "toggled-override", colorScheme: "dark", overrideMode: "light" },
];

export const THEME_STORAGE_KEY = "themeMode";

/**
 * Tolerance for the visual diff gate: fraction of compared pixels that may differ
 * (after a per-pixel color-distance threshold that already absorbs anti-aliasing /
 * subpixel font-rendering noise) before a pair is flagged as NOT "substantially
 * similar". This is intentionally generous -- the ported app shell is a from-scratch
 * vanilla-extract reproduction of MUI's stock theme, not a byte-for-byte port, so minor
 * spacing/font-metric drift across environments is expected and accepted per the plan.
 */
export const MAX_DIFF_RATIO = 0.35;

/** Per-pixel color-distance threshold passed to pixelmatch (0-1; higher = more lenient). */
export const PIXELMATCH_THRESHOLD = 0.3;

export const ARTIFACTS_DIR = "verification/screenshots";
