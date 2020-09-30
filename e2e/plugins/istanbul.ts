import { nextSupport } from '../../packages/bragi/rollup.config'
import useBrowserify from '@cypress/browserify-preprocessor'
import { BrowserifyObject } from 'browserify'

const options = useBrowserify.defaultOptions

options.typescript = require.resolve('typescript')
options.browserifyOptions.transform = []
options.browserifyOptions.extensions = ['.js']

options.onBundle = (bundler: BrowserifyObject) => {
    bundler.transform(require.resolve('@cypress/browserify-preprocessor/node_modules/babelify'), {
        plugins: ['babel-plugin-istanbul'],
        extensions: ['.ts', '.js'],
        presets: [['@babel/preset-env', { targets: nextSupport }]],
    })
}

export default useBrowserify(options)
