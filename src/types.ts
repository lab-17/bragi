import { TAudioContextConstructor } from 'standardized-audio-context'

export interface BragiController {
    play: () => void
    pause: () => void
    stop: () => void
    changeVolume: (value: number) => void
}

export interface BragiSourceOptions {
    label?: string
    url: string
}

export type BragiWindow = typeof window | Partial<typeof window>
export interface BragiOptions {
    ponyfill?: BragiPonyfillOptions
    window?: BragiWindow
}

export interface BragiPonyfills {
    AudioContext: TAudioContextConstructor | typeof AudioContext
}

export type BragiPonyfillOptions = Partial<BragiPonyfills>
