import * as defaultModes from './modes'
import * as defaultTransports from './transports'

import { BragiMode } from './modes/types'
import { BragiTransport } from './transports/types'
import { BragiPonyfills, BragiOptions, BragiPonyfillOptions } from './types'

export class Bragi {
    private locked = true

    private safe: BragiPonyfills

    private mode: BragiMode
    private transport: BragiTransport

    readonly isBrowser = typeof window !== undefined
    readonly usedWebApis: (keyof BragiPonyfills)[] = ['AudioContext']
    readonly unlockEvents = ['touchstart', 'click']
    readonly defaultOptions = {
        autoUnlock: true,
        ponyfill: {},
    }

    constructor(options: BragiOptions = {}) {
        const { mode, modes, transport, transports, autoUnlock, ponyfill } = {
            ...this.defaultOptions,
            ...options,
        }

        this.safe = this.ponifyWebApis(ponyfill)

        this.transport = (transports ? { ...defaultTransports, ...transports } : defaultTransports)[
            transport ?? 'default'
        ]

        this.mode = new (modes ? { ...defaultModes, ...modes } : defaultModes)[mode ?? 'default']()

        if (!this.isBrowser) this.locked = false
        else if (autoUnlock) this.addUnlockListeners()
    }

    private ponifyWebApis(options: BragiPonyfillOptions): BragiPonyfills {
        const ponyfill = {} as BragiPonyfills

        this.usedWebApis.forEach((api) => {
            const impl = options[api] ?? window[api]

            if (!impl)
                throw new Error(`This browser not have support to ${name}, please add a ponyfill.`)

            ponyfill[api] = impl
        })

        return ponyfill
    }

    private addUnlockListeners(): void {
        this.unlockEvents.forEach((eventName) =>
            addEventListener(eventName, this.unlock, { passive: true }),
        )
    }
    private removeUnlockListeners(): void {
        this.unlockEvents.forEach((eventName) => removeEventListener(eventName, this.unlock))
    }

    public unlock(): void {
        this.locked = false
    }

    public removeSource(symbol: symbol): void {
        return
    }
    public removeSources(symbols: symbol[]): void {
        return
    }

    public implode(): void {
        this.removeUnlockListeners()
    }

    public play(symbol: symbol): void {
        return
    }

    public pause(symbol: symbol): void {
        return
    }

    public stop(symbol: symbol): void {
        return
    }

    public changeVolume(symbol: symbol): void {
        return
    }
}

new Bragi()

export default Bragi
