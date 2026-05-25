import path from 'node:path'
import {fileURLToPath} from 'node:url'
import type {NextConfig} from 'next'

const configDir = path.dirname(fileURLToPath(import.meta.url))
const workspaceRoot = path.resolve(configDir, '..')

const nextConfig: NextConfig = {
  env: {
    // Matches the behavior of `sanity dev` which sets styled-components to use the fastest way of inserting CSS rules in both dev and production. It's default behavior is to disable it in dev mode.
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
      ...(process.env.NODE_ENV === 'development'
        ? [
            {
              protocol: 'https',
              hostname: 'images.unsplash.com',
              pathname: '/**',
            },
          ]
        : []),
    ] as any,
  },

  // Required to support PostHog trailing slash API requests
  skipTrailingSlashRedirect: true,

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
            key: 'X-Frame-Options',
            value: 'DENY',
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
            value: 'max-age=63072000; includeSubDomains; preload',
          },
          {
            key: 'Content-Security-Policy',
            value: "default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https://cdn.sanity.io https://images.unsplash.com; font-src 'self'; connect-src 'self' https://api.sanity.io https://cdn.sanity.io; frame-ancestors 'none';",
          },
        ],
      },
    ];
  },
}

export default nextConfig
