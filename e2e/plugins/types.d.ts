declare module '@cypress/code-coverage/task' {
    export default Cypress['PluginConfig']
}

declare module '@cypress/browserify-preprocessor' {
    const fn = function (options): (file: Cypress.FileObject) => string | Promise<string> {
        return
    }

    const options: {
        [index: string]: any
    } = {}

    fn.defaultOptions = options

    export default fn
}
