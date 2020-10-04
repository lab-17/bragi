import { IAudioContext, IGainNode } from 'standardized-audio-context'
import { envName } from '../config'
import {
    IBragiSourceOptions,
    TBragiCodecs,
    TBragiPonyfill,
    TBragiSupportedExtension,
    TBragiValidatedCodecs,
} from '../types'
import { IBragiLogger } from './logger'

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export function createCodecsValidator(
    audioTool: HTMLMediaElement,
    possibleCodecs: TBragiCodecs,
    safe: TBragiPonyfill,
) {
    const canPlayType = (type: string) => !!audioTool.canPlayType(type)

    const support = {} as TBragiValidatedCodecs<TBragiSupportedExtension>

    ;(safe.Object.entries(possibleCodecs) as Array<[TBragiSupportedExtension, string[]]>).forEach(
        ([ext, codecs]) => {
            support[ext] = !!codecs.find(canPlayType)
        },
    )

    const canPlayExt = (ext: string) => !!support[ext as TBragiSupportedExtension]

    return {
        canPlayType,
        canPlayExt,
        support,
    }
}

export function getFirstSupportedOrigin(
    origin: IBragiSourceOptions['origin'],
    codecsValidator: IBragiCodecsValidator,
    logger: IBragiLogger,
): string {
    if (typeof origin === 'string') {
        if (!codecsValidator.canPlayExt(getExt(origin, logger)))
            logger.warn(getNotSupportMsg(origin))

        return origin
    }

    const [first, possibleOrigin] = origin

    if (typeof first === 'string') {
        if (!codecsValidator.canPlayExt(getExt(first, logger))) logger.warn(getNotSupportMsg(first))

        return (possibleOrigin ?? first) as string
    }

    const [, supported] =
        (origin as [string, string][]).find(([ext, current]) => {
            return (
                codecsValidator.canPlayExt(getExt(ext, logger)) ||
                logger.info(getNotSupportMsg(current))
            )
        }) ||
        logger.warn(getNotSupportMsg(first[1])) ||
        first

    return supported
}

function getExt(origin: string, logger: IBragiLogger): string {
    const [cleanOrigin] = origin.split('?', 1)
    const [, ext] = /\.([^.]+)$/.exec(cleanOrigin) ?? []

    if (!ext)
        logger.warn(
            `File/Stream extension not defined, the lib can't detect real compatibility before the preload. Read more on https://`,
        )

    return ext
}

function getNotSupportMsg(origin: string, name = envName): string {
    return `The '${origin}' origin is not supported in this ${name}.`
}

export function useSetGain({ gain }: IGainNode<IAudioContext>, { currentTime }: IAudioContext) {
    return (value: number): void => {
        gain.setValueAtTime(value, currentTime)
    }
}

export type IBragiCodecsValidator = ReturnType<typeof createCodecsValidator>
