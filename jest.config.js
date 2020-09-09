module.exports = {
    preset: 'ts-jest',
    coverageProvider: 'v8',
    coverageReporters: ['lcov', 'text-summary'],
    collectCoverageFrom: ['src/**/*.ts'],
    coveragePathIgnorePatterns: [`\\/(types|index)\\.ts$`],
    watchPathIgnorePatterns: ['.*\\.(js|md|yml|json|lock)$', '^\\..*', '^(audio|coverage|lib)\\/*'],
    // coverageThreshold: {
    //     global: {
    //         branches: 80,
    //         functions: 80,
    //         lines: 80,
    //         statements: -10,
    //     },
    // },
}
