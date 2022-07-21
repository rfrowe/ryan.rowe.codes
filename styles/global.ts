import {css} from "@emotion/react";

const globalStyles = css({
    'html, body': {
        padding: 0,
        margin: 0,
        fontFamily: 'sans-serif',
    },
    body: {
        textRendering: 'optimizeLegibility'
    },
    '*': {
        boxSizing: 'border-box'
    }
})

export default globalStyles