import { BragiTransport } from './types'

export class BragiTransportHttp implements BragiTransport {
    private source: ReadableStream
    constructor(source: ReadableStream) {
        this.source = source
    }
}

export default BragiTransportHttp
