module.exports = {
    title: 'Bragi',
    tagline: 'Web Audio Ecosystem',
    url: 'https://lab-17.github.io',
    baseUrl: '/bragi/',
    onBrokenLinks: 'warn',
    favicon: 'img/favicon.ico',
    organizationName: 'Sobrado 17',
    projectName: 'Bragi',
    themeConfig: {
        navbar: {
            title: 'Bragi.js',
            logo: {
                alt: 'Bragi.js logo',
                src: 'img/logo.svg',
            },
            items: [
                {
                    to: 'docs/',
                    activeBasePath: 'docs',
                    label: 'Docs',
                    position: 'left',
                },
                { to: 'blog/', label: 'Blog', position: 'left' },
                {
                    href: 'https://github.com/lab-17/bragi',
                    label: 'GitHub',
                    position: 'right',
                },
            ],
        },
        footer: {
            style: 'dark',
            links: [
                {
                    title: 'Docs',
                    items: [],
                },
                {
                    title: 'Community',
                    items: [
                        {
                            label: 'Stack Overflow',
                            href: 'https://stackoverflow.com/questions/tagged/bragi.js',
                        },
                    ],
                },
                {
                    title: 'More',
                    items: [
                        {
                            label: 'Blog',
                            to: 'blog',
                        },
                        {
                            label: 'GitHub',
                            href: 'https://github.com/lab-17/bragi',
                        },
                    ],
                },
            ],
            copyright: `Copyright © ${new Date().getFullYear()} <a href="https://github.com/Oak-V">Vinícius Carvalho</a> & <a href="https://github.com/lab-17">Sobrado 17</a>`,
        },
    },
    presets: [
        [
            '@docusaurus/preset-classic',
            {
                docs: {
                    path: 'www/docs',
                    sidebarPath: require.resolve('./www/src/sidebar.js'),
                    editUrl: 'https://github.com/lab-17/bragi/edit/master/www/docs',
                },
                blog: {
                    path: 'www/blog',
                    showReadingTime: true,
                    editUrl: 'https://github.com/lab-17/bragi/edit/master/www/blog/',
                },
                theme: {
                    customCss: require.resolve('./www/src/custom.css'),
                },
                pages: {
                    path: 'www/src/pages',
                },
            },
        ],
    ],
}
