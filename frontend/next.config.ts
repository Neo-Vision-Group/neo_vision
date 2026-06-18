import path from 'node:path'
import {fileURLToPath} from 'node:url'
import type {NextConfig} from 'next'
import type {RemotePattern} from 'next/dist/shared/lib/image-config'

const configDir = path.dirname(fileURLToPath(import.meta.url))
const workspaceRoot = path.resolve(configDir, '..')

// CSP is now handled by middleware.ts with nonce-based script-src

const nextConfig: NextConfig = {
  env: {
    SC_DISABLE_SPEEDY: 'false',
  },
  turbopack: {
    root: workspaceRoot,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'cdn.sanity.io',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'cdn.brandfetch.io',
        pathname: '/**',
      },
      ...(process.env.NODE_ENV === 'development'
        ? [
            {
              protocol: 'https' as const,
              hostname: 'images.unsplash.com',
              pathname: '/**',
            } satisfies RemotePattern,
          ]
        : []),
    ],
  },

  allowedDevOrigins: ['*.trycloudflare.com'],

  async rewrites() {
    return [
      {
        source: "/ingest/static/:path*",
        destination: "https://eu-assets.i.posthog.com/static/:path*",
      },
      {
        source: "/ingest/array/:path*",
        destination: "https://eu-assets.i.posthog.com/array/:path*",
      },
      {
        source: "/ingest/:path*",
        destination: "https://eu.i.posthog.com/:path*",
      },
    ];
  },

  async headers() {
    return [
      {
        source: '/ingest/static/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
                    {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()',
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains',
          },
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on',
          },
        ],
      },
    ];
  },

  async redirects() {
    return [
      {
        source: '/blog',
        destination: '/insights',
        permanent: true,
      },
      {
        source: '/blog/:slug',
        destination: '/insights/:slug',
        permanent: true,
      },
      {
        source: '/services/landing-pages',
        destination: '/services/websites-ecommerce',
        permanent: true,
      },
      
      {
        source: '/services/custom-websites',
        destination: '/services/websites-ecommerce',
        permanent: true,
      },
      {
        source: '/services/news-media-websites',
        destination: '/services/websites-ecommerce',
        permanent: true,
      },
      {
        source: '/services/award-winning-websites',
        destination: '/services/websites-ecommerce',
        permanent: true,
      },
      {
        source: '/services/ecommerce-solutions',
        destination: '/services/websites-ecommerce',
        permanent: true,
      },
      {
        source: '/services/award-winning-ecommerce-solutions',
        destination: '/services/websites-ecommerce',
        permanent: true,
      },
      {
        source: '/services/custom-business-software',
        destination: '/services/custom-software',
        permanent: true,
      },
      {
        source: '/services/business-process-automation-software',
        destination: '/services/custom-software',
        permanent: true,
      },
      {
        source: '/services/digital-transformation',
        destination: '/services/custom-software',
        permanent: true,
      },
      {
        source: '/services/mobile-apps',
        destination: '/services/mobile-app-development',
        permanent: true,
      },
      {
        source: '/services/web-apps',
        destination: '/services/custom-software',
        permanent: true,
      },
      {
        source: '/services/web3-development',
        destination: '/services/custom-software',
        permanent: true,
      },
      {
        source: '/services/extended-reality-development',
        destination: '/services/custom-software',
        permanent: true,
      },
      {
        source: '/services/ai-integration',
        destination: '/services/ai-agents',
        permanent: true,
      },
      {
        source: '/services/augmented-development-team',
        destination: '/services/',
        permanent: true,
      },
      {
        source: '/services/white-label-development',
        destination: '/services/',
        permanent: true,
      },
    ]
  },
}

export default nextConfig