import { IAudioContext, IAudioNode, TAudioContextConstructor } from 'standardized-audio-context'
import { TBragiSupportedExtension, TBragiUsedWebApis } from './config'
import { TBragiLoggerLevel } from './util'

export { IBragiCodecsValidator } from './util'

export { TBragiCodecs, TBragiSupportedExtension, TBragiUsedWebApis } from './config'

export { TBragiPublicStates } from './bragi'

export type TBragiRunMaybeInAll = boolean | symbol | symbol[]
export type TBragiRunInSelection = Exclude<TBragiRunMaybeInAll, boolean>[]

export type TBragiListenerOptions = NonNullable<Parameters<Window['addEventListener']>[2]>

export type TBragiContext = IAudioContext
export type TBragiNode = IAudioNode<TBragiContext>

export type TBragiPonyfill = Pick<
    Omit<Window & typeof globalThis, 'AudioContext' | 'navigator'> & {
        AudioContext: TAudioContextConstructor
    } & Pick<Window & typeof globalThis, 'navigator'>['navigator'],
    TBragiUsedWebApis[number]
>

export interface IBragiOptions {
    ponyfills?: Partial<TBragiPonyfill>
    logLevel: TBragiLoggerLevel
    autoUnlock: boolean
    muted: boolean
    gain: number
}

export type TBragiValidatedCodecs<T extends string | number | symbol> = {
    [keys in T]: boolean
}

export interface IBragiSourceOptions {
    gain: number
    preload: boolean
    origin: string | [TBragiSupportedExtension, string] | [TBragiSupportedExtension, string][]
}
