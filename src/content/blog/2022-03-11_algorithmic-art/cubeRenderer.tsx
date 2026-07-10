import { Suspense, useEffect } from "react";
import { P5Canvas, type P5CanvasInstance } from "@p5-wrapper/react";
// Type-only p5 import, purely for the `Image` face type. `import type` is erased at
// compile time, so it adds no runtime import -- important because evaluating p5 touches
// `window`, which would crash Astro's Node-based static build. The value-level p5 import
// is deferred by `@p5-wrapper/react` itself: its `P5Canvas` is a `React.lazy` that only
// `import()`s p5 in the browser, so a plain static `import { P5Canvas }` above is safe
// even though this island is server-skipped (`client:only` -- see cubeCard.tsx/post.mdx).
import type p5Types from "p5";
import { vars } from "@styles/theme.css.ts";
import { sortAndChunkImages } from "./cubeImages";

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

// Module-level render state singleton. The p5 draw loop reads these live every frame, and
// React writes to them from effects (index, theme background) below. This is fine under
// Astro's default MPA navigation (no `<ClientRouter>`), which fully reloads the page -- and
// re-evaluates this module -- per navigation. `onCubesLoaded` is the one value that flows
// out of p5 back into React: the setup closure calls it once textures finish loading.
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
  onCubesLoaded: undefined as ((count: number) => void) | undefined,
};

function drawFaceBox(p5: P5CanvasInstance) {
  const side = p5.width / 2;
  const cube = state.cubes.data[state.cubes.index];
  if (!cube) {
    return;
  }

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

/**
 * The p5 sketch, in `@p5-wrapper/react`'s instance-mode shape: a single closure that
 * assigns p5's lifecycle hooks. Defined once at module scope so its reference is stable --
 * `<P5Canvas sketch={...}>` re-instantiates p5 (reloading textures, resetting rotation)
 * whenever the `sketch` reference changes, so it must never be an inline/render-scoped
 * function.
 *
 * p5 2.0 removed `preload()`; the supported replacement is an async `setup()` that
 * `await`s its asset loads (p5 core `await`s `setup` before starting the draw loop, so no
 * frame draws until every texture is ready). `loadImage` now returns a `Promise`, so the
 * groups load with `Promise.all` and the count flows back to React via `onCubesLoaded`.
 */
const sketch = (p5: P5CanvasInstance) => {
  p5.setup = async () => {
    // No `.parent()` needed: `@p5-wrapper/react` creates p5 in instance mode bound to its
    // own container node, so `createCanvas` attaches the canvas there automatically.
    const canvas = p5.createCanvas(512, 512, p5.WEBGL);
    canvas.mousePressed(() => (state.drag.start = true));
    canvas.mouseReleased(() => (state.drag.start = false));

    p5.textureMode(p5.NORMAL);
    p5.angleMode(p5.DEGREES);

    const loaded = await Promise.all(
      cubeUrlGroups.map(urls => Promise.all(urls.map(url => p5.loadImage(url))) as Promise<Cube>),
    );
    state.cubes.data.splice(0, state.cubes.data.length, ...loaded);

    state.onCubesLoaded?.(state.cubes.data.length);
  };

  p5.draw = () => {
    p5.background(state.background);
    p5.noStroke();
    drawFaceBox(p5);
  };

  p5.mouseDragged = () => {
    if (!state.drag.start) {
      return;
    }

    state.rotation.x += (p5.pmouseY - p5.mouseY) * state.drag.rate;
    state.rotation.y += (p5.mouseX - p5.pmouseX) * state.drag.rate;
  };

  p5.mouseReleased = () => {
    state.drag.start = false;
  };
};

interface Props {
  index: number;
  onCubesLoaded: (count: number) => void;
}

/**
 * Ported from the react-p5 implementation to `@p5-wrapper/react` v5 (React 19 + p5 2.x).
 * Rendered inside a `client:only="react"` island (see cubeCard.tsx / post.mdx): the whole
 * subtree is excluded from SSR. The slider's `index` and the theme background feed the p5
 * draw loop through the module-level `state` singleton (written from the effects below,
 * read live every frame in `draw`).
 */
const CubeRenderer = ({ index, onCubesLoaded }: Props) => {
  useEffect(() => {
    state.cubes.index = index;
  }, [index]);

  useEffect(() => {
    state.onCubesLoaded = onCubesLoaded;
    return () => {
      state.onCubesLoaded = undefined;
    };
  }, [onCubesLoaded]);

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
      <P5Canvas sketch={sketch} />
    </Suspense>
  );
};

export default CubeRenderer;
