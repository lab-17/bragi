import { BragiPonyfills, BragiOptions, BragiPonyfillOptions } from './types'

export interface BragiController {
    play: () => void
    pause: () => void
    stop: () => void
    changeVolume: (value: number) => void
}

interface BragiSourceOptions {
    label?: string
    url: string
}

export class Bragi {
    private locked = true
    private muted = false
    private listening = false
    private volume = 1.0

    private audios = new Map<symbol, BragiController>()

    private context?: AudioContext
    private safe: BragiPonyfills

    readonly isBrowser = typeof window !== undefined
    readonly usedWebApis: (keyof BragiPonyfills)[] = ['AudioContext']
    readonly unlockEvents = ['touchstart', 'touchend', 'keydown', 'keyup', 'click']
    readonly listenerOptions = { passive: true }
    readonly defaultOptions = {
        autoUnlock: this.isBrowser,
        ponyfill: {},
    }

    constructor(options: BragiOptions = {}) {
        const currentOptions = { ...this.defaultOptions, ...options }

        const { autoUnlock, ponyfill } = currentOptions

        this.safe = this.ponifyWebApis(ponyfill)

        if (!this.isBrowser) this.unlock()
        else if (autoUnlock) this.addUnlockListeners()
    }

    private ponifyWebApis(options: BragiPonyfillOptions): BragiPonyfills {
        const ponyfill = {} as BragiPonyfills

        this.usedWebApis.forEach((api) => {
            const impl = options[api] ?? window[api]

            if (!impl)
                throw this.isBrowser
                    ? new Error(`This browser not have support to ${name}, please add a ponyfill.`)
                    : new Error(`This runtime not have support to ${name}, please add a ponyfill.`)

            ponyfill[api] = impl
        })

        return ponyfill
    }

    private addUnlockListeners(): void {
        if (this.listening || !this.isBrowser) return

        this.listening = true

        this.unlockEvents.forEach((eventName) =>
            addEventListener(eventName, this.unlock, this.listenerOptions),
        )
    }
    private removeUnlockListeners(): void {
        if (!this.listening) return

        this.unlockEvents.forEach((eventName) => removeEventListener(eventName, this.unlock))
    }

    private unlock(): void {
        if (!this.locked) return

        this.locked = false
        this.context = new this.safe.AudioContext()

        this.removeUnlockListeners()
    }

    private getSource(symbol: symbol): BragiController {
        const source = this.audios.get(symbol)

        if (!source) throw ''

        return source
    }

    public addSource(source: BragiSourceOptions): symbol {
        const symbol = Symbol(source.label ?? source.url)
        this.audios.set(symbol, source as any)
        return symbol
    }

    public addSources(sources: BragiSourceOptions[]): symbol[] {
        return sources.map((source) => {
            return this.addSource(source)
        })
    }

    public removeSource(symbol: symbol): void {
        this.stop(symbol)
        this.audios.delete(symbol)
    }
    public removeSources(symbols: symbol[]): void {
        symbols.forEach((symbol) => {
            this.removeSource(symbol)
        })
    }

    public play(symbol: symbol): void {
        this.unlock()

        this.getSource(symbol).play()
    }

    public playAll(): void {
        this.unlock()

        this.audios.forEach((methods) => {
            methods.play()
        })
    }

    public pause(symbol: symbol): void {
        this.getSource(symbol).pause()
    }

    public pauseAll(): void {
        this.audios.forEach((methods) => {
            methods.pause()
        })
    }

    public stop(symbol: symbol): void {
        this.getSource(symbol).stop()
    }

    public stopAll(): void {
        this.audios.forEach((methods) => {
            methods.stop()
        })
    }

    public delete(symbol: symbol): boolean {
        this.stop(symbol)
        return this.audios.delete(symbol)
    }

    public deleteAll(): boolean {
        this.stopAll()
        this.audios.clear()
        return this.audios.size === 0
    }

    public changeVolume(symbol: symbol, value: number): void {
        this.getSource(symbol).changeVolume(value)
    }
}

export default Bragi
