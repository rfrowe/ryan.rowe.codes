import { useEffect, useRef, useState } from "react";
import ConsoleTypist from "./ConsoleTypist";
import * as styles from "./SkylineAnchors.css.ts";

/**
 * A provenance/craft overlay for the home-page Kerry Park skyline: it draws the 11 anchor
 * points used to align the day and night photos. The night photo was perspective-warped
 * onto the day photo via a homography, so a given anchor lands at the SAME position in the
 * rendered webp for both themes -- only the *coordinate label* differs (the anchor's pixel
 * position in whichever original photo is showing).
 *
 * The rendered webp (`public/seattle-{day,night}.webp`, 2400x1454) was produced by cropping
 * the original day photo to origin (4, 252), size 3552x2152, then scaling to 2400x1454. So
 * each anchor's position in the rendered image is derived from its original day-photo pixel
 * below, rather than hardcoded.
 */

// Rendered webp dimensions (identical for day & night -- the night frame is aligned to it).
const IMG_W = 2400;
const IMG_H = 1454;

// The crop + scale that produced the rendered webp from the original day photo.
const CROP_X0 = 4;
const CROP_Y0 = 252;
const CROP_W = 3552;
const CROP_H = 2152;
const SCALE_X = IMG_W / CROP_W;
const SCALE_Y = IMG_H / CROP_H;

// Index-matched anchor pairs. `day` is the pixel position in the original day photo
// (4816x2408), `night` in the original night photo (5130x3108).
const DAY_PTS: ReadonlyArray<readonly [number, number]> = [
  [1609, 489],
  [1395, 745],
  [1809, 757],
  [1590, 1996],
  [2279, 1027],
  [3364, 1999],
  [407, 901],
  [1632, 1048],
  [1882, 1215],
  [2167, 1991],
  [1528, 1984],
];

const NIGHT_PTS: ReadonlyArray<readonly [number, number]> = [
  [2598, 326],
  [2318, 718],
  [2822, 720],
  [2619, 2423],
  [3477, 1083],
  [4874, 2413],
  [1068, 853],
  [2575, 1111],
  [2985, 1360],
  [3294, 2412],
  [2418, 2364],
];

interface Anchor {
  index: number;
  /** Position within the rendered webp (0..IMG_W, 0..IMG_H). */
  imgX: number;
  imgY: number;
  /** Coordinate label to show in each theme (the original-photo pixel position). */
  dayLabel: string;
  nightLabel: string;
}

// Precompute each anchor's rendered-image position from the crop/scale constants.
const ANCHORS: Anchor[] = DAY_PTS.map(([dx, dy], i) => {
  const [nx, ny] = NIGHT_PTS[i];
  return {
    index: i,
    imgX: (dx - CROP_X0) * SCALE_X,
    imgY: (dy - CROP_Y0) * SCALE_Y,
    dayLabel: `(${dx}, ${dy})`,
    nightLabel: `(${nx}, ${ny})`,
  };
});

type Mode = "light" | "dark";

const isMode = (value: string | undefined): value is Mode => value === "light" || value === "dark";

interface Size {
  width: number;
  height: number;
}

interface PlacedAnchor extends Anchor {
  screenX: number;
  screenY: number;
}

/**
 * Replicate the background's `background-size: cover` + `background-position: center top`
 * mapping EXACTLY, so a marker sits precisely on the photo feature it references. Anchors
 * that fall outside the visible (cover-cropped) area are culled.
 */
const placeAnchors = ({ width, height }: Size): PlacedAnchor[] => {
  if (width <= 0 || height <= 0) {
    return [];
  }

  const scale = Math.max(width / IMG_W, height / IMG_H);
  const renderedW = IMG_W * scale;
  const renderedH = IMG_H * scale;
  const offsetX = (width - renderedW) * 0.5; // center
  const offsetY = (height - renderedH) * 0; // top

  const placed: PlacedAnchor[] = [];
  for (const anchor of ANCHORS) {
    const screenX = offsetX + anchor.imgX * scale;
    const screenY = offsetY + anchor.imgY * scale;
    // Cull anything outside the visible container box.
    if (screenX < 0 || screenX > width || screenY < 0 || screenY > height) {
      continue;
    }
    placed.push({ ...anchor, screenX, screenY });
  }
  return placed;
};

const readThemeMode = (): Mode => (isMode(document.documentElement.dataset.theme) ? (document.documentElement.dataset.theme as Mode) : "dark");

const SkylineAnchors = () => {
  const rootRef = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState<Size | null>(null);
  const [mode, setMode] = useState<Mode>("dark");
  const [hovered, setHovered] = useState<number | null>(null);
  // Two-stage typed reveal for the hovered anchor: "Anchor N" types first, then the
  // coordinate. `numTyped` flips true when the "Anchor N" line finishes; it resets whenever
  // the hovered anchor changes (below) so leaving and re-entering re-types from scratch.
  const [numTyped, setNumTyped] = useState(false);

  // Measure the container (the skyline image div this island is mounted inside) and keep the
  // marker positions in sync with every resize. The root element is `position: absolute;
  // inset: 0`, so its own box already tracks the image div's content box exactly (its
  // containing block is the image div, which is `position: relative`) -- measuring the root
  // directly avoids the `<astro-island>` wrapper in between, which is a zero-size inline
  // element (its only child is out of flow).
  useEffect(() => {
    const root = rootRef.current;
    if (!root) {
      return;
    }

    const measure = () => {
      const rect = root.getBoundingClientRect();
      setSize({ width: rect.width, height: rect.height });
    };

    measure();

    const observer = new ResizeObserver(measure);
    observer.observe(root);
    return () => observer.disconnect();
  }, []);

  // Stay theme-reactive so the coordinate label switches day<->night live when the toggle is
  // used. There's no shared theme context under Astro -- ThemeToggle mutates `data-theme` on
  // <html> directly -- so a MutationObserver is the way to observe it (same pattern as the
  // quine CodeBlock and the cube renderer). Marker positions are theme-independent; only the
  // label text changes.
  useEffect(() => {
    const documentElement = document.documentElement;

    const sync = () => setMode(readThemeMode());
    sync();

    const observer = new MutationObserver(sync);
    observer.observe(documentElement, { attributes: true, attributeFilter: ["data-theme"] });
    return () => observer.disconnect();
  }, []);

  // Restart the two-stage typing whenever the hovered anchor changes (including on un-hover
  // -> null), so returning to a marker re-types "Anchor N" and then the coordinate.
  useEffect(() => {
    setNumTyped(false);
  }, [hovered]);

  const placed = size ? placeAnchors(size) : [];

  return (
    <div ref={rootRef} className={styles.root} aria-hidden="true">
      {placed.map(anchor => {
        const isActive = hovered === anchor.index;
        const label = mode === "light" ? anchor.dayLabel : anchor.nightLabel;
        return (
          <div key={anchor.index} className={styles.anchor} style={{ left: anchor.screenX, top: anchor.screenY }}>
            <button
              type="button"
              className={`${styles.marker}${isActive ? ` ${styles.markerActive}` : ""}`}
              aria-label={`Homography alignment anchor ${anchor.index + 1}`}
              onMouseEnter={() => setHovered(anchor.index)}
              onMouseLeave={() => setHovered(current => (current === anchor.index ? null : current))}
              onFocus={() => setHovered(anchor.index)}
              onBlur={() => setHovered(current => (current === anchor.index ? null : current))}
            >
              <svg className={styles.markerSvg} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} aria-hidden="true">
                <rect x={4} y={4} width={16} height={16} rx={1} />
                <line x1={12} y1={8} x2={12} y2={16} />
                <line x1={8} y1={12} x2={16} y2={12} />
              </svg>
            </button>
            {isActive && (
              <>
                <div className={styles.anchorNum}>
                  <ConsoleTypist
                    once
                    key={`num-${anchor.index}`}
                    text={`ANCHOR ${String(anchor.index + 1).padStart(2, "0")}`}
                    onTypingFinished={() => setNumTyped(true)}
                  />
                </div>
                {numTyped && (
                  <div className={styles.tooltip}>
                    <ConsoleTypist once key={`coord-${anchor.index}-${mode}`} text={label} />
                  </div>
                )}
              </>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default SkylineAnchors;
