module.exports = {
    preset: 'ts-jest',
    coverageDirectory: 'coverage',
    coverageProvider: 'v8',
    coverageReporters: ['lcov', 'text'],
    collectCoverageFrom: ['src/**/*.ts'],
    coveragePathIgnorePatterns: [`\\/types\\.ts$`, `\\/index\\.ts$`],
    coverageThreshold: {
        global: {
            branches: 80,
            functions: 80,
            lines: 80,
            statements: -10,
        },
    },
}
