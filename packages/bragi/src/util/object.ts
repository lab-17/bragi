import { TBragiPonyfill } from '../types'

export function remap<T>(that: T, safe: TBragiPonyfill): T {
    // const prototype = Object.getPrototypeOf(that)
    safe.Object.keys(that).forEach((key) => {
        removeUnderscoredAndConfig(key, that, safe)
    })

    return that
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function removeUnderscoredAndConfig(key: string, that: any, safe: TBragiPonyfill) {
    const remap = key[0] === '_'

    if (remap) {
        delete that[key]
        return
    }

    safe.Object.defineProperty(that, key, {
        configurable: false,
        writable: false,
        enumerable: true,
    })
}

export function freeze<T>(that: T, safe: TBragiPonyfill): T {
    const prototype = safe.Object.getPrototypeOf(that)

    safe.Object.freeze(that)

    safe.Object.seal(prototype)

    return that
}
