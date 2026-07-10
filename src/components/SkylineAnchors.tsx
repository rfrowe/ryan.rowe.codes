import { useCallback, useEffect, useRef, useState } from "react";
import Delaunator from "delaunator";
import ConsoleTypist from "./ConsoleTypist";
import { toggleThemeMode } from "@styles/theme-script";
import { transitions } from "@styles/theme.css.ts";
import * as styles from "./SkylineAnchors.css.ts";

/**
 * Interactive home-page skyline banner: a day (light) / night (dark) Kerry Park photo pair
 * aligned by a homography on 21 hand-picked anchors. A theme toggle animates a single progress
 * value `t` (0 = day, 1 = night) that both cross-dissolves a WebGL triangle-mesh morph of the
 * two photos and glides the anchor markers along the same path. Each marker types out its
 * anchor's coordinate and alignment error, and toggles the theme on click.
 */

// Rendered webp dimensions + the crop/scale that produced them from the original day photo.
const IMG_W = 2400;
const IMG_H = 1508;
const CROP_X0 = 4;
const CROP_Y0 = 288;
const CROP_W = 3368;
const CROP_H = 2116;
const SCALE_X = IMG_W / CROP_W;
const SCALE_Y = IMG_H / CROP_H;

// Shared with the whole-site theme crossfade (global.css.ts) so photo, anchors, and palette
// all swap on one beat.
const MORPH_MS = transitions.duration.theme;

// Half the marker box (keep in sync with MARKER/2 in SkylineAnchors.css.ts). Culls any anchor
// whose box would extend past an image edge, so no marker is ever clipped.
const MARKER_HALF = 26;

// Index-matched anchors. `DAY_PTS`/`NIGHT_PTS` are pixel coords in each original photo (the
// coordinate labels); `NIGHT_WARPED_PTS` is each night anchor pushed through the homography
// into the day frame -- where it lands in the rendered night webp. `ERRS` is the per-anchor
// residual ||warped_night - day|| in px.
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

const NIGHT_WARPED_PTS: ReadonlyArray<readonly [number, number]> = [
  [1585, 503], [1388, 749], [1796, 754], [1667, 2015], [2256, 1019], [3439, 1992], [427, 872],
  [1621, 1047], [1925, 1204], [2221, 2019], [1525, 2013], [2864, 1962], [1633, 1378], [1486, 1226],
  [2448, 1269], [558, 1988], [686, 1746], [1042, 1806], [2099, 1205], [2112, 1210], [2346, 1956],
];

const ERRS: ReadonlyArray<number> = [
  33.8, 18.4, 23.4, 25.4, 12.0, 41.3, 14.8, 12.5, 27.1, 46.3, 18.5, 82.4, 8.6, 20.1, 23.5, 15.6,
  6.0, 3.8, 23.0, 21.7, 82.9,
];

// Map an original-photo pixel coordinate into rendered-webp pixel space (0..IMG_W, 0..IMG_H).
const toImg = (px: number, py: number): [number, number] => [(px - CROP_X0) * SCALE_X, (py - CROP_Y0) * SCALE_Y];

interface Anchor {
  index: number;
  // Feature position in the rendered webp for each theme (webp px). Day uses the day photo's
  // coordinate; night uses the homography-warped night coordinate.
  dayImgX: number;
  dayImgY: number;
  nightImgX: number;
  nightImgY: number;
  numLabel: string;
  dayLabel: string;
  nightLabel: string;
  errLabel: string;
}

const ANCHORS: Anchor[] = DAY_PTS.map(([dx, dy], i) => {
  const [nx, ny] = NIGHT_PTS[i];
  const [wx, wy] = NIGHT_WARPED_PTS[i];
  const [dayImgX, dayImgY] = toImg(dx, dy);
  const [nightImgX, nightImgY] = toImg(wx, wy);
  return {
    index: i,
    dayImgX,
    dayImgY,
    nightImgX,
    nightImgY,
    numLabel: `ANCHOR ${String(i + 1).padStart(2, "0")}`,
    dayLabel: `(${dx}, ${dy})`,
    nightLabel: `(${nx}, ${ny})`,
    errLabel: `ERR ${ERRS[i].toFixed(1)}px`,
  };
});

type Mode = "light" | "dark";

const isMode = (value: string | undefined): value is Mode => value === "light" || value === "dark";
const readThemeMode = (): Mode => (isMode(document.documentElement.dataset.theme) ? document.documentElement.dataset.theme : "dark");

const easeInOut = (p: number): number => (p < 0.5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2);

// --- Morph mesh -----------------------------------------------------------------------
// Control points in webp px, each with a day position (a) and night position (b). Anchors
// differ between the two; boundary points are identity so the frame edges stay put and the
// triangulation covers the whole image. The morph interpolates a->b by `t`.
interface CtrlPt {
  ax: number;
  ay: number;
  bx: number;
  by: number;
}

const buildMesh = (): { pts: CtrlPt[]; triangles: Uint16Array } => {
  const pts: CtrlPt[] = ANCHORS.map(a => ({ ax: a.dayImgX, ay: a.dayImgY, bx: a.nightImgX, by: a.nightImgY }));
  // Boundary ring (identity: ax===bx, ay===by) so the mesh spans the full webp and the low-
  // anchor sky/foreground don't get dragged around by the skyline anchors.
  const EDGE = 6;
  for (let i = 0; i <= EDGE; i++) {
    const fx = (i / EDGE) * IMG_W;
    const fy = (i / EDGE) * IMG_H;
    pts.push({ ax: fx, ay: 0, bx: fx, by: 0 });
    pts.push({ ax: fx, ay: IMG_H, bx: fx, by: IMG_H });
    if (i > 0 && i < EDGE) {
      pts.push({ ax: 0, ay: fy, bx: 0, by: fy });
      pts.push({ ax: IMG_W, ay: fy, bx: IMG_W, by: fy });
    }
  }
  const coords: number[] = [];
  for (const p of pts) {
    coords.push((p.ax + p.bx) / 2, (p.ay + p.by) / 2);
  }
  const d = new Delaunator(Float64Array.from(coords));
  return { pts, triangles: Uint16Array.from(d.triangles) };
};

const MESH = buildMesh();

// --- WebGL ----------------------------------------------------------------------------
const VERT_SRC = `
attribute vec2 aA;
attribute vec2 aB;
uniform float uT;
uniform float uUseB;
uniform float uScale;
uniform vec2 uOffset;
uniform vec2 uCanvas;
uniform vec2 uImg;
varying vec2 vUv;
void main() {
  vec2 m = mix(aA, aB, uT);
  vec2 screen = m * uScale + uOffset;
  vec2 clip = (screen / uCanvas) * 2.0 - 1.0;
  gl_Position = vec4(clip.x, -clip.y, 0.0, 1.0);
  vUv = mix(aA, aB, uUseB) / uImg;
}`;

const FRAG_SRC = `
precision mediump float;
uniform sampler2D uTex;
uniform float uAlpha;
varying vec2 vUv;
void main() {
  vec4 c = texture2D(uTex, vUv);
  gl_FragColor = vec4(c.rgb * uAlpha, uAlpha);
}`;

const compile = (gl: WebGLRenderingContext, type: number, src: string): WebGLShader | null => {
  const sh = gl.createShader(type);
  if (!sh) return null;
  gl.shaderSource(sh, src);
  gl.compileShader(sh);
  return gl.getShaderParameter(sh, gl.COMPILE_STATUS) ? sh : null;
};

const createProgram = (gl: WebGLRenderingContext): WebGLProgram | null => {
  const vs = compile(gl, gl.VERTEX_SHADER, VERT_SRC);
  const fs = compile(gl, gl.FRAGMENT_SHADER, FRAG_SRC);
  if (!vs || !fs) return null;
  const prog = gl.createProgram();
  if (!prog) return null;
  gl.attachShader(prog, vs);
  gl.attachShader(prog, fs);
  gl.linkProgram(prog);
  return gl.getProgramParameter(prog, gl.LINK_STATUS) ? prog : null;
};

const makeTexture = (gl: WebGLRenderingContext, img: HTMLImageElement): WebGLTexture | null => {
  const tex = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, tex);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img);
  return tex;
};

interface GLState {
  gl: WebGLRenderingContext;
  prog: WebGLProgram;
  loc: {
    aA: number;
    aB: number;
    uT: WebGLUniformLocation | null;
    uUseB: WebGLUniformLocation | null;
    uScale: WebGLUniformLocation | null;
    uOffset: WebGLUniformLocation | null;
    uCanvas: WebGLUniformLocation | null;
    uImg: WebGLUniformLocation | null;
    uTex: WebGLUniformLocation | null;
    uAlpha: WebGLUniformLocation | null;
  };
  bufA: WebGLBuffer;
  bufB: WebGLBuffer;
  bufIdx: WebGLBuffer;
  count: number;
  texDay: WebGLTexture | null;
  texNight: WebGLTexture | null;
  ready: boolean;
}

interface Size {
  w: number;
  h: number;
}

const SkylineAnchors = () => {
  const rootRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const glRef = useRef<GLState | null>(null);
  const rafRef = useRef(0);
  const tRef = useRef(1); // 0 = day, 1 = night (dark default)
  const sizeRef = useRef<Size | null>(null);

  const [size, setSize] = useState<Size | null>(null);
  const [t, setT] = useState(1);
  const [mode, setMode] = useState<Mode>("dark");
  const [hovered, setHovered] = useState<number | null>(null);
  const [pinned, setPinned] = useState<number | null>(null);
  // Sequenced typewriter reveal for the selected anchor: 0 = "ANCHOR NN", 1 = coordinate,
  // 2 = error, 3 = done. Only the actively-typing line renders a ConsoleTypist (cursor);
  // completed lines are static, so the cursor appears to walk down the readout.
  const [stage, setStage] = useState(0);

  // Click-to-toggle pins that anchor selected so it stays lit and re-types while it glides;
  // pointer hover always wins and releases the pin.
  const active = hovered ?? pinned;

  // Draw the current morph frame. Pure imperative (reads refs), so it's safe to call from
  // rAF, ResizeObserver, and texture-load without stale closures.
  const draw = useCallback(() => {
    const s = glRef.current;
    const sz = sizeRef.current;
    const canvas = canvasRef.current;
    if (!s || !s.ready || !sz || !canvas || sz.w <= 0 || sz.h <= 0) {
      return;
    }
    const { gl, prog, loc } = s;
    const tv = tRef.current;

    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.clearColor(0, 0, 0, 1);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.useProgram(prog);

    gl.bindBuffer(gl.ARRAY_BUFFER, s.bufA);
    gl.enableVertexAttribArray(loc.aA);
    gl.vertexAttribPointer(loc.aA, 2, gl.FLOAT, false, 0, 0);
    gl.bindBuffer(gl.ARRAY_BUFFER, s.bufB);
    gl.enableVertexAttribArray(loc.aB);
    gl.vertexAttribPointer(loc.aB, 2, gl.FLOAT, false, 0, 0);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, s.bufIdx);

    const scale = Math.max(sz.w / IMG_W, sz.h / IMG_H);
    const dpr = canvas.width / sz.w;
    gl.uniform1f(loc.uScale, scale * dpr);
    gl.uniform2f(loc.uOffset, ((sz.w - IMG_W * scale) / 2) * dpr, 0);
    gl.uniform2f(loc.uCanvas, canvas.width, canvas.height);
    gl.uniform2f(loc.uImg, IMG_W, IMG_H);
    gl.uniform1f(loc.uT, tv);

    gl.enable(gl.BLEND);
    gl.blendFunc(gl.ONE, gl.ONE); // additive: day*(1-t) + night*t
    gl.activeTexture(gl.TEXTURE0);
    gl.uniform1i(loc.uTex, 0);

    gl.uniform1f(loc.uUseB, 0);
    gl.uniform1f(loc.uAlpha, 1 - tv);
    gl.bindTexture(gl.TEXTURE_2D, s.texDay);
    gl.drawElements(gl.TRIANGLES, s.count, gl.UNSIGNED_SHORT, 0);

    gl.uniform1f(loc.uUseB, 1);
    gl.uniform1f(loc.uAlpha, tv);
    gl.bindTexture(gl.TEXTURE_2D, s.texNight);
    gl.drawElements(gl.TRIANGLES, s.count, gl.UNSIGNED_SHORT, 0);
  }, []);

  // Animate `t` toward a target over MORPH_MS, redrawing the canvas and nudging the anchors
  // (setT) every frame so both stay frame-locked.
  const startMorph = useCallback(
    (target: number) => {
      const from = tRef.current;
      if (from === target) {
        return;
      }
      cancelAnimationFrame(rafRef.current);
      const start = performance.now();
      const step = (now: number) => {
        const p = Math.min((now - start) / MORPH_MS, 1);
        tRef.current = from + (target - from) * easeInOut(p);
        setT(tRef.current);
        draw();
        if (p < 1) {
          rafRef.current = requestAnimationFrame(step);
        }
      };
      rafRef.current = requestAnimationFrame(step);
    },
    [draw],
  );

  // One-time WebGL setup + texture load. If WebGL is unavailable the morph is skipped (the
  // CSS background-image on `.image` remains) but the anchor markers still animate.
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) {
      return;
    }
    const gl = canvas.getContext("webgl", { alpha: false, antialias: true });
    if (!gl) {
      return;
    }
    const prog = createProgram(gl);
    if (!prog) {
      return;
    }

    const posA = new Float32Array(MESH.pts.length * 2);
    const posB = new Float32Array(MESH.pts.length * 2);
    MESH.pts.forEach((p, i) => {
      posA[i * 2] = p.ax;
      posA[i * 2 + 1] = p.ay;
      posB[i * 2] = p.bx;
      posB[i * 2 + 1] = p.by;
    });
    const bufA = gl.createBuffer();
    const bufB = gl.createBuffer();
    const bufIdx = gl.createBuffer();
    if (!bufA || !bufB || !bufIdx) {
      return;
    }
    gl.bindBuffer(gl.ARRAY_BUFFER, bufA);
    gl.bufferData(gl.ARRAY_BUFFER, posA, gl.STATIC_DRAW);
    gl.bindBuffer(gl.ARRAY_BUFFER, bufB);
    gl.bufferData(gl.ARRAY_BUFFER, posB, gl.STATIC_DRAW);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, bufIdx);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, MESH.triangles, gl.STATIC_DRAW);

    glRef.current = {
      gl,
      prog,
      loc: {
        aA: gl.getAttribLocation(prog, "aA"),
        aB: gl.getAttribLocation(prog, "aB"),
        uT: gl.getUniformLocation(prog, "uT"),
        uUseB: gl.getUniformLocation(prog, "uUseB"),
        uScale: gl.getUniformLocation(prog, "uScale"),
        uOffset: gl.getUniformLocation(prog, "uOffset"),
        uCanvas: gl.getUniformLocation(prog, "uCanvas"),
        uImg: gl.getUniformLocation(prog, "uImg"),
        uTex: gl.getUniformLocation(prog, "uTex"),
        uAlpha: gl.getUniformLocation(prog, "uAlpha"),
      },
      bufA,
      bufB,
      bufIdx,
      count: MESH.triangles.length,
      texDay: null,
      texNight: null,
      ready: false,
    };

    let loaded = 0;
    const onOne = (which: "day" | "night", img: HTMLImageElement) => () => {
      const state = glRef.current;
      if (!state) {
        return;
      }
      const tex = makeTexture(gl, img);
      if (which === "day") {
        state.texDay = tex;
      } else {
        state.texNight = tex;
      }
      loaded += 1;
      if (loaded === 2) {
        state.ready = true;
        draw();
      }
    };
    const imgDay = new Image();
    const imgNight = new Image();
    imgDay.onload = onOne("day", imgDay);
    imgNight.onload = onOne("night", imgNight);
    imgDay.src = "/seattle-day.webp";
    imgNight.src = "/seattle-night.webp";

    return () => {
      cancelAnimationFrame(rafRef.current);
      const state = glRef.current;
      if (state) {
        gl.deleteBuffer(state.bufA);
        gl.deleteBuffer(state.bufB);
        gl.deleteBuffer(state.bufIdx);
        gl.deleteProgram(state.prog);
        if (state.texDay) gl.deleteTexture(state.texDay);
        if (state.texNight) gl.deleteTexture(state.texNight);
      }
      glRef.current = null;
    };
  }, [draw]);

  // Measure the image div and keep the canvas backing store (device px, capped 2x DPR) and
  // the marker layout in sync with every resize.
  useEffect(() => {
    const root = rootRef.current;
    if (!root) {
      return;
    }
    const measure = () => {
      const rect = root.getBoundingClientRect();
      const next = { w: rect.width, h: rect.height };
      sizeRef.current = next;
      setSize(next);
      const canvas = canvasRef.current;
      if (canvas && next.w > 0 && next.h > 0) {
        const dpr = Math.min(window.devicePixelRatio || 1, 2);
        canvas.width = Math.round(next.w * dpr);
        canvas.height = Math.round(next.h * dpr);
      }
      draw();
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(root);
    return () => observer.disconnect();
  }, [draw]);

  // Theme reactivity: read the initial theme instantly (no morph); animate on later changes,
  // whoever triggered them (nav toggle or a marker click, both via toggleThemeMode).
  useEffect(() => {
    const apply = (animate: boolean) => {
      const m = readThemeMode();
      setMode(m);
      const target = m === "dark" ? 1 : 0;
      if (animate) {
        startMorph(target);
      } else {
        tRef.current = target;
        setT(target);
        draw();
      }
    };
    apply(false);
    const observer = new MutationObserver(() => apply(true));
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
    return () => observer.disconnect();
  }, [draw, startMorph]);

  // Re-type from "ANCHOR NN" whenever the selection or theme changes.
  useEffect(() => {
    setStage(0);
  }, [active, mode]);

  const scale = size ? Math.max(size.w / IMG_W, size.h / IMG_H) : 0;
  const offsetX = size ? (size.w - IMG_W * scale) / 2 : 0;
  const placed = size
    ? ANCHORS.map(anchor => {
        const imgX = anchor.dayImgX + (anchor.nightImgX - anchor.dayImgX) * t;
        const imgY = anchor.dayImgY + (anchor.nightImgY - anchor.dayImgY) * t;
        return { anchor, screenX: offsetX + imgX * scale, screenY: imgY * scale };
      }).filter(
        p =>
          p.screenX - MARKER_HALF >= 0 &&
          p.screenX + MARKER_HALF <= size.w &&
          p.screenY - MARKER_HALF >= 0 &&
          p.screenY + MARKER_HALF <= size.h,
      )
    : [];

  return (
    <div ref={rootRef} className={styles.root} aria-hidden="true">
      <canvas ref={canvasRef} className={styles.canvas} />
      {placed.map(({ anchor, screenX, screenY }) => {
        const isActive = active === anchor.index;
        const coordLabel = mode === "light" ? anchor.dayLabel : anchor.nightLabel;
        return (
          <div key={anchor.index} className={styles.anchor} style={{ left: screenX, top: screenY }}>
            <button
              type="button"
              className={`${styles.marker}${isActive ? ` ${styles.markerActive}` : ""}`}
              aria-label={`Homography alignment anchor ${anchor.index + 1} — click to toggle theme`}
              onMouseEnter={() => {
                setPinned(null);
                setHovered(anchor.index);
              }}
              onMouseLeave={() => setHovered(current => (current === anchor.index ? null : current))}
              onFocus={() => {
                setPinned(null);
                setHovered(anchor.index);
              }}
              onBlur={() => setHovered(current => (current === anchor.index ? null : current))}
              onClick={() => {
                toggleThemeMode();
                setPinned(anchor.index);
              }}
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
