# Production Deployment Checklist

This checklist ensures all critical items are addressed before deploying to production.

## ✅ Pre-Deployment Tasks

### Environment Variables (CRITICAL)
- [ ] Set `NEXT_PUBLIC_SITE_URL` to production domain (not localhost)
- [ ] Configure `UPSTASH_REDIS_REST_URL` from https://console.upstash.com/
- [ ] Configure `UPSTASH_REDIS_REST_TOKEN` from https://console.upstash.com/
- [ ] Set `NEXT_PUBLIC_SANITY_PROJECT_ID` to actual project ID
- [ ] Set `SANITY_API_READ_TOKEN` with read permissions
- [ ] Set `SANITY_WRITE_TOKEN` with write permissions
- [ ] Set `RESEND_API_KEY` for contact form emails
- [ ] Set `CONTACT_TO` email address for form submissions
- [ ] Set `RESEND_FROM` verified sender email
- [ ] Configure `NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN`
- [ ] Configure `POSTHOG_SERVER_API_KEY` (separate from client token)
- [ ] Set `PLAUSIBLE_SCRIPT_URL` with your custom domain
- [ ] Set `NEXT_PUBLIC_SANITY_STUDIO_URL` to production Studio URL
- [ ] Remove or update `ALLOWED_ORIGINS` if used

### Build Validation
- [ ] Run `npm run type-check` - no TypeScript errors
- [ ] Run `npm run lint` - no ESLint errors
- [ ] Run `npm run build` locally - successful build
- [ ] Test production build: `npm start` - app runs correctly
- [ ] Verify `sanity.schema.json` is committed to git
- [ ] Confirm prebuild script validates environment variables

### Content & Assets
- [ ] All required Sanity content is published (not draft)
- [ ] Home page configured with `pageType: 'home'`
- [ ] Site settings singleton configured in Sanity
- [ ] SEO settings singleton configured in Sanity
- [ ] Cookie settings configured in site settings
- [ ] Test all page routes render correctly
- [ ] Verify images load from Sanity CDN

### Security
- [ ] Verify CSP headers don't block legitimate scripts
- [ ] Test contact form rate limiting works
- [ ] Verify CSRF protection is active
- [ ] Test cookie consent banner appears
- [ ] Confirm no localhost URLs in production env
- [ ] Review security headers in `next.config.ts`
- [ ] Verify Upstash Redis is configured (not in-memory fallback)

### Testing
- [ ] Test all main routes: `/`, `/about`, `/services`, `/contact`, `/insights`, `/portfolio`
- [ ] Test service detail pages: `/services/[slug]`
- [ ] Test case study pages: `/portfolio/[slug]`
- [ ] Test insight detail pages: `/insights/[slug]`
- [ ] Verify page transitions work smoothly
- [ ] Test contact form submission end-to-end
- [ ] Verify analytics tracking fires (check PostHog/Plausible)
- [ ] Test on mobile devices (iOS Safari, Android Chrome)
- [ ] Test cookie consent accept/reject flows
- [ ] Verify email notifications arrive (if Resend configured)

### Performance
- [ ] Run Lighthouse audit - target 90+ on all metrics
- [ ] Check Core Web Vitals (LCP, FID, CLS)
- [ ] Verify images are optimized
- [ ] Check font loading strategy
- [ ] Test page load times on 3G connection

### SEO
- [ ] Verify `robots.txt` is accessible at `/robots.txt`
- [ ] Verify `sitemap.xml` is accessible at `/sitemap.xml`
- [ ] Submit sitemap to Google Search Console
- [ ] Test social sharing previews (Twitter, LinkedIn, Facebook)
- [ ] Verify Open Graph images render correctly
- [ ] Check meta descriptions on all pages
- [ ] Verify canonical URLs are correct

### Monitoring & Observability
- [ ] Set up uptime monitoring (UptimeRobot, Pingdom, etc.)
- [ ] Configure error tracking if using (Sentry when ready)
- [ ] Set up performance monitoring
- [ ] Configure log aggregation if needed
- [ ] Set up alerts for critical errors
- [ ] Document incident response procedures

## 🚀 Deployment Steps

### Pre-Deploy
1. [ ] Create production environment on hosting platform
2. [ ] Configure all environment variables in hosting dashboard
3. [ ] Set up custom domain and SSL certificate
4. [ ] Configure DNS records

### Deploy
1. [ ] Push code to production branch
2. [ ] Trigger production build
3. [ ] Monitor build logs for errors
4. [ ] Wait for deployment to complete

### Post-Deploy Verification
1. [ ] Visit production URL - site loads correctly
2. [ ] Check browser console - no critical errors
3. [ ] Test contact form submission
4. [ ] Verify analytics tracking works
5. [ ] Check email notifications arrive
6. [ ] Test page transitions
7. [ ] Verify cookie banner appears for new visitors
8. [ ] Check social sharing previews
9. [ ] Test mobile responsiveness
10. [ ] Monitor error logs for first 24 hours

## 📊 Post-Launch Monitoring (First 24 Hours)

- [ ] Monitor error rates
- [ ] Check performance metrics
- [ ] Review analytics data
- [ ] Monitor contact form submissions
- [ ] Check email delivery rates
- [ ] Review security logs
- [ ] Monitor rate limiting effectiveness
- [ ] Check Upstash Redis usage

## 🔧 Rollback Plan

If critical issues are discovered:

1. **Immediate Actions:**
   - Revert to previous deployment
   - Document the issue
   - Notify stakeholders

2. **Investigation:**
   - Check error logs
   - Review recent changes
   - Test in staging environment

3. **Fix & Redeploy:**
   - Apply fix
   - Test thoroughly
   - Redeploy with monitoring

## 📝 Notes

### Known Limitations
- In-memory rate limiting will NOT work in serverless environments (Upstash Redis required)
- Console statements are guarded but not removed (consider adding proper logging service)
- Error monitoring not configured (Sentry integration pending)

### Production Environment Validation
The build process automatically validates critical environment variables. Build will fail if:
- `NEXT_PUBLIC_SITE_URL` is localhost
- Sanity credentials are placeholder values
- Upstash Redis credentials are missing
- Required tokens are not set

### Icon Assets
Generated icons use Next.js ImageResponse API:
- `/icon.tsx` - 192x192 PWA icon
- `/apple-icon.tsx` - 180x180 Apple touch icon
- `/opengraph-image.tsx` - 1200x630 social sharing image

Replace these with actual brand assets for production.

### Security Headers
Configured in `next.config.ts`:
- Content Security Policy (CSP) with nonce
- HTTP Strict Transport Security (HSTS)
- X-Frame-Options: DENY
- X-Content-Type-Options: nosniff
- Referrer-Policy
- Permissions-Policy

### Rate Limiting
Contact form is rate-limited to 5 requests per 15 minutes per IP using Upstash Redis.

### Analytics
- PostHog: Client-side and server-side tracking
- Plausible: Privacy-friendly analytics
- Both respect cookie consent preferences
