import { createClient } from '@sanity/client'
import dotenv from 'dotenv'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// Load environment variables from studio directory
dotenv.config({ path: join(__dirname, '..', '.env') })

const client = createClient({
  projectId: process.env.SANITY_STUDIO_PROJECT_ID,
  dataset: process.env.SANITY_STUDIO_DATASET || 'production',
  apiVersion: '2024-01-01',
  useCdn: false,
  token: process.env.SANITY_WRITE_TOKEN,
})

async function getProjects() {
  try {
    const projects = await client.fetch(
      `*[_type == "project"]{ _id, client, slug, year, category, industry, tagline, metric, metricLabel } | order(publishedAt desc)`
    )
    return projects
  } catch (error) {
    console.error('Error fetching projects:', error)
    return []
  }
}

async function createPortfolioPage() {
  console.log('Fetching projects...')
  const projects = await getProjects()

  if (projects.length === 0) {
    console.warn('No projects found. Please create projects first using populate-case-studies.ts')
    return
  }

  console.log(`Found ${projects.length} projects`)

  // Get featured project (first one)
  const featuredProject = projects[0]
  
  // Get grid items (first 8 projects excluding featured)
  const gridProjects = projects.slice(0, 8)

  const portfolioPage = {
    _type: 'page',
    name: 'Portfolio',
    slug: { current: 'portfolio', _type: 'slug' },
    pageType: 'home',
    heading: null,
    subheading: null,
    pageBuilder: [
      {
        _key: 'hero',
        _type: 'pageHero',
        eyebrow: 'OUR WORK',
        heading: '200+ Products Shipped.',
        headingType: 'multipart',
        headingMultipart: {
          regular: '200+ Products',
          bold: 'Shipped.',
        },
        subheading: 'Here are a few we\'re most proud of.',
      },
      {
        _key: 'featured',
        _type: 'portfolioFeatured',
        caseStudy: {
          _type: 'reference',
          _ref: featuredProject._id
        }
      },
      {
        _key: 'grid',
        _type: 'portfolioGrid',
        items: gridProjects.map((p: any) => ({
          _type: 'reference',
          _ref: p._id
        })),
        serviceFilters: [
          { label: 'All', value: 'all' },
          { label: 'Engineering', value: 'engineering' },
          { label: 'AI Transformation', value: 'ai' },
          { label: 'Design', value: 'design' },
          { label: 'Strategy', value: 'strategy' },
        ],
        industryFilters: [
          { label: 'All', value: 'all' },
          { label: 'Media', value: 'media' },
          { label: 'Healthcare', value: 'healthcare' },
          { label: 'Fintech', value: 'fintech' },
          { label: 'E-Commerce', value: 'ecommerce' },
          { label: 'EdTech', value: 'edtech' },
          { label: 'SaaS', value: 'saas' },
          { label: 'Construction', value: 'construction' },
        ],
      },
      {
        _key: 'metrics',
        _type: 'portfolioMetrics',
        items: [
          { value: '200+', label: 'Projects' },
          { value: '10+', label: 'Industries served' },
          { value: '15+', label: 'Countries' },
          { value: '4.8/5', label: 'Average rating' },
        ],
      },
      {
        _key: 'cta',
        _type: 'portfolioCta',
        heading: {
          regular: 'Don\'t see your industry?',
          bold: 'We\'ve probably built in it.',
        },
        body: '500+ projects across healthcare, fintech, consumer apps, education, e-commerce, SaaS, media, and more. Let\'s talk about your project.',
        cta: {
          label: 'Start a project',
          href: '/contact',
        },
      },
    ],
  }

  console.log('Creating portfolio page...')

  try {
    // Check if portfolio page already exists
    const existingPage = await client.fetch(`*[_type == "page" && slug.current == "portfolio"][0]{ _id }`)
    
    if (existingPage) {
      console.log('Portfolio page already exists. Updating...')
      const result = await client.patch(existingPage._id).set(portfolioPage).commit()
      console.log(`Updated portfolio page: ${result.slug.current}`)
    } else {
      const result = await client.create(portfolioPage)
      console.log(`Created portfolio page: ${result.slug.current}`)
    }
  } catch (error) {
    console.error('Error creating portfolio page:', error)
  }
}

// Run the script
createPortfolioPage()
  .then(() => {
    console.log('Done!')
    process.exit(0)
  })
  .catch((error) => {
    console.error('Script failed:', error)
    process.exit(1)
  })
