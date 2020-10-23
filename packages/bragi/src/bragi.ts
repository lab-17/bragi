import { IAudioContext, IGainNode } from 'standardized-audio-context'

import {
    TBragiContext,
    TBragiPonyfill,
    TBragiNode,
    IBragiOptions,
    TBragiAddSourceOptions,
} from './types'

import { isBrowser, codecs, unlockEvents, listenerOptions, rootDefaultOptions } from './config'

import {
    freeze,
    createWebApisPonyfill,
    IBragiCodecsValidator,
    createCodecsValidator,
    setGain,
    createLogger,
    IBragiLogger,
    TBragiLoggerLevel,
    createRunner,
    createApplier,
    clearAndFreeze,
} from './util'

import { BragiSource } from './source'

let globalContext: TBragiContext
let globalSafe: TBragiPonyfill
let globalUserPonyfills: Partial<TBragiPonyfill>

let audioTool: HTMLMediaElement
let codecsValidator: IBragiCodecsValidator

let locked = true
let listening = false
let isSupported = true

export class Bragi {
    #context?: TBragiContext
    #destination?: IGainNode<IAudioContext>

    #autoUnlock: boolean
    #muted: boolean
    #gain: number

    readonly #name = 'BragiAudioGroup'

    readonly #safe: TBragiPonyfill

    readonly #mapper: IBragiStorageMaps
    readonly #inspect: Bragi['_inspect']

    readonly #logLevel: TBragiLoggerLevel
    readonly #logger: IBragiLogger

    readonly #sources: IBragiStorageMaps['sources']
    readonly #nodes: IBragiStorageMaps['nodes']
    readonly #toApplyNodes: IBragiStorageMaps['toApplyNodes']

    constructor(options: Partial<IBragiOptions> = {}) {
        const currentOptions = { ...rootDefaultOptions, ...options }

        const { autoUnlock, gain, muted, logLevel } = currentOptions

        this.#logLevel = logLevel
        this.#logger = createLogger(this.#logLevel)

        this.#safe = this.#getSafe()

        this.#autoUnlock = autoUnlock
        this.#gain = gain
        this.#muted = muted

        this.#inspect = this._inspect

        this.#mapper = freeze(
            {
                nodes: new this.#safe.Map(),
                sources: new this.#safe.Map(),
                toApplyNodes: new this.#safe.Map(),
            },
            this.#safe,
        )

        this.#sources = this.#mapper.sources
        this.#nodes = this.#mapper.nodes
        this.#toApplyNodes = this.#mapper.toApplyNodes

        this.#addUnlockListeners()

        clearAndFreeze(this, this.#safe)
    }

    static readonly setPonyfills = (
        ponyfills: Partial<TBragiPonyfill>,
    ): Partial<TBragiPonyfill> => {
        return globalUserPonyfills ?? (globalUserPonyfills = ponyfills)
    }

    readonly #getSafe = (): TBragiPonyfill => {
        return globalSafe ?? (globalSafe = this.#createSafe(globalUserPonyfills))
    }

    readonly #getLogger = (): IBragiLogger => {
        return this.#logger
    }

    readonly addSource = createApplier(({ label, ...options }: TBragiAddSourceOptions): symbol => {
        const id = this.#safe.Symbol(label)

        this.#sources.set(
            id,
            new BragiSource(
                this.#safe,
                this.#getContext,
                this.#getDestination,
                this.#getCodecs(),
                this.#logger,
                freeze(options, this.#safe),
            ),
        )

        return id
    }, this.#getSafe)

    readonly addNode = createApplier(({ label, target, ...options }: IBragiNodeOptions): symbol => {
        const id = this.#safe.Symbol(label)

        this.#toApplyNodes.set(id, [freeze(options, this.#safe), target])

        if (!locked) this.#applyNode(id)

        return id
    }, this.#getSafe)

    readonly removeSource = createRunner(
        {
            inAll: (_inDepth: true) => {
                this.cancel(true)
                this.#sources.forEach((methods) => {
                    methods.disconnect()
                })
                this.#sources.clear()
            },
            inSelection: (targets: readonly symbol[]) => {
                targets.forEach((target) => {
                    this.cancel(target)
                    this.#getSource(target).disconnect()
                    this.#sources.delete(target)
                })
            },
        },
        this.#getSafe,
        this.#getLogger,
        this.#name,
    )

    readonly removeNode = createRunner(
        {
            inAll: (_inDepth: true) => {
                this.#nodes.forEach((methods) => {
                    methods.disconnect()
                })
                this.#nodes.clear()
            },
            inSelection: (targets: readonly symbol[]) => {
                targets.forEach((target) => {
                    this.#getNode(target).disconnect()
                    this.#nodes.delete(target)
                })
            },
        },
        this.#getSafe,
        this.#getLogger,
        this.#name,
    )

    readonly resume = createRunner(
        {
            verify: () => {
                this.#unlock(true)
                this.#applyNode(true)
            },
            inAll: async (_inDepth: true) => {
                const promises: Promise<void>[] = []

                this.#sources.forEach((methods) => {
                    promises.push(methods.resume())
                })

                await this.#safe.Promise.all(promises)

                return
            },
            inSelection: async (targets: readonly symbol[]) => {
                await this.#safe.Promise.all(
                    targets.map((target) => {
                        return this.#getSource(target).resume()
                    }),
                )
                return
            },
        },
        this.#getSafe,
        this.#getLogger,
        this.#name,
    )

    readonly pause = createRunner(
        {
            inAll: (_inDepth: true) => {
                this.#sources.forEach((methods) => {
                    methods.pause()
                })
            },
            inSelection: (targets: readonly symbol[]) => {
                targets.forEach((target) => {
                    this.#getSource(target).pause()
                })
            },
        },
        this.#getSafe,
        this.#getLogger,
        this.#name,
    )

    readonly cancel = createRunner(
        {
            inAll: (_inDepth: true) => {
                this.#sources.forEach((methods) => {
                    methods.cancel()
                })
            },
            inSelection: (targets: readonly symbol[]) => {
                targets.forEach((target) => {
                    this.#getSource(target).cancel()
                })
            },
        },
        this.#getSafe,
        this.#getLogger,
        this.#name,
    )

    readonly mute = createRunner(
        {
            inAll: (inDepth: boolean) => {
                if (this.#muted) return

                const destination = this.#getDestination()
                const { minValue } = destination.gain

                setGain(destination, this.#getContext(), minValue)

                if (inDepth)
                    this.#sources.forEach((methods) => {
                        methods.mute()
                    })

                this.#muted = true

                return
            },
            inSelection: (targets: readonly symbol[]) => {
                targets.forEach((target) => {
                    this.#getSource(target).mute()
                })
            },
        },
        this.#getSafe,
        this.#getLogger,
        this.#name,
    )

    readonly unmute = createRunner(
        {
            inAll: (inDepth: boolean) => {
                if (!this.#muted) return

                setGain(this.#getDestination(), this.#getContext(), this.#gain)

                if (inDepth)
                    this.#sources.forEach((methods) => {
                        methods.unmute()
                    })

                this.#muted = false

                return
            },
            inSelection: (targets: readonly symbol[]) => {
                targets.forEach((target) => {
                    this.#getSource(target).unmute()
                })
            },
        },
        this.#getSafe,
        this.#getLogger,
        this.#name,
    )

    readonly inspect = createRunner(
        {
            inAll: (inDepth: boolean) => {
                const structure = this.#inspect()

                if (inDepth) {
                    const depthStructure = ({ ...structure } as unknown) as IBragiReturnInspect

                    ;(this.#safe.Object.keys(this.#mapper) as (keyof IBragiStorageMaps)[]).forEach(
                        (key) => {
                            depthStructure[key] = []
                            // eslint-disable-next-line @typescript-eslint/no-explicit-any
                            this.#mapper[key].forEach((methods: any) => {
                                depthStructure[key].push(methods?.inspect?.() ?? methods[0])
                            })
                        },
                    )

                    return depthStructure
                }

                return structure
            },
            inGroup: (name: keyof IBragiStorageMaps, targets: readonly symbol[]) => {
                const results: IBragiReturnInspect[typeof name][] = targets.map((target) => {
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    const current = this.#mapper[name].get(target) as any
                    return current?.inspect?.() ?? current[0]
                })

                if (results.length > 0) return results

                this.#mapper[name].forEach((methods: unknown) => {
                    const result =
                        (methods as BragiSource | undefined)?.inspect?.() ??
                        ((methods as unknown[] | undefined)?.[0] as IBragiNodeOptions) ??
                        methods

                    results.push(result as typeof result | any)
                })

                return results
            },
        },
        this.#getSafe,
        this.#getLogger,
        this.#name,
    )
    // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
    private readonly _inspect = () => ({
        autoUnlock: this.#autoUnlock,
        gain: this.#gain,
        isBrowser: isBrowser,
        listening: listening,
        locked: locked,
        muted: this.#muted,
        nodes: this.#nodes?.size ?? 0,
        safe: !!this.#safe,
        sources: this.#sources?.size ?? 0,
        toApplyNodes: this.#toApplyNodes?.size ?? 0,
        context: !!this.#context,
        isSupported: isSupported,
        codecs: this.#getCodecs().support,
    })

    // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
    readonly #getCodecs = () => {
        return (
            codecsValidator ??
            (codecsValidator = createCodecsValidator(
                audioTool ?? (audioTool = new this.#safe.Audio()),
                codecs,
                this.#safe,
            ))
        )
    }

    readonly #getContext = (): TBragiContext => {
        const context = this.#context

        if (!context) throw new this.#safe.Error(`AudioContext not initialized.`)

        return context
    }

    readonly #getDestination = (): IGainNode<IAudioContext> => {
        if (this.#destination) return this.#destination

        const ctx = this.#getContext()
        const node = ctx.createGain()
        node.connect(ctx.destination)

        setGain(node, ctx, this.#gain)

        return (this.#destination = node)
    }

    readonly #getSource = (id: symbol): BragiSource => {
        const source = this.#sources.get(id)

        if (!source) throw new this.#safe.Error(`Source ${id.toString()} not exists`)

        return source
    }
    readonly #getNode = (id: symbol): any => {
        const node = this.#nodes.get(id)

        if (!node) throw new this.#safe.Error(`Node ${id.toString()} not exists`)

        return node
    }

    readonly #applyNode = createRunner(
        {
            inAll: (_inDepth: true) => {
                return
            },
            inSelection: (_targets: readonly symbol[]) => {
                return
            },
        },
        this.#getSafe,
        this.#getLogger,
        this.#name,
    )

    readonly #unlock = (force?: Event | boolean): void => {
        if (!locked || !force) return

        locked = false

        this.#removeUnlockListeners()

        this.#context = globalContext ?? (globalContext = new this.#safe.AudioContext())
    }

    readonly #addUnlockListeners = (): void => {
        if (listening || !this.#autoUnlock) return

        listening = true

        unlockEvents.forEach((eventName) =>
            this.#safe.addEventListener(eventName, this.#unlock, listenerOptions),
        )
    }

    readonly #removeUnlockListeners = (): void => {
        if (!listening) return

        listening = false

        unlockEvents.forEach((eventName) => this.#safe.removeEventListener(eventName, this.#unlock))
    }

    readonly #setIsSupported = (newIsSupported: boolean): void => {
        isSupported = newIsSupported
    }

    readonly #createSafe = (ponyfills?: Partial<TBragiPonyfill>): TBragiPonyfill => {
        if (this.#safe) return this.#safe

        const result = createWebApisPonyfill(ponyfills, this.#logger)

        const [newIsSupported, newSafe] = result

        this.#setIsSupported(newIsSupported)

        return newSafe
    }
}

export const bragi = Bragi

export const setBragiPonyfills = Bragi.setPonyfills
export const useBragi = (options: Partial<IBragiOptions> = {}): Bragi => new Bragi(options)

export { Bragi as default }

export type TBragiPublicStates = Bragi['_inspect']
export interface IBragiStorageMaps {
    readonly sources: Map<symbol, BragiSource>
    readonly nodes: Map<symbol, TBragiNode>
    readonly toApplyNodes: Map<symbol, [IBragiNodeOptions, symbol?]>
}

export type IBragiReturnInspect = Omit<ReturnType<Bragi['_inspect']>, keyof IBragiStorageMaps> & {
    toApplyNodes: IBragiNodeOptions[]
    sources: ReturnType<BragiSource['inspect']>[]
    nodes: any[]
}

export interface IBragiNodeOptions {
    label?: string
    target?: symbol
}
