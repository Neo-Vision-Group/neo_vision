<wizard-report>
# PostHog post-wizard report

The wizard has completed a deep integration of PostHog analytics into the Neo Vision Next.js App Router project.

## Summary of changes

**New files created:**
- `instrumentation-client.ts` — Client-side PostHog initialization using the Next.js 15.3+ `instrumentation-client` approach. Initializes `posthog-js` with the EU host, reverse proxy, exception capture, and debug mode in development.
- `lib/posthog-server.ts` — Singleton server-side PostHog client (`posthog-node`) for tracking events in API routes.

**Modified files:**
- `next.config.ts` — Added `skipTrailingSlashRedirect: true` and reverse-proxy `rewrites()` routing `/ingest/*` through to `eu.i.posthog.com` (and `/ingest/static/*`, `/ingest/array/*` to `eu-assets.i.posthog.com`) to avoid ad-blocker interference.
- `components/partials/Button.tsx` — Added `onClick` forwarding on link-mode `<Button>` so click handlers work when `href` is provided.
- `.env.local` — Added `NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN` and `NEXT_PUBLIC_POSTHOG_HOST`.

**Events instrumented:**

| Event | Description | File |
|-------|-------------|------|
| `contact_form_submitted` | User successfully submits the contact form (client-side confirmation) | `components/sections/contact/ContactFormSection.tsx` |
| `contact_form_error` | Contact form submission fails with an error | `components/sections/contact/ContactFormSection.tsx` |
| `contact_submitted` | Server-side: contact form data saved to Sanity (reliable conversion event) | `app/api/contact/route.ts` |
| `insights_category_filtered` | User filters the insights grid by category | `components/sections/insights/InsightsGrid.tsx` |
| `insight_cta_clicked` | User clicks 'Book a call' CTA at the bottom of an insight article | `components/sections/insight-detail/InsightClosingCta.tsx` |
| `study_cta_clicked` | User clicks the CTA button at the bottom of a case study | `components/sections/study/ClosingCta.tsx` |
| `portfolio_cta_clicked` | User clicks the CTA button in the portfolio section | `components/sections/portfolio/PortfolioCta.tsx` |
| `nav_cta_clicked` | User clicks the primary CTA button in the navigation bar | `components/layout/NavClient.tsx` |
| `resource_downloaded` | User clicks to download a resource (guide or tool) | `components/partials/ResourceCard.tsx` |
| `calendly_booking_viewed` | Calendly scheduling widget is rendered/loaded | `components/sections/contact/Booking.tsx` |

## Next steps

We've built some insights and a dashboard for you to keep an eye on user behavior, based on the events we just instrumented:

- [Analytics basics dashboard](/dashboard/668842)
- [Contact form submissions over time](/insights/GH1UVsC2)
- [Contact page conversion funnel](/insights/XZaoVVuV)
- [Nav CTA clicks by placement](/insights/iJYTZ8Wq)
- [CTA engagement across site](/insights/ublHXJj6)
- [Insights category filter usage](/insights/98C13or8)

### Agent skill

We've left an agent skill folder in your project. You can use this context for further agent development when using Claude Code. This will help ensure the model provides the most up-to-date approaches for integrating PostHog.

</wizard-report>
