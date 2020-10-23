import { TBragiPonyfill } from '../types'

export function clear<T>(that: T, safe: TBragiPonyfill): T {
    safe.Object.keys(that).forEach((key) => {
        removeUnderscoredAndConfig(key as keyof T, that, safe)
    })

    return that
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function removeUnderscoredAndConfig<T>(key: keyof T, that: T, safe: TBragiPonyfill) {
    const remove = (key as string)[0] === '_'

    if (remove) {
        delete that[key]
        return
    }

    safe.Object.defineProperty(that, key, {
        configurable: false,
        writable: false,
        enumerable: true,
    })
}

export function freeze<T>(that: T, safe: TBragiPonyfill): Readonly<T> {
    const prototype = safe.Object.getPrototypeOf(that)

    safe.Object.freeze(that)

    safe.Object.seal(prototype)

    return that
}

export function clearAndFreeze<T>(that: T, safe: TBragiPonyfill): Readonly<T> {
    return freeze(clear(that, safe), safe)
}
