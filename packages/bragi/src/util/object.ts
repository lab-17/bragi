export function remap<T>(that: T): T {
    // const prototype = Object.getPrototypeOf(that)
    Object.keys(that).forEach((key) => {
        removeUnderscoredAndConfig(key, that)
    })

    return that
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function removeUnderscoredAndConfig(key: string, that: any) {
    const remap = key[0] === '_'

    if (remap) {
        delete that[key]
        return
    }

    Object.defineProperty(that, key, {
        configurable: false,
        writable: false,
        enumerable: true,
    })
}

export function freeze<T>(that: T): T {
    const prototype = Object.getPrototypeOf(that)

    Object.freeze(that)

    Object.seal(prototype)

    return that
}
