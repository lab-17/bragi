import {
    TBragiContext,
    TBragiPonyfill,
    TBragiSupportedExtension,
    IBragiCodecsValidator,
} from './types'

import { getFirstSupportedOrigin } from './util'

export class BragiSource {
    #safe: TBragiPonyfill

    #context?: TBragiContext
    #getContext: () => TBragiContext

    #codecs: IBragiCodecsValidator

    #controller: AbortController

    #origin: string | [TBragiSupportedExtension, string] | [TBragiSupportedExtension, string][]

    #type?: string
    #size?: number
    #stream?: ReadableStreamDefaultReader<Uint8Array>

    #loaded?: Promise<void>

    constructor(
        safe: TBragiPonyfill,
        getContext: () => TBragiContext,
        codecs: IBragiCodecsValidator,
        { origin }: any,
    ) {
        this.#safe = safe

        this.#getContext = getContext

        this.#codecs = codecs

        this.#controller = new this.#safe.AbortController()

        this.#origin = origin

        this.#preload()
    }

    // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
    get inspect() {
        return {
            safe: !!this.#safe,
            type: this.#type,
            size: this.#size,
        }
    }

    readonly #preload = () => {
        this.#loaded = this.#safe
            .fetch(getFirstSupportedOrigin(this.#origin, this.#codecs), {
                signal: this.#controller.signal,
            })
            .then(({ body, headers }) => {
                this.#type = headers.get('Content-Type') ?? undefined

                this.#verifyRequestType()

                const size = headers.get('Content-Size')
                this.#size = size ? +size : Infinity

                if (!body) throw new Error('Unexpected body undefined.')

                this.#stream = body.getReader()
            })
    }

    readonly #verifyRequestType = () => {
        if (!this.#type) throw new Error('Header Content-Type is undefined. Verify your server.')
        if (!this.#codecs.canPlayType(this.#type))
            throw new Error(`This browser not can't play type '${this.#type}'.`)
    }

    readonly #verifyContext = async (): Promise<void> => {
        await this.#loaded

        if (this.#context) return

        this.#context = this.#getContext()
    }

    readonly resume = async (): Promise<void> => {
        await this.#verifyContext()

        console.log(this.#stream, this.#context)
    }

    readonly pause = (): void => {
        return
    }

    readonly cancel = (): void => {
        return
    }

    readonly mute = (): void => {
        return
    }

    readonly unmute = (): void => {
        return
    }

    readonly disconnect = (): void => {
        return
    }
}
