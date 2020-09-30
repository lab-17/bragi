import { info, warn } from './logger'
import { TBragiPonyfill } from '../types'
import { envName, safeGlobal, usedWebApis } from '../config'

export function createWebApisPonyfill(
    ponyfills: Partial<TBragiPonyfill> = {},
    usedApis = usedWebApis,
): [boolean, TBragiPonyfill] {
    const safe = {} as TBragiPonyfill

    let supported = true

    usedApis.forEach((api) => {
        const [isSupported, ponyfill] = getPonyfill(ponyfills, api)

        if (!isSupported) supported = false

        safe[api] = ponyfill
    })

    return [supported, safe]
}

function getPonyfill<T extends keyof TBragiPonyfill>(
    ponyfills: Partial<TBragiPonyfill>,
    api: T,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
): [boolean, any] {
    const ponyOrNative = ponyfills[api] || createBindGlobal(api)

    return [!!ponyOrNative, ponyOrNative || createErrorOnCall(api)]
}
function createBindGlobal<T extends keyof TBragiPonyfill>(
    api: T,
    global = safeGlobal,
): TBragiPonyfill[T] | false {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const native = ((global[api] as any) || (global as any)[`webkit${api}`])?.bind?.(global)

    if (native)
        info(
            `Using native '${api}', in many cases, shouldn't cause problems, but it's less safe than using ponyfill.`,
        )

    return native || false
}

function createErrorOnCall<T extends keyof TBragiPonyfill>(api: T, name = envName) {
    const msg = `This ${name} not have support to '${api}', please add a ponyfill.`

    warn(`${msg} This throw an error if called.`)

    return (function (this: { error: true }) {
        this.error = true
        throw new Error(msg)
    } as unknown) as TBragiPonyfill[T]
}
