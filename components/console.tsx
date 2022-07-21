import {css} from '@emotion/react';

import {useCallback, useEffect, useMemo, useState} from 'react'

interface Props {
    text: string
    startDelayMillis?: number
    onTypingFinished?: () => void
    onTypingFinishedDelayMillis?: number
    cursorIntervalMillis?: number
    getInsertionDelayMillis?: (idx: number) => number
    deletionDelayMillis?: number
}

const defaultCharacterDelay = () => Math.random() * 75 + 25

function useFlashingCursor(flashIntervalMillis: number): [JSX.Element, (flash: boolean) => void] {
    const [flashEnabled, setFlashEnabled] = useState(false);
    const [showCursor, setShowCursor] = useState(true);

    useEffect(() => {
        if (!flashEnabled) {
            if (!showCursor) {
                setShowCursor(true)
            }
        } else {
            const timer = setInterval(() => setShowCursor(prev => !prev), flashIntervalMillis)

            return () => clearInterval(timer)
        }
    }, [flashEnabled]);

    const cursor = useMemo(() => {
        const visibility = showCursor ? 'visible' : 'hidden'

        return <span css={css({visibility})}>&#9144;</span>
    }, [showCursor])

    const setCursorFlashing = useCallback(() => setFlashEnabled(state => !state), [])

    return [cursor, setCursorFlashing]
}

const ConsoleTypist = ({
    text,
    startDelayMillis = 250,
    onTypingFinished,
    onTypingFinishedDelayMillis = 5000,
    cursorIntervalMillis = 500,
    getInsertionDelayMillis = defaultCharacterDelay,
    deletionDelayMillis = 25,
}: Props) => {
    const [idx, setIdx] = useState(0)
    const [currentText, setCurrentText] = useState(text)
    const [cursor, setCursorFlashing] = useFlashingCursor(cursorIntervalMillis)

    // Type or erase letters at a pseudo-random, relatively realistic speed.
    useEffect(() => {
        let timer: NodeJS.Timeout | undefined

        // When text has changed, erase back to start; otherwise, type entirety of text character by character.
        if (currentText === text) {
            if (idx < text.length) {
                timer = setTimeout(() => setIdx(prev => prev + 1), getInsertionDelayMillis(idx))
            } else if (idx === text.length) {
                // Finished typing desired text, notify listener after appropriate delay.
                setCursorFlashing(true)
                timer = setTimeout(() => onTypingFinished && onTypingFinished(), onTypingFinishedDelayMillis)
            }
        } else {
            if (idx > 0) {
                timer = setTimeout(() => setIdx(prev => prev - 1), deletionDelayMillis)
            } else {
                // Successfully erased to start, begin typing new text.
                timer = setTimeout(() => {
                    setCurrentText(text)
                    setCursorFlashing(false)
                }, startDelayMillis)
            }
        }

        return () => { timer === undefined || clearTimeout(timer) }
    }, [idx, currentText, text])


    return <>{currentText.substring(0, idx)}{cursor}</>
}

export default ConsoleTypist
