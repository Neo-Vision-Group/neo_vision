# Neo Vision Website 2026 — Full Codebase Audit

**Repository:** `Neo-Vision-Group/neo_vision` (branch `main`, 122 commits)
**Audit date:** 2026-06-13
**Method:** Local max-effort multi-agent review (1 recon/dependency pass + 6 parallel dimension finders), findings cross-verified against each other and against live source. Two P0 candidates were adversarially verified and **refuted** (see §0.4).
**Scope:** READ-ONLY. No source files were modified. The only file written is this report.

---

## 0. Executive Summary

### 0.1 Overall verdict

**Health: B− / "solid foundation, needs a hardening + performance + testing pass before it's production-robust."**

This is a competently built, security-*conscious*, SEO-*sophisticated* Next.js 16 + Sanity v5 marketing site. The fundamentals are genuinely good: a working nonce-based CSP, fully parameterized GROQ (no injection), server-only Sanity tokens, strict TypeScript with no build-error suppression, clean single-lockfile hygiene, and an unusually thorough metadata/canonical/hreflang/JSON-LD layer.

It is held back by four things:

1. **One live, authn-less abuse vector** — the resource endpoint is an open email relay (P0).
2. **A client-heavy render strategy** that hurts Core Web Vitals on a site whose entire job is marketing/SEO (LCP content hidden behind JS, a forced 3s intro, and the whole page-builder shipped to every page).
3. **Zero automated tests** and **no production error monitoring** — regressions and runtime failures are invisible.
4. **Heavy copy-paste** in the two form API routes (~130 duplicated lines) that has already started to drift.

Nothing here is "the site is on fire," but the P0 and the CWV issues should be addressed before any serious production traffic.

### 0.2 Per-dimension scores

| Dim | Area | Score | One-line |
|-----|------|-------|----------|
| A | Architecture & organization | 6/10 | Clean module boundaries, but route duplication + 3 dead/duplicated env-validation copies |
| B | Components | 6/10 | Good structure & error boundaries; a hooks-order bug, a dead analytics env var, an image crash |
| C | Security | 6.5/10 | Strong scaffold (CSP works, GROQ safe, tokens server-only); dragged down by the open-relay endpoint |
| D | Layouts & UI | 7/10 | Solid; minor a11y (zoom cap) and CLS risks from late-revealed content |
| E | Integrations | 6/10 | Resend/PostHog/Upstash wired well, but no timeouts/idempotency and a per-request `shutdown()` bug |
| F | Performance | 5/10 | Client-heavy render tree + forced intro + hidden LCP content = real CWV cost |
| G | Data layer | 7/10 | Parameterized GROQ, sound image handling; `useCdn:true`+token footgun, slug uniqueness gap |
| H | Error handling & observability | 4/10 | Error boundaries exist but logging ends at `console`; no monitoring; fail-open alert unconsumed |
| I | Testing | 1/10 | No test framework, no tests, no CI test job |
| J | Build / CI / DevEx | 6/10 | Strict TS, clean lockfile, reproducible CI; but no build/type/lint/test gate in CI |
| K | SEO & metadata | 7/10 | Sophisticated; undermined by a JSON-LD allowlist that drops 3 page types & a hardcoded domain |

### 0.3 The 5 biggest risks

1. **`SEC-1` — Open email relay / arbitrary attachment (P0).** `app/api/resource/route.ts` trusts a client-supplied URL and emails/attaches it to a client-supplied recipient from the company's verified domain. Abusable for phishing-from-your-domain.
2. **`SEC-2`+`SEC-3` — Rate limiting can silently fail open in production.** The in-memory fallback is per-instance (useless on serverless) and the env guard that would *require* Upstash in prod (`throwIfProductionEnvInvalid`) is **never called**.
3. **`PERF-1`/`PERF-2`/`PERF-3` — Core Web Vitals.** The LCP hero is `ssr:false` + `visibility:hidden` until GSAP hydrates, a forced 3s intro overlay blocks first paint, and the entire ~50-section page-builder ships to every page. Bad for a site that lives or dies on organic search.
4. **`TEST-1`+`OBS-1` — Flying blind.** No tests on security-critical paths (CSRF, validation, rate-limit) and no error monitoring; the rate-limit "fail-open ALERT" logs to a `console` nobody consumes.
5. **`SEO-1` — Structured data silently dropped on /portfolio, /about, /contact.** The JSON-LD validator allowlist omits the very `@type`s those pages generate, so they ship with zero structured data.

### 0.4 ⚠️ Verified NON-issues (candidate findings that were refuted)

These were flagged by automated passes and **disproven on verification** — do not act on them:

- **"No CSP / clickjacking unprotected (proxy.ts is a dead file)."** **FALSE.** Next.js 16 renamed `middleware.ts` → `proxy.ts` with the exported function renamed to `proxy` ([docs](https://nextjs.org/docs/app/api-reference/file-conventions/proxy)). The repo is on Next **16.2.6**, and `frontend/proxy.ts` exports `proxy(request)` + `export const config = { matcher }` exactly per convention. The **nonce-based CSP, `frame-ancestors 'none'`, `base-uri`, `form-action`, `upgrade-insecure-requests` are all active in production.** (Only nit → `DOC-1`: the comment in `next.config.ts:9` still says "handled by middleware.ts".)
- **"`swiper` not installed → build break (P0)."** **FALSE.** `swiper@^12.2.0` is a declared dependency in the root `package.json`. The finder saw no `node_modules/swiper` only because the fresh clone was never `npm install`ed. (Real residual nit → `ARCH-6`: it's declared in the *root* workspace rather than `frontend/` where it's used.)

### 0.5 The 5 highest-value quick wins (P1 that are C1/C2)

| Win | ID | Effort | Why |
|-----|-----|--------|-----|
| Add `CreativeWork`,`AboutPage`,`ContactPage` to JSON-LD allowlist | `SEO-1` | C1 | Restores structured data on 3 key page types in a 3-line edit |
| Rename `PLAUSIBLE_SCRIPT_URL` → `NEXT_PUBLIC_PLAUSIBLE_SCRIPT_URL` | `CMP-2` | C1 | Plausible analytics currently **never loads** (env var undefined in client bundle) |
| Move `Story.tsx` early-return below the hooks | `CMP-1` | C1 | Removes a Rules-of-Hooks violation that crashes when data toggles |
| Call `throwIfProductionEnvInvalid()` at boot | `SEC-3` | C1 | Activates the (currently dead) guard that forces Upstash + real tokens in prod |
| Stop trusting client `resourceObject`; look up the file server-side | `SEC-1` | C2 | Closes the P0 open-relay vector |
| Add a `build + type-check + lint` job to CI | `BUILD-1` | C2 | Stops broken builds/types reaching `main` (only Vercel catches them today, post-merge) |

### 0.6 Detected stack inventory

| Area | Detail |
|------|--------|
| Monorepo | npm **workspaces** (`frontend`, `studio`), package name `neoxai` |
| Package manager | **npm 10.9.0**, single root `package-lock.json` (lockfileVersion 3); CI on Node 20 |
| Frontend | **Next.js 16.2.6** (App Router), **React 19.2**, **TypeScript 5.9.3** (`strict: true`) |
| Styling | **Tailwind CSS v4** (CSS-first `@import 'tailwindcss'`); a legacy v3-style `tailwind.config.ts` remains |
| CMS / data | **Sanity v5** (`next-sanity ^12`, `@sanity/client ^7`), GROQ-typed via `sanity typegen` |
| Forms | react-hook-form + zod |
| Animation/UI | GSAP 3.15 + `@gsap/react`, Lenis, Swiper, sonner, next-themes |
| Email | Resend + `@react-email/*` |
| Rate limiting | Upstash Redis + `@upstash/ratelimit` (in-memory fallback) |
| Analytics | PostHog (proxied via `/ingest/*` → EU), Plausible (`next-plausible`), Vercel Speed Insights |
| Hosting | **Vercel** (`frontend/vercel.json`); Studio separately hosted |
| CI/CD | One workflow: `security-audit.yml` (npm audit + dependency-review + CodeQL; a security-headers job is commented out). **No build/test/lint job.** |
| Security primitives | nonce CSP (`proxy.ts`), HSTS/`X-Content-Type-Options`/`Referrer-Policy`/`Permissions-Policy` (`next.config.ts`), CSRF + honeypot + origin/referer checks, `security.txt` |

---

## 1. Master findings table

Sorted by severity (P0→P3), then ascending complexity (C1→C4). Locations are relative to the repo root. Severity: **P0** fix now · **P1** this sprint · **P2** plan it · **P3** polish. Complexity: **C1** <1h · **C2** hours · **C3** 1–3 days · **C4** architectural.

| ID | Title | Cat | Sev | Cx | Location | Impact |
|----|-------|-----|-----|----|----------|--------|
| SEC-1 | Open email relay / arbitrary attachment via client-supplied resource URL | C/E | **P0** | C2 | `frontend/app/api/resource/route.ts:213-273`; `frontend/lib/resourceRequestSchema.ts:6-14` | Phishing/spam + URL-content delivery from the verified company domain to attacker-chosen recipients |
| SEO-1 | JSON-LD validator allowlist drops `CreativeWork`/`AboutPage`/`ContactPage` | K | P1 | C1 | `frontend/lib/sanitize.ts:42-54` | Portfolio, About, Contact pages ship **zero** structured data despite generating it |
| CMP-2 | Plausible script URL uses non-`NEXT_PUBLIC_` env var in a client component | B/E | P1 | C1 | `frontend/components/partials/ConsentAwarePlausible.tsx:20` | `src` is always `undefined` → Plausible analytics never loads |
| CMP-1 | Conditional early-return before hooks (Rules of Hooks violation) | B | P1 | C1 | `frontend/components/sections/home/Story.tsx:55` | React throws "rendered fewer hooks" when section data toggles (draft/live editing) |
| SEC-3 | Production env-validation guard never invoked (dead) | C | P1 | C1 | `frontend/lib/validate-env.ts:96-112`; `frontend/lib/env.ts:37-55` | "Upstash required in prod / no localhost / real tokens" guarantees are never enforced at runtime |
| TEST-1 | No automated tests of any kind | I | P1 | C3 | repo-wide (`frontend`, `studio`) | CSRF, validation, rate-limit, GROQ, routes can all regress silently |
| SEC-1-FIX dep → CMP-3 | `next/image` with no `width`/`height`/`fill` in portable text | B | P1 | C2 | `frontend/components/partials/PortableTextRenderer.tsx:117` | Throws at render → any Insight post body with an inline image crashes |
| SEC-2 | In-memory rate limiter ineffective on serverless + module `setInterval` | C | P1 | C2 | `frontend/lib/rate-limit.ts:15,73-80` | When Upstash unset, per-IP limits reset per instance → abuse of contact/resource endpoints |
| ARCH-1 | Two form API routes ~95% copy-pasted (~130 lines) | A | P1 | C2 | `frontend/app/api/contact/route.ts:14-143` vs `…/resource/route.ts:14-143` | Security fixes must be applied twice; drift already present (SEC-6, ARCH-5) |
| BUILD-1 | CI has no build / type-check / lint / test gate | J | P1 | C2 | `.github/workflows/security-audit.yml` | Type/lint/build breakage reaches `main`; only Vercel catches it, post-merge |
| OBS-1 | No error monitoring; observability ends at `console` | H | P1 | C2 | `frontend/app/global-error.tsx:13`; `frontend/lib/security-logger.ts:54-58`; `rate-limit-upstash.ts:75-83` | Security events, write/email failures, and rate-limit fail-open are invisible in prod |
| PERF-3 | Forced 3s intro overlay blocks first paint | F | P1 | C2 | `frontend/components/partials/FirstLoadIntro.tsx:11,128-134` | First-time LCP/FCP delayed ≥3s even on a fully-loaded page |
| PERF-1 | LCP hero content is `ssr:false` + hidden until GSAP hydrates | F | P1 | C3 | `frontend/components/sections/home/Hero.tsx:8-22`; `…/motion/RevealOnScroll.tsx:91`; `SplitTextReveal.tsx:150` | LCP element absent from SSR HTML, invisible until JS runs → multi-second LCP on mobile |
| PERF-2 | PageBuilder is a client component importing all ~50 sections | F | P1 | C3 | `frontend/components/PageBuilder.tsx:1`; `frontend/components/BlockRenderer.tsx:5-64` | Every page ships the union of all section code (+gsap/forms) — no code-splitting |
| SEC-6 | Raw email (PII) sent to PostHog in resource route only | C | P2 | C1 | `frontend/app/api/resource/route.ts:199-201` | PII to analytics, inconsistent with contact route's deliberate restraint (GDPR/data-min) |
| SEC-5 | Origin/Referer `new URL()` unguarded → 500 instead of 403 | C | P2 | C1 | `frontend/app/api/contact/route.ts:82-92`; `…/resource/route.ts:81-92` | Malformed header (trivial to send) throws → 500; malformed `ALLOWED_ORIGINS` 500s every request |
| SEC-7 | "localhost in production" check logs "blocked" but doesn't block | C | P2 | C1 | `frontend/app/api/contact/route.ts:65-71`; `…/resource/route.ts:64-70` | A misconfig leaves `localhost` an accepted origin in prod; log is misleading |
| SEC-8 | Double-escaping: `sanitizeHtml` before Sanity store + React email | C/B | P2 | C1 | `frontend/lib/sanitize.ts:1-9`; contact/resource write blocks | `O'Brien` → `O&#x27;Brien` stored & shown; email body uses raw value → they diverge |
| SEC-9 | `useCdn:true` on the token-bearing read client | G/C | P2 | C1 | `frontend/sanity/lib/client.ts:6-13` | Token + CDN footgun → stale/cached content; same client backs `defineLive` |
| SEC-10 | Studio schema lacks URL/required validation feeding the email flow | G/C | P2 | C1 | `studio/src/schemaTypes/objects/resources/freeResources.ts:54-65`; `documents/resourceRequests.ts:8-17` | Editor-set `externalUrl` (any host) becomes the attachment source (widens SEC-1) |
| SEC-6-PII dup → ARCH-2 | IP extraction triplicated; trusts client `x-forwarded-for` | C/A | P2 | C1 | `frontend/lib/getIP.ts`, `rate-limit.ts:17-30`, `security-logger.ts:19-32` + inline in routes | Spoofable XFF rotates rate-limit keys & poisons logs; 4–5 copies to fix |
| PERF-5 | Home page data fetched twice per request | F | P2 | C1 | `frontend/app/page.tsx:15-22,40` | `generateMetadata` uses the `cache()`'d loader; the page calls `sanityFetch` directly → 2 round-trips |
| PERF-7 | Sanity image URLs omit `.auto('format')`/`.quality()` | F | P2 | C1 | `frontend/sanity/lib/utils.ts:39-52` | CDN serves original format/full size; redundant bytes (esp. raw `<img>` / OG) |
| SEO-2 | Hardcoded `neovision.dev` in WebSite SearchAction structured data | K | P2 | C1 | `frontend/sanity/lib/seo.ts:1322-1332` | Preview/staging JSON-LD advertises prod domain; rots if domain changes; node not nested under WebSite |
| CMP-5 | Dead "Book a call" CTA (no `href`/`onClick`) | B | P2 | C1 | `frontend/components/sections/services/ServiceNavigator.tsx:272` | Closing CTA button does nothing |
| CMP-6 | `DrawLine` listens for wrong event name | B | P2 | C1 | `frontend/components/partials/motion/DrawLine.tsx:81` vs `lib/page-transition.ts:1` | Post-navigation `ScrollTrigger.refresh()` never fires → mis-measured draw lines |
| CMP-7 | `CountingNumber` RAF not cancelled on unmount | B | P2 | C1 | `frontend/components/partials/motion/CountingNumber.tsx:47` | `setState` after unmount; minor leak |
| CMP-4 | Broken social share URLs (`https://Neo Vision.com/...`) | B/K | P2 | C1 | `frontend/components/sections/insight-detail/InsightHero.tsx:156,164,172` | Share links are invalid (placeholder domain with a space) |
| INT-1 | PostHog `flushAt:1` + `await shutdown()` per request on a singleton | E | P2 | C2 | `frontend/lib/posthog-server.ts:13-19`; `resource/route.ts:195-206` | Later requests reuse a shut-down client (dropped events) + per-request latency |
| INT-2 | Resend calls have no timeout; sequential; no idempotency | E | P2 | C2 | contact `238-277`, resource `232-273` | Hanging Resend blocks the response; duplicate submits → duplicate emails |
| ARCH-3 | Env-validation logic triplicated + two copies dead | A | P2 | C2 | `frontend/lib/env.ts`, `lib/validate-env.ts`, `scripts/prebuild.mjs` | ~170 lines unused/divergent; only the untyped `.mjs` actually runs |
| ARCH-4 | Two rate-limiter impls, divergent semantics, duplicated fail-open | A | P2 | C2 | `frontend/lib/rate-limit.ts` vs `rate-limit-upstash.ts:60-130` | Dev (fixed window) ≠ prod (sliding); duplicated catch blocks drift |
| CMP-9 | Resource popup: leaked auto-close timer + no dialog a11y/focus | B | P2 | C2 | `frontend/components/partials/ResourceRequestPopUp.tsx:130` | Stale timeout fires post-unmount; modal not `role="dialog"`/focus-trapped |
| CMP-10 | `PortfolioGrid` active state keyed by index, not item id | B | P2 | C2 | `frontend/components/sections/portfolio/PortfolioGrid.tsx:145,258` | After filtering, stale `isActive[idx]` mis-applies to a different card |
| PERF-6 | GROQ over-fetch: `...` spreads + full `asset->` expansions | F | P2 | C2 | `frontend/sanity/lib/queries.ts:76-730` | Inflated payload/query time + larger RSC data shipped to client |
| PERF-8 | Global RAF canvas runs on every page | F | P2 | C2 | `frontend/app/layout.tsx:141-145`; `HeroBrandDotsMediaProvider.tsx:196-250` | Continuous main-thread/GPU work competing with hydration on all routes |
| SEO-4 | No listing pages for `/insights` `/portfolio` `/services` | K | P2 | C2 | those dirs hold only `[slug]/`; breadcrumbs `seo.ts:694-738` | Breadcrumb/nav URLs 404 unless matching Sanity `page` docs exist |
| PERF-4 | 35 sections rely on `ssr:false` motion wrappers | F | P2 | C3 | e.g. `home/Work.tsx`, `Methodology.tsx`, `Team.tsx` | Content missing from SSR HTML, pops in late → CLS + delayed paint |
| SEO-3 | `generateStaticParams` implies SSG but `defineLive` forces dynamic | K/D | P2 | C3 | `frontend/sanity/lib/live.ts:10-14`; all `[slug]` routes | `generateStaticParams` largely cosmetic; inconsistent `revalidate` across route types |
| SEC-11 | CSRF design smell + unauthenticated `GET /api/csrf` token mint | C | P3 | C2 | `frontend/lib/csrf.ts:14-23`; `app/api/csrf/route.ts` | Works (sameSite+origin carry it) but confusing; silent no-token fallback |
| ARCH-5 | Inconsistent error-response shapes/log levels between routes | A | P3 | C1 | contact `:110` vs resource `:110-114` | `failure` vs `blocked` + different copy for the same condition |
| ARCH-6 | Dead/misplaced deps: unused `getCsrfToken`, unused `@plausible-analytics/tracker`, root-level dup deps | A | P3 | C1 | `lib/csrf.ts:25-28`; root `package.json` | Misleading surface; `swiper`/`@gsap/react` declared in root not `frontend` |
| SCHEMA-1 | Resource schema accepts empty/URL-less payloads | A/I | P3 | C1 | `frontend/lib/resourceRequestSchema.ts:5-14` | Empty `resourceRequested` + no URL passes → email with no download; `path: undefined` |
| CMP-8 | Malformed Tailwind hover class on "Accept All" | B/D | P3 | C1 | `frontend/components/partials/CookieBanner.tsx:380,485` | `hover:bg---brand-hover)]` → no hover state + dead class |
| CMP-11 | Button link variant drops anchor attributes | B | P3 | C1 | `frontend/components/partials/Button.tsx:97` | `aria-*`/`id`/`data-*` silently dropped on link render |
| UI-1 | `maximumScale: 5` viewport caps zoom | D | P3 | C1 | `frontend/app/layout.tsx:87-91` | WCAG 1.4.4 / Lighthouse a11y flag; mild |
| DATA-1 | Slug-based detail queries assume uniqueness not enforced | G | P3 | C2 | queries `queries.ts:813,857…`; schemas `page.ts`,`post.ts` | Duplicate slugs → non-deterministic `[0]` → wrong page renders |
| DATA-2 | `link.linkType` `initialValue:'url'` ≠ option value `'href'` | G | P3 | C1 | `studio/src/schemaTypes/objects/link.ts:20-35` | New links default to an unhandled type → render no destination until re-selected |
| INT-3 | Studio Presentation resolves `post` → `/posts/:slug` (site uses `/insights/`) | E | P3 | C1 | `studio/sanity.config.ts:36-46,78-80` | Visual Editing "open preview" for Insights 404s |
| SEO-5 | `robots.ts` `host` directive + origin header fallback on preview | K | P3 | C1 | `frontend/app/robots.ts:13`; `app/site-origin.ts:42-49` | Non-standard `host` dir; preview sitemap could point at preview domain (prod mitigated by prebuild) |
| PERF-9 | 4 fonts preloaded; ClashDisplay `swap` CLS | F | P3 | C2 | `frontend/app/layout.tsx:44-85` | Bandwidth contention + headline font swap shift *(needs verification)* |
| PERF-10 | `useScrollToHash` polls with `setInterval` | F | P3 | C1 | `frontend/components/PageBuilder.tsx:85-111` | Repeated layout queries for 2s after navigation with a hash |
| DOC-1 | Stale comment: "CSP handled by middleware.ts" | A | P3 | C1 | `frontend/next.config.ts:9` | Misleads readers (file is `proxy.ts`); functionality is fine |

---

## 2. Detailed findings

### SEC-1 — Open email relay / arbitrary attachment via client-supplied resource URL · **P0** · C2 · C/E
**Location:** `frontend/app/api/resource/route.ts:213-273`, schema `frontend/lib/resourceRequestSchema.ts:6-14`, client `frontend/components/partials/ResourceRequestPopUp.tsx:110-119`

**Evidence:**
```ts
// route.ts
const resource = data.resourceObject;
const resolvedUrl =
  resource.fileUrl ?? resource.file?.asset?.url ?? resource.externalUrl ?? undefined;
const isFileDownload = !!(resource.fileUrl ?? resource.file?.asset?.url);
// …
to: data.email,                              // attacker-controlled recipient
attachments: [{ path: resolvedUrl, filename: resolvedUrl.split("/").pop()?.split("?")[0] ?? "resource" }]
```
```ts
// resourceRequestSchema.ts — the whole resourceObject comes from the request body
resourceObject: z.object({
  file: z.object({ asset: z.object({ url: z.string().url().max(2000).optional() }).optional() }).optional(),
  fileUrl: z.string().url().max(2000).optional(),
  externalUrl: z.string().url().max(2000).optional(),
}).strict(),
```

**Impact:** The endpoint never looks the resource up server-side. An attacker scripts a POST (minting a CSRF token from `GET /api/csrf` and setting `Origin`/`Referer` to the allowed host — both bypassable from a non-browser client) with `{ email: "victim@x.com", resourceObject: { fileUrl: "https://attacker.example/payload.pdf" } }`. Resend then sends `victim@x.com` an email **from the verified Neo Vision domain** containing the attacker's link and a fetched attachment. This is an open email relay (phishing/spam from your domain → deliverability & brand damage) plus delivery of arbitrary URL content.

*Severity nuance:* this is **not** classic internal-network SSRF — Resend fetches the URL from Resend's infrastructure, not from the app's VPC, so `http://169.254.169.254/...` won't reach cloud metadata. The real, confirmed risk is the open relay + arbitrary attachment. Still P0 because it's a live, unauthenticated abuse of a production endpoint sending mail as your domain.

**Fix:** Accept only a resource identifier (the `freeResources` item `_key`/slug), then re-fetch the canonical `file.asset->url` / `externalUrl` server-side via GROQ and host-allowlist it (`cdn.sanity.io` + your configured domains) before linking/attaching. Drop `resourceObject` from the request schema entirely.

---

### SEC-2 — In-memory rate limiter is ineffective on serverless + module-level `setInterval` · P1 · C2 · C
**Location:** `frontend/lib/rate-limit.ts:15,73-80`

**Evidence:** `const store: RateLimitStore = {}` is per-process module state and cleanup is a module-level `setInterval`. This path runs whenever `UPSTASH_REDIS_REST_URL`/`_TOKEN` are absent (the documented fallback).

**Impact:** On Vercel each invocation may be a fresh isolate, so per-IP counters reset constantly and limits are bypassable by spreading requests across instances — directly enabling abuse of the contact and resource (SEC-1) endpoints. `setInterval` in a serverless function is unreliable. Compounded by SEC-3 (nothing forces Upstash in prod).

**Fix:** Hard-require Upstash in production (wire SEC-3) and remove the in-memory path for prod; replace `setInterval` GC with lazy expiry.

---

### SEC-3 — Production env-validation guard is never invoked · P1 · C1 · C
**Location:** `frontend/lib/validate-env.ts:96-112`, `frontend/lib/env.ts:37-55`

**Evidence:** Grep finds **no callers** of `throwIfProductionEnvInvalid()`, `validateProductionEnv()`, `validateEnv()`, or `getEnv()` outside their own files — no `instrumentation.ts`, no layout, no config import. (The active env check is a separate hand-rolled `scripts/prebuild.mjs`, which validates `NEXT_PUBLIC_SITE_URL` but not the full set.)

**Impact:** The promised guarantees — "Upstash required in prod", "no localhost site URL", "real Sanity tokens" — are never enforced at boot, so the unsafe rate-limit fallback (SEC-2) and other misconfigs can ship undetected.

**Fix:** Call `throwIfProductionEnvInvalid()` from `frontend/instrumentation.ts` (runs once at server boot). Decide whether `lib/env.ts`'s Zod schema is the single source of truth and either use it or delete it (see ARCH-3).

---

### SEC-5 — Origin/Referer parsing throws → 500 instead of 403 · P2 · C1 · C
**Location:** `frontend/app/api/contact/route.ts:82-92`, `frontend/app/api/resource/route.ts:81-92`

**Evidence:**
```ts
const originUrl = new URL(origin);
const refererUrl = new URL(referer);
// inside .some():
const allowedUrl = new URL(allowed);   // also unguarded
```
`new URL()` throws on a malformed value; none of these are wrapped.

**Impact:** A request with a malformed `Origin`/`Referer` (trivial) throws an unhandled exception → 500 instead of a clean 403. A malformed entry in `ALLOWED_ORIGINS` 500s **every** request.

**Fix:** Wrap each `new URL(...)` in try/catch → 403 on parse failure; validate/normalize `ALLOWED_ORIGINS` once at startup.

---

### SEC-6 — Raw email (PII) sent to PostHog in resource route only · P2 · C1 · C
**Location:** `frontend/app/api/resource/route.ts:199-201` (vs contact `:207-218`)

**Evidence:** Resource captures `properties: { email: data.email, resourceRequested: …, receivedAt, correlation_id }`. The contact route deliberately sends only non-PII (`has_company`, `has_phone`, category fields).

**Impact:** Plaintext email lands in analytics event properties — a GDPR/data-minimization concern, and inconsistent with the sibling route's documented restraint (an artifact of imperfect copy-paste).

**Fix:** Remove `email` (and reconsider free-text `resourceRequested`) from the event properties.

---

### SEC-8 — Double-escaping corrupts stored data · P2 · C1 · C/B
**Location:** `frontend/lib/sanitize.ts:1-9`, contact `:164-176`, resource `:163-168`

**Evidence:** `sanitizeHtml()` entity-encodes `& < > " ' /`, and the result is written to Sanity (`message: sanitizeHtml(data.message)`). But Sanity stores plain text/JSON (not HTML), and the React email components already escape on render — and they're passed the **raw** `data.*`, not the sanitized value.

**Impact:** Stored values are corrupted (`O'Brien` → `O&#x27;Brien`, `a/b` → `a&#x2F;b`) and shown mangled in Studio, while emails show the un-mangled raw text — the two diverge. It also implies XSS protection at the wrong layer.

**Fix:** Store the raw validated text (Zod already bounds length); rely on React/Sanity output encoding at render. Remove `sanitizeHtml` from the storage path.

---

### SEC-9 — `useCdn:true` on the token-bearing read client · P2 · C1 · G/C
**Location:** `frontend/sanity/lib/client.ts:6-13`

**Evidence:** `createClient({ …, useCdn: true, token, stega:{studioUrl} })`. This same `client` backs `defineLive` and direct `client.fetch` in `generateStaticParams`.

**Impact:** `useCdn:true` + token is a known footgun — token-authed requests through the CDN can serve stale content and the intent is self-contradictory (public dataset ⇒ token unnecessary; private ⇒ CDN should be off). *(Token is NOT exposed to the browser — `client` is server-only, verified — so this is correctness/caching, not credential leakage.)*

**Fix:** Set `useCdn:false` on this token-bearing client (standard `next-sanity` pattern), or split into a tokenless CDN public client + a tokened uncached client for `defineLive`.

---

### CMP-1 — Conditional early-return before hooks · P1 · C1 · B
**Location:** `frontend/components/sections/home/Story.tsx:55`

**Evidence:** `if (!heading && milestones.length === 0) return null;` sits **above** later `useRef` (`:64-65`) and `useEffect` (`:96,102`).

**Impact:** When the section's data toggles between empty and non-empty (live editing / draft mode), React renders a different number of hooks → "rendered fewer hooks than expected" crash.

**Fix:** Move the early return below all hook calls.

---

### CMP-2 — Plausible uses a non-`NEXT_PUBLIC_` env var in a client component · P1 · C1 · B/E
**Location:** `frontend/components/partials/ConsentAwarePlausible.tsx:20`

**Evidence:** A `'use client'` component reads `process.env.PLAUSIBLE_SCRIPT_URL`. Without the `NEXT_PUBLIC_` prefix, Next.js does not inline it into the client bundle, so it's `undefined`.

**Impact:** The script `src` is always `undefined` → **Plausible analytics never loads in production.**

**Fix:** Rename to `NEXT_PUBLIC_PLAUSIBLE_SCRIPT_URL` (and update `lib/env.ts` + `.env.example`).

---

### CMP-3 — `next/image` with no dimensions in portable text · P1 · C2 · B
**Location:** `frontend/components/partials/PortableTextRenderer.tsx:117`

**Evidence:** The `image` block renders `<Image src={url} alt=… className=… />` with no `width`/`height`/`fill`. `next/image` requires one and throws at render.

**Impact:** Any Insight post body containing an inline image crashes the page.

**Fix:** Use `fill` (with a positioned, sized wrapper) or pass explicit `width`/`height` from the Sanity asset metadata.

---

### TEST-1 — No automated tests of any kind · P1 · C3 · I
**Location:** repo-wide

**Evidence:** No `*.test.*`/`*.spec.*`, no vitest/jest/playwright/testing-library deps, no `test` script; CI runs no test job.

**Impact:** Security-critical paths (CSRF constant-time compare, origin/referer validation, Zod schemas, rate-limit fail-open, GROQ handling) are unverified; the route copy-paste (ARCH-1) makes silent divergence likely.

**Fix:** Add Vitest + `@testing-library/react`. Prioritize: (1) the two API route handlers (rate-limit/CSRF/origin/honeypot/validation branches), (2) `lib/csrf.ts`, (3) the Zod schemas, (4) the pure builders in `sanity/lib/seo.ts` (trivial to test, high value). Add a CI `test` job.

---

### OBS-1 — No error monitoring; observability ends at `console` · P1 · C2 · H
**Location:** `frontend/app/global-error.tsx:13`, `frontend/lib/security-logger.ts:54-58`, `frontend/lib/rate-limit-upstash.ts:75-83`

**Evidence:** `global-error.tsx` has `// Log to your error reporting service here` then only `console.error`. `security-logger` writes via `console.warn("[SECURITY]", …)`. The rate-limit fail-open path logs `"[SECURITY] ALERT: Rate limiting degraded"` with a comment that it "should trigger an alert" — nothing consumes it.

**Impact:** In production, CSRF failures, honeypot hits, Sanity write/email failures, and **rate limiting silently failing open** are invisible unless someone tails platform logs.

**Fix:** Add `@sentry/nextjs` (or equivalent); make `security-logger` take an injectable sink and route failure/blocked + fail-open events to it.

---

### ARCH-1 — Two form API routes are ~95% copy-pasted · P1 · C2 · A
**Location:** `frontend/app/api/contact/route.ts:14-143` vs `frontend/app/api/resource/route.ts:14-143`

**Evidence:** The rate-limit selection, the entire CSRF + origin/referer block, JSON-parse guard, Zod error response, honeypot drop, and `SANITY_WRITE_TOKEN` guard are line-for-line identical (~130 lines); only the schema, limiter fn, and `_type` differ.

**Impact:** Every security fix must be made twice and will drift — drift is already present (SEC-6 PII, ARCH-5 error shapes, the `[api/contact]` mislabeled logs in the resource route at `:229,247-248,276,281,287`).

**Fix:** Extract `withFormSecurity(req, { rateLimit, schema })` (or a `validateRequest()` returning `{ data } | { errorResponse }`) into `lib/`; each route keeps only its Sanity-write + email specifics.

---

### BUILD-1 — CI has no build / type-check / lint / test gate · P1 · C2 · J
**Location:** `.github/workflows/security-audit.yml`

**Evidence:** The only workflow runs `npm audit`, dependency-review, and CodeQL. No job runs `next build`, `tsc --noEmit`, or `eslint`, though `type-check` and `lint` scripts exist. A `security-headers` job is commented out (`:80-82`).

**Impact:** Type/lint/build breakage merges to `main` undetected (only Vercel catches it, post-merge). *Mitigation:* `next.config.ts` does **not** set `ignoreBuildErrors`/`ignoreDuringBuilds`, so `next build` itself still fails on errors — but only on Vercel.

**Fix:** Add a job: `npm ci && npm run type-check --workspaces && npm run lint && npm run build`.

---

### PERF-1 / PERF-3 / PERF-2 — Core Web Vitals cluster · P1
- **PERF-1 (C3, `Hero.tsx:8-22`, `RevealOnScroll.tsx:91`, `SplitTextReveal.tsx:150`):** the hero loads its text via `dynamic(…, { ssr:false })` and motion wrappers render at `visibility:hidden` until `useGSAP` runs. The LCP headline is absent from SSR HTML and invisible until the GSAP bundle downloads/parses/executes → multi-second LCP on mobile. **Fix:** server-render hero text visible by default; apply the reveal as progressive enhancement (animate from a visible baseline, or gate `visibility:hidden` behind a JS-loaded/`prefers-reduced-motion` class).
- **PERF-3 (C2, `FirstLoadIntro.tsx:11,128-134`):** `MIN_DURATION = 3000` keeps a `fixed inset-0` overlay up ≥3s on first visit regardless of readiness. **Fix:** drop to ~0–400ms and dismiss as soon as `pageReady`.
- **PERF-2 (C3, `PageBuilder.tsx:1`, `BlockRenderer.tsx:5-64`):** `PageBuilder` is `'use client'` and statically imports all ~50 sections, so every page ships the union of all section code. **Fix:** make `BlockRenderer`/`PageBuilder` server components (isolate the `useOptimistic` draft logic into a small client wrapper used only in draft mode) and `dynamic()`-import each block so only rendered blocks ship.

*(PERF-4 through PERF-10 are real but lower-impact; see the master table for locations/fixes — over-fetching, double home fetch, missing image format hints, the global RAF canvas, font preloading, and hash-scroll polling.)*

---

### SEO-1 — JSON-LD validator drops `CreativeWork`/`AboutPage`/`ContactPage` · P1 · C1 · K
**Location:** `frontend/lib/sanitize.ts:42-54`

**Evidence:** `allowedTypes` = `["Organization","WebSite","WebPage","Article","BlogPosting","Person","BreadcrumbList","Service","Product","FAQPage","HowTo"]`. `StructuredDataScript` filters every node through `validateStructuredData`. But `buildCreativeWorkStructuredData` emits `@type:"CreativeWork"` for all portfolio/project pages, and `getPageSchemaType` forces `AboutPage`/`ContactPage` for `/about` and `/contact` — none are allowlisted.

**Impact:** Portfolio, About, and Contact pages ship **zero** structured data despite the code generating it — a real SEO/rich-result loss on key pages.

**Fix:** Add `"CreativeWork"`, `"AboutPage"`, `"ContactPage"` to `allowedTypes`.

---

*(Remaining P2/P3 findings — SEC-7, SEC-10, SEC-11, ARCH-2/3/4/5/6, INT-1/2/3, CMP-4/5/6/7/8/9/10/11, DATA-1/2, SEO-2/3/4/5, UI-1, SCHEMA-1, DOC-1 — are fully specified in the master table (§1) with location, impact, and fix. They are intentionally not re-expanded here to keep the report scannable; each is C1–C3 and self-contained.)*

---

## 3. Priority matrix & sequencing

### 3.1 Severity × Complexity grid

| | **C1** (≤1h) | **C2** (hours) | **C3** (1–3d) | **C4** |
|---|---|---|---|---|
| **P0** | — | **SEC-1** | — | — |
| **P1** | SEO-1, CMP-2, CMP-1, SEC-3 | CMP-3, SEC-2, ARCH-1, BUILD-1, OBS-1, PERF-3 | TEST-1, PERF-1, PERF-2 | — |
| **P2** | SEC-5, SEC-6, SEC-7, SEC-8, SEC-9, SEC-10, ARCH-2, PERF-5, PERF-7, SEO-2, CMP-4, CMP-5, CMP-6, CMP-7 | INT-1, INT-2, ARCH-3, ARCH-4, CMP-9, CMP-10, PERF-6, PERF-8, SEO-4 | PERF-4, SEO-3 | — |
| **P3** | ARCH-5, ARCH-6, SCHEMA-1, CMP-8, CMP-11, UI-1, DATA-2, INT-3, SEO-5, PERF-10, DOC-1 | SEC-11, DATA-1, PERF-9 | — | — |

### 3.2 Do-first set (high value, low effort)

**Sprint 1 — close the hole + reclaim the freebies (≈1 day total):**
1. **SEC-1** (P0/C2) — stop trusting `resourceObject`; resolve the file server-side + host-allowlist.
2. **SEC-3** (P1/C1) — call `throwIfProductionEnvInvalid()` at boot (this also de-risks SEC-2).
3. **CMP-2** (P1/C1) — fix the Plausible env var (analytics is currently dead).
4. **CMP-1** (P1/C1) — move Story.tsx return below hooks.
5. **SEO-1** (P1/C1) — extend the JSON-LD allowlist.
6. **CMP-3** (P1/C2) — fix the portable-text image crash.
7. **SEC-5/6/7/8** (P2/C1 batch) — guard `new URL`, drop PostHog PII, block-or-fix the localhost check, remove storage-path `sanitizeHtml`.

**Sprint 2 — guardrails + structure:**
8. **BUILD-1** + **TEST-1** (start) — add the CI build/type/lint job and the first Vitest suites on the API routes.
9. **OBS-1** — wire Sentry.
10. **ARCH-1** (+ ARCH-2/3/4) — extract the shared form-security wrapper; collapse the duplicated helpers (fixes the mislabeled logs and error-shape drift for free).
11. **SEC-2** — require Upstash in prod, remove the in-memory path.

**Sprint 3 — Core Web Vitals:**
12. **PERF-3** (quickest CWV win), then **PERF-1**, then **PERF-2/PERF-4** (the render-strategy refactor), then the PERF-5/6/7/8 batch.

**Ongoing / backlog:** the P3 polish items (CMP-4/5/6/7/8/11, DATA-1/2, INT-3, SEO-2/3/4/5, UI-1, SCHEMA-1, DOC-1) — fold into whatever sprint touches the relevant file.

---

## 4. Appendices

### Appendix A — Dependency vulnerability scan

**Command run:** `npm audit --json` at repo root (a `package-lock.json` already existed; `git status --porcelain` confirmed the lockfile was unchanged by the scan). Re-confirmed against the production tree with `npm audit --omit=dev`.

**Totals:** **22 vulnerabilities — 0 critical, 10 high, 12 moderate, 0 low.** Dependency tree: 1,590 packages (1,213 prod / 236 dev / 164 optional).

**Key structural fact:** nearly every advisory chains through the **Sanity build/CLI toolchain** (build-time / dev tooling, **not** the deployed Next.js request path). npm's proposed bulk fix is `sanity@4.3.0`, flagged `isSemVerMajor` — that's a **downgrade** from the installed `sanity@5.x`, so `npm audit fix --force` would break things. **Needs a deliberate Sanity version decision, not an auto-fix.**

| Package | Sev | Advisory / cause | Vulnerable range | Fix per audit |
|---|---|---|---|---|
| esbuild | high | GHSA-gv7w-rqvm-qjhr — missing binary integrity verification → RCE via `NPM_CONFIG_REGISTRY` (CVSS 8.1); GHSA-g7r4-m6w7-qqqr (low, dev-server file read, Windows) | `0.17.0–0.28.0` | via `sanity@4.3.0` (major ↓) |
| vite | high | depends on vulnerable esbuild | `4.2.0-beta.0–8.0.3` | via `sanity@4.3.0` |
| vite-node | high | depends on vulnerable vite | `1.0.0-beta.0–5.3.0` | fixable |
| uuid | moderate | GHSA-w5hq-g745-h8pq — missing buffer bounds check when `buf` provided (CVSS 7.5) | `<11.1.1` | via `sanity@4.3.0` |
| postcss | moderate | GHSA-qx2v-qp2m-jg93 — XSS via unescaped `</style>` in stringify (CVSS 6.1); nested under `next/node_modules/postcss` | `<8.5.10` | via `@vercel/speed-insights@1.0.4` (major) |
| js-yaml | moderate | GHSA-mh29-5h37-fv8m — prototype pollution in merge `<<` (CVSS 5.3); under `@vercel/frameworks` | `<3.14.2` | via `sanity@4.3.0` |
| next | moderate | flagged via bundled vulnerable `postcss` | `9.3.4-canary.0–16.3.0-canary.5` | via `@vercel/speed-insights@1.0.4` |
| sanity (direct) | high | chains @sanity/cli, @sanity/migrate, @sanity/preview-url-secret | various | `sanity@4.3.0` (major ↓) |
| @sanity/cli / cli-build / codegen / migrate / runtime-cli | high | all chain to vulnerable vite/esbuild | various | via `sanity@4.3.0` |
| @sanity/uuid / typeid-js / @sanity/preview-url-secret | moderate | depend on vulnerable `uuid` | various | via `sanity@4.3.0` |

Other moderate flags: `@sanity/visual-editing`, `next-sanity` (direct), `next-plausible` (direct, **`fixAvailable:false`** — no fix offered), `@vercel/speed-insights` (direct), `@vercel/frameworks`.

**Risk read:** the two advisories with real CVSS — esbuild RCE (8.1) and uuid OOB (7.5) — live in the **build/dev toolchain**, not the public request path. No advisory implicates the deployed runtime directly. Net: **non-emergency, defer-fixable**, but the fix is a Sanity-major decision, not `npm audit fix --force`.

### Appendix B — Outdated / unused dependencies

- **Unused (confirmed by Grep, no source import):** `@plausible-analytics/tracker` (`^0.4.4`) — the site uses `next-plausible` instead. Strong removal candidate. *(verify it isn't dynamically loaded.)*
- **Misplaced in monorepo:** root `package.json` declares `@gsap/react` and `swiper` as direct deps, but they're consumed inside the `frontend` workspace (which already declares `@gsap/react`). The root copies are redundant/misplaced. *(This is the kernel of truth behind the refuted "swiper not installed" P0 — it IS installed, just declared in the wrong workspace.)*
- **Possibly vestigial under Tailwind v4:** the legacy v3-style `tailwind.config.ts` and `autoprefixer` (v4's `@tailwindcss/postcss` may make both redundant). *(needs verification — which config path actually drives the build.)*
- **Dev tooling lag:** root `npm-run-all2 ^5.0.2` (v8 exists). Minor.
- **Bleeding-edge (not outdated):** Next 16.2 + React 19.2 are current-generation.

### Appendix C — "Needs verification" items & how to verify

| Item | How to verify |
|---|---|
| Best-path Sanity vuln fix (avoid the `sanity@4.3.0` downgrade) | `npm why esbuild` / `npm why uuid`; check if `sanity@5.x` has a patched line, or override transitive deps via `overrides` in `package.json` |
| Unused/misplaced deps | `npm why @plausible-analytics/tracker`, `npm why autoprefixer`, `npx depcheck --workspaces`, `npm outdated` |
| Tailwind v4 config effectiveness | Inspect `next build` CSS output; confirm `tailwind.config.ts` theme tokens are applied vs the `@theme` block in `globals.css` |
| PERF — do `[slug]`/home routes actually render statically? | Read the `next build` route summary (`○`/`ƒ`/`●` markers); confirm `defineLive`+`SanityLive` doesn't force all routes dynamic (SEO-3) |
| PERF-9 — ClashDisplay swap CLS magnitude | Lighthouse / WebPageTest filmstrip; measure CLS attributable to the headline font |
| SEO-4 — do `services`/`portfolio`/`insights` listing `page` docs exist in Sanity? | Query the dataset for `page` docs with those slugs; if absent, breadcrumb/nav URLs 404 |
| DATA-1 — real-world slug collisions | Add a Sanity `isUnique` validation or run a GROQ uniqueness check across `page`/`post`/`project`/`service` |
| security.txt referenced pages exist | Fetch `/security-policy` and `/security-acknowledgments` on the deployed site |

### Appendix D — Verified-clean (no action)

- **CSP & clickjacking:** active via `frontend/proxy.ts` (Next 16 `proxy.ts` convention) — nonce + `strict-dynamic` + `frame-ancestors 'none'` + `base-uri`/`form-action`/`upgrade-insecure-requests`.
- **GROQ injection:** none — every dynamic value is passed via `params` (`$slug`/`$skip`/`$limit`); inlined fragments are build-time constants.
- **Token exposure:** read token is `import 'server-only'`; `client.ts` imported only in server files; write client/token only in API routes. No secret reaches the client bundle.
- **Draft/preview:** `validatePreviewUrl` gates the enable route (401 on bad secret); public fetches pin `perspective:'published'` + `stega:false`.
- **CI secrets / committed env:** `.env.example` is placeholders only; CI uses `npm ci` (reproducible) and pins action versions; no hardcoded secrets.
- **TypeScript:** `strict:true`, no `ignoreBuildErrors`/`ignoreDuringBuilds`.
- **`console` hygiene:** ~49 occurrences, mostly `NODE_ENV==="development"`-gated or in error boundaries; no stray debug logs shipped.

---

*Report generated by a local multi-agent code review (Claude Code). Findings citing `file:line` were confirmed against source; items explicitly tagged "needs verification" were not run to ground in this read-only pass. No source files were modified.*
