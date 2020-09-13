module.exports = {
    preset: 'ts-jest',
    testEnvironment: 'node',
    collectCoverage: true,
    coverageDirectory: 'coverage/server',
    coverageReporters: ['json'],
    collectCoverageFrom: ['src/**/*.ts'],
    testRegex: ['/tests/server/.*\\.spec\\.ts$'],
    coveragePathIgnorePatterns: [`(\\/|\\.)types\\.ts$`],
    watchPathIgnorePatterns: [
        '.*\\.(js|md|yml|json|lock)$',
        '^\\..*',
        '^(audio|coverage|lib|e2e|docs|tests\\/client|node_modules)\\/*',
    ],
}
