import '@emotion/react'
import {WithConditionalCSSProp} from "@emotion/react/types/jsx-namespace";
import {Theme as MuiTheme} from '@mui/material'

type PropsWithClassName<P> = 'className' extends keyof P ? P : {className?: string} & P

declare module '@emotion/react' {
    export interface Theme extends MuiTheme {}
    export type PropsWithStyle<P = {}> = PropsWithClassName<P> & WithConditionalCSSProp<PropsWithClassName<P>>
}
