import { useState } from "react";
import CubeRenderer from "./cubeRenderer";
import * as styles from "./cubeCard.css.ts";

// MUI's "Calculate" icon path, reproduced inline now that MUI/Emotion are fully removed
// from the project.
const calculateIconPath =
  "M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5.97 4.06L14.09 6l1.41 1.41L16.91 6l1.06 1.06-1.41 1.41 1.41 1.41-1.06 1.06-1.41-1.4-1.41 1.41-1.06-1.06 1.41-1.41-1.41-1.42zm-6.78.66h5v1.5h-5v-1.5zM11.5 16h-2v2H8v-2H6v-1.5h2v-2h1.5v2h2V16zm6.5 1.25h-5v-1.5h5v1.5zm0-2.5h-5v-1.5h5v1.5z";

/**
 * Ported from the pre-migration cubeCard.tsx. Mounted via `<CubeCard client:only="react" />`
 * (see post.mdx): the "Complexity" control is a native `<input type="range">` rather than
 * MUI's `Slider` -- MUI/Emotion are fully removed, and a native range input keeps full
 * keyboard/screen-reader support (`aria-label` + `aria-valuetext`) without reimplementing
 * it, which a screenshot diff alone wouldn't catch if dropped.
 */
const CubeCard = () => {
  const [cubeIndex, setCubeIndex] = useState(0);
  const [numCubes, setNumCubes] = useState(0);

  return (
    <div className={styles.container}>
      <div className={styles.controls}>
        <label id="complexity-slider-label" htmlFor="complexity-slider" className={styles.label}>
          Complexity {cubeIndex}
        </label>
        <svg className={styles.calculateIcon} viewBox="0 0 24 24" aria-hidden="true">
          <path d={calculateIconPath} />
        </svg>
        <input
          id="complexity-slider"
          className={styles.slider}
          type="range"
          min={0}
          max={Math.max(numCubes - 1, 0)}
          step={1}
          value={cubeIndex}
          aria-label="Complexity"
          aria-valuetext={`Complexity ${cubeIndex}`}
          onChange={event => setCubeIndex(Number(event.target.value))}
        />
      </div>
      <CubeRenderer index={cubeIndex} onCubesLoaded={setNumCubes} />
    </div>
  );
};

export default CubeCard;
