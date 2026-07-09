import { useCallback, useEffect, useMemo, useState } from "react";
import * as styles from "./ConsoleTypist.css.ts";

export interface ConsoleTypistProps {
  text: string;
  startDelayMillis?: number;
  onTypingFinished?: () => void;
  onTypingFinishedDelayMillis?: number;
  cursorIntervalMillis?: number;
  getInsertionDelayMillis?: (idx: number) => number;
  deletionDelayMillis?: number;
  className?: string;
}

const defaultCharacterDelay = () => Math.random() * 75 + 25;

function useBlinkingCursor(flashIntervalMillis: number): [JSX.Element, boolean, (flash: boolean) => void] {
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

  // `flash` is unused -- mirrors the pre-migration component's toggle-regardless-of-argument
  // behavior (both call sites below happen to call this at the right moments for a toggle
  // to land on the intended value).
  const setCursorFlashing = useCallback((_flash: boolean) => setFlashEnabled(state => !state), []);

  return [cursor, flashEnabled, setCursorFlashing];
}

/**
 * Typewriter effect: types `text` out character-by-character at a randomized pace, holds,
 * erases it, then types whatever `text` has become -- the caller drives cycling by changing
 * `text` (typically from `onTypingFinished`).
 *
 * Exposes `data-typing="done"` on the wrapping element once the current `text` has finished
 * typing, cleared again the instant erasure starts, so callers -- Phase 8's Playwright
 * screenshots in particular -- can wait for a stable frame instead of racing the randomized
 * per-character timers.
 */
const ConsoleTypist = ({
  text,
  startDelayMillis = 250,
  onTypingFinished,
  onTypingFinishedDelayMillis = 5000,
  cursorIntervalMillis = 1000,
  getInsertionDelayMillis = defaultCharacterDelay,
  deletionDelayMillis = 25,
  className,
}: ConsoleTypistProps) => {
  const [idx, setIdx] = useState(0);
  const [currentText, setCurrentText] = useState(text);
  const [cursor, cursorIsFlashing, setCursorFlashing] = useBlinkingCursor(cursorIntervalMillis);

  // Type or erase letters at a pseudo-random, relatively realistic speed.
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout> | undefined;

    // When text has changed, erase back to start; otherwise, type entirety of text character by character.
    if (currentText === text) {
      if (idx < text.length) {
        timer = setTimeout(() => setIdx(prev => prev + 1), getInsertionDelayMillis(idx));
      } else if (idx === text.length) {
        // Finished typing desired text, notify listener after appropriate delay.
        setCursorFlashing(true);
        timer = setTimeout(() => onTypingFinished && onTypingFinished(), onTypingFinishedDelayMillis);
      }
    } else {
      if (idx > 0) {
        timer = setTimeout(() => setIdx(prev => prev - 1), deletionDelayMillis);
        if (cursorIsFlashing) {
          setCursorFlashing(false);
        }
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
