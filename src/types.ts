export interface BragiOptions {
    ponyfill?: BragiPonyfillOptions
}

export interface BragiPonyfills {
    AudioContext: typeof AudioContext
}

export type BragiPonyfillOptions = Partial<BragiPonyfills>
