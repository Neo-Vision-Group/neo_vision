# Production Testing Checklist

This document lists all features, integrations, and security measures that must be tested in production after deployment.

## 🔐 Security & Protection

### CSP (Content Security Policy)
- [ ] **No CSP violations in browser console** — Open DevTools Console on all major pages
- [ ] **Inline theme script loads** — Page should not flash wrong theme
- [ ] **Third-party scripts load correctly** — Calendly, Plausible, PostHog
- [ ] **Nonce attribute present** — Inspect `<script>` tags in page source for `nonce` attribute

### CSRF Protection
- [ ] **Contact form submission works** — Submit a test contact form
- [ ] **CSRF token validation** — Verify form fails with manipulated/missing token (DevTools Network tab)
- [ ] **Token refresh on page reload** — Token should be different after refresh

### Rate Limiting
- [ ] **Contact form rate limit enforced** — Submit 6+ forms rapidly, verify 429 response
- [ ] **Rate limit headers present** — Check `X-RateLimit-*` headers in 429 response
- [ ] **Upstash Redis connected** — Check server logs for no "fail-open" alerts
- [ ] **Rate limiter fail-open alerts** — If Upstash fails, verify `[SECURITY] ALERT` in logs

### Origin & Referer Validation
- [ ] **Contact form requires Origin header** — Test with curl/Postman without Origin
- [ ] **Contact form requires Referer header** — Test with curl/Postman without Referer
- [ ] **Localhost blocked in production** — Verify no localhost in `ALLOWED_ORIGINS`

### Honeypot
- [ ] **Honeypot field hidden** — Inspect contact form, verify `website` field is `display: none`
- [ ] **Honeypot triggers silent drop** — Fill honeypot field, verify 200 response but no Sanity record

---

## 📧 Email & Notifications

### Resend Integration
- [ ] **Contact notification email received** — Submit form, check `CONTACT_TO` inbox
- [ ] **Confirmation email to user** — Check user's email inbox
- [ ] **Email formatting correct** — Verify HTML rendering, all fields present
- [ ] **Reply-to address set** — Reply to notification email should go to user

### Sanity Write
- [ ] **Contact submission saved to Sanity** — Check Sanity Studio for new `contactSubmission` document
- [ ] **All form fields captured** — Verify name, email, company, phone, projectType, budget, hearAboutUs, message
- [ ] **Sanitized HTML** — Check for no raw HTML tags in saved data
- [ ] **Timeout handling** — Verify 10-second timeout doesn't hang requests

---

## 📊 Analytics & Tracking

### PostHog
- [ ] **Page views tracked** — Navigate site, check PostHog dashboard for events
- [ ] **UTM parameters captured** — Visit with `?utm_source=test&utm_campaign=prod`, verify in PostHog
- [ ] **Contact form conversion tracked** — Submit form, verify `contact_submitted` event
- [ ] **Consent respected** — Reject analytics cookies, verify no PostHog events
- [ ] **Server-side distinct ID** — Check PostHog event properties for IP-based ID

### Plausible
- [ ] **Page views tracked** — Check Plausible dashboard
- [ ] **Consent respected** — Reject analytics cookies, verify no Plausible events

### Cookie Banner
- [ ] **Banner shows on first visit** — Clear cookies, reload page
- [ ] **Preferences persist** — Accept/reject, reload, verify choice remembered
- [ ] **Reopen from footer** — Click "Cookie Settings" in footer
- [ ] **Category toggles work** — Toggle analytics/marketing categories

---

## 🎨 UI/UX & Animations

### First-Visit Loading Experience
- [ ] **Intro plays on first visit** — Clear session storage, reload
- [ ] **Intro skipped on subsequent visits** — Reload page, verify no intro
- [ ] **clash progress bar animates** — Watch loading percentage
- [ ] **Hero background reused** — Verify no duplicate `hero.mp4` elements

### Page Transitions
- [ ] **Wipe animation on navigation** — Click internal links, verify red sweep
- [ ] **Halftone pattern persists** — Navigate from home to other pages with hero
- [ ] **No flash during transition** — Loading fallback should not show
- [ ] **Transition completes** — Page reveals after route content loads

### Theme Toggle
- [ ] **Dark mode toggle works** — Click theme toggle in nav
- [ ] **Theme persists** — Reload page, verify theme remembered
- [ ] **No flash of wrong theme** — Hard reload, should not flash light mode in dark

### Dropdown Keyboard Navigation
- [ ] **Arrow keys navigate options** — Focus contact form dropdown, press ↓/↑
- [ ] **Enter/Space selects** — Navigate to option, press Enter
- [ ] **Home/End jump to first/last** — Press Home/End keys
- [ ] **Escape closes dropdown** — Press Escape, verify dropdown closes
- [ ] **Focus returns to button** — After selection, focus should return to trigger

---

## 🖼️ Images & Media

### Next/Image Optimization
- [ ] **Images load correctly** — Check all pages for broken images
- [ ] **Responsive images** — Resize browser, verify different sizes load
- [ ] **Lazy loading works** — Scroll down, verify images load on demand
- [ ] **No layout shift** — Images should not cause content to jump

### Sanity CDN
- [ ] **Sanity images load** — Check portfolio, insights, team member portraits
- [ ] **Image transformations work** — Verify cropped/resized images render correctly
- [ ] **Fallback for missing images** — Test with deleted Sanity asset

### Hero Background Video
- [ ] **Hero video plays** — Check home page hero
- [ ] **Video loops smoothly** — Watch for seamless loop
- [ ] **Shared media source** — Verify only one `hero.mp4` element in DOM

---

## 📱 Responsive & Accessibility

### Mobile Responsiveness
- [ ] **Mobile nav works** — Test hamburger menu on mobile
- [ ] **Touch interactions** — Test all interactive elements on touch device
- [ ] **Viewport meta tag** — Check page source for correct viewport settings

### Keyboard Navigation
- [ ] **Tab order logical** — Tab through page, verify focus order
- [ ] **Skip to content link** — Tab from top, verify skip link appears
- [ ] **Focus visible** — All interactive elements show focus indicator
- [ ] **No keyboard traps** — Can navigate entire page with keyboard only

### Screen Reader
- [ ] **ARIA labels present** — Check dropdown, nav, buttons for aria-* attributes
- [ ] **Heading hierarchy** — Verify h1 → h2 → h3 structure
- [ ] **Alt text on images** — All content images have descriptive alt text
- [ ] **Form labels** — All form inputs have associated labels

---

## 🔗 Integrations

### Calendly
- [ ] **Calendly widget loads** — Navigate to booking page
- [ ] **Booking flow works** — Complete a test booking
- [ ] **CSP allows Calendly** — No console errors for Calendly scripts/iframes

### Sanity Studio
- [ ] **Studio accessible** — Visit `/studio` route
- [ ] **Content edits reflect** — Edit content in Studio, verify on frontend
- [ ] **Draft mode works** — Enable draft mode, verify unpublished content shows
- [ ] **Live preview** — Test Sanity live preview if configured

---

## 🌐 SEO & Metadata

### Meta Tags
- [ ] **Title tags unique** — Check all major pages for unique titles
- [ ] **Meta descriptions present** — View page source, verify descriptions
- [ ] **Open Graph tags** — Share link on social media, verify preview
- [ ] **Twitter Card tags** — Share on Twitter, verify card renders

### Structured Data
- [ ] **JSON-LD present** — View page source, verify `<script type="application/ld+json">`
- [ ] **No JSON-LD CSP violations** — Check console for CSP errors
- [ ] **Valid schema** — Test with Google Rich Results Test

### Sitemap & Robots
- [ ] **Sitemap accessible** — Visit `/sitemap.xml`
- [ ] **Robots.txt correct** — Visit `/robots.txt`, verify production settings
- [ ] **Canonical URLs** — Check `<link rel="canonical">` on all pages

---

## ⚡ Performance

### Core Web Vitals
- [ ] **LCP < 2.5s** — Check PageSpeed Insights
- [ ] **FID < 100ms** — Test interaction responsiveness
- [ ] **CLS < 0.1** — Verify no layout shifts

### Caching
- [ ] **Static assets cached** — Check Network tab for cache headers
- [ ] **ISR working** — Verify pages regenerate after revalidation period
- [ ] **CDN headers** — Check for Vercel/CDN cache headers

---

## 🚨 Error Handling

### Error Pages
- [ ] **404 page renders** — Visit non-existent route
- [ ] **404 uses layout** — Verify nav/footer present on 404
- [ ] **500 error page** — Trigger server error, verify error page
- [ ] **Global error boundary** — Test client-side error, verify `global-error.tsx`

### Graceful Degradation
- [ ] **Email failure doesn't block** — Disable Resend, verify form still saves to Sanity
- [ ] **Analytics failure silent** — Disable PostHog, verify no user-facing errors
- [ ] **Rate limiter fail-open** — Disable Upstash, verify requests still work (with alert)

---

## 🔍 Monitoring & Logging

### Server Logs
- [ ] **Security events logged** — Check logs for `[SECURITY]` entries
- [ ] **Correlation IDs present** — Verify contact submissions have correlation IDs
- [ ] **No sensitive data in logs** — Ensure no passwords/tokens logged

### Error Tracking
- [ ] **Errors reported** — Trigger error, verify in error tracking service (if configured)
- [ ] **Source maps working** — Check error stack traces are readable

---

## ✅ Final Checks

- [ ] **All environment variables set** — See `ENVIRONMENT-VARIABLES.md`
- [ ] **No localhost in production config** — Grep for `localhost` in env vars
- [ ] **HTTPS enforced** — Verify all requests use HTTPS
- [ ] **Security headers present** — Check for CSP, X-Frame-Options, etc.
- [ ] **No console errors** — Clean console on all major pages
- [ ] **Build successful** — Verify deployment build completed without errors
