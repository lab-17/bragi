import * as transports from '.'

export interface BragiTransport {}

export type BragiTransports = Omit<typeof transports, 'default'>
export type BragiTransportsNames = keyof BragiTransports
