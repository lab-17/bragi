import { BragiTransport } from './types'

export class BragiTransportHtml implements BragiTransport {
    private source: HTMLAudioElement
    constructor(source: HTMLAudioElement) {
        this.source = source
    }
}

export default BragiTransportHtml
