import React from 'react'
import Link from '@docusaurus/Link'
import Layout from '@theme/Layout'
import useDocusaurusContext from '@docusaurus/useDocusaurusContext'
import useBaseUrl from '@docusaurus/useBaseUrl'

const features: any[] = []

function FeatureText({ title, description }) {
    return (
        <>
            <h3>{title}</h3>
            <p>{description}</p>
        </>
    )
}

function FeatureImage({ imageUrl, title }) {
    const imgUrl = useBaseUrl(imageUrl)
    return (
        imageUrl && (
            <div>
                <img src={imgUrl} alt={title} />
            </div>
        )
    )
}
function Feature({ imageUrl, title, description }) {
    return (
        <div>
            <FeatureImage imageUrl={imageUrl} title={title} />
            <FeatureText title={title} description={description} />
        </div>
    )
}

function HomeHeroText({ siteConfig }) {
    return (
        <>
            <h1>{siteConfig.title}</h1>
            <p>{siteConfig.tagline}</p>
        </>
    )
}

function HomeHeroBtn() {
    return (
        <div>
            <Link to={useBaseUrl('docs/')}>Get Started</Link>
        </div>
    )
}

function HomeHero({ siteConfig }) {
    return (
        <div>
            <HomeHeroText siteConfig={siteConfig} />
            <HomeHeroBtn />
        </div>
    )
}

function HomeHeader({ siteConfig }) {
    return (
        <header>
            <HomeHero siteConfig={siteConfig} />
        </header>
    )
}

function HomeMain() {
    return (
        <main>
            {features.map((props, idx) => (
                <Feature key={idx} {...props} />
            ))}
        </main>
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
            <HomeHeader siteConfig={siteConfig} />
            <HomeMain />
        </Layout>
    )
}

export default Home
