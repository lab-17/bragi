import { IBragiRunner, TBragiRunInSelection, TBragiRunMaybeInAll } from '../types'

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export function createRunner(methods: IBragiRunner) {
    // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
    return (first: TBragiRunMaybeInAll, ...targets: TBragiRunInSelection) =>
        run(methods, first, targets)
}
function run(
    methods: IBragiRunner,
    first: TBragiRunMaybeInAll,
    targets: TBragiRunInSelection,
): void {
    methods.verify?.()
    typeof first === 'boolean'
        ? methods.inAll(first)
        : [first, targets].flat(2).forEach((target) => {
              methods.inSelection(target)
          })
}
