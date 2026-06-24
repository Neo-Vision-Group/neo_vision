import {MetadataRoute} from 'next'
import {resolveSiteOrigin} from '@/app/site-origin'

export default async function robots(): Promise<MetadataRoute.Robots> {
  const origin = await resolveSiteOrigin()

  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/studio', '/api/', '/draft-mode/', '/ingest/'],
    },
    sitemap: `${origin}/sitemap.xml`,
  }
}
