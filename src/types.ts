import { BragiModesNames, BragiModes } from './modes/types'
import { BragiTransportsNames, BragiTransports } from './transports/types'

export interface BragiOptions {
    mode?: BragiModesNames
    modes?: Partial<BragiModes>
    transport?: BragiTransportsNames
    transports?: Partial<BragiTransports>
    ponyfill?: BragiPonyfillOptions
}

export interface BragiPonyfills {
    AudioContext: typeof AudioContext
}

export type BragiPonyfillOptions = Partial<BragiPonyfills>
