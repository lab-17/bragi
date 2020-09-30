import { BragiSource } from './source'

import { defaultOptions, isBrowser, codecs, unlockEvents, listenerOptions } from './config'

import {
    TBragiContext,
    TBragiPonyfill,
    TBragiNode,
    TBragiRunMaybeInAll,
    TBragiRunInSelection,
    IBragiOptions,
} from './types'

import {
    freeze,
    remap,
    createRunner,
    createWebApisPonyfill,
    IBragiCodecsValidator,
    createCodecsValidator,
} from './util'

let globalContext: TBragiContext
let safe: TBragiPonyfill

let audioTool: HTMLMediaElement
let codecsValidator: IBragiCodecsValidator

let locked = true
let listening = false
let isSupported = true

export class Bragi {
    #context?: TBragiContext

    #autoUnlock: boolean
    #muted: boolean
    #gain: number

    readonly #mapper: Bragi['_mapper']

    readonly #sources: Map<symbol, BragiSource>
    readonly #nodes: Map<symbol, TBragiNode>
    readonly #toApplyNodes: Map<symbol, [any, symbol?]>

    public readonly inspect: Bragi['_inspect']

    constructor(options: Partial<IBragiOptions> = {}) {
        const currentOptions = { ...defaultOptions, ...options }

        const { autoUnlock, gain, muted, ponyfills } = currentOptions

        this.#applyPonyfills(ponyfills)

        this.#autoUnlock = autoUnlock
        this.#gain = gain
        this.#muted = muted

        this.#mapper = this._mapper
        this.inspect = this._inspect

        this.#sources = new safe.Map()
        this.#nodes = new safe.Map()
        this.#toApplyNodes = new safe.Map()

        this.#muted
        this.#gain

        this.#addUnlockListeners()

        freeze(remap(this))
    }

    readonly add = <T extends keyof Bragi['_mapper']['add']>(
        type: T,
        ...sourcesOrNodes: Parameters<Bragi['_mapper']['add'][T]>[]
    ): symbol[] => {
        return sourcesOrNodes.flat(2).map((options) => this.#mapper.add[type](options))
    }

    readonly remove = (
        type: keyof Bragi['_mapper']['remove'],
        first: TBragiRunMaybeInAll,
        ...targets: TBragiRunInSelection
    ): void => {
        return this.#mapper.remove[type](first, targets.flat())
    }

    readonly resume = createRunner({
        verify: () => {
            this.#unlock(true)
            this.#apply('node', true)
        },
        inAll: () => {
            const promises: Promise<void>[] = []
            this.#sources.forEach((methods) => {
                promises.push(methods.resume())
            })
            return Promise.all(promises)
        },
        inSelection: (target: symbol) => {
            return this.#get('source', target).resume()
        },
    })

    readonly pause = createRunner({
        inAll: () => {
            this.#sources.forEach((methods) => {
                methods.pause()
            })
        },
        inSelection: (target: symbol) => {
            this.#get('source', target).pause()
        },
    })

    readonly cancel = createRunner({
        inAll: () => {
            this.#sources.forEach((methods) => {
                methods.cancel()
            })
        },
        inSelection: (target) => {
            this.#get('source', target).cancel()
        },
    })

    readonly mute = createRunner({
        inAll: () => {
            if (this.#muted) return

            this.#muted = true

            this.#sources.forEach((methods) => {
                methods.mute()
            })
        },
        inSelection: (target) => {
            this.#get('source', target).mute()
        },
    })

    readonly unmute = createRunner({
        inAll: () => {
            if (!this.#muted) return

            this.#muted = false

            this.#sources.forEach((methods) => {
                methods.unmute()
            })
        },
        inSelection: (target) => {
            this.#get('source', target).unmute()
        },
    })

    readonly #get = <T extends keyof Bragi['_mapper']['get']>(
        type: T,
        ...args: Parameters<Bragi['_mapper']['get'][T]> | Parameters<Bragi['_mapper']['get'][T]>[]
    ): ReturnType<Bragi['_mapper']['get'][T]> => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        return (this.#mapper.get[type] as any)(...args)
    }

    readonly #apply = <T extends keyof Bragi['_mapper']['apply']>(
        type: T,
        ...args: Parameters<Bragi['_mapper']['apply'][T]>
    ): ReturnType<Bragi['_mapper']['apply'][T]> => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        return (this.#mapper.apply[type] as any)(...args)
    }

    readonly #getCodecs = () => {
        return (
            codecsValidator ??
            (codecsValidator = createCodecsValidator(
                audioTool ?? (audioTool = new safe.Audio()),
                codecs,
            ))
        )
    }
    readonly #getContext = (): TBragiContext => {
        const context = this.#context

        if (!context) throw new Error(`AudioContext not initialized.`)

        return context
    }
    readonly #getSource = (id: symbol): BragiSource => {
        const source = this.#sources.get(id)

        if (!source) throw new Error(`Source ${id.toString()} not exists`)

        return source
    }
    readonly #getNode = (id: symbol): any => {
        const node = this.#nodes.get(id)

        if (!node) throw new Error(`Node ${id.toString()} not exists`)

        return node
    }

    readonly #addSource = ({ label, ...options }: any): symbol => {
        const id = safe.Symbol(label)

        this.#sources.set(id, new BragiSource(safe, this.#getContext, this.#get('codecs'), options))

        return id
    }
    readonly #addNode = ({ label, target, ...options }: any): symbol => {
        const id = safe.Symbol(label)

        this.#toApplyNodes.set(id, [options, target])

        if (!locked) this.#apply('node', id)

        return id
    }

    readonly #removeSource = createRunner({
        inAll: () => {
            this.cancel(true)
            this.#sources.forEach((methods) => {
                methods.disconnect()
            })
            this.#sources.clear()
        },
        inSelection: (target: symbol) => {
            this.cancel(target)
            this.#get('source', target).disconnect()
            this.#sources.delete(target)
        },
    })
    readonly #removeNode = createRunner({
        inAll: () => {
            this.#nodes.forEach((methods) => {
                methods.disconnect()
            })
            this.#nodes.clear()
        },
        inSelection: (target) => {
            this.#get('node', target).disconnect()
            this.#nodes.delete(target)
        },
    })

    readonly #applyNode = createRunner({
        inAll: () => {
            return
        },
        inSelection: () => {
            return
        },
    })

    private readonly _mapper = {
        get: {
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
        apply: {
            node: this.#applyNode,
        },
    }

    // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
    get _inspect() {
        return {
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
        }
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

        const [verifiedSupport, safeImplementations] = createWebApisPonyfill(ponyfills)

        safe = safeImplementations
        isSupported = verifiedSupport
    }
}

export const bragi = Bragi

export const useBragi = (options: Partial<IBragiOptions> = {}): Bragi => new Bragi(options)

export { Bragi as default }

export type TBragiPublicStates = Bragi['_inspect']
