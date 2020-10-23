import { TBragiPonyfill } from '../types'

import { defaultMessages } from '../config'

import { freeze } from './object'
import { IBragiLogger } from './logger'

type BExcluded<T> = Exclude<T, null | null[]>
// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export const createRunner = <
    RS = null,
    RA = null,
    RG = null,
    RV = null,
    PG = null,
    PS = null,
    PA = null
>(
    config: IBragiRunnerMethods<RS, RA, RG, RV, PG, PS, PA>,
    getSafe: () => TBragiPonyfill,
    getLogger: () => IBragiLogger,
    instanceName: string,
    // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
) => {
    const throwError = createThrowError(defaultMessages, config.messages)

    function run(allInDepth: BExcluded<PA>): BExcluded<RA>
    function run(
        firstTarget: BExcluded<Readonly<PS | PS[]>>,
        ...targets: BExcluded<Readonly<PS | PS[]>>[]
    ): BExcluded<RS>
    function run(
        targetGroup: BExcluded<PG>,
        ...targets: BExcluded<Readonly<PS | PS[]>>[]
    ): BExcluded<RG>
    function run(
        first: BExcluded<Readonly<PS | PS[]> | PA | PG>,
        ...targets: BExcluded<Readonly<PS | PS[]>>[]
    ) {
        const safe = getSafe()
        const logger = getLogger()

        config.verify?.(first, targets)

        const object = () => {
            const flat = [first, targets].flat(2) as PS[]

            throwError(flat.length === 0, 'empty', safe)

            return config.inSelection?.(flat)
        }

        const operations = {
            number: () => {
                logger.warn(`The first argument of type number is not allowed, this is unsafe!`)
                return instanceName
            },
            undefined: () => throwError(true, 'empty', safe),
            boolean: () => {
                throwError(targets.length > 0, 'notAllowed', safe)

                return config.inAll?.(first as PA)
            },
            string: () => config.inGroup?.(first as PG, targets.flat(2) as PS[]),
            object,
            symbol: object,
        }

        const operation = operations[typeof first as keyof typeof operations]

        throwError(!operation, 'invalid', safe)

        const result = operation()

        return (result ? freeze(result, safe) : null) as BExcluded<RS | RA | RG>
    }

    return run
}

function createThrowError<T = Readonly<{ [index: string]: string }>>(
    defaultMsgs: T,
    messages?: Partial<T>,
) {
    return (condition: boolean, msgKey: keyof T, safe: TBragiPonyfill) => {
        if (condition)
            throw new safe.Error(((messages?.[msgKey] ?? defaultMsgs[msgKey]) as unknown) as string)
    }
}

export interface IBragiRunnerMethods<RS, RA, RG, RV, PG, PS, PA> {
    verify?: (first: PG | PA | Readonly<PS | PS[]>, values: Readonly<PS | PS[]>[]) => RV
    inSelection?: (values: Readonly<PS[]>) => RS
    inGroup?: (name: PG, values: Readonly<PS[]>) => RG
    inAll?: (inDepth: PA) => RA
    messages?: Partial<typeof defaultMessages>
}
