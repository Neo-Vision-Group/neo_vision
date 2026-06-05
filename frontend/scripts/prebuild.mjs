import {spawnSync} from 'node:child_process'

// Validate production environment variables
if (process.env.NODE_ENV === 'production') {
  console.log('🔍 Validating production environment variables...')
  
  const errors = []
  
  // Required Sanity configuration
  if (!process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || process.env.NEXT_PUBLIC_SANITY_PROJECT_ID === 'your_project_id') {
    errors.push('NEXT_PUBLIC_SANITY_PROJECT_ID must be set to your actual Sanity project ID')
  }
  
  if (!process.env.SANITY_API_READ_TOKEN || process.env.SANITY_API_READ_TOKEN === 'your_read_token') {
    errors.push('SANITY_API_READ_TOKEN must be set to your actual Sanity read token')
  }
  
  if (!process.env.SANITY_WRITE_TOKEN || process.env.SANITY_WRITE_TOKEN === 'your_write_token') {
    errors.push('SANITY_WRITE_TOKEN must be set to your actual Sanity write token')
  }
  
  // Site URL must not be localhost
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL
  if (!siteUrl) {
    errors.push('NEXT_PUBLIC_SITE_URL must be set to your production domain')
  } else if (siteUrl.includes('localhost') || siteUrl.includes('127.0.0.1')) {
    errors.push('NEXT_PUBLIC_SITE_URL cannot be localhost in production')
  }
  
  // Upstash Redis is required for production rate limiting
  if (!process.env.UPSTASH_REDIS_REST_URL) {
    errors.push('UPSTASH_REDIS_REST_URL is required for production rate limiting')
  }
  
  if (!process.env.UPSTASH_REDIS_REST_TOKEN) {
    errors.push('UPSTASH_REDIS_REST_TOKEN is required for production rate limiting')
  }
  
  if (errors.length > 0) {
    console.error('\n❌ Production environment validation failed:\n')
    errors.forEach(error => console.error(`  • ${error}`))
    console.error('\nFix these issues before deploying to production.\n')
    process.exit(1)
  }
  
  console.log('✅ Production environment validation passed\n')
}

if (process.env.VERCEL === '1') {
  console.log('Skipping Sanity typegen on Vercel; using committed sanity.schema.json and sanity.types.ts')
  process.exit(0)
}

const result = spawnSync('npm', ['run', 'sanity:typegen'], {
  stdio: 'inherit',
  shell: process.platform === 'win32',
})

process.exit(result.status ?? 1)
