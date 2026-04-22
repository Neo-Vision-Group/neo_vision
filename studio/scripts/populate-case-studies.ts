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

// Sample data
const clients = [
  'Forbes Romania', 'Confidas', 'TechCorp', 'HealthFirst', 'FinServe',
  'EduTech Solutions', 'MediaHub', 'SaaSify', 'BuildPro', 'RetailMax',
  'CloudScale', 'DataFlow', 'AI Innovations', 'SmartRetail', 'MediConnect',
  'FinTech Pro', 'LearnPlatform', 'StreamMedia', 'EnterpriseSoft', 'ConstructAI',
  'AgriTech Solutions', 'CyberSecure', 'MarketingAI', 'AutoFlow', 'SupplyChain Pro',
  'EcoEnergy', 'LegalTech', 'TravelAI', 'FoodTech', 'SportAnalytics',
  'MusicStream', 'GamingPlatform', 'SocialConnect', 'DeliveryPro', 'GreenTech'
]

const categories = [
  'Engineering', 'AI Transformation', 'Design', 'Strategy',
  'Engineering + AI', 'Design + AI', 'Strategy + AI'
]

const industries = [
  'media', 'fintech', 'healthcare', 'ecommerce', 'edtech',
  'saas', 'construction', 'agriculture', 'cybersecurity', 'marketing',
  'automotive', 'logistics', 'energy', 'legal', 'travel',
  'food', 'sports', 'entertainment', 'gaming', 'social'
]

const taglines = [
  'Headless NLP-powered personalization that increased traffic by 42%.',
  'AI-powered NLP content personalization driving 3x engagement.',
  'Scalable microservices architecture reducing costs by 35%.',
  'Real-time analytics dashboard processing 1M+ events daily.',
  'Machine learning recommendation engine boosting conversion by 28%.',
  'Design system implementation improving development velocity by 40%.',
  'Cloud migration strategy reducing infrastructure costs by 50%.',
  'AI-powered customer support reducing response time by 60%.',
  'Progressive web app increasing mobile engagement by 45%.',
  'Data pipeline automation saving 200+ hours monthly.',
  'API gateway implementation improving security and performance.',
  'Mobile-first redesign increasing conversion by 35%.',
  'AI fraud detection reducing false positives by 70%.',
  'Real-time collaboration platform for distributed teams.',
  'E-commerce personalization driving 25% revenue increase.',
  'Healthcare AI assistant improving diagnosis accuracy by 30%.',
  'FinTech platform processing $1B+ in transactions.',
  'EdTech platform serving 500K+ active students.',
  'Media streaming platform handling 10M+ concurrent users.',
  'Construction management tool reducing project delays by 40%.',
  'AgriTech IoT platform monitoring 100K+ sensors.',
  'Cybersecurity solution detecting threats in real-time.',
  'Marketing automation platform increasing ROI by 45%.',
  'Autonomous vehicle AI system achieving 99.9% accuracy.',
  'Supply chain optimization reducing costs by 30%.',
  'Energy management platform cutting consumption by 25%.',
  'LegalTech AI contract review saving 80% time.',
  'Travel AI personalization increasing bookings by 35%.',
  'FoodTech platform connecting 50K+ restaurants.'
]

const metrics = [
  { value: '+42%', label: 'Traffic increase' },
  { value: '+3x', label: 'Engagement' },
  { value: '-35%', label: 'Cost reduction' },
  { value: '1M+', label: 'Daily events' },
  { value: '+28%', label: 'Conversion boost' },
  { value: '+40%', label: 'Dev velocity' },
  { value: '-50%', label: 'Infra costs' },
  { value: '-60%', label: 'Response time' },
  { value: '+45%', label: 'Mobile engagement' },
  { value: '200hrs', label: 'Monthly savings' },
  { value: '+35%', label: 'Conversion rate' },
  { value: '-70%', label: 'False positives' },
  { value: '500K+', label: 'Active users' },
  { value: '$1B+', label: 'Transactions' },
  { value: '10M+', label: 'Concurrent users' },
  { value: '-40%', label: 'Project delays' },
  { value: '100K+', label: 'Sensors monitored' },
  { value: '99.9%', label: 'Accuracy rate' },
  { value: '-30%', label: 'Supply costs' },
  { value: '-25%', label: 'Energy usage' },
  { value: '-80%', label: 'Time saved' },
  { value: '+35%', label: 'Booking increase' },
  { value: '50K+', label: 'Restaurant partners' }
]

const challengeHeadings = [
  'Legacy System Migration',
  'Data Integration Complexity',
  'Scalability Bottlenecks',
  'User Experience Inconsistency',
  'Performance Optimization',
  'Security Vulnerabilities',
  'Real-time Data Processing',
  'Cross-platform Compatibility',
  'API Integration Challenges',
  'Database Performance'
]

const challengeBodies = [
  'The client was struggling with a monolithic architecture that made it difficult to scale and maintain their application. Each change required extensive testing and deployment cycles, slowing down time-to-market for new features.',
  'Data silos across multiple systems made it impossible to get a unified view of customer information. This led to inconsistent user experiences and missed opportunities for personalization.',
  'As user base grew exponentially, the existing infrastructure couldn\'t handle the load. Performance degradation during peak hours was causing significant user churn and revenue loss.',
  'The application had evolved over years with multiple teams working independently, resulting in inconsistent design patterns and user experiences across different sections.',
  'Performance issues were affecting user retention. Page load times were exceeding industry standards, and the application was unable to handle concurrent users during peak periods.',
  'Security vulnerabilities were discovered in the legacy system, requiring immediate remediation. The client needed to modernize their security posture without disrupting ongoing operations.',
  'The business required real-time analytics to make data-driven decisions. The existing batch processing system couldn\'t provide the insights needed in a timely manner.',
  'Supporting multiple platforms with a single codebase was proving challenging. The client needed a solution that would work seamlessly across web, mobile, and tablet devices.',
  'Integrating with third-party APIs was complex and error-prone. The existing integration patterns were not scalable and required significant manual effort.',
  'Database performance was becoming a bottleneck as data volumes grew. Query optimization and architectural changes were needed to improve response times.'
]

const challengeIssues = [
  { tag: 'PERFORMANCE', body: 'Page load times exceeded 8 seconds on average' },
  { tag: 'SCALABILITY', body: 'System couldn\'t handle peak traffic loads' },
  { tag: 'MAINTENANCE', body: 'Bug fixes took weeks to deploy' },
  { tag: 'COST', body: 'Infrastructure costs were growing exponentially' },
  { tag: 'SECURITY', body: 'Multiple security vulnerabilities identified' },
  { tag: 'UX', body: 'Inconsistent user experience across platforms' },
  { tag: 'DATA', body: 'Data silos preventing unified insights' },
  { tag: 'INTEGRATION', body: 'Third-party integrations were brittle' },
  { tag: 'MONITORING', body: 'Lack of real-time monitoring and alerts' },
  { tag: 'DOCUMENTATION', body: 'Poor documentation hindering onboarding' }
]

const approachHeadings = [
  { faded: 'We took a', bold: 'data-driven approach' },
  { faded: 'Our strategy focused on', bold: 'incremental migration' },
  { faded: 'We implemented', bold: 'microservices architecture' },
  { faded: 'The solution involved', bold: 'cloud-native technologies' },
  { faded: 'We adopted', bold: 'agile development practices' }
]

const approachBodies = [
  'We began with a comprehensive assessment of the existing system, identifying pain points and opportunities for improvement. This informed our migration strategy and helped prioritize initiatives.',
  'Our approach involved breaking down the monolith into smaller, manageable services. We prioritized high-impact areas and implemented changes incrementally to minimize disruption.',
  'We leveraged modern cloud technologies to build a scalable and resilient architecture. This included containerization, orchestration, and automated deployment pipelines.',
  'We implemented a design system to ensure consistency across all platforms. This reduced development time and improved the overall user experience.',
  'We adopted a test-driven development approach to ensure quality at every step. This included automated testing, continuous integration, and comprehensive monitoring.'
]

const approachCallouts = [
  { label: 'Key Insight', body: 'Incremental migration reduced risk by 60% compared to a full rewrite.' },
  { label: 'Strategy', body: 'We focused on quick wins to build momentum and stakeholder confidence.' },
  { label: 'Approach', body: 'Cloud-native technologies enabled rapid scaling and cost optimization.' },
  { label: 'Method', body: 'Design system implementation accelerated development by 40%.' },
  { label: 'Process', body: 'Test-driven development reduced bug rate by 70%.' }
]

const keyWinsHeadings = [
  'Measurable Impact',
  'Business Results',
  'Performance Gains',
  'User Satisfaction',
  'Operational Efficiency'
]

const whatWeBuiltHeadings = [
  'Core Features Delivered',
  'Technical Implementation',
  'Platform Capabilities',
  'System Architecture',
  'Solution Components'
]

const numbersHeadings = [
  'The Impact',
  'Key Metrics',
  'Performance Results',
  'Business Outcomes',
  'Success Indicators'
]

const techStackTools = [
  'React', 'Next.js', 'TypeScript', 'Node.js', 'Python',
  'PostgreSQL', 'MongoDB', 'Redis', 'Elasticsearch', 'GraphQL',
  'AWS', 'Google Cloud', 'Docker', 'Kubernetes', 'Terraform',
  'GitHub Actions', 'CircleCI', 'Datadog', 'Sentry', 'Segment',
  'Figma', 'Storybook', 'Tailwind CSS', 'shadcn/ui', 'Sanity'
]

const testimonialQuotes = [
  {
    quote: 'The team delivered exceptional results. Their expertise in modern web technologies helped us transform our entire platform. The migration was seamless and the performance improvements were immediate.',
    attribution: 'CTO',
    source: 'TechCorp'
  },
  {
    quote: 'Working with this team was a game-changer for our business. They understood our requirements perfectly and delivered a solution that exceeded our expectations.',
    attribution: 'Product Director',
    source: 'HealthFirst'
  },
  {
    quote: 'The attention to detail and commitment to quality was outstanding. They didn\'t just build what we asked for—they helped us think through the problem and deliver a better solution.',
    attribution: 'VP Engineering',
    source: 'FinServe'
  },
  {
    quote: 'Their agile approach and transparent communication made the entire project smooth. We always knew where we stood and could trust that the final product would be excellent.',
    attribution: 'Founder',
    source: 'EduTech Solutions'
  },
  {
    quote: 'The scalability improvements have been transformative. We can now handle 10x the traffic without any performance degradation. This has opened up new growth opportunities for us.',
    attribution: 'CTO',
    source: 'MediaHub'
  }
]

const closingCtaHeadings = [
  { regular: 'Ready to build', bold: 'something great?' },
  { regular: 'Let\'s create your', bold: 'next success story.' },
  { regular: 'Transform your', bold: 'digital presence.' },
  { regular: 'Start your', bold: 'project today.' },
  { regular: 'Build the future', bold: 'with us.' }
]

const closingCtaBodies = [
  'We\'ve helped hundreds of companies transform their digital presence. Let\'s discuss how we can help you achieve your goals.',
  'Our team has the expertise to tackle any challenge. Reach out to learn how we can help you succeed.',
  'From concept to launch, we\'re with you every step of the way. Let\'s build something amazing together.',
  'Your success is our success. Let\'s partner to create a solution that drives real business results.',
  'We\'re ready to help you tackle your next big challenge. Get in touch to start the conversation.'
]

const generateFeatures = (count: number) => {
  const features = []
  for (let i = 1; i <= count; i++) {
    features.push({
      number: i.toString(),
      title: `Feature ${i}`,
      body: `This feature provides essential functionality for the platform, enabling users to accomplish key tasks efficiently and effectively. Built with scalability and performance in mind.`
    })
  }
  return features
}

const generateComparisonRows = (count: number) => {
  const metrics = ['Page Load Time', 'Time to Interactive', 'API Response Time', 'Database Query Time', 'Error Rate', 'Uptime']
  const beforeValues = ['8.5s', '12s', '500ms', '2.3s', '2.5%', '99.5%']
  const afterValues = ['1.2s', '2.1s', '85ms', '120ms', '0.3%', '99.99%']
  
  const rows = []
  for (let i = 0; i < Math.min(count, metrics.length); i++) {
    rows.push({
      label: metrics[i],
      before: beforeValues[i],
      after: afterValues[i]
    })
  }
  return rows
}

const generateStats = (count: number) => {
  const labels = ['Users', 'Revenue', 'Sessions', 'Conversions', 'Retention', 'NPS Score']
  const values = ['500K+', '$2.5M', '2.1M', '35%', '85%', '72']
  
  const stats = []
  for (let i = 0; i < Math.min(count, labels.length); i++) {
    stats.push({
      value: values[i],
      label: labels[i]
    })
  }
  return stats
}

async function createCaseStudies() {
  console.log('Creating 30 case studies...')

  const caseStudies = []

  for (let i = 0; i < 30; i++) {
    const client = clients[i % clients.length]
    const category = categories[i % categories.length]
    const industry = industries[i % industries.length]
    const tagline = taglines[i % taglines.length]
    const metric = metrics[i % metrics.length]
    const year = (2023 + Math.floor(i / 10)).toString()
    
    const slug = `${client.toLowerCase().replace(/\s+/g, '-')}-${i}`

    const challengeHeading = challengeHeadings[i % challengeHeadings.length]
    const challengeBody = challengeBodies[i % challengeBodies.length]
    const caseStudyIssues = [
      challengeIssues[i % challengeIssues.length],
      challengeIssues[(i + 1) % challengeIssues.length],
      challengeIssues[(i + 2) % challengeIssues.length],
      challengeIssues[(i + 3) % challengeIssues.length]
    ]

    const approachHeading = approachHeadings[i % approachHeadings.length]
    const approachBody = approachBodies[i % approachBodies.length]
    const approachCallout = approachCallouts[i % approachCallouts.length]

    const keyWinsHeading = keyWinsHeadings[i % keyWinsHeadings.length]
    const comparisonRows = generateComparisonRows(4)

    const whatWeBuiltHeading = whatWeBuiltHeadings[i % whatWeBuiltHeadings.length]
    const features = generateFeatures(4)

    const numbersHeading = numbersHeadings[i % numbersHeadings.length]
    const stats = generateStats(4)

    const testimonial = testimonialQuotes[i % testimonialQuotes.length]
    
    const tools = techStackTools.slice(0, 8 + (i % 5))

    const closingCtaHeading = closingCtaHeadings[i % closingCtaHeadings.length]
    const closingCtaBody = closingCtaBodies[i % closingCtaBodies.length]

    const caseStudy = {
      _type: 'project',
      name: client,
      slug: { current: slug, _type: 'slug' },
      client,
      category,
      industry,
      year,
      tagline,
      metric: metric.value,
      metricLabel: metric.label,
      thumb: `https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&h=600&fit=crop&auto=format&q=${i + 1}`,
      
      // Challenge section
      challenge: {
        eyebrow: 'THE CHALLENGE',
        heading: challengeHeading,
        body: challengeBody,
        issues: caseStudyIssues
      },

      // Approach section
      approach: {
        eyebrow: 'OUR APPROACH',
        heading: approachHeading,
        body: approachBody,
        callout: approachCallout
      },

      // Key Wins section
      keyWins: {
        eyebrow: 'THE KEY WINS',
        heading: keyWinsHeading,
        comparison: {
          beforeLabel: 'Before',
          afterLabel: 'After',
          rows: comparisonRows
        }
      },

      // What We Built section
      whatWeBuilt: {
        eyebrow: 'WHAT WE BUILT',
        heading: whatWeBuiltHeading,
        features: features
      },

      // Numbers section
      numbers: {
        eyebrow: 'THE NUMBERS',
        heading: numbersHeading,
        footnote: 'Results measured over 6-month period following implementation.',
        stats: stats
      },

      // Testimonial section
      detailTestimonial: {
        eyebrow: 'TESTIMONIAL',
        quote: testimonial
      },

      // Tech Stack section
      techStack: {
        eyebrow: 'TECH STACK',
        tools: tools
      },

      // Closing CTA section
      closingCta: {
        heading: closingCtaHeading,
        body: closingCtaBody,
        cta: {
          label: 'Start a project',
          href: '/contact'
        }
      },

      // Published date
      publishedAt: new Date(
        Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000
      ).toISOString()
    }

    caseStudies.push(caseStudy)
  }

  console.log(`Creating ${caseStudies.length} case studies...`)

  try {
    const results = []
    for (const caseStudy of caseStudies) {
      try {
        const result = await client.create(caseStudy)
        results.push(result)
        console.log(`Created: ${result.client} (slug: ${result.slug.current})`)
      } catch (error) {
        console.error(`Error creating ${caseStudy.client}:`, error)
      }
    }
    console.log(`Successfully created ${results.length} case studies!`)
  } catch (error) {
    console.error('Error creating case studies:', error)
  }
}

// Run the script
createCaseStudies()
  .then(() => {
    console.log('Done!')
    process.exit(0)
  })
  .catch((error) => {
    console.error('Script failed:', error)
    process.exit(1)
  })
