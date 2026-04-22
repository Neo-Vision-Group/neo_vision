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

// Categories from the schema
const categories = [
  { title: 'AI Transformation', value: 'ai-transformation' },
  { title: 'Engineering', value: 'engineering' },
  { title: 'Design Research', value: 'design-research' },
  { title: 'Systems Playbooks', value: 'systems-playbooks' },
  { title: 'Operators Notes', value: 'operators-notes' },
]

// Sample titles and content for insights
const sampleTitles = [
  'The Future of AI in Enterprise',
  'Building Scalable ML Infrastructure',
  'Design Systems for AI Products',
  'Operational Excellence in Data Teams',
  'AI Ethics: A Practical Guide',
  'From Prototype to Production',
  'The Economics of AI Adoption',
  'Human-Centered AI Design',
  'Data Governance at Scale',
  'Building Trust in AI Systems',
  'The Rise of Edge AI',
  'Machine Learning Operations Best Practices',
  'AI-Powered User Research',
  'The Role of AI in Product Strategy',
  'Building Resilient AI Systems',
  'The Future of Work with AI',
  'AI for Social Good',
  'The Intersection of AI and Design',
  'Managing Technical Debt in ML',
  'The Psychology of AI Adoption',
  'AI-Powered Decision Making',
  'Building Inclusive AI Products',
  'The Future of Natural Language Processing',
  'AI in Healthcare: Opportunities and Challenges',
  'The Role of AI in Climate Change',
  'Building AI Teams That Scale',
  'The Ethics of Generative AI',
  'AI-Powered Personalization',
  'The Future of Computer Vision',
  'Building Trustworthy AI Systems',
  'AI in Finance: A Practical Guide',
  'The Role of AI in Education',
  'Building AI-Powered Products',
  'The Future of Robotics and AI',
  'AI-Powered Analytics',
  'The Role of AI in Supply Chain',
  'Building AI for Good',
  'The Future of AI Regulation',
  'AI-Powered Customer Service',
  'The Role of AI in Marketing',
  'Building AI-Powered Workflows',
  'The Future of AI Research',
  'AI-Powered Content Creation',
  'The Role of AI in Cybersecurity',
  'Building AI-Powered Platforms',
  'The Future of AI Hardware',
  'AI-Powered Automation',
  'The Role of AI in Agriculture',
  'Building AI-Powered Solutions',
  'The Future of AI Standards',
]

const sampleExcerpts = [
  'Explore how artificial intelligence is transforming enterprise operations and driving innovation across industries.',
  'Learn the best practices for building machine learning infrastructure that scales with your business needs.',
  'Discover how design systems can help create consistent and user-friendly AI-powered products.',
  'Understand the key principles of operational excellence for data teams and ML organizations.',
  'A practical guide to implementing ethical AI practices in your organization.',
  'From initial prototype to production deployment: lessons learned from real-world AI projects.',
  'Analyze the costs and benefits of AI adoption for businesses of all sizes.',
  'Putting humans at the center of AI design: creating products that augment human capabilities.',
  'Strategies for implementing data governance frameworks that scale with your organization.',
  'Building trust in AI systems through transparency, fairness, and accountability.',
]

const generatePortableText = (title: string, category: string) => {
  return [
    {
      _type: 'block',
      style: 'normal',
      children: [
        {
          _type: 'span',
          text: `In the rapidly evolving landscape of ${category === 'ai-transformation' ? 'AI transformation' : category.replace('-', ' ')}, ${title.toLowerCase()} represents a significant opportunity for organizations looking to stay ahead of the curve.`,
        },
      ],
    },
    {
      _type: 'block',
      style: 'h2',
      children: [{ _type: 'span', text: 'Key Insights' }],
    },
    {
      _type: 'block',
      style: 'normal',
      children: [
        {
          _type: 'span',
          text: 'This comprehensive exploration covers the fundamental concepts, practical applications, and strategic considerations that organizations need to understand when implementing these technologies.',
        },
      ],
    },
    {
      _type: 'block',
      style: 'h3',
      children: [{ _type: 'span', text: 'Practical Applications' }],
    },
    {
      _type: 'block',
      style: 'normal',
      children: [
        {
          _type: 'span',
          text: 'Real-world examples demonstrate how leading organizations are successfully leveraging these approaches to drive business value and competitive advantage.',
        },
      ],
    },
    {
      _type: 'object',
      name: 'keyPoint',
      _key: 'keypoint1',
      label: 'Key Takeaway',
      body: 'Implementation requires careful planning, cross-functional collaboration, and a clear understanding of business objectives.',
    },
    {
      _type: 'block',
      style: 'h2',
      children: [{ _type: 'span', text: 'Conclusion' }],
    },
    {
      _type: 'block',
      style: 'normal',
      children: [
        {
          _type: 'span',
          text: 'As we look to the future, organizations that embrace these technologies thoughtfully and strategically will be well-positioned to thrive in an increasingly competitive landscape.',
        },
      ],
    },
  ]
}

async function getTeamMembers() {
  try {
    const teamMembers = await client.fetch(
      `*[_type == "teamMember"]{ _id, name } | order(order asc)`
    )
    return teamMembers
  } catch (error) {
    console.error('Error fetching team members:', error)
    return []
  }
}

async function createInsights() {
  console.log('Fetching team members...')
  const teamMembers = await getTeamMembers()

  if (teamMembers.length === 0) {
    console.warn('No team members found. Please create team members first.')
    console.warn('You can create them in the Sanity Studio or modify this script to create them.')
    return
  }

  console.log(`Found ${teamMembers.length} team members`)

  const insights = []
  const usedTitles = new Set<string>()

  for (let i = 0; i < 50; i++) {
    const category = categories[i % categories.length]
    let title = sampleTitles[i % sampleTitles.length]
    
    // Add suffix to duplicate titles
    let suffix = 1
    let uniqueTitle = title
    while (usedTitles.has(uniqueTitle)) {
      uniqueTitle = `${title} ${suffix}`
      suffix++
    }
    usedTitles.add(uniqueTitle)
    title = uniqueTitle

    const slug = title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '')
    
    const author = teamMembers[i % teamMembers.length]
    const excerpt = sampleExcerpts[i % sampleExcerpts.length]
    const readTime = Math.floor(Math.random() * 10) + 3 // 3-13 minutes
    const featured = i < 5 // First 5 are featured
    const order = i

    const insight = {
      _type: 'post',
      title,
      slug: { current: slug, _type: 'slug' },
      publishedAt: new Date(
        Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000
      ).toISOString(),
      excerpt,
      author: { _type: 'reference', _ref: author._id },
      category: category.value,
      readTime,
      featured,
      body: generatePortableText(title, category.value),
      order,
    }

    insights.push(insight)
  }

  console.log(`Creating ${insights.length} insights...`)

  try {
    const results = []
    for (const insight of insights) {
      const result = await client.create(insight)
      results.push(result)
      console.log(`Created: ${result.title} (slug: ${result.slug.current})`)
    }
    console.log(`Successfully created ${results.length} insights!`)
  } catch (error) {
    console.error('Error creating insights:', error)
  }
}

// Run the script
createInsights()
  .then(() => {
    console.log('Done!')
    process.exit(0)
  })
  .catch((error) => {
    console.error('Script failed:', error)
    process.exit(1)
  })
