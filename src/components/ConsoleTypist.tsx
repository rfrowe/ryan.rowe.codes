import { useEffect, useMemo, useState, type JSX } from "react";
import * as styles from "./ConsoleTypist.css.ts";

export interface ConsoleTypistProps {
  text: string;
  onTypingFinished?: () => void;
  className?: string;
  /**
   * Type once and hold: type the text a single time and leave it static -- no erase/retype
   * cycle. `onTypingFinished` fires exactly once when typing completes. Defaults to false (the
   * type/hold/erase/retype cycling that HeadlineCycler drives).
   */
  once?: boolean;
}

const defaultCharacterDelay = () => Math.random() * 75 + 25;

const startDelayMillis = 250;
const onTypingFinishedDelayMillis = 5000;
const cursorIntervalMillis = 1000;
const deletionDelayMillis = 25;

function useBlinkingCursor(flashIntervalMillis: number): [JSX.Element, (flash: boolean) => void] {
  const [flashEnabled, setFlashEnabled] = useState(false);

  const cursor = useMemo(
    () => (
      <span
        className={flashEnabled ? styles.cursor : undefined}
        style={flashEnabled ? { animationDuration: `${flashIntervalMillis}ms` } : undefined}
      >
        &#9144;
      </span>
    ),
    [flashEnabled, flashIntervalMillis],
  );

  return [cursor, setFlashEnabled];
}

/**
 * Typewriter effect: types `text` out character-by-character at a randomized pace, holds,
 * erases it, then types whatever `text` has become -- the caller drives cycling by changing
 * `text` (typically from `onTypingFinished`).
 *
 * Exposes `data-typing="done"` on the wrapping element once the current `text` finishes typing
 * (cleared the instant erasure starts) so callers can wait for a stable frame instead of racing
 * the randomized per-character timers.
 */
const ConsoleTypist = ({
  text,
  onTypingFinished,
  className,
  once = false,
}: ConsoleTypistProps) => {
  const [idx, setIdx] = useState(0);
  const [currentText, setCurrentText] = useState(text);
  const [cursor, setCursorFlashing] = useBlinkingCursor(cursorIntervalMillis);

  // Type or erase letters at a pseudo-random, relatively realistic speed.
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout> | undefined;

    if (once) {
      // "Type once, then hold": no erase, no cycling.
      if (currentText !== text) {
        // The text prop changed (e.g. a theme toggle swapped day<->night coords mid-type):
        // restart typing the new text from the top instead of erasing the old one.
        setCurrentText(text);
        setIdx(0);
      } else if (idx < text.length) {
        timer = setTimeout(() => setIdx(prev => prev + 1), defaultCharacterDelay());
      } else {
        // Finished: hold the fully-typed text, flash the cursor, and notify exactly once.
        setCursorFlashing(true);
        onTypingFinished?.();
      }

      return () => {
        timer === undefined || clearTimeout(timer);
      };
    }

    // When text has changed, erase back to start; otherwise, type entirety of text character by character.
    if (currentText === text) {
      if (idx < text.length) {
        timer = setTimeout(() => setIdx(prev => prev + 1), defaultCharacterDelay());
      } else if (idx === text.length) {
        // Finished typing desired text, notify listener after appropriate delay.
        setCursorFlashing(true);
        timer = setTimeout(() => onTypingFinished && onTypingFinished(), onTypingFinishedDelayMillis);
      }
    } else {
      if (idx > 0) {
        timer = setTimeout(() => setIdx(prev => prev - 1), deletionDelayMillis);
        setCursorFlashing(false);
      } else {
        // Successfully erased to start, begin typing new text.
        timer = setTimeout(() => {
          setCurrentText(text);
        }, startDelayMillis);
      }
    }

    return () => {
      timer === undefined || clearTimeout(timer);
    };
  }, [idx, currentText, text]);

  const isDone = currentText === text && idx === text.length;

  return (
    <span data-typing={isDone ? "done" : undefined}>
      <span className={className}>{currentText.substring(0, idx)}</span>
      {cursor}
    </span>
  );
};

export default ConsoleTypist;
