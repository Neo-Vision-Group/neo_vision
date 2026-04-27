# AGENTS.md — Neo Vision Technologies Website

> This file is the single source of truth for all AI agents working on this codebase.
> Read it fully before making any changes.

---

## 1. Project Overview

A Next.js 15 (App Router) website powered by **Sanity CMS** (v3). The monorepo contains:

| Folder      | Purpose                                              |
| ----------- | ---------------------------------------------------- |
| `frontend/` | Next.js app — renders the public website             |
| `studio/`   | Sanity Studio — content authoring UI                 |
| `demo/`     | Vibe-coded demo site — reference design to replicate |

The demo folder is the **design reference**. Its components, sections, and page layouts are the target for the new site. The new site replaces hardcoded content with Sanity-driven page blocks.

---

## 2. Architecture — Page Builder Pattern

### Core Concept

Every renderable section of the website is a **Page Block** — a Sanity object type that maps 1:1 to a React component.

Pages are composed by arranging page blocks in Sanity's array field (`pageBuilder`). The frontend reads the array, iterates over each block, and renders the matching component via `BlockRenderer`.

### Data Flow

```
Sanity Document (page / service / project)
  └─ pageBuilder: [ { _type: "homeHero", ... }, { _type: "origin", ... }, ... ]
       │
       ▼
  GROQ Query (queries.ts → pageQuery / inline)
       │
       ▼
  Next.js Route (app/[slug]/page.tsx)
       │
       ▼
  PageBuilder component (components/PageBuilder.tsx)
       │
       ▼
  BlockRenderer (components/BlockRenderer.tsx)
       │
       ▼
  BlockErrorBoundary (components/BlockErrorBoundary.tsx)
       │  — looks up block._type in the Blocks map
       ▼
  Section Component (components/sections/<category>/<Component>.tsx)
```

### Key Files

| File                                                      | Role                                                                                                                                            |
| --------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------- |
| `frontend/sanity/lib/queries.ts`                          | All GROQ queries — **single source** for data fetching                                                                                          |
| `frontend/sanity/lib/types.ts`                            | Shared TypeScript types (`PageBuilderSection`, etc.)                                                                                            |
| `frontend/sanity.types.ts`                                | **Auto-generated** by `sanity typegen generate` — never edit manually                                                                           |
| `sanity.schema.json`                                      | Committed schema snapshot generated from the Studio and consumed by frontend typegen/builds                                                     |
| `frontend/components/PageBuilder.tsx`                     | Receives a page document, extracts `pageBuilder[]`, renders via `BlockRenderer`                                                                 |
| `frontend/components/BlockRenderer.tsx`                   | Maps `block._type` string → React component. **Every new page block must be registered here.**                                                  |
| `frontend/components/BlockErrorBoundary.tsx`              | Isolates individual page block render failures so one broken section does not crash the whole page                                              |
| `frontend/components/RouteLoading.tsx`                    | Shared loading UI used by route-level `loading.tsx` files in the App Router                                                                     |
| `frontend/components/partials/FirstLoadIntro.tsx`         | One-time first-visit loading experience that reuses the hero background, hardcoded brand title, and Betatron progress indicator                 |
| `frontend/components/transition/TransitionProvider.tsx`   | Global client-side page transition shell — intercepts internal links, runs the GSAP route wipe, and waits for route-ready markers before reveal |
| `frontend/components/transition/PageTransitionMarker.tsx` | Client marker rendered by final route content to signal that the incoming page is ready and whether its hero uses the shared halftone pattern   |
| `frontend/components/partials/CookieBanner.tsx`           | Global client-side cookie consent banner/preferences panel driven by `siteSettings.cookieSettings` and reopened from the footer                 |
| `studio/src/schemaTypes/index.ts`                         | Registers all Sanity schema types (documents + objects)                                                                                         |
| `studio/src/schemaTypes/documents/page.ts`                | `page` document — **its `pageBuilder.of` array must list every block type available to main pages**                                             |
| `studio/src/schemaTypes/documents/service.ts`             | `service` document — has its own `pageBuilder.of` array for service detail pages                                                                |
| `studio/src/schemaTypes/documents/project.ts`             | `project` document — case study data with optional `pageBuilder` field for block-based content (studyHero, studyChallenge, etc.)                |
| `studio/src/schemaTypes/singletons/settings.tsx`          | Global site singleton. Also contains the `cookieSettings` object used by the banner and footer reopen control                                   |

---

## 3. Route Architecture

### Main Pages — `/[slug]`

These are CMS-driven pages built from the `page` document type. Each page has a `pageType` field (home, services, insights, caseStudies) and a `pageBuilder` array.

| URL                  | Sanity `pageType` | Notes                                                                                              |
| -------------------- | ----------------- | -------------------------------------------------------------------------------------------------- |
| `/` (root)           | `home`            | The home page. Fetched via `pageType == 'home'`                                                    |
| `/about`             | (general)         | Slug-based                                                                                         |
| `/services`          | `services`        | Services listing page                                                                              |
| `/contact`           | (general)         | Contact page                                                                                       |
| `/insights`          | `insights`        | Insights listing page                                                                              |
| `/portfolio`         | `caseStudies`     | Portfolio listing page                                                                             |
| `not-found` fallback | —                 | Root-level `frontend/app/not-found.tsx` uses the shared layout shell and a custom theme-aware hero |

**Route file:** `frontend/app/[slug]/page.tsx`
**Loading UI:** `frontend/app/[slug]/loading.tsx`
**Home route:** `frontend/app/page.tsx` — uses the dedicated `homePageQuery` to fetch the home page.
**Not found route:** `frontend/app/not-found.tsx` — custom 404 hero rendered inside the existing root layout (`Nav` + `Footer` remain shared).
**Global loading UI:** `frontend/app/loading.tsx`

### First-Visit Loading Experience

The site uses a dedicated first-visit loading experience for the initial page entry only. It is rendered in two places:

- Route-level `loading.tsx` files delegate to `frontend/components/InitialRouteLoading.tsx`, which renders the branded intro before the first requested page stream resolves and falls back to `RouteLoading` after the intro cookie is set.

The intro component is responsible for:

- Reusing the same visual background treatment as the hero sections
- Hardcoding the website name for fast boot rendering
- Animating a brand-colored loading bar with a Betatron percentage readout without depending on client hydration, so the motion starts during the streamed loading fallback
- Persisting completion in session storage and a cookie via the root layout marker after the first page boot completes so the intro does not replay during in-site navigation or subsequent visits

### App-Shell Page Transitions

The root layout now mounts a client-side `TransitionProvider` around the shared shell (`Nav`, routed `main`, `Footer`). It owns the full-viewport route wipe:

- Delegated interception for same-origin internal anchor clicks
- A fixed red sweep panel plus a shared halftone veil layer
- A GSAP lifecycle (`leave -> waiting-for-route -> enter`) that keeps the old page covered until the next route emits a `PageTransitionMarker`

`loading.tsx` fallbacks do **not** emit route-ready markers. The wipe should reveal only when final route content mounts.

The shared halftone persistence rule is driven by two conventions:

- Hero sections that visually own the brand dots must include `.has-hero-pattern`
- Final page content must render `PageTransitionMarker` with the correct `hasHeroPattern` value

The current hero sections that should carry `.has-hero-pattern` are:

- `frontend/components/sections/home/Hero.tsx`
- `frontend/components/sections/PageHero.tsx`
- `frontend/components/sections/services/ServiceHero.tsx`
- `frontend/components/sections/contact/ContactHero.tsx`
- `frontend/components/sections/insight-detail/InsightHero.tsx`
- `frontend/components/sections/study/Hero.tsx`

Non-hero sections that reuse `HeroBrandDotsBackground` should **not** opt into `.has-hero-pattern`, otherwise the transition veil will persist on the wrong routes.

### Global Cookie Banner

Cookie consent is modeled as global data on the existing `siteSettings` singleton via the `cookieSettings` object. The root layout fetches this through `settingsQuery` and mounts `frontend/components/partials/CookieBanner.tsx` once for the entire app shell.

Implementation rules:

- Reuse `siteSettings.cookieSettings` instead of creating a second singleton document for consent UI
- Keep policy copy, action labels, and category descriptions CMS-managed through `settingsQuery`
- The footer button reopens the customize state by dispatching the shared `neo:open-cookie-preferences` browser event
- The banner must remain responsive and theme-aware in both light and dark mode because it sits outside page-builder content

The `homePageQuery` in `queries.ts` filters only by `pageType == 'home'` and includes all the same pageBuilder block projections as `pageQuery`.

The `pageQuery` in `queries.ts` uses conditional logic to handle slug-based routing:

- Empty slug (`""`) → returns the `home` page
- Non-empty slug → returns the page matching that slug

### Individual Pages — `/parent_name/[slug]`

These are detail pages for specific content types:

| Route Pattern       | Document Type | Route File                               |
| ------------------- | ------------- | ---------------------------------------- |
| `/services/[slug]`  | `service`     | `frontend/app/services/[slug]/page.tsx`  |
| `/portfolio/[slug]` | `project`     | `frontend/app/portfolio/[slug]/page.tsx` |
| `/insights/[slug]`  | `post`        | `frontend/app/insights/[slug]/page.tsx`  |

Each detail route should expose a colocated `loading.tsx` so the App Router can show a branded fallback during data fetching.

**Service pages** (`service` document) have their own `pageBuilder` field and should use the PageBuilder pattern directly.

**Case study pages** (`project` document) use the `pageBuilder` field for block-based content (studyHero, studyChallenge, etc.). The frontend route should render stored project blocks directly and only use project-level metadata as lightweight per-block fallback data where needed.

**Insight pages** (`post` document) should use `pageBuilder` as the source of truth for renderable article sections. Document-level metadata such as title, author, category, excerpt, cover image, and related insights can remain on the `post` document. The post-level `coverImage` field is the shared source for the individual insight hero, insight cards, and featured insight references. Within `insightBlock`, the main text, quote body, and card body should all be modeled as portable text so editorial formatting stays consistent across sections.

---

## 4. Page Block Registry

### Adding a New Page Block — Checklist

1. **Sanity Schema** — Create the object type in `studio/src/schemaTypes/objects/<category>/`
2. **Register Schema** — Import and add to `studio/src/schemaTypes/index.ts`
3. **Add to Document** — Add `{type: 'yourBlockName'}` to the `pageBuilder.of` array in every document type where the block should be insertable. In this repo that may include `page.ts`, `service.ts`, `project.ts`, and `post.ts`.
4. **GROQ Projection** — Add a `_type == "yourBlockName" => { ... }` projection in `queries.ts` → the shared page-builder projection and any route-specific queries that read `pageBuilder` separately (`projectBySlugQuery`, `INSIGHT_BY_SLUG_QUERY`, etc.)
5. **Frontend Component** — Create the React component in `frontend/components/sections/<category>/`
6. **Register in BlockRenderer** — Import and add to the `Blocks` map in `frontend/components/BlockRenderer.tsx`
7. **Regenerate Types** — Run `sanity typegen generate` to update `sanity.types.ts`

### Figma-Led Block Work

For blocks requested with "take code from demo and compare with Figma", use this order of precedence:

1. **Demo component exists** — Port the structure from `demo/`, then use Figma to validate spacing, hierarchy, and missing details.
2. **Demo has content but no section component** — Reuse the content shape if it is still relevant, but derive the component structure from Figma.
3. **Demo has only placeholders or no implementation** — Treat the linked Figma node as the source of truth and design the Sanity field model from the Figma layout.

When working from Figma:

- Inspect the node with the Figma MCP before deciding the schema shape.
- Mirror the actual information architecture from the design instead of forcing everything into generic `title/body/items`.
- Prefer existing shared field types (`button`, `link`, `blockContentTextOnly`, etc.) over inventing near-duplicates.
- If the design implies grouped/repeatable structures, model them explicitly in Sanity.
- If a block should be usable in multiple page-builder documents, make both the schema registration and the frontend query support truly multi-document.

### Cross-Document Availability Rule

Adding a block to a document's `pageBuilder.of` array is **not enough**.

If a block is registered for:

- `page` or `service`: ensure it is covered by the shared page-builder projection.
- `project`: ensure `projectBySlugQuery` projects the block shape.
- `post`: ensure `INSIGHT_BY_SLUG_QUERY` projects the block shape.

Otherwise the block may appear in Studio but fail to render on the frontend.

### Current Block Types

#### Main Page Blocks (available in `page` document)

| Sanity `_type`        | Component             | Category               |
| --------------------- | --------------------- | ---------------------- |
| `homeHero`            | `Hero`                | home                   |
| `origin`              | `Origin`              | home                   |
| `whatWeDo`            | `WhatWeDo`            | home                   |
| `signature`           | `Signature`           | home                   |
| `signature2`          | `Signature2`          | home                   |
| `why`                 | `Why`                 | home                   |
| `story`               | `Story`               | home                   |
| `team`                | `Team`                | home                   |
| `methodology`         | `Methodology`         | home                   |
| `testimonials`        | `TrustedBy`           | home                   |
| `portfolio`           | `OurWork`             | home                   |
| `cta`                 | `ClosingCta`          | home                   |
| `pricing`             | —                     | home (component empty) |
| `pageHero`            | `PageHero`            | shared                 |
| `contactHero`         | `ContactHero`         | shared                 |
| `contactForm`         | `ContactFormSection`  | shared                 |
| `booking`             | `Booking`             | contact                |
| `engineeringServices` | `EngineeringServices` | services               |
| `aiServices`          | `AIServices`          | services               |
| `serviceNavigator`    | `ServiceNavigator`    | services               |
| `industries`          | `Industries`          | services               |
| `whyRomania`          | `WhyRomania`          | shared/services        |
| `techStack`           | `TechStacks`          | about/shared           |
| `awards`              | `Awards`              | about/shared           |
| `press`               | `Press`               | about                  |
| `faq`                 | `FAQ`                 | shared                 |
| `compare`             | `Compare`             | shared                 |
| `insightsFeatured`    | `InsightsFeatured`    | insights               |
| `insightsGrid`        | `InsightsGrid`        | insights               |
| `insightsResources`   | `InsightsResources`   | insights               |
| `insightsCta`         | `InsightsCta`         | insights               |

`signature` note: the nested `steps[]` objects support `textured` plus an optional Sanity `graphic` image field for red-tinted line-art hover states, and the nested `valueCard` object supports its own optional `graphic` image field for the panel beside the CTA.
`signature2` note: highlighted `steps[]` items support an optional Sanity `graphic` image field for the same red-tinted line-art card treatment used in the Work block.
`portfolio` note: the section-level bottom CTA now uses the shared Sanity `button` object, so editors can manage both its label and destination from CMS.

#### Portfolio Page Blocks (registered in BlockRenderer but NOT in `page.ts` pageBuilder)

| Sanity `_type`      | Component           | Notes                                     |
| ------------------- | ------------------- | ----------------------------------------- |
| `portfolioFeatured` | `PortfolioFeatured` | **Missing from `page.ts` pageBuilder.of** |
| `portfolioGrid`     | `PortfolioGrid`     | **Missing from `page.ts` pageBuilder.of** |
| `portfolioCta`      | `PortfolioCta`      | **Missing from `page.ts` pageBuilder.of** |
| `portfolioMetrics`  | `PortfolioMetrics`  | **Missing from `page.ts` pageBuilder.of** |

#### Case Study Page Blocks (registered in BlockRenderer but NOT in `page.ts` pageBuilder)

| Sanity `_type`     | Component          | Notes                                                                                  |
| ------------------ | ------------------ | -------------------------------------------------------------------------------------- |
| `studyHero`        | `StudyHero`        | Used by portfolio/[slug] — hero text and image combined                                |
| `studyHeroImage`   | `StudyHeroImage`   | Used by portfolio/[slug]                                                               |
| `studyChallenge`   | `StudyChallenge`   | Used by portfolio/[slug]                                                               |
| `studyApproach`    | `StudyApproach`    | Used by portfolio/[slug]                                                               |
| `studyKeyWins`     | `StudyKeyWins`     | Used by portfolio/[slug]                                                               |
| `studyNumbers`     | `StudyNumbers`     | Used by portfolio/[slug]                                                               |
| `studyTestimonial` | `StudyTestimonial` | Used by portfolio/[slug]                                                               |
| `studyTechStack`   | `StudyTechStack`   | Used by portfolio/[slug]                                                               |
| `steps`            | `Steps`            | Preferred replacement for the retired study what-we-built section on portfolio/[slug]  |
| `portfolioGrid`    | `PortfolioGrid`    | Preferred replacement for the retired study more-like-this section on portfolio/[slug] |
| `cta`              | `ClosingCta`       | Preferred replacement for the retired study closing CTA section on portfolio/[slug]    |

#### Service Detail Page Blocks (available in `service` document)

| Sanity `_type`        | Component             | Notes                                                                                                                  |
| --------------------- | --------------------- | ---------------------------------------------------------------------------------------------------------------------- |
| `engineeringServices` | `EngineeringServices` | Services listing / capability cards                                                                                    |
| `serviceHero`         | `ServiceHero`         | Service detail hero with breadcrumb trail, multi-line headline, CTA rail, and service metadata fallbacks              |
| `aiServices`          | `AIServices`          | AI transformation service card grid with service references and per-card CTAs                                          |
| `isThisForYou`        | `IsThisForYou`        | Service detail qualifier checklist                                                                                     |
| `soundFamiliar`       | `SoundFamiliar`       | Service detail pain-point cards                                                                                        |
| `compare`             | `Compare`             | Service detail comparison matrix against alternatives; also available in `page`, `project`, and `post` page builders   |
| `reality`             | `Reality`             | Compound-value / supporting proof section                                                                              |
| `whyRomania`          | `WhyRomania`          | Romania talent, timezone, and efficiency proof grid; now also available in `page`, `project`, and `post` page builders |
| `techStack`           | `TechStacks`          | Grouped tools/partners matrix; available in `page`, `service`, `project`, and `post` page builders                     |
| `awards`              | `Awards`              | Recognition card stack with featured badge; available in `page`, `service`, `project`, and `post` page builders        |

#### Blocks in Demo but NOT yet implemented

Reference `demo/src/components/sections/` and `demo/src/app/(site)/` for:

- About page sections (Awards, Press, TechStacks, AboutFaq, AboutValues, etc.)
- Service detail sections (IsThisForYou, SoundFamiliar, WhatYouGet, HowWeBuild, etc.)
- Various shared UI components

---

## 5. Known Bugs & Issues

### CRITICAL — Blocking home page rendering (ALL FIXED ✅)

1. ✅ **Type import mismatch**: `GetPageQueryResult` → `PageQueryResult` — Fixed in `types.ts`, `PageBuilder.tsx`, `[slug]/page.tsx`.

2. ✅ **GROQ syntax error**: Fixed missing comma after `...` and corrected `"industry"` → `"industries"` in `pageQuery`.

3. ✅ **Home page inline query**: Consolidated to use dedicated `homePageQuery` that filters only by `pageType == 'home'`.

4. ✅ **GROQ query separation**: Created separate `homePageQuery` for the home page (filters by `pageType == 'home'`) and kept `pageQuery` for slug-based pages (filters by `slug.current == $slug`). Both queries include identical pageBuilder block projections.

### MEDIUM — Architecture gaps

5. ✅ **`/services/[slug]` route exists**: Service detail pages now render the `service` document `pageBuilder` via `frontend/app/services/[slug]/page.tsx`.

6. **Empty component files**: `Pricing.tsx`, `Testimonials.tsx`, `Steps.tsx` are 0 bytes.

### LOW — Technical debt

8. **Project detail content is block-only**: The `project` document should keep shared metadata fields (client, category, industry, hero image sources, etc.) and model all renderable sections through `pageBuilder` blocks only.

9. **Insight detail routes still keep metadata outside blocks**: Hero, author, category, excerpt, and related-insight metadata stay on the `post` document, but the article body sections should be modeled through `pageBuilder` only.

---

## 6. Naming Conventions

- **Sanity type names**: camelCase (e.g., `homeHero`, `studyChallenge`, `portfolioFeatured`)
- **Component files**: PascalCase (e.g., `Hero.tsx`, `WhatWeDo.tsx`)
- **Section folders**: lowercase category (e.g., `sections/home/`, `sections/study/`, `sections/portfolio/`)
- **GROQ queries**: UPPER_SNAKE_CASE for standalone queries (e.g., `ALL_INSIGHTS_QUERY`), camelCase for page-related (e.g., `pageQuery`)

---

## 7. Development Commands

```bash
# Frontend (from frontend/)
npm run dev          # Start Next.js dev server
npx sanity typegen generate  # Regenerate sanity.types.ts after schema changes

# Studio (from studio/)
npm run dev          # Start Sanity Studio dev server
npm run sanity:typegen  # Refresh ../sanity.schema.json and regenerate Studio type artifacts

# Both (from root)
npm run dev          # Runs both concurrently (check package.json)
```

---

## 8. Environment

- **Framework**: Next.js 15 (App Router)
- **CMS**: Sanity v3
- **Styling**: Tailwind CSS
- **Fonts**: Inter, IBM Plex Mono, Funnel Display, Betatron (local)
- **Deployment**: Vercel
- **TypeScript**: Strict-ish (uses `any` casts in BlockRenderer for flexibility)

---

## 9. Rules for Agents

1. **Never edit `sanity.types.ts` manually** — it is auto-generated. Change schemas and re-run typegen.
2. **Always update `BlockRenderer.tsx`** when adding a new page block component.
3. **Always update `pageQuery`** (or relevant query) GROQ projections when adding block types.
4. **Always update the document's `pageBuilder.of` array** when making a block available to a document type.
5. **Always update this AGENTS.md** when adding new block types, routes, or changing architecture.
6. **Reference `demo/`** for design — component layouts, spacing, typography, and color usage.
7. **Keep page routes clean**: `/[slug]` for main pages, `/parent/[slug]` for individual content pages.
8. **Test with Sanity data**: After schema changes, verify that Studio can add the block and the frontend renders it.
9. **Respect the transition escape hatch**: Internal links can opt out of the route wipe with `data-transition-ignore` when a browser-native navigation is required.
10. **Keep the schema snapshot fresh**: Frontend/Vercel builds read the committed root `sanity.schema.json`, so after schema edits run `npm run sanity:typegen --workspace=studio` and commit the updated snapshot before deploying.
