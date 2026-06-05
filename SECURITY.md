# Security Documentation

## Overview

This document outlines the security measures implemented in the Neo Vision Technologies website.

## Security Features

### 1. Rate Limiting

**Implementation:** `frontend/lib/rate-limit.ts`

- Contact form: 5 requests per 15 minutes per IP
- Returns 429 status with Retry-After header
- In-memory store with automatic cleanup

**Usage:**
```typescript
const rateLimitResult = await rateLimit(req, {
  interval: 15 * 60 * 1000, // 15 minutes
  uniqueTokenPerInterval: 5,
});
```

### 2. CSRF Protection

**Implementation:** `frontend/lib/csrf.ts`

- Double-submit cookie pattern
- Tokens expire after 1 hour
- HttpOnly, Secure (production), SameSite=Strict cookies

**Usage:**
```typescript
// Generate token (GET /api/csrf)
const token = generateCsrfToken();
await setCsrfCookie(token);

// Validate token (in API routes)
const isValid = await validateCsrfToken(req);
```

### 3. Input Sanitization

**Implementation:** `frontend/lib/sanitize.ts`

- HTML entity encoding for all user inputs
- Structured data validation for JSON-LD
- Applied to all contact form submissions

**Functions:**
- `sanitizeHtml(input)` - Escapes HTML entities
- `sanitizeForJson(obj)` - Recursively sanitizes objects
- `validateStructuredData(data)` - Validates structured data types

### 4. Security Logging

**Implementation:** `frontend/lib/security-logger.ts`

- Logs all security events with correlation IDs
- Tracks: IP, User-Agent, endpoint, status, reason
- Development: logs all events
- Production: logs only failures and blocks

**Log Levels:**
- `success` - Normal operations (dev only)
- `failure` - Failed requests (always logged)
- `blocked` - Security blocks (always logged)

### 5. Content Security Policy (CSP)

**Configuration:** `frontend/next.config.ts`

- Removed `unsafe-eval` (GSAP works without it)
- Kept `unsafe-inline` for necessary inline scripts/styles
- Added `base-uri` and `form-action` directives
- Frame ancestors set to 'none' (clickjacking protection)

### 6. Security Headers

All routes include:
- `X-Content-Type-Options: nosniff`
- `X-Frame-Options: DENY`
- `Referrer-Policy: strict-origin-when-cross-origin`
- `Permissions-Policy: camera=(), microphone=(), geolocation=()`
- `Strict-Transport-Security: max-age=63072000; includeSubDomains`
- `X-DNS-Prefetch-Control: on`

**Note:** HSTS preload removed until domain is registered at hstspreload.org

### 7. PostHog Token Separation

**Server-side:** Uses `POSTHOG_SERVER_API_KEY` (falls back to public token if not set)
**Client-side:** Uses `NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN`

This maintains proper security boundaries between server and client.

### 8. Origin Validation

**Contact API:** Requires both Origin AND Referer headers to match allowed origins
- Prevents CSRF attacks
- Validates localhost is not allowed in production
- Logs all validation failures

### 9. Error Message Sanitization

- Generic error messages returned to clients
- Detailed errors logged server-side only
- Development mode shows more details in console
- Production mode hides stack traces

### 10. Cookie Security

All cookies use:
- `SameSite=Strict` (CSRF protection)
- `Secure` flag in production (HTTPS only)
- `HttpOnly` where applicable
- Environment-specific naming

## Environment Variables

### Required

```bash
NEXT_PUBLIC_SANITY_PROJECT_ID="your_project_id"
NEXT_PUBLIC_SANITY_DATASET="production"
NEXT_PUBLIC_SANITY_API_VERSION="2025-09-25"
```

### Security-Related

```bash
# Separate PostHog tokens for security boundaries
POSTHOG_SERVER_API_KEY="server_side_api_key"
NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN="client_side_token"

# Site URL for CORS validation
NEXT_PUBLIC_SITE_URL="https://neovision.dev"
```

### Validation

Environment variables are validated at startup using Zod:

```typescript
import { validateEnv } from '@/lib/env';

// In your app initialization
validateEnv();
```

## Security.txt

Located at `/.well-known/security.txt`

Contains:
- Security contact email
- Expiration date (1 year)
- Preferred languages
- Canonical URL
- Security policy link
- Acknowledgments link

## API Security Checklist

For all new API routes:

- [ ] Implement rate limiting
- [ ] Validate CSRF token
- [ ] Validate Origin and Referer headers
- [ ] Sanitize all inputs
- [ ] Log security events
- [ ] Return generic error messages
- [ ] Use correlation IDs for tracing

## Testing Security

### Rate Limiting

```bash
# Test rate limit (should block after 5 requests)
for i in {1..10}; do
  curl -X POST http://localhost:3000/api/contact \
    -H "Content-Type: application/json" \
    -d '{"name":"Test","email":"test@example.com","message":"Test message"}'
done
```

### CSRF Protection

```bash
# Should fail without CSRF token
curl -X POST http://localhost:3000/api/contact \
  -H "Content-Type: application/json" \
  -d '{"name":"Test","email":"test@example.com","message":"Test"}'
```

### CSP Violations

Check browser console for CSP violations and adjust policy as needed.

## Incident Response

1. **Detection:** Check security logs for unusual patterns
2. **Correlation:** Use correlation IDs to trace requests
3. **Analysis:** Review IP addresses, user agents, and request patterns
4. **Response:** Block malicious IPs, rotate tokens if needed
5. **Documentation:** Update this file with lessons learned

## Security Contacts

- **Security Issues:** security@neovision.dev
- **General Contact:** office@neovision.dev

## Compliance

- GDPR: Cookie consent banner with granular controls
- CCPA: Privacy policy and data deletion on request
- OWASP Top 10: Addressed in implementation

## Regular Maintenance

### Weekly
- Review security logs for anomalies
- Check for failed authentication attempts
- Monitor rate limit triggers

### Monthly
- Run `npm audit` and update dependencies
- Review and rotate API keys
- Test security headers with securityheaders.com

### Quarterly
- External security audit
- Penetration testing
- Review and update security policies

## Known Limitations

1. **Rate Limiting:** In-memory store (resets on server restart)
   - **Solution:** Use Redis/Upstash for production
   
2. **CSP:** Still uses `unsafe-inline` for styles
   - **Solution:** Implement nonce-based CSP in future

3. **HSTS Preload:** Not registered yet
   - **Action:** Register at hstspreload.org when ready

## Future Improvements

1. Implement Redis-backed rate limiting for distributed systems
2. Add Cloudflare Turnstile or reCAPTCHA v3
3. Implement nonce-based CSP
4. Add automated dependency scanning (Snyk/Dependabot)
5. Set up CSP reporting endpoint
6. Implement Web Application Firewall (WAF) rules

## References

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [OWASP Cheat Sheet Series](https://cheatsheetseries.owasp.org/)
- [Next.js Security](https://nextjs.org/docs/app/building-your-application/configuring/security)
- [MDN Web Security](https://developer.mozilla.org/en-US/docs/Web/Security)
