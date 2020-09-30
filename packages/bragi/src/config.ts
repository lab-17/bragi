import { IBragiOptions, TBragiListenerOptions } from './types'

export const isBrowser = typeof window !== 'undefined'

export const safeGlobal = isBrowser ? window : globalThis

export const envName = isBrowser ? 'browser' : 'runtime'

export const codecs = {
    mp3: ['audio/mpeg;', 'audio/mp3;'],
    mpeg: ['audio/mpeg;'],
    opus: ['audio/ogg; codecs="opus"'],
    ogg: ['audio/ogg; codecs="vorbis"'],
    oga: ['audio/ogg; codecs="vorbis"'],
    wav: ['audio/wav; codecs="1"'],
    aac: ['audio/aac;'],
    caf: ['audio/x-caf;'],
    m4a: ['audio/x-m4a;', 'audio/m4a;', 'audio/aac;'],
    m4b: ['audio/x-m4b;', 'audio/m4b;', 'audio/aac;'],
    mp4: ['audio/x-mp4;', 'audio/mp4;', 'audio/aac;'],
    weba: ['audio/webm; codecs="vorbis"'],
    webm: ['audio/webm; codecs="vorbis"'],
    dolby: ['audio/mp4; codecs="ec-3"'],
    flac: ['audio/x-flac;', 'audio/flac;'],
}

/* (keyof (Window & typeof globalThis))[] */
export const usedWebApis = <const>[
    'addEventListener',
    'removeEventListener',
    'AudioContext',
    'Audio',
    'fetch',
    'AbortController',
    'Map',
    'Symbol',
]

export const unlockEvents: (keyof WindowEventMap)[] = [
    'touchstart',
    'touchend',
    'keydown',
    'keyup',
    'click',
]

export const listenerOptions: TBragiListenerOptions = {
    passive: true,
}

export const defaultOptions: IBragiOptions = {
    autoUnlock: isBrowser,
    muted: false,
    gain: 1.0,
}

export type TBragiUsedWebApis = typeof usedWebApis
export type TBragiCodecs = typeof codecs
export type TBragiSupportedExtension = keyof TBragiCodecs
