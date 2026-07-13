import { useState } from "react";
import { FaCalculator } from "react-icons/fa6";
import CubeRenderer from "./cubeRenderer";
import * as styles from "./cubeCard.css.ts";

// Native range input keeps keyboard + screen-reader support without a custom slider.
const CubeCard = () => {
  const [cubeIndex, setCubeIndex] = useState(0);
  const [numCubes, setNumCubes] = useState(0);

  return (
    <div className={styles.container}>
      <div className={styles.controls}>
        <label id="complexity-slider-label" htmlFor="complexity-slider" className={styles.label}>
          Complexity {cubeIndex}
        </label>
        <FaCalculator className={styles.calculateIcon} aria-hidden="true" />
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
