import { name } from './package.json'
import strip from '@rollup/plugin-strip'
import { getBabelOutputPlugin as babel } from '@rollup/plugin-babel'
import typescript from '@rollup/plugin-typescript'
import dts from 'rollup-plugin-dts'
import { terser } from 'rollup-plugin-terser'

const [, filename] = name.split('/')

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

const nodeLegacySupport = 'maintained node versions'

const node = {
    input,
    plugins: [typescript(), strip()],
    output: [
        { format: 'esm', browsers: nextSupport, node: true },
        { format: 'cjs', exports: 'named' },
    ].map(createNodeOutputConfig),
}

const typeDefinitions = {
    input,
    plugins: [dts()],
    output: [
        {
            ...nodeConfig,
            sourcemap: false,
            format: 'esm',
            dir: `${outputDir}/types`,
            plugins: [],
        },
    ],
}

const browsers = {
    input,
    plugins: [typescript(), strip(), terser()],
    output: [
        { format: 'esm', modules: 'auto', browsers: modernSupport },
        { name: filename, format: 'umd' },
        { format: 'system', modules: 'systemjs' },
        { format: 'amd' },
    ].map(createBrowserOutputConfig),
}

console.log(JSON.stringify([node, typeDefinitions, browsers], null, 2))

export default [node, typeDefinitions, browsers]

function createNodeOutputConfig({ format, browsers, node, exports }) {
    const targets = {
        browsers: browsers ?? nodeLegacySupport,
    }

    if (node) targets.node = node

    return {
        ...nodeConfig,
        format,
        dir: `${outputDir}/${format}`,
        exports,
        plugins: [
            babel({
                presets: [
                    [
                        '@babel/preset-env',
                        {
                            targets,
                        },
                    ],
                ],
            }),
        ],
    }
}

function createBrowserOutputConfig({ name, format, modules, browsers }) {
    const babelPlugin = babel({
        allowAllFormats: true,
        presets: [
            [
                '@babel/preset-env',
                {
                    modules: modules ?? format,
                    targets: {
                        browsers: browsers ?? legacySupport,
                    },
                },
            ],
        ],
    })

    return {
        ...browserConfig,
        name,
        format,
        exports: 'named',
        file: `${outputDir}/bundle/${format}/${filename}.js`,
        plugins: [babelPlugin],
    }
}
