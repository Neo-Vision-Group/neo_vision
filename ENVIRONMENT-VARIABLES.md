# Environment Variables

This document lists all environment variables required for production deployment.

## 📋 Quick Reference

| Variable | Required | Service | Purpose |
|----------|----------|---------|---------|
| `NEXT_PUBLIC_SITE_URL` | ✅ Yes | Next.js | Site origin for CORS/CSP |
| `NEXT_PUBLIC_SANITY_PROJECT_ID` | ✅ Yes | Sanity | Sanity project ID |
| `NEXT_PUBLIC_SANITY_DATASET` | ✅ Yes | Sanity | Sanity dataset name |
| `SANITY_API_READ_TOKEN` | ✅ Yes | Sanity | Read token for draft mode |
| `SANITY_WRITE_TOKEN` | ✅ Yes | Sanity | Write token for contact forms |
| `RESEND_API_KEY` | ⚠️ Recommended | Resend | Email notifications |
| `RESEND_FROM` | ⚠️ Recommended | Resend | From email address |
| `CONTACT_TO` | ⚠️ Recommended | Resend | Notification recipient |
| `UPSTASH_REDIS_REST_URL` | ⚠️ Recommended | Upstash | Rate limiting |
| `UPSTASH_REDIS_REST_TOKEN` | ⚠️ Recommended | Upstash | Rate limiting auth |
| `NEXT_PUBLIC_POSTHOG_KEY` | ⚠️ Optional | PostHog | Analytics |
| `NEXT_PUBLIC_POSTHOG_HOST` | ⚠️ Optional | PostHog | Analytics host |
| `NEXT_PUBLIC_PLAUSIBLE_DOMAIN` | ⚠️ Optional | Plausible | Analytics |
| `ALLOWED_ORIGINS` | ⚠️ Optional | Security | Additional CORS origins |

---

## 🔧 Detailed Configuration

### Core Site Configuration

#### `NEXT_PUBLIC_SITE_URL` ✅ **REQUIRED**
- **Purpose**: Full site URL for CORS validation, CSP, and canonical URLs
- **Format**: `https://yourdomain.com` (no trailing slash)
- **Example**: `https://neovision.dev`
- **Used in**: Origin validation, CSP headers, metadata generation
- **⚠️ Critical**: Must NOT include `localhost` in production

#### `ALLOWED_ORIGINS` (Optional)
- **Purpose**: Comma-separated list of additional allowed origins for CORS
- **Format**: `https://domain1.com,https://domain2.com`
- **Example**: `https://staging.neovision.dev,https://preview.neovision.dev`
- **Used in**: Contact form origin validation
- **Default**: Only `NEXT_PUBLIC_SITE_URL` is allowed

---

### Sanity CMS

#### `NEXT_PUBLIC_SANITY_PROJECT_ID` ✅ **REQUIRED**
- **Purpose**: Your Sanity project ID
- **Format**: Alphanumeric string (e.g., `abc123xyz`)
- **Example**: `your_project_id`
- **Where to find**: Sanity dashboard → Project Settings
- **Used in**: All Sanity API requests

#### `NEXT_PUBLIC_SANITY_DATASET` ✅ **REQUIRED**
- **Purpose**: Sanity dataset name
- **Format**: String (e.g., `production`, `staging`)
- **Example**: `production`
- **Default**: `production`
- **Used in**: Sanity queries and mutations

#### `SANITY_API_READ_TOKEN` ✅ **REQUIRED**
- **Purpose**: Read token for accessing draft/unpublished content
- **Format**: Long alphanumeric token
- **Where to get**: Sanity dashboard → API → Tokens → Add API token
- **Permissions**: Viewer or Editor
- **Used in**: Draft mode, preview functionality
- **⚠️ Security**: Keep secret, do NOT prefix with `NEXT_PUBLIC_`

#### `SANITY_WRITE_TOKEN` ✅ **REQUIRED**
- **Purpose**: Write token for creating contact submissions
- **Format**: Long alphanumeric token
- **Where to get**: Sanity dashboard → API → Tokens → Add API token
- **Permissions**: Editor or Admin
- **Used in**: Contact form submissions
- **⚠️ Security**: Keep secret, do NOT prefix with `NEXT_PUBLIC_`
- **⚠️ Critical**: Must NOT be `your_write_token` (placeholder value)

---

### Email (Resend)

#### `RESEND_API_KEY` ⚠️ **RECOMMENDED**
- **Purpose**: Resend API key for sending emails
- **Format**: `re_` prefix followed by alphanumeric string
- **Where to get**: [Resend Dashboard](https://resend.com/api-keys)
- **Used in**: Contact form email notifications
- **Fallback**: Contact forms still save to Sanity without this

#### `RESEND_FROM` ⚠️ **RECOMMENDED**
- **Purpose**: From email address for notifications
- **Format**: `name@yourdomain.com` or `Name <name@yourdomain.com>`
- **Example**: `Neo Vision <hello@neovision.dev>`
- **Requirements**: Domain must be verified in Resend
- **Default**: `onboarding@resend.dev` (for testing only)
- **⚠️ Production**: Must use verified domain

#### `CONTACT_TO` ⚠️ **RECOMMENDED**
- **Purpose**: Email address to receive contact form notifications
- **Format**: `email@domain.com`
- **Example**: `nvt.dev@neovision.dev`
- **Default**: `nvt.dev@neovision.dev`
- **Used in**: Contact notification emails

---

### Rate Limiting (Upstash)

#### `UPSTASH_REDIS_REST_URL` ⚠️ **RECOMMENDED**
- **Purpose**: Upstash Redis REST endpoint
- **Format**: `https://your-endpoint.upstash.io`
- **Where to get**: [Upstash Console](https://console.upstash.com/) → Database → REST API
- **Used in**: Production rate limiting
- **Fallback**: In-memory rate limiter (NOT production-safe)
- **⚠️ Production**: Strongly recommended for production

#### `UPSTASH_REDIS_REST_TOKEN` ⚠️ **RECOMMENDED**
- **Purpose**: Upstash Redis authentication token
- **Format**: Long alphanumeric token
- **Where to get**: Upstash Console → Database → REST API
- **Used in**: Authenticating with Upstash Redis
- **⚠️ Security**: Keep secret

**Rate Limiting Configuration**:
- **Limit**: 5 requests per 15 minutes per IP
- **Window**: Sliding window
- **Fail-open**: Yes (with alerts in logs)

---

### Analytics

#### `NEXT_PUBLIC_POSTHOG_KEY` (Optional)
- **Purpose**: PostHog project API key
- **Format**: `phc_` prefix followed by alphanumeric string
- **Where to get**: PostHog → Project Settings → API Keys
- **Used in**: User behavior analytics, conversion tracking
- **Consent**: Respects cookie banner preferences

#### `NEXT_PUBLIC_POSTHOG_HOST` (Optional)
- **Purpose**: PostHog API host (for EU/self-hosted instances)
- **Format**: `https://eu.i.posthog.com` or `https://app.posthog.com`
- **Default**: `https://eu.i.posthog.com`
- **Used in**: PostHog client initialization

#### `NEXT_PUBLIC_PLAUSIBLE_DOMAIN` (Optional)
- **Purpose**: Domain for Plausible analytics
- **Format**: `yourdomain.com` (no protocol)
- **Example**: `neovision.dev`
- **Used in**: Plausible script initialization
- **Consent**: Respects cookie banner preferences

---

## 🔐 Security Best Practices

### Secret Management
1. **Never commit secrets** — Use `.env.local` for local development
2. **Use Vercel Environment Variables** — Set in Vercel dashboard for production
3. **Rotate tokens regularly** — Especially write tokens
4. **Principle of least privilege** — Use read-only tokens where possible

### Production Checklist
- [ ] All `NEXT_PUBLIC_*` variables are safe to expose
- [ ] No `localhost` in `NEXT_PUBLIC_SITE_URL` or `ALLOWED_ORIGINS`
- [ ] `SANITY_WRITE_TOKEN` is NOT the placeholder value
- [ ] Resend domain is verified
- [ ] Upstash Redis is configured (or accept in-memory fallback risk)
- [ ] All secrets are set in Vercel dashboard, not in code

---

## 📝 Example `.env.local` (Development)

```bash
# Site Configuration
NEXT_PUBLIC_SITE_URL=http://localhost:3000

# Sanity
NEXT_PUBLIC_SANITY_PROJECT_ID=your_project_id
NEXT_PUBLIC_SANITY_DATASET=production
SANITY_API_READ_TOKEN=your_read_token_here
SANITY_WRITE_TOKEN=your_write_token_here

# Email (Resend)
RESEND_API_KEY=re_your_api_key_here
RESEND_FROM=onboarding@resend.dev
CONTACT_TO=your-email@example.com

# Rate Limiting (Upstash)
UPSTASH_REDIS_REST_URL=https://your-endpoint.upstash.io
UPSTASH_REDIS_REST_TOKEN=your_token_here

# Analytics (Optional)
NEXT_PUBLIC_POSTHOG_KEY=phc_your_key_here
NEXT_PUBLIC_POSTHOG_HOST=https://eu.i.posthog.com
NEXT_PUBLIC_PLAUSIBLE_DOMAIN=localhost
```

---

## 📝 Example Production Environment Variables (Vercel)

```bash
# Site Configuration
NEXT_PUBLIC_SITE_URL=https://neovision.dev

# Sanity
NEXT_PUBLIC_SANITY_PROJECT_ID=abc123xyz
NEXT_PUBLIC_SANITY_DATASET=production
SANITY_API_READ_TOKEN=sk...
SANITY_WRITE_TOKEN=sk...

# Email (Resend)
RESEND_API_KEY=re_...
RESEND_FROM=Neo Vision <hello@neovision.dev>
CONTACT_TO=nvt.dev@neovision.dev

# Rate Limiting (Upstash)
UPSTASH_REDIS_REST_URL=https://your-prod-endpoint.upstash.io
UPSTASH_REDIS_REST_TOKEN=...

# Analytics
NEXT_PUBLIC_POSTHOG_KEY=phc_...
NEXT_PUBLIC_POSTHOG_HOST=https://eu.i.posthog.com
NEXT_PUBLIC_PLAUSIBLE_DOMAIN=neovision.dev
```

---

## 🚨 Troubleshooting

### Contact Form Not Working
1. Check `SANITY_WRITE_TOKEN` is set and not placeholder
2. Verify `NEXT_PUBLIC_SITE_URL` matches actual domain
3. Check browser console for CORS/CSP errors
4. Verify Upstash credentials if rate limiting fails

### Emails Not Sending
1. Verify `RESEND_API_KEY` is valid
2. Check `RESEND_FROM` domain is verified in Resend
3. Look for errors in server logs
4. Contact forms still save to Sanity even if email fails

### Rate Limiting Not Working
1. Check `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN` are set
2. Look for `[SECURITY] ALERT` in logs (indicates fail-open)
3. Fallback to in-memory limiter in development is expected

### Analytics Not Tracking
1. Verify cookie banner preferences are accepted
2. Check `NEXT_PUBLIC_POSTHOG_KEY` is set correctly
3. Ensure CSP allows analytics domains
4. Check browser console for blocked requests

---

## 📚 Additional Resources

- [Next.js Environment Variables](https://nextjs.org/docs/basic-features/environment-variables)
- [Vercel Environment Variables](https://vercel.com/docs/concepts/projects/environment-variables)
- [Sanity API Tokens](https://www.sanity.io/docs/http-auth)
- [Resend Documentation](https://resend.com/docs)
- [Upstash Redis](https://docs.upstash.com/redis)
