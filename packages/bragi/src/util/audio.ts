import { TBragiCodecs, TBragiSupportedExtension, TBragiValidatedCodecs } from '../types'

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export function createCodecsValidator(audioTool: HTMLMediaElement, possibleCodecs: TBragiCodecs) {
    const canPlayType = (type: string) => !!audioTool.canPlayType(type)

    const support = {} as TBragiValidatedCodecs<TBragiSupportedExtension>

    ;(Object.entries(possibleCodecs) as Array<[TBragiSupportedExtension, string[]]>).forEach(
        ([ext, codecs]) => {
            const isSupported = !codecs.find(canPlayType)
            support[ext] = isSupported
        },
    )

    const canPlayExt = (ext: TBragiSupportedExtension) => !!support[ext]

    return {
        canPlayType,
        canPlayExt,
        support,
    }
}

export function getFirstSupportedOrigin(
    origin: string | [TBragiSupportedExtension, string] | [TBragiSupportedExtension, string][],
    codecsValidator: IBragiCodecsValidator,
): string {
    console.log(origin)
    console.log(codecsValidator)
    return ''
}

export type IBragiCodecsValidator = ReturnType<typeof createCodecsValidator>
