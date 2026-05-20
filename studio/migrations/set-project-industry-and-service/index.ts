import {createClient} from '@sanity/client'
import {config} from 'dotenv'
import {resolve} from 'path'

// Load environment variables from studio .env file
config({path: resolve(process.cwd(), '.env')})

/**
 * Migration script to set industry and service references on all projects.
 *
 * Required environment variables:
 * - SANITY_STUDIO_PROJECT_ID (or SANITY_PROJECT_ID)
 * - SANITY_API_WRITE_TOKEN (token with write permissions)
 * - SANITY_STUDIO_DATASET (defaults to 'production')
 *
 * Get a write token from https://www.sanity.io/manage > Project > API > Tokens
 */

const projectId = process.env.SANITY_STUDIO_PROJECT_ID || process.env.SANITY_PROJECT_ID
const dataset = process.env.SANITY_STUDIO_DATASET || process.env.SANITY_DATASET || 'production'
const token = process.env.SANITY_API_WRITE_TOKEN || process.env.SANITY_WRITE_TOKEN

if (!projectId) {
  console.error('Error: Missing SANITY_STUDIO_PROJECT_ID or SANITY_PROJECT_ID environment variable')
  process.exit(1)
}

if (!token) {
  console.error('Error: Missing SANITY_API_WRITE_TOKEN environment variable')
  console.error('Create one at: https://www.sanity.io/manage > Your Project > API > Tokens')
  console.error('The token needs "Write" permissions.')
  process.exit(1)
}

const client = createClient({
  projectId,
  dataset,
  apiVersion: '2025-09-25',
  token,
})

// Default service and industry to create/link if none exist
const DEFAULT_SERVICES = [
  {name: 'Engineering', category: 'engineering'},
  {name: 'AI Transformation', category: 'ai'},
  {name: 'Design', category: 'design'},
  {name: 'Strategy', category: 'strategy'},
]

const DEFAULT_INDUSTRIES = [
  {name: 'Healthcare'},
  {name: 'Finance'},
  {name: 'Retail'},
  {name: 'Technology'},
  {name: 'Manufacturing'},
  {name: 'Energy'},
]

async function getOrCreateServices(): Promise<Map<string, string>> {
  const existing = await client.fetch(`*[_type == "service"]{_id, name}`)
  const map = new Map<string, string>()

  // Add existing services to map
  for (const s of existing) {
    if (s.name) map.set(s.name.toLowerCase(), s._id)
  }

  // Create missing default services
  for (const svc of DEFAULT_SERVICES) {
    if (!map.has(svc.name.toLowerCase())) {
      console.log(`Creating service: ${svc.name}`)
      const doc = await client.create({
        _type: 'service',
        name: svc.name,
        slug: {_type: 'slug', current: svc.category},
        category: svc.category,
        price: 'Contact us',
        tag: 'Popular',
        duration: '4-12 weeks',
      })
      map.set(svc.name.toLowerCase(), doc._id)
    }
  }

  return map
}

async function getOrCreateIndustries(): Promise<Map<string, string>> {
  const existing = await client.fetch(`*[_type == "industry"]{_id, name}`)
  const map = new Map<string, string>()

  // Add existing industries to map
  for (const i of existing) {
    if (i.name) map.set(i.name.toLowerCase(), i._id)
  }

  // Create missing default industries
  for (const ind of DEFAULT_INDUSTRIES) {
    if (!map.has(ind.name.toLowerCase())) {
      console.log(`Creating industry: ${ind.name}`)
      const doc = await client.create({
        _type: 'industry',
        name: ind.name,
        slug: {_type: 'slug', current: ind.name.toLowerCase().replace(/\s+/g, '-')},
        order: 0,
      })
      map.set(ind.name.toLowerCase(), doc._id)
    }
  }

  return map
}

async function updateProjects(
  serviceMap: Map<string, string>,
  industryMap: Map<string, string>
) {
  const projects = await client.fetch(`*[_type == "project"]{_id, client, "category": category->name, "industry": industry->name}`)

  console.log(`\nFound ${projects.length} projects to update`)

  // Get first available service and industry as defaults
  const defaultServiceId = serviceMap.get('engineering') || Array.from(serviceMap.values())[0]
  const defaultIndustryId = industryMap.get('technology') || Array.from(industryMap.values())[0]

  if (!defaultServiceId || !defaultIndustryId) {
    throw new Error('No services or industries available to assign')
  }

  for (const project of projects) {
    const hasCategory = project.category !== null && project.category !== undefined
    const hasIndustry = project.industry !== null && project.industry !== undefined

    if (hasCategory && hasIndustry) {
      console.log(`  ✓ Skipping "${project.client}" - already has category and industry`)
      continue
    }

    const patch: {category?: {_type: 'reference'; _ref: string}; industry?: {_type: 'reference'; _ref: string}} = {}

    if (!hasCategory) {
      patch.category = {_type: 'reference', _ref: defaultServiceId}
    }

    if (!hasIndustry) {
      patch.industry = {_type: 'reference', _ref: defaultIndustryId}
    }

    console.log(`  → Updating "${project.client}" with ${Object.keys(patch).join(' + ')}`)
    await client.patch(project._id).set(patch).commit()
  }
}

async function main() {
  console.log('=== Project Migration: Setting Industry & Service References ===\n')

  console.log('Step 1: Setting up services...')
  const serviceMap = await getOrCreateServices()
  console.log(`  ${serviceMap.size} services available\n`)

  console.log('Step 2: Setting up industries...')
  const industryMap = await getOrCreateIndustries()
  console.log(`  ${industryMap.size} industries available\n`)

  console.log('Step 3: Updating projects...')
  await updateProjects(serviceMap, industryMap)

  console.log('\n=== Migration Complete ===')
}

main().catch((err) => {
  console.error('Migration failed:', err)
  process.exit(1)
})
