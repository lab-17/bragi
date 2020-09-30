import React from 'react'
import Link from '@docusaurus/Link'
import Layout from '@theme/Layout'
import useDocusaurusContext from '@docusaurus/useDocusaurusContext'
import useBaseUrl from '@docusaurus/useBaseUrl'

const features: any[] = []

function Feature({ imageUrl, title, description }: any) {
    const imgUrl = useBaseUrl(imageUrl)
    return (
        <div>
            {imgUrl && (
                <div>
                    <img src={imgUrl} alt={title} />
                </div>
            )}
            <h3>{title}</h3>
            <p>{description}</p>
        </div>
    )
}

function Home() {
    const context = useDocusaurusContext()
    const { siteConfig = {} } = context
    return (
        <Layout
            title={`Hello from ${siteConfig.title}`}
            description="Description will go into a meta tag in <head />"
        >
            <header>
                <div>
                    <h1>{siteConfig.title}</h1>
                    <p>{siteConfig.tagline}</p>
                    <div>
                        <Link to={useBaseUrl('docs/')}>Get Started</Link>
                    </div>
                </div>
            </header>
            <main>
                {features && features.length > 0 && (
                    <section>
                        <div>
                            <div>
                                {features.map((props, idx) => (
                                    <Feature key={idx} {...props} />
                                ))}
                            </div>
                        </div>
                    </section>
                )}
            </main>
        </Layout>
    )
}

export default Home
