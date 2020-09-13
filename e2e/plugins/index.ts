import codeCoverageTask from '@cypress/code-coverage/task'

import useIstanbul from './istanbul'

const plugins: Cypress.PluginConfig = (on, config) => {
    codeCoverageTask(on, config)

    on('file:preprocessor', useIstanbul)
    return config
}

module.exports = plugins
