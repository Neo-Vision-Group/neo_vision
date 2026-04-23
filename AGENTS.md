# AGENTS.md — Neo Vision Technologies Website

> This file is the single source of truth for all AI agents working on this codebase.
> Read it fully before making any changes.

---

## 1. Project Overview

A Next.js 15 (App Router) website powered by **Sanity CMS** (v3). The monorepo contains:

| Folder       | Purpose |
|-------------|---------|
| `frontend/` | Next.js app — renders the public website |
| `studio/`   | Sanity Studio — content authoring UI |
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
       │  — looks up block._type in the Blocks map
       ▼
  Section Component (components/sections/<category>/<Component>.tsx)
```

### Key Files

| File | Role |
|------|------|
| `frontend/sanity/lib/queries.ts` | All GROQ queries — **single source** for data fetching |
| `frontend/sanity/lib/types.ts` | Shared TypeScript types (`PageBuilderSection`, etc.) |
| `frontend/sanity.types.ts` | **Auto-generated** by `sanity typegen generate` — never edit manually |
| `frontend/components/PageBuilder.tsx` | Receives a page document, extracts `pageBuilder[]`, renders via `BlockRenderer` |
| `frontend/components/BlockRenderer.tsx` | Maps `block._type` string → React component. **Every new page block must be registered here.** |
| `studio/src/schemaTypes/index.ts` | Registers all Sanity schema types (documents + objects) |
| `studio/src/schemaTypes/documents/page.ts` | `page` document — **its `pageBuilder.of` array must list every block type available to main pages** |
| `studio/src/schemaTypes/documents/service.ts` | `service` document — has its own `pageBuilder.of` array for service detail pages |
| `studio/src/schemaTypes/documents/project.ts` | `project` document — case study data (fields, NOT pageBuilder — sections are inlined as nested objects) |

---

## 3. Route Architecture

### Main Pages — `/[slug]`

These are CMS-driven pages built from the `page` document type. Each page has a `pageType` field (home, services, insights, caseStudies) and a `pageBuilder` array.

| URL | Sanity `pageType` | Notes |
|-----|-------------------|-------|
| `/` (root) | `home` | The home page. Fetched via `pageType == 'home'` |
| `/about` | (general) | Slug-based |
| `/services` | `services` | Services listing page |
| `/contact` | (general) | Contact page |
| `/insights` | `insights` | Insights listing page |
| `/portfolio` | `caseStudies` | Portfolio listing page |

**Route file:** `frontend/app/[slug]/page.tsx`
**Home route:** `frontend/app/page.tsx` — uses the dedicated `homePageQuery` to fetch the home page.

The `homePageQuery` in `queries.ts` filters only by `pageType == 'home'` and includes all the same pageBuilder block projections as `pageQuery`.

The `pageQuery` in `queries.ts` uses conditional logic to handle slug-based routing:
- Empty slug (`""`) → returns the `home` page
- Non-empty slug → returns the page matching that slug

### Individual Pages — `/parent_name/[slug]`

These are detail pages for specific content types:

| Route Pattern | Document Type | Route File |
|--------------|---------------|------------|
| `/services/[slug]` | `service` | `frontend/app/services/[slug]/page.tsx` — **DOES NOT EXIST YET** |
| `/portfolio/[slug]` | `project` | `frontend/app/portfolio/[slug]/page.tsx` |
| `/insights/[slug]` | `post` | `frontend/app/insights/[slug]/page.tsx` |

**Service pages** (`service` document) have their own `pageBuilder` field and should use the PageBuilder pattern directly.

**Case study pages** (`project` document) do NOT have a `pageBuilder` field — they store section data as nested fields (challenge, approach, keyWins, etc.). The route currently constructs a synthetic `pageBuilder` array from these fields and passes it to `PageBuilder`. This is the intended pattern for projects until the schema is migrated.

**Insight pages** (`post` document) use a hardcoded template, not PageBuilder. This is acceptable for now.

---

## 4. Page Block Registry

### Adding a New Page Block — Checklist

1. **Sanity Schema** — Create the object type in `studio/src/schemaTypes/objects/<category>/`
2. **Register Schema** — Import and add to `studio/src/schemaTypes/index.ts`
3. **Add to Document** — Add `{type: 'yourBlockName'}` to the `pageBuilder.of` array in the relevant document(s) (`page.ts`, `service.ts`)
4. **GROQ Projection** — Add a `_type == "yourBlockName" => { ... }` projection in `queries.ts` → `pageQuery` (and any other queries that read pageBuilder)
5. **Frontend Component** — Create the React component in `frontend/components/sections/<category>/`
6. **Register in BlockRenderer** — Import and add to the `Blocks` map in `frontend/components/BlockRenderer.tsx`
7. **Regenerate Types** — Run `sanity typegen generate` to update `sanity.types.ts`

### Current Block Types

#### Main Page Blocks (available in `page` document)

| Sanity `_type` | Component | Category |
|----------------|-----------|----------|
| `homeHero` | `Hero` | home |
| `origin` | `Origin` | home |
| `whatWeDo` | `WhatWeDo` | home |
| `signature` | `Signature` | home |
| `why` | `Why` | home |
| `story` | `Story` | home |
| `team` | `Team` | home |
| `methodology` | `Methodology` | home |
| `testimonials` | `TrustedBy` | home |
| `portfolio` | `OurWork` | home |
| `cta` | `ClosingCta` | home |
| `pricing` | — | home (component empty) |
| `pageHero` | `PageHero` | shared |
| `contactHero` | `ContactHero` | shared |
| `contactForm` | `ContactFormSection` | shared |
| `booking` | `Booking` | contact |
| `engineeringServices` | `EngineeringServices` | services |
| `industries` | `Industries` | services |
| `faq` | `FAQ` | shared |
| `insightsFeatured` | `InsightsFeatured` | insights |
| `insightsGrid` | `InsightsGrid` | insights |
| `insightsResources` | `InsightsResources` | insights |
| `insightsCta` | `InsightsCta` | insights |

#### Portfolio Page Blocks (registered in BlockRenderer but NOT in `page.ts` pageBuilder)

| Sanity `_type` | Component | Notes |
|----------------|-----------|-------|
| `portfolioFeatured` | `PortfolioFeatured` | **Missing from `page.ts` pageBuilder.of** |
| `portfolioGrid` | `PortfolioGrid` | **Missing from `page.ts` pageBuilder.of** |
| `portfolioCta` | `PortfolioCta` | **Missing from `page.ts` pageBuilder.of** |
| `portfolioMetrics` | `PortfolioMetrics` | **Missing from `page.ts` pageBuilder.of** |

#### Case Study Page Blocks (registered in BlockRenderer but NOT in `page.ts` pageBuilder)

| Sanity `_type` | Component | Notes |
|----------------|-----------|-------|
| `studyHeroImage` | `StudyHeroImage` | Used by portfolio/[slug] |
| `studyChallenge` | `StudyChallenge` | Used by portfolio/[slug] |
| `studyApproach` | `StudyApproach` | Used by portfolio/[slug] |
| `studyKeyWins` | `StudyKeyWins` | Used by portfolio/[slug] |
| `studyWhatWeBuilt` | `StudyWhatWeBuilt` | Used by portfolio/[slug] |
| `studyNumbers` | `StudyNumbers` | Used by portfolio/[slug] |
| `studyTestimonial` | `StudyTestimonial` | Used by portfolio/[slug] |
| `studyTechStack` | `StudyTechStack` | Used by portfolio/[slug] |
| `studyMoreLikeThis` | `StudyMoreLikeThis` | Used by portfolio/[slug] |
| `studyClosingCta` | `StudyClosingCta` | Used by portfolio/[slug] |

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

5. **Missing `/services/[slug]` route**: The `service` document has a `pageBuilder` field but no Next.js route renders it.

6. **Empty component files**: `Pricing.tsx`, `Testimonials.tsx`, `Compare.tsx`, `Steps.tsx`, `Awards.tsx`, `Press.tsx`, `TechStacks.tsx` are 0 bytes.

### LOW — Technical debt

8. **Portfolio `[slug]` manually constructs pageBuilder**: This works but is fragile. Consider migrating `project` document to use a `pageBuilder` field directly.

9. **Insight `[slug]` doesn't use PageBuilder**: Hardcoded template. Could be migrated to PageBuilder pattern later.

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
