import { BragiTransport } from './types'

export class BragiTransportSocket implements BragiTransport {
    private source: WebSocket
    constructor(source: WebSocket) {
        this.source = source
    }
}

export default BragiTransportSocket
