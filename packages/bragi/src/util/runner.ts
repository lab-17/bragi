// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export function createRunner<RS, RA, RG, RV, PG = null, PS = null, PA = null, PSG = null>(
    methods: IBragiRunnerMethods<RS, RA, RG, RV, PG, PS, PA, PSG>,
) {
    function run(
        target: Exclude<PS | PS[], null | null[]>,
        ...targets: Exclude<(PS | PS[])[], (null | null[])[]>
    ): RS
    function run(
        groupName: Exclude<PG, null> & string,
        ...targets: Exclude<(PSG | PSG[])[], (null | null[])[]>
    ): RG
    function run(allInDepth: Exclude<PA, null>): RA
    function run(
        first: PS | PS[] | PA | PG,
        ...targets: (PS | PS[] | PSG | PSG[])[]
    ): RS | RA | RG | void {
        methods.verify?.(first, targets)

        if (typeof first === 'boolean') return methods.inAll?.(first as PA)
        if (typeof first === 'string')
            return methods.inGroup?.(first as PG, targets.flat(2) as PSG[])

        return methods.inSelection?.([first, targets].flat(2) as PS[])
    }

    return run
}

export interface IBragiRunnerMethods<RS, RA, RG, RV, PG, PS, PA, PSG = PS> {
    verify?: (first: PG | PA | PS | PS[], values: (PS | PS[] | PSG | PSG[])[]) => RV
    inSelection?: (values: PS[]) => RS
    inGroup?: (name: PG, values: PSG[]) => RG
    inAll?: (inDepth: PA) => RA
}
