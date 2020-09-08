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

export interface BragiOptions {
    ponyfill?: BragiPonyfillOptions
}

export interface BragiPonyfills {
    AudioContext: TAudioContextConstructor | typeof AudioContext
}

export type BragiPonyfillOptions = Partial<BragiPonyfills>
