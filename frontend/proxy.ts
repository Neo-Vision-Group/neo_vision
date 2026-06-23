import { NextRequest, NextResponse } from 'next/server';

export function proxy(request: NextRequest) {
  // Generate a random nonce for this request
  const nonce = Buffer.from(crypto.randomUUID()).toString('base64');
  
  // Build CSP header with nonce
  const isDev = process.env.NODE_ENV === 'development'
  const cspHeader = [
    "default-src 'self';",
    `script-src 'self' 'nonce-${nonce}' 'strict-dynamic'${isDev ? " 'unsafe-eval'" : ''} https://assets.calendly.com https://plausible.io https://eu-assets.i.posthog.com https://widget.clutch.co;`,
    "style-src 'self' 'unsafe-inline' https://assets.calendly.com;",
    "img-src 'self' data: https://cdn.sanity.io https://images.unsplash.com https://*.calendly.com https://plausible.io;",
    "font-src 'self';",
    "connect-src 'self' https://api.sanity.io https://*.api.sanity.io https://cdn.sanity.io https://calendly.com https://*.calendly.com https://plausible.io https://eu.i.posthog.com https://eu-assets.i.posthog.com wss:;",
    "frame-src 'self' https://calendly.com https://calendar.google.com https://widget.clutch.co https://cdn.sanity.io/;",
    "frame-ancestors 'none';",
    "base-uri 'self';",
    "form-action 'self';",
    "upgrade-insecure-requests;",
  ].join(' ');

  // Clone the request headers
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set('x-nonce', nonce);

  // Create response with CSP header
  const response = NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });

  // Set CSP header on response
  response.headers.set('Content-Security-Policy', cspHeader);

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
