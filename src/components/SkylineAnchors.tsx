import { useEffect, useRef, useState } from "react";
import ConsoleTypist from "./ConsoleTypist";
import { toggleThemeMode } from "@styles/theme-script";
import * as styles from "./SkylineAnchors.css.ts";

/**
 * A provenance/craft overlay for the home-page Kerry Park skyline: it draws the anchor
 * points used to align the day and night photos. The night photo was perspective-warped
 * onto the day photo via a homography, so a given anchor lands at the SAME position in the
 * rendered webp for both themes -- only the coordinate label differs (the anchor's pixel
 * position in whichever original photo is showing). See `tools/` to regenerate all of this
 * for new photos.
 */

// Rendered webp dimensions (identical for day & night -- the night frame is aligned to it).
const IMG_W = 2400;
const IMG_H = 1508;

// The crop + scale that produced the rendered webp from the original day photo.
const CROP_X0 = 4;
const CROP_Y0 = 288;
const CROP_W = 3368;
const CROP_H = 2116;
const SCALE_X = IMG_W / CROP_W;
const SCALE_Y = IMG_H / CROP_H;

// Index-matched anchor pairs: `day` is the pixel position in the original day photo
// (4816x2408), `night` in the original night photo (5130x3108). `ERRS` is each pair's
// homography reprojection error in px (||H*night - day||).
const DAY_PTS: ReadonlyArray<readonly [number, number]> = [
  [1612, 483], [1406, 746], [1819, 748], [1644, 2004], [2244, 1017], [3398, 1990], [417, 883],
  [1632, 1053], [1899, 1210], [2176, 2007], [1509, 2004], [2946, 1972], [1633, 1387], [1468, 1234],
  [2425, 1270], [573, 1983], [690, 1750], [1038, 1807], [2076, 1209], [2091, 1214], [2429, 1964],
];

const NIGHT_PTS: ReadonlyArray<readonly [number, number]> = [
  [2584, 358], [2305, 709], [2856, 712], [2608, 2395], [3459, 1080], [4943, 2394], [1037, 887],
  [2602, 1120], [2998, 1334], [3323, 2409], [2427, 2390], [4176, 2345], [2599, 1568], [2414, 1363],
  [3696, 1423], [1211, 2344], [1370, 2040], [1819, 2120], [3230, 1335], [3248, 1342], [3493, 2330],
];

const ERRS: ReadonlyArray<number> = [
  33.8, 18.4, 23.4, 25.4, 12.0, 41.3, 14.8, 12.5, 27.1, 46.3, 18.5, 82.4, 8.6, 20.1, 23.5, 15.6,
  6.0, 3.8, 23.0, 21.7, 82.9,
];

interface Anchor {
  index: number;
  /** Position within the rendered webp (0..IMG_W, 0..IMG_H). */
  imgX: number;
  imgY: number;
  numLabel: string;
  dayLabel: string;
  nightLabel: string;
  errLabel: string;
}

const ANCHORS: Anchor[] = DAY_PTS.map(([dx, dy], i) => {
  const [nx, ny] = NIGHT_PTS[i];
  return {
    index: i,
    imgX: (dx - CROP_X0) * SCALE_X,
    imgY: (dy - CROP_Y0) * SCALE_Y,
    numLabel: `ANCHOR ${String(i + 1).padStart(2, "0")}`,
    dayLabel: `(${dx}, ${dy})`,
    nightLabel: `(${nx}, ${ny})`,
    errLabel: `ERR ${ERRS[i].toFixed(1)}px`,
  };
});

type Mode = "light" | "dark";

const isMode = (value: string | undefined): value is Mode => value === "light" || value === "dark";

const readThemeMode = (): Mode => (isMode(document.documentElement.dataset.theme) ? (document.documentElement.dataset.theme as Mode) : "dark");

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
  const offsetY = 0; // top

  const placed: PlacedAnchor[] = [];
  for (const anchor of ANCHORS) {
    const screenX = offsetX + anchor.imgX * scale;
    const screenY = offsetY + anchor.imgY * scale;
    if (screenX < 0 || screenX > width || screenY < 0 || screenY > height) {
      continue;
    }
    placed.push({ ...anchor, screenX, screenY });
  }
  return placed;
};

const SkylineAnchors = () => {
  const rootRef = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState<Size | null>(null);
  const [mode, setMode] = useState<Mode>("dark");
  const [hovered, setHovered] = useState<number | null>(null);
  // Sequenced reveal for the hovered anchor: 0 = typing "ANCHOR NN", 1 = typing the
  // coordinate, 2 = typing the error, 3 = done. Only the actively-typing line renders a
  // ConsoleTypist (with its cursor); completed lines are static text -- so the cursor
  // appears to "move" down from the anchor number to the coordinate to the error.
  const [stage, setStage] = useState(0);

  // Measure the container (the skyline image div this island is mounted inside) and keep the
  // marker positions in sync with every resize. The root element is `position: absolute;
  // inset: 0`, so its own box tracks the image div's content box exactly.
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

  // Stay theme-reactive so the coordinate label switches day<->night live when the theme is
  // toggled (via the nav toggle OR by clicking a marker). Marker positions are
  // theme-independent; only the coordinate text and the CSS accent colour change.
  useEffect(() => {
    const sync = () => setMode(readThemeMode());
    sync();

    const observer = new MutationObserver(sync);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
    return () => observer.disconnect();
  }, []);

  // Restart the sequence whenever the hovered anchor changes (including on un-hover -> null),
  // so returning to a marker re-types from "ANCHOR NN".
  useEffect(() => {
    setStage(0);
  }, [hovered]);

  const placed = size ? placeAnchors(size) : [];

  return (
    <div ref={rootRef} className={styles.root} aria-hidden="true">
      {placed.map(anchor => {
        const isActive = hovered === anchor.index;
        const coordLabel = mode === "light" ? anchor.dayLabel : anchor.nightLabel;
        return (
          <div key={anchor.index} className={styles.anchor} style={{ left: anchor.screenX, top: anchor.screenY }}>
            <button
              type="button"
              className={`${styles.marker}${isActive ? ` ${styles.markerActive}` : ""}`}
              aria-label={`Homography alignment anchor ${anchor.index + 1} — click to toggle theme`}
              onMouseEnter={() => setHovered(anchor.index)}
              onMouseLeave={() => setHovered(current => (current === anchor.index ? null : current))}
              onFocus={() => setHovered(anchor.index)}
              onBlur={() => setHovered(current => (current === anchor.index ? null : current))}
              onClick={() => toggleThemeMode()}
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
                  {stage === 0 ? (
                    <ConsoleTypist once key={`n${anchor.index}`} text={anchor.numLabel} onTypingFinished={() => setStage(1)} />
                  ) : (
                    anchor.numLabel
                  )}
                </div>
                {stage >= 1 && (
                  <div className={styles.readout}>
                    <div>
                      {stage === 1 ? (
                        <ConsoleTypist once key={`c${anchor.index}-${mode}`} text={coordLabel} onTypingFinished={() => setStage(2)} />
                      ) : (
                        coordLabel
                      )}
                    </div>
                    {stage >= 2 && (
                      <div>
                        <ConsoleTypist once key={`e${anchor.index}`} text={anchor.errLabel} />
                      </div>
                    )}
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
