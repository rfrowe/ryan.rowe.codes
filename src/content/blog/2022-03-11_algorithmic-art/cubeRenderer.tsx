import { lazy, Suspense, useEffect, useMemo } from "react";
// Type-only: `p5` (and `react-p5`, which wraps it) touch `window` as an import-time side
// effect, which crashes Astro's Node-based static build even for a `client:only` island
// (ES `import` statements execute eagerly when a module is loaded, before any client
// directive gets a chance to skip rendering it). `import type` is fully erased at compile
// time, so it contributes no runtime import at all. See the `Sketch` lazy-import below
// for the same problem on the value side.
import type p5Types from "p5";
import { vars } from "@styles/theme.css.ts";
import { sortAndChunkImages } from "./cubeImages";

// `react-p5`'s default export re-exports `p5` itself, so a plain static `import Sketch
// from "react-p5"` would hit the same "window is not defined" crash during Astro's
// server build. A dynamic import defers module evaluation until something actually calls
// it -- which, for a `client:only="react"` island, only ever happens in the browser.
const Sketch = lazy(() => import("react-p5"));

type Face = p5Types.Image;
type Cube = [Face, Face, Face, Face, Face, Face];

enum Faces {
  FRONT,
  BACK,
  BOTTOM,
  TOP,
  RIGHT,
  LEFT,
}

const state = {
  background: "transparent",
  cubes: {
    data: [] as Cube[],
    index: 0,
  },
  drag: {
    start: false,
    rate: 0.4,
  },
  rotation: {
    x: -22.5,
    y: 45,
  },
};

const setup = (p5: p5Types, canvasParentRef: Element) => {
  const canvas = p5.createCanvas(512, 512, p5.WEBGL).parent(canvasParentRef);
  canvas.mousePressed(() => (state.drag.start = true));
  canvas.mouseReleased(() => (state.drag.start = false));

  p5.textureMode(p5.NORMAL);
  p5.angleMode(p5.DEGREES);
};

const draw = (p5: p5Types) => {
  p5.background(state.background);
  p5.noStroke();
  drawFaceBox(p5);
};

function drawFaceBox(p5: p5Types) {
  const side = p5.width / 2;
  const cube = state.cubes.data[state.cubes.index];

  p5.push();

  // Apply rotation.
  p5.translate(0, 0, -side / 2);
  p5.rotateX(state.rotation.x);
  p5.rotateY(state.rotation.y);
  p5.translate(0, 0, side / 2);

  // Center the box.
  p5.translate(-side / 2, -side / 2, 0);

  // Draw faces.
  p5.texture(cube[Faces.FRONT]);
  p5.quad(0, 0, side, 0, side, side, 0, side);

  p5.push();
  p5.texture(cube[Faces.LEFT]);
  p5.translate(0, 0, -side);
  p5.rotateY(-90);
  p5.quad(side, 0, 0, 0, 0, side, side, side);
  p5.pop();

  p5.push();
  p5.texture(cube[Faces.TOP]);
  p5.translate(0, 0, -side);
  p5.rotateX(90);
  p5.quad(0, side, 0, 0, side, 0, side, side);
  p5.pop();

  p5.push();
  p5.texture(cube[Faces.RIGHT]);
  p5.translate(side, 0, 0);
  p5.rotateY(90);
  p5.quad(0, 0, side, 0, side, side, 0, side);
  p5.pop();

  p5.push();
  p5.texture(cube[Faces.BOTTOM]);
  p5.translate(0, side, 0);
  p5.rotateX(-90);
  p5.quad(0, 0, 0, side, side, side, side, 0);
  p5.pop();
  p5.push();

  p5.texture(cube[Faces.BACK]);
  p5.rotateY(180);
  p5.translate(-side, 0, side);
  p5.quad(side, 0, 0, 0, 0, side, side, side);
  p5.pop();

  p5.pop();
}

// Vite statically analyzes this call at build time, so the glob pattern/options must be
// literal here (they can't be pulled out into cubeImages.ts). `eager: true` + `query:
// '?url'` + `import: 'default'` resolves synchronously to `Record<modulePath, urlString>`
// -- no useStaticQuery/GraphQL round trip needed. The actual sort+chunk logic (the top
// silent-failure risk -- see cubeImages.ts) lives in the pure, unit-tested helper.
const imageGlob = import.meta.glob<string>("./assets/**/*.jpg", {
  eager: true,
  query: "?url",
  import: "default",
});
const cubeUrlGroups = sortAndChunkImages(imageGlob);

function getPreloader(urlGroups: string[][], setNumCubes: (cubes: number) => void) {
  return (p5: p5Types) => {
    state.cubes.data.splice(0, state.cubes.data.length, ...urlGroups.map(urls => urls.map(url => p5.loadImage(url)) as Cube));

    setNumCubes(state.cubes.data.length);
  };
}

function mouseDragged(p5: p5Types) {
  if (!state.drag.start) {
    return;
  }

  state.rotation.x += (p5.pmouseY - p5.mouseY) * state.drag.rate;
  state.rotation.y += (p5.mouseX - p5.pmouseX) * state.drag.rate;
}

// vars.palette.background.default is a vanilla-extract CSS variable reference (e.g.
// `var(--xxxx)`), not a literal color -- p5's color parser doesn't resolve CSS custom
// properties, so this pulls out the variable name to resolve its live value from the DOM.
const backgroundCssVarName = /var\((--[^,)]+)/.exec(vars.palette.background.default)?.[1];

function resolveThemeBackground(): string {
  if (!backgroundCssVarName) {
    return state.background;
  }

  const resolved = getComputedStyle(document.documentElement).getPropertyValue(backgroundCssVarName).trim();
  return resolved || state.background;
}

interface Props {
  index: number;
  onCubesLoaded: (count: number) => void;
}

/**
 * Ported from the pre-migration cubeRenderer.tsx. Rendered inside a `client:only="react"`
 * island (see cubeCard.tsx / post.mdx): the whole subtree is excluded from SSR, so
 * `react-p5` can be a plain static import instead of the old `@loadable/component` dynamic
 * import. The module-level `state` singleton is fine under Astro's default MPA navigation
 * (no `<ClientRouter>`), which fully reloads the page -- and this module -- per navigation.
 */
const CubeRenderer = ({ index, onCubesLoaded }: Props) => {
  useEffect(() => {
    state.cubes.index = index;
  }, [index]);

  const preload = useMemo(() => getPreloader(cubeUrlGroups, onCubesLoaded), [onCubesLoaded]);

  // There's no shared theme-mode context under Astro (unlike the pre-migration
  // `useTheme()`); the toggle island (ThemeToggle.tsx) mutates `data-theme` on <html>
  // directly without dispatching an event, so a MutationObserver is the only way to stay
  // theme-reactive here -- same pattern as the quine's CodeBlock island.
  useEffect(() => {
    const documentElement = document.documentElement;

    const sync = () => {
      state.background = resolveThemeBackground();
    };

    sync();

    const observer = new MutationObserver(sync);
    observer.observe(documentElement, { attributes: true, attributeFilter: ["data-theme"] });

    return () => observer.disconnect();
  }, []);

  return (
    <Suspense fallback={null}>
      <Sketch
        setup={setup}
        draw={draw}
        preload={preload}
        mouseDragged={mouseDragged}
        mouseReleased={() => (state.drag.start = false)}
      />
    </Suspense>
  );
};

export default CubeRenderer;
