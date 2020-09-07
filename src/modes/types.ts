import * as modes from '.'

export interface BragiMode {}

export type BragiModes = Omit<typeof modes, 'default'>
export type BragiModesNames = keyof BragiModes
