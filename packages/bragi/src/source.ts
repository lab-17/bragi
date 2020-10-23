import { IAudioContext, IGainNode } from 'standardized-audio-context'

import { sourceDefaultOptions } from './config'

import { TBragiContext, TBragiPonyfill, IBragiCodecsValidator, IBragiSourceOptions } from './types'

import { freeze, getFirstSupportedOrigin, IBragiLogger, setGain } from './util'

export class BragiSource {
    #safe: TBragiPonyfill

    #getContext: () => TBragiContext
    #getRootDestination: () => IGainNode<IAudioContext>

    #destination?: IGainNode<IAudioContext>

    #codecs: IBragiCodecsValidator

    #controller: AbortController

    #origin: string

    #type?: string
    #size?: number
    #gain: number

    #logger: IBragiLogger

    #loaded?: Promise<ReadableStreamDefaultReader<Uint8Array>>

    constructor(
        safe: TBragiPonyfill,
        getContext: () => TBragiContext,
        getRootDestination: () => IGainNode<IAudioContext>,
        codecs: IBragiCodecsValidator,
        logger: IBragiLogger,
        options: Partial<IBragiSourceOptions>,
    ) {
        const currentOptions = { ...sourceDefaultOptions, ...options }

        const { gain, preload, origin } = currentOptions

        this.#logger = logger
        this.#safe = safe
        this.#getContext = getContext
        this.#getRootDestination = getRootDestination
        this.#codecs = codecs

        this.#gain = gain
        this.#origin = getFirstSupportedOrigin(origin, this.#codecs, this.#logger)

        this.#controller = new this.#safe.AbortController()

        if (preload) this.#loaded = this.#preload()
    }

    // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
    readonly inspect = () =>
        freeze(
            {
                safe: !!this.#safe,
                origin: this.#origin,
                type: this.#type,
                size: this.#size,
            },
            this.#safe,
        )

    // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
    readonly #getReader = () => this.#loaded || this.#preload()

    readonly #getDestination = (): IGainNode<IAudioContext> => {
        if (this.#destination) return this.#destination

        const ctx = this.#getContext()
        const node = ctx.createGain()
        node.connect(this.#getRootDestination())

        setGain(node, ctx, this.#gain)

        return (this.#destination = node)
    }

    // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
    readonly #preload = () =>
        this.#safe
            .fetch(this.#origin, {
                signal: this.#controller.signal,
            })
            .then(({ body, headers }) => {
                this.#setType(headers.get('Content-Type'))

                this.#setSize(headers.get('Content-Size'))

                if (!body) throw new this.#safe.Error('Unexpected body undefined.')

                return body.getReader()
            })

    readonly #setType = (type: string | null): void => {
        if (!type)
            throw new this.#safe.Error('Header Content-Type is undefined. Verify your server.')
        if (!this.#codecs.canPlayType(type))
            throw new this.#safe.Error(`This browser not can't play type '${type}'.`)

        this.#type = type
    }

    readonly #setSize = (size: string | null): void => {
        this.#size = size ? +size : Infinity
    }

    readonly resume = async (): Promise<void> => {
        const reader = await this.#getReader()

        const ctx = this.#getContext()

        let { buffer } = (await reader.read()).value ?? {}
        while (buffer) {
            const audioBufferChunk = await ctx.decodeAudioData(buffer)
            const source = ctx.createBufferSource()
            source.buffer = audioBufferChunk
            source.connect(this.#getDestination())
            source.start()
            buffer = undefined
        }
    }

    readonly pause = (): void => {
        return
    }

    readonly cancel = (): void => {
        this.#controller.abort()
    }

    readonly mute = (): void => {
        const destination = this.#getDestination()
        const { minValue } = destination.gain

        setGain(destination, this.#getContext(), minValue)
    }

    readonly unmute = (): void => {
        setGain(this.#getDestination(), this.#getContext(), this.#gain)
    }

    readonly disconnect = (): void => {
        return
    }
}
