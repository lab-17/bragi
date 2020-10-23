// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function createApplier<T extends (...args: any) => unknown>(fn: T, _getSafe: unknown) {
    return (...args: (Parameters<T>[0] | Parameters<T>[0][])[]): ReturnType<T>[] => {
        return args.flat(2).map(fn) as ReturnType<T>[]
    }
}
