declare module '@cypress/code-coverage/task' {
    export default Cypress['PluginConfig']
}

declare module '@cypress/browserify-preprocessor' {
    const options = {
        typescript: '',
        browserifyOptions: {
            transform: [] as string[],
            extensions: [] as string[],
        },
        onBundle(_bundler: unknown): void {
            return
        },
    }

    const fn = function (
        _options: typeof options,
    ): (file: Cypress.FileObject) => string | Promise<string> {
        return
    }
    fn.defaultOptions = options

    export default fn
}
