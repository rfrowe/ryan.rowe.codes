import { Suspense, useEffect } from "react";
import { P5Canvas, type P5CanvasInstance } from "@p5-wrapper/react";
// Type-only import, erased at build. Evaluating p5 touches `window` and would crash the
// static build, so the runtime import is deferred: P5Canvas is a lazy component that only
// imports p5 in the browser.
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

// Render state the p5 draw loop reads live every frame; the effects below write to it.
// `onCubesLoaded` flows the other way: setup calls it once textures finish loading.
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

// Vite statically analyzes this call at build time, so the pattern and options must be
// literal here (they can't be pulled out into cubeImages.ts). `eager` + `?url` + `default`
// resolves synchronously to `Record<modulePath, urlString>`.
const imageGlob = import.meta.glob<string>("./assets/**/*.jpg", {
  eager: true,
  query: "?url",
  import: "default",
});
const cubeUrlGroups = sortAndChunkImages(imageGlob);

// vars.palette.background.default is a CSS variable reference (`var(--xxx)`), not a literal
// color. p5's color parser can't resolve custom properties, so pull out the variable name
// and read its live value from the DOM.
const backgroundCssVarName = /var\((--[^,)]+)/.exec(vars.palette.background.default)?.[1];

function resolveThemeBackground(): string {
  if (!backgroundCssVarName) {
    return state.background;
  }

  const resolved = getComputedStyle(document.documentElement).getPropertyValue(backgroundCssVarName).trim();
  return resolved || state.background;
}

// Defined once at module scope so the reference is stable: `<P5Canvas sketch={...}>`
// re-instantiates p5 (reloading textures, resetting rotation) whenever the reference
// changes, so this must never be an inline function. `setup` is async because p5 awaits it
// before starting the draw loop, so no frame draws until every texture has loaded.
const sketch = (p5: P5CanvasInstance) => {
  p5.setup = async () => {
    // No `.parent()` needed: p5 is bound to its own container, so `createCanvas` attaches there.
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

// Rendered in a `client:only="react"` island, so this subtree is excluded from SSR. The
// effects below push the slider `index` and theme background into the `state` singleton.
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

  // ThemeToggle mutates `data-theme` on <html> without dispatching an event, so a
  // MutationObserver is the only way to stay theme-reactive here.
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
