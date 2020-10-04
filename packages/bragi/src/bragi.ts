import { BragiSource } from './source'

import { isBrowser, codecs, unlockEvents, listenerOptions, rootDefaultOptions } from './config'

import {
    TBragiContext,
    TBragiPonyfill,
    TBragiNode,
    IBragiOptions,
    IBragiSourceOptions,
} from './types'

import {
    freeze,
    remap,
    createWebApisPonyfill,
    IBragiCodecsValidator,
    createCodecsValidator,
    useSetGain,
    createLogger,
    IBragiLogger,
    TBragiLoggerLevel,
    createRunner,
} from './util'

import { IAudioContext, IGainNode } from 'standardized-audio-context'

let globalContext: TBragiContext
let safe: TBragiPonyfill

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

    readonly #mapper: Bragi['_mapper'] & { maps: IBragiStorageMaps }
    readonly #inspect: Bragi['_inspect']

    readonly #logLevel: TBragiLoggerLevel
    readonly #logger: IBragiLogger

    readonly #sources: IBragiStorageMaps['sources']
    readonly #nodes: IBragiStorageMaps['nodes']
    readonly #toApplyNodes: IBragiStorageMaps['toApplyNodes']

    constructor(options: Partial<IBragiOptions> = {}) {
        const currentOptions = { ...rootDefaultOptions, ...options }

        const { autoUnlock, gain, muted, ponyfills, logLevel } = currentOptions

        this.#logLevel = logLevel
        this.#logger = createLogger(this.#logLevel)

        this.#applyPonyfills(ponyfills)

        this.#autoUnlock = autoUnlock
        this.#gain = gain
        this.#muted = muted

        this.#inspect = this._inspect

        const maps: IBragiStorageMaps = {
            sources: new safe.Map(),
            nodes: new safe.Map(),
            toApplyNodes: new safe.Map(),
        }

        this.#mapper = {
            ...this._mapper,
            maps,
        }

        this.#sources = maps.sources
        this.#nodes = maps.nodes
        this.#toApplyNodes = maps.toApplyNodes

        this.#addUnlockListeners()

        freeze(remap(this, safe), safe)
    }

    readonly add = <T extends keyof Bragi['_mapper']['add']>(
        type: T,
        ...sourcesOrNodes: (
            | Parameters<Bragi['_mapper']['add'][T]>[0]
            | Parameters<Bragi['_mapper']['add'][T]>[0][]
        )[]
    ): symbol[] => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        return sourcesOrNodes.flat(2).map((options) => this.#mapper.add[type](options as any))
    }

    readonly remove = <T extends keyof Bragi['_mapper']['remove']>(
        type: T,
        ...targets: (symbol | symbol[])[]
    ): void => {
        this.#mapper.remove[type](targets.flat())
        return
    }

    readonly resume = createRunner({
        verify: () => {
            this.#unlock(true)
            this.#applyNode(true)
        },
        inAll: async (_inDepth: true) => {
            const promises: Promise<void>[] = []

            this.#sources.forEach((methods) => {
                promises.push(methods.resume())
            })

            await safe.Promise.all(promises)

            return
        },
        inSelection: async (targets: symbol[]) => {
            await safe.Promise.all(
                targets.map((target) => {
                    return this.#get('source', target).resume()
                }),
            )
            return
        },
    })

    readonly pause = createRunner({
        inAll: (_inDepth: true) => {
            this.#sources.forEach((methods) => {
                methods.pause()
            })
        },
        inSelection: (targets: symbol[]) => {
            targets.forEach((target) => {
                this.#get('source', target).pause()
            })
        },
    })

    readonly cancel = createRunner({
        inAll: (_inDepth: true) => {
            this.#sources.forEach((methods) => {
                methods.cancel()
            })
        },
        inSelection: (targets: symbol[]) => {
            targets.forEach((target) => {
                this.#get('source', target).cancel()
            })
        },
    })

    readonly mute = createRunner({
        inAll: (inDepth: boolean) => {
            if (this.#muted) return

            const destination = this.#get('destination')
            const { minValue } = destination.gain

            useSetGain(destination, this.#get('context'))(minValue)

            if (inDepth)
                this.#sources.forEach((methods) => {
                    methods.mute()
                })

            this.#muted = true

            return
        },
        inSelection: (targets: symbol[]) => {
            targets.forEach((target) => {
                this.#get('source', target).mute()
            })
        },
    })

    readonly unmute = createRunner({
        inAll: (inDepth: boolean) => {
            if (!this.#muted) return

            useSetGain(this.#get('destination'), this.#get('context'))(this.#gain)

            if (inDepth)
                this.#sources.forEach((methods) => {
                    methods.unmute()
                })

            this.#muted = false

            return
        },
        inSelection: (targets: symbol[]) => {
            targets.forEach((target) => {
                this.#get('source', target).unmute()
            })
        },
    })

    readonly inspect = createRunner({
        inAll: (inDepth: boolean) => {
            const structure = this.#inspect()

            if (inDepth) {
                const depthStructure = ({ ...structure } as unknown) as IBragiReturnInspect

                const { maps } = this.#mapper
                ;(safe.Object.keys(maps) as (keyof typeof maps)[]).forEach((key) => {
                    depthStructure[key] = []
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    maps[key].forEach((methods: any) => {
                        depthStructure[key].push(methods?.inspect?.() ?? methods[0])
                    })
                })

                return depthStructure
            }

            return structure
        },
        inGroup: (name: keyof IBragiStorageMaps, targets: symbol[]) => {
            const results: IBragiReturnInspect[typeof name][] = targets.map((target) => {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const current = this.#mapper.maps[name].get(target) as any
                return current?.inspect?.() ?? current[0]
            })

            if (results.length > 0) return results

            this.#mapper.maps[name].forEach((methods: unknown) => {
                const result =
                    (methods as BragiSource | undefined)?.inspect() ??
                    ((methods as unknown[] | undefined)?.[0] as IBragiNodeOptions) ??
                    methods

                results.push(result as typeof result | any)
            })

            return results
        },
    })
    // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
    private readonly _inspect = () => ({
        autoUnlock: this.#autoUnlock,
        gain: this.#gain,
        isBrowser: isBrowser,
        listening: listening,
        locked: locked,
        muted: this.#muted,
        nodes: this.#nodes?.size ?? 0,
        safe: !!safe,
        sources: this.#sources?.size ?? 0,
        toApplyNodes: this.#toApplyNodes?.size ?? 0,
        context: !!this.#context,
        isSupported: isSupported,
    })

    readonly #get = <T extends keyof Bragi['_mapper']['get']>(
        type: T,
        ...args: Parameters<Bragi['_mapper']['get'][T]> | Parameters<Bragi['_mapper']['get'][T]>[]
    ): ReturnType<Bragi['_mapper']['get'][T]> => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        return (this.#mapper.get[type] as any)(...args)
    }

    // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
    readonly #getCodecs = () => {
        return (
            codecsValidator ??
            (codecsValidator = createCodecsValidator(
                audioTool ?? (audioTool = new safe.Audio()),
                codecs,
                safe,
            ))
        )
    }
    readonly #getContext = (): TBragiContext => {
        const context = this.#context

        if (!context) throw new safe.Error(`AudioContext not initialized.`)

        return context
    }
    readonly #getDestination = (): IGainNode<IAudioContext> => {
        if (this.#destination) return this.#destination

        const ctx = this.#getContext()
        const node = ctx.createGain()
        node.connect(ctx.destination)

        useSetGain(node, ctx)(this.#gain)

        return (this.#destination = node)
    }
    readonly #getSource = (id: symbol): BragiSource => {
        const source = this.#sources.get(id)

        if (!source) throw new safe.Error(`Source ${id.toString()} not exists`)

        return source
    }
    readonly #getNode = (id: symbol): any => {
        const node = this.#nodes.get(id)

        if (!node) throw new safe.Error(`Node ${id.toString()} not exists`)

        return node
    }

    readonly #addSource = ({
        label,
        ...options
    }: IBragiSourceOptions & { label: string }): symbol => {
        const id = safe.Symbol(label)

        this.#sources.set(
            id,
            new BragiSource(
                safe,
                this.#getContext,
                this.#getDestination,
                this.#get('codecs'),
                this.#logger,
                options,
            ),
        )

        return id
    }
    readonly #addNode = ({ label, target, ...options }: IBragiNodeOptions): symbol => {
        const id = safe.Symbol(label)

        this.#toApplyNodes.set(id, [options, target])

        if (!locked) this.#applyNode(id)

        return id
    }

    readonly #removeSource = createRunner({
        inAll: (_inDepth: true) => {
            this.cancel(true)
            this.#sources.forEach((methods) => {
                methods.disconnect()
            })
            this.#sources.clear()
        },
        inSelection: (targets: symbol[]) => {
            targets.forEach((target) => {
                this.cancel(target)
                this.#get('source', target).disconnect()
                this.#sources.delete(target)
            })
        },
    })
    readonly #removeNode = createRunner({
        inAll: (_inDepth: true) => {
            this.#nodes.forEach((methods) => {
                methods.disconnect()
            })
            this.#nodes.clear()
        },
        inSelection: (targets: symbol[]) => {
            targets.forEach((target) => {
                this.#get('node', target).disconnect()
                this.#nodes.delete(target)
            })
        },
    })

    readonly #applyNode = createRunner({
        inAll: (_inDepth: true) => {
            return
        },
        inSelection: (_targets: symbol[]) => {
            return
        },
    })

    private readonly _mapper = {
        get: {
            destination: this.#getDestination,
            context: this.#getContext,
            codecs: this.#getCodecs,
            source: this.#getSource,
            node: this.#getNode,
        },
        add: {
            source: this.#addSource,
            node: this.#addNode,
        },
        remove: {
            source: this.#removeSource,
            node: this.#removeNode,
        },
    }

    readonly #unlock = (force?: Event | boolean): void => {
        if (!locked || !force) return

        locked = false

        this.#removeUnlockListeners()

        this.#context = globalContext || (globalContext = new safe.AudioContext())
    }

    readonly #addUnlockListeners = (): void => {
        if (listening || !this.#autoUnlock) return

        listening = true

        unlockEvents.forEach((eventName) =>
            safe.addEventListener(eventName, this.#unlock, listenerOptions),
        )
    }

    readonly #removeUnlockListeners = (): void => {
        if (!listening) return

        listening = false

        unlockEvents.forEach((eventName) => safe.removeEventListener(eventName, this.#unlock))
    }

    readonly #applyPonyfills = (ponyfills?: Partial<TBragiPonyfill>): void => {
        if (safe) return

        const [verifiedSupport, safeImplementations] = createWebApisPonyfill(
            ponyfills,
            this.#logger,
        )

        safe = safeImplementations
        isSupported = verifiedSupport
    }
}

export const bragi = Bragi

export const useBragi = (options: Partial<IBragiOptions> = {}): Bragi => new Bragi(options)

export { Bragi as default }

export type TBragiPublicStates = Bragi['_inspect']
export interface IBragiStorageMaps {
    sources: Map<symbol, BragiSource>
    nodes: Map<symbol, TBragiNode>
    toApplyNodes: Map<symbol, [IBragiNodeOptions, symbol?]>
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
