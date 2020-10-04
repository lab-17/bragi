import { TBragiPonyfill } from '../types'
import { envName, safeGlobal, usedWebApis } from '../config'
import { IBragiLogger } from './logger'

export function createWebApisPonyfill(
    ponyfills: Partial<TBragiPonyfill> = {},
    logger: IBragiLogger,
    usedApis = usedWebApis,
    global = safeGlobal,
): [boolean, TBragiPonyfill] {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const safe = {} as any

    let supported = true

    usedApis.forEach((api) => {
        const [isSupported, ponyfill] = getPonyfill(ponyfills, api, logger, safe, global)

        if (!isSupported) supported = false

        safe[api] = ponyfill
    })

    return [supported, safe as TBragiPonyfill]
}

function getPonyfill<T extends keyof TBragiPonyfill>(
    ponyfills: Partial<TBragiPonyfill>,
    api: T,
    logger: IBragiLogger,
    safe: TBragiPonyfill,
    global = safeGlobal,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
): [boolean, any] {
    const ponyOrNative = ponyfills[api] || createBindGlobal(api, logger, global)

    return [!!ponyOrNative, ponyOrNative || createErrorOnCall(api, logger, safe)]
}
function createBindGlobal<T extends keyof TBragiPonyfill>(
    api: T,
    logger: IBragiLogger,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    global: any = safeGlobal,
): TBragiPonyfill[T] | false {
    const impl = global[api] || global[`webkit${api}`] || global?.navigator?.[api]

    const [firstLetter] = impl?.name ?? ''

    const native =
        firstLetter && firstLetter === firstLetter.toLowerCase()
            ? impl?.bind?.(global) ?? impl
            : impl

    if (native)
        logger.info(
            `Using native '${api}', in many cases, shouldn't cause problems, but it's less safe than using ponyfill.`,
        )

    return native || false
}

function createErrorOnCall<T extends keyof TBragiPonyfill>(
    api: T,
    logger: IBragiLogger,
    safe: TBragiPonyfill,
    name = envName,
) {
    const msg = `This ${name} not have support to '${api}', please add a ponyfill.`

    logger.warn(`${msg} This throw an error if called.`)

    return (function (this: { error: true }) {
        this.error = true
        throw new safe.Error(msg)
    } as unknown) as TBragiPonyfill[T]
}
