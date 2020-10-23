import { IAudioContext, IAudioNode, TAudioContextConstructor } from 'standardized-audio-context'

import { TBragiSupportedExtension, TBragiUsedWebApis } from './config'

import { TBragiLoggerLevel } from './util'

export { IBragiCodecsValidator, IBragiLogger, IBragiRunnerMethods, TBragiLoggerLevel } from './util'
export { TBragiCodecs, TBragiSupportedExtension, TBragiUsedWebApis } from './config'
export {
    TBragiPublicStates,
    IBragiNodeOptions,
    IBragiReturnInspect,
    IBragiStorageMaps,
} from './bragi'

export type TBragiListenerOptions = NonNullable<Parameters<Window['addEventListener']>[2]>

export type TBragiContext = IAudioContext
export type TBragiNode = IAudioNode<TBragiContext>

export type TBragiPonyfill = Readonly<
    Pick<
        Omit<Window & typeof globalThis, 'AudioContext' | 'navigator'> & {
            AudioContext: TAudioContextConstructor
        } & Pick<Window & typeof globalThis, 'navigator'>['navigator'],
        TBragiUsedWebApis[number]
    >
>

export interface IBragiOptions {
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
    origin:
        | string
        | [TBragiSupportedExtension, string]
        | [TBragiSupportedExtension, string][]
        | string[]
}

export type TBragiAddSourceOptions = Partial<Omit<IBragiSourceOptions, 'origin'>> & {
    label: string
} & Pick<IBragiSourceOptions, 'origin'>
