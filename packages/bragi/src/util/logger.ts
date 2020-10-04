import { safeGlobal } from '../config'

const prefix = '[Bragi]:'

const logLevels = {
    error() {
        return ['error']
    },
    warn() {
        return ['error', 'warn']
    },
    info() {
        return ['error', 'warn', 'info']
    },
    debug() {
        return 'debug'
    },
    none() {
        return []
    },
}

const setLogLevel = (level: TBragiLoggerLevel): string[] | string => logLevels[level]()

const useLog = (currentLogLevel: string[] | string, global = safeGlobal) => (
    level: keyof typeof console,
    ...data: unknown[]
) => {
    if (currentLogLevel === 'debug' || currentLogLevel.includes(level))
        return global.console[level](prefix, ...data)
}

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export function createLogger(level: TBragiLoggerLevel, global = safeGlobal) {
    const currentLogLevel = setLogLevel(level)

    const log = useLog(currentLogLevel, global)

    return {
        warn: (...data: unknown[]): void => log('warn', ...data),
        info: (...data: unknown[]): void => log('info', ...data),
        error: (...data: unknown[]): void => log('error', ...data),
        debug: (
            type: Exclude<keyof typeof console, TBragiLoggerLevel> | true,
            ...data: unknown[]
        ): void => log(type === true ? 'debug' : type, ...data),
    }
}

export type TBragiLoggerLevel = keyof typeof logLevels
export type IBragiLogger = ReturnType<typeof createLogger>
