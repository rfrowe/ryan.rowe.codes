import React from "react";
import {css} from '@emotion/react'
import {PropsWithStyle} from '@emotion/react'
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

const blinkingStyle = (interval: number) => css({
    animationName: 'blinker',
    animationDuration: `${interval}ms`,
    animationTimingFunction: 'step-start',
    animationIterationCount: 'infinite',
    '@keyframes blinker': {
        '50%': {
            'opacity': 0
        }
    }
})

function useBlinkingCursor(flashIntervalMillis: number): [JSX.Element, boolean, (flash: boolean) => void] {
    const [flashEnabled, setFlashEnabled] = useState(false);

    const cursor = useMemo(() => {
        const cursorCss = flashEnabled ? [blinkingStyle(flashIntervalMillis)] : []

        return <span css={cursorCss}>&#9144;</span>
    }, [flashEnabled, flashIntervalMillis])

    const setCursorFlashing = useCallback(() => setFlashEnabled(state => !state), [setFlashEnabled])

    return [cursor, flashEnabled, setCursorFlashing]
}

const ConsoleTypist = ({
    text,
    startDelayMillis = 250,
    onTypingFinished,
    onTypingFinishedDelayMillis = 5000,
    cursorIntervalMillis = 1000,
    getInsertionDelayMillis = defaultCharacterDelay,
    deletionDelayMillis = 25,
    css,
    className
}: PropsWithStyle<Props>) => {
    const [idx, setIdx] = useState(0)
    const [currentText, setCurrentText] = useState(text)
    const [cursor, cursorIsFlashing, setCursorFlashing] = useBlinkingCursor(cursorIntervalMillis)

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
                if (cursorIsFlashing) {
                    setCursorFlashing(false)
                }
            } else {
                // Successfully erased to start, begin typing new text.
                timer = setTimeout(() => {
                    setCurrentText(text)
                }, startDelayMillis)
            }
        }

        return () => { timer === undefined || clearTimeout(timer) }
    }, [idx, currentText, text])


    return (
        <>
            <span css={css} className={className}>
                {currentText.substring(0, idx)}
            </span>
            {cursor}
        </>
    )
}

export default ConsoleTypist
