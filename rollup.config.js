import { name } from './package.json'
import strip from '@rollup/plugin-strip'
import { getBabelOutputPlugin as babel } from '@rollup/plugin-babel'
import typescript from '@rollup/plugin-typescript'
import dts from 'rollup-plugin-dts'
import { terser } from 'rollup-plugin-terser'

const input = './src/index.ts'
const outputDir = './lib'

const commonConfig = {
    preferConst: true,
    sourcemap: true,
}

const nodeConfig = {
    ...commonConfig,
    preserveModules: true,
}

const browserConfig = {
    ...commonConfig,
}

const banedSupport = 'not dead and not op_mini all and not ie 11'
const legacySupport = `cover 99.5% and ${banedSupport}`
const modernSupport = `${legacySupport} and supports es6-module`
const nextSupport = `${modernSupport} and >=0.2% and last 3 major versions and last 5 versions`

export default [
    {
        input,
        plugins: [typescript(), strip()],
        output: [
            {
                ...nodeConfig,
                format: 'esm',
                dir: `${outputDir}/esm`,
                plugins: [
                    babel({
                        presets: [
                            [
                                '@babel/preset-env',
                                {
                                    targets: {
                                        browsers: nextSupport,
                                        node: true,
                                    },
                                },
                            ],
                        ],
                    }),
                ],
            },
            {
                ...nodeConfig,
                format: 'cjs',
                exports: 'named',
                dir: `${outputDir}/cjs`,
                plugins: [
                    babel({
                        presets: [
                            [
                                '@babel/preset-env',
                                {
                                    targets: { browsers: 'maintained node versions' },
                                },
                            ],
                        ],
                    }),
                ],
            },
        ],
    },
    {
        input,
        plugins: [dts()],
        output: [
            {
                preserveModules: true,
                preferConst: true,
                format: 'esm',
                dir: `${outputDir}/types`,
                plugins: [],
            },
        ],
    },
    {
        input,
        plugins: [typescript(), strip(), terser()],
        output: [
            {
                ...browserConfig,
                format: 'esm',
                file: `${outputDir}/bundle/esm/${name}.js`,
                plugins: [
                    babel({
                        presets: [
                            [
                                '@babel/preset-env',
                                {
                                    targets: {
                                        browsers: modernSupport,
                                    },
                                },
                            ],
                        ],
                    }),
                ],
            },
            {
                ...browserConfig,
                name,
                format: 'umd',
                exports: 'named',
                file: `${outputDir}/bundle/umd/${name}.js`,
                plugins: [
                    babel({
                        allowAllFormats: true,
                        presets: [
                            [
                                '@babel/preset-env',
                                {
                                    modules: 'umd',
                                    targets: {
                                        browsers: legacySupport,
                                    },
                                },
                            ],
                        ],
                    }),
                ],
            },
            {
                ...browserConfig,
                format: 'system',
                exports: 'named',
                file: `${outputDir}/bundle/system/${name}.js`,
                plugins: [
                    babel({
                        allowAllFormats: true,
                        presets: [
                            [
                                '@babel/preset-env',
                                {
                                    modules: 'systemjs',
                                    targets: {
                                        browsers: legacySupport,
                                    },
                                },
                            ],
                        ],
                    }),
                ],
            },
            {
                ...browserConfig,
                format: 'amd',
                exports: 'named',
                file: `${outputDir}/bundle/amd/${name}.js`,
                plugins: [
                    babel({
                        allowAllFormats: true,
                        presets: [
                            [
                                '@babel/preset-env',
                                {
                                    modules: 'amd',
                                    targets: {
                                        browsers: legacySupport,
                                    },
                                },
                            ],
                        ],
                    }),
                ],
            },
        ],
    },
]
