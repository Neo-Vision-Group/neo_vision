import { NextRequest, NextResponse } from 'next/server';

const NONCE_COOKIE = 'neo-csp-nonce';
const NONCE_COOKIE_MAX_AGE = 60 * 60; // 1 hour

function getOrCreateNonce(request: NextRequest): { nonce: string; setCookie?: string } {
  const existing = request.cookies.get(NONCE_COOKIE)?.value;
  if (existing && /^[A-Za-z0-9+/=]+$/.test(existing)) {
    return { nonce: existing };
  }

  const nonce = Buffer.from(crypto.randomUUID()).toString('base64');
  const isProduction = process.env.NODE_ENV === 'production';
  const secureFlag = isProduction ? ' Secure;' : '';
  const setCookie = `${NONCE_COOKIE}=${nonce}; Path=/; Max-Age=${NONCE_COOKIE_MAX_AGE}; HttpOnly;${secureFlag} SameSite=Strict`;
  return { nonce, setCookie };
}

export function proxy(request: NextRequest) {
  // Use a stable nonce per browser session so RSC and HTML requests share the
  // same nonce and inline scripts match the CSP header.
  const { nonce, setCookie } = getOrCreateNonce(request);

  // Build CSP header with nonce
  const isDev = process.env.NODE_ENV === 'development'
  const cspHeader = [
    "default-src 'self';",
    `script-src 'self' 'nonce-${nonce}' 'strict-dynamic'${isDev ? " 'unsafe-eval'" : ''} https://assets.calendly.com https://plausible.io https://eu-assets.i.posthog.com https://widget.clutch.co https://www.googletagmanager.com;`,
    "style-src 'self' 'unsafe-inline' https://assets.calendly.com;",
    "img-src 'self' data: https://cdn.sanity.io https://images.unsplash.com https://*.calendly.com https://plausible.io;",
    "font-src 'self';",
    "connect-src 'self' https://api.sanity.io https://*.api.sanity.io https://cdn.sanity.io https://calendly.com https://*.calendly.com https://plausible.io https://*.google-analytics.com https://analytics.google.com https://*.analytics.google.com https://eu.i.posthog.com https://eu-assets.i.posthog.com wss:;",
    "frame-src 'self' https://calendly.com https://calendar.google.com https://widget.clutch.co;",
    "frame-ancestors 'none';",
    "base-uri 'self';",
    "form-action 'self';",
    "upgrade-insecure-requests;",
  ].join(' ');

  // Clone the request headers
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set('x-nonce', nonce);
  requestHeaders.set('Content-Security-Policy', cspHeader);

  // Create response with CSP header
  const response = NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });

  // Set CSP header on response
  response.headers.set('Content-Security-Policy', cspHeader);
  if (setCookie) {
    response.headers.set('Set-Cookie', setCookie);
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    {
      source: '/((?!api|_next/static|_next/image|favicon.ico).*)',
      missing: [
        { type: 'header', key: 'next-router-prefetch' },
        { type: 'header', key: 'purpose', value: 'prefetch' },
      ],
    },
  ],
};
