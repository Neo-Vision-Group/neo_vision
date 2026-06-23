import {defineQuery} from 'next-sanity'

const linkReference = /* groq */ `
  _type == "link" => {
    "page": page->slug.current,
    "post": post->slug.current,
    "service": service->slug.current,
    "project": project->slug.current
  }
`

const linkFields = /* groq */ `
  link {
      ...,
      ${linkReference}
      }
`

const portableTextWithLinks = /* groq */ `
  ...,
  _type == "image" => {
    ...,
    asset->{
      url,
      metadata{
        dimensions{
          width,
          height
        }
      }
    }
  },
  markDefs[]{
    ...,
    ${linkReference}
  }
`

const postFields = /* groq */ `
  _id,
  "status": select(_originalId in path("drafts.**") => "draft", "published"),
  "title": coalesce(title, "Untitled"),
  "slug": slug.current,
  excerpt,
  coverImage,
  "cover": coverImage.asset->url,
  "date": coalesce(date, _updatedAt),
  "author": author->{firstName, lastName, picture},
  "category": category->{_id, title, slug},
`

const seoImageFields = /* groq */ `
  {
    ...,
    asset->
  }
`

const seoFields = /* groq */ `
  seo{
    ...,
    ogImage ${seoImageFields},
    twitterImage ${seoImageFields},
    socialImage ${seoImageFields},
    alternateLanguages[]{
      ...,
      languageCode,
      url,
      isDefault
    }
  }
`

const seoSettingsFields = /* groq */ `
  siteName,
  defaultSeo{
    ...,
    ogImage ${seoImageFields},
    twitterImage ${seoImageFields},
    socialImage ${seoImageFields},
    alternateLanguages[]{
      ...,
      languageCode,
      url,
      isDefault
    }
  },
  googleSiteVerification,
  bingSiteVerification,
  pinterestVerification,
  yandexVerification,
  facebookDomainVerification
`

const sharedPageBuilderProjection = /* groq */ `
  "pageBuilder": pageBuilder[]{
    ...,
    _type == "homeHero" => {
      ...,
      primaryCta {
        ...,
        ${linkFields}
      },
      secondaryCta {
        ...,
        ${linkFields}
      }
    },
    _type == "serviceHero" => {
      ...,
      breadcrumb {
        rootLabel,
        categoryLabel,
        currentLabel
      },
      headlineLines,
      description,
      cta {
        ...,
        ${linkFields}
      },
      leadingHighlights[]{
        value,
        label
      },
      trailingHighlights[]{
        value,
        label
      },
      "serviceName": ^.name,
      "serviceCategory": ^.category,
      "serviceDescription": ^.description,
      "servicePrice": ^.price,
      "serviceDuration": ^.duration
    },
    _type == "pageHero" => {
      ...,
      eyebrow,
      heading,
      subheading,
      stats[]{
        number,
        suffix,
        label
      },
      featured->{
        _type,
        _id,
        slug,
        _type == "post" => {
          title,
          excerpt,
          "category": category->{_id, title, slug},
          publishedAt,
          readTime,
          "cover": coverImage.asset->url,
          author->{name}
        },
        _type == "project" => {
          client,
          year,
          "category": category->name,
          "industry": industry->name,
          tagline,
          "cover": thumb.asset->url
        }
      }
    },
    _type == "contactHero" => {
      ...,
      eyebrow,
      heading,
      description,
      stats[]{
        number,
        suffix,
        label
      },
      steps[]{
        title,
        description
      },
      formConfig {
        services,
        budgetRanges,
        timelines,
        hearAboutUs
      }
    },
    _type == "insightBlock" => {
      ...,
      text[]{
        ${portableTextWithLinks}
      },
      quote {
        attribution,
        quote[]{
          ${portableTextWithLinks}
        }
      },
      card {
        label,
        body[]{
          ${portableTextWithLinks}
        }
      }
    },
    _type == "booking" => {
      ...,
      heading,
      callTitle,
      whatToExpectHeading,
      expectations,
      schedulerUrl,
      teamMember->{
        name,
        role,
        portrait
      }
    },
    _type == "callToAction" => {
      ...,
      button {
        ...,
        ${linkFields}
      }
    },
    _type == "infoSection" => {
      content[]{
        ...,
        markDefs[]{
          ...,
          ${linkReference}
        }
      }
    },
    _type == "testimonials" => {
      ...,
      eyebrow,
      logos[]{
        name,
        "logoLight": logoLight.asset->url,
        "logoDark": logoDark.asset->url,
        link,
      },
      testimonials[]->{
        name,
        attribution,
        quote,
        profilePicture
      }
    },
    _type == "whatWeDo" => {
      ...,
      ctaSection {
        ...,
        cta {
          ...,
          ${linkFields}
        }
      },
      cards[]{
        ...,
        cta {
          ...,
          ${linkFields}
        },
        services[]->{
          ...
        }
      }
    },
    _type == "signature" => {
      ...,
      cta {
        ...,
        ${linkFields}
      }
    },
    _type == "signature2" => {
      ...,
      steps[]{
        ...,
        title,
        highlighted,
        graphic
      },
      cta {
        ...,
        ${linkFields}
      }
    },
    _type == "team" => {
      ...,
      members[]->{
        ...,
        portrait {
          ...,
          asset->
        }
      }
    },
    _type == "story" => {
      ...,
      milestones[]{
        year,
        body
      }
    },
    _type == "portfolio" => {
      ...,
      eyebrow,
      heading,
      cta {
        ...,
        ${linkFields}
      },
      cards[]{
        ...,
        project->{
          _id,
          title,
          client,
          year,
          slug,
          "category": category->name,
          tagline,
          "thumb": thumb.asset->url
        }
      }
    },
    _type == "pricing" => {
      ...,
      tiers[]{
        ...,
        cta {
          ...,
          ${linkFields}
        }
      }
    },
    _type == "cta" => {
      ...,
      heading,
      body,
      cta {
        ...,
        ${linkFields}
      },
      subtext
    },
    _type == "engineeringServices" => {
      ...,
      services[]{
        ...,
        service->{
          ...
        }
      }
    },
    _type == "serviceNavigator" => {
      ...,
      cards[]{
        ...,
        cta {
          ...,
          ${linkFields}
        }
      },
      closingCta {
        ...,
        ${linkFields}
      }
    },
    _type == "soundFamiliar" => {
      ...,
      painPoints[]{
        ...,
        title,
        body
      }
    },
    _type == "aiServices" => {
      ...,
      services[]{
        ...,
        service->{
          ...
        },
        cta {
          ...,
          ${linkFields}
        }
      }
    },
    _type == "industries" => {
      ...,
      industries[]{
        ...,
        icon
      }
    },
    _type == "reality" => {
      ...,
      heading {
        faded,
        bold
      },
      points[]{
        title,
        body
      },
      cta {
        ...,
        ${linkFields}
      }
    },
    _type == "compare" => {
      ...,
      heading {
        highlighted,
        regular
      },
      rows[]{
        label
      },
      columns[]{
        name,
        highlightColumn,
        values[]{
          available
        }
      },
      closing {
        lead,
        highlight,
        followup
      }
    },
    _type == "whyRomania" => {
      ...,
      title[]{
        ...,
        markDefs[]{
          ...,
          ${linkReference}
        }
      },
      body[]{
        ...,
        markDefs[]{
          ...,
          ${linkReference}
        }
      },
      highlights[]{
        stat,
        description
      }
    },
    _type == "faq" => {
      ...,
      items[]{
        ...
      }
    },
    _type == "isThisForYou" => {
      ...,
      items[]{
        text
      }
    },
    _type == "steps" => {
      ...,
      items[]{
        ...,
        title,
        duration,
        body
      },
      visual {
        ...,
        asset->
      }
    },
    _type == "insightsGrid" => {
      ...,
      categoryFilters[]{
        label,
        value
      },
      items[]->{
        _id,
        title,
        slug,
        excerpt,
        "category": category->{_id, title, slug},
        publishedAt,
        readTime,
        featured,
        "cover": coverImage.asset->url,
        author->{name, role, portrait}
      }
    },
    _type == "freeResources" => {
      ...,
      heading {
        faded,
        bold,
        regular,
        trailing
      },
      items[]->{
        ...,
        "fileUrl": file.asset.asset->url,
      }
    },
    _type == "studyHero" => {
      ...,
      details[]{
        _key,
        label,
        value
      },
      heroImage {
        ...,
        asset->
      },
      "projectTitle": ^.title,
      "projectTagline": ^.tagline,
      "projectThumb": ^.thumb.asset->url
    },
    _type == "studyHeroImage" => {
      ...,
      image {
        ...,
        asset->
      }
    },
    _type == "studyChallenge" => {
      ...,
      issues[]{
        _key,
        tag,
        body
      }
    },
    _type == "studyApproach" => {
      ...,
      heading {
        faded,
        bold
      },
      body[]{
        ${portableTextWithLinks}
      },
      callout {
        label,
        body
      }
    },
    _type == "studyKeyWins" => {
      ...,
      comparison {
        beforeLabel,
        afterLabel,
        rows[]{
          _key,
          label,
          before,
          after
        }
      }
    },
    _type == "studyWhatWeBuilt" => {
      ...,
      features[]{
        _key,
        number,
        title,
        body,
        image {
          ...,
          asset->
        }
      }
    },
    _type == "studyNumbers" => {
      ...,
      stats[]{
        _key,
        value,
        label,
        description
      }
    },
    _type == "studyTestimonial" => {
      ...,
      quote {
        profilePicture {
          asset->{
            _id,
            url,
            metadata { lqip, dimensions }
          }
        },
        quote,
        attribution,
        source,
        accent
      }
    },
    _type == "studyTechStack" => {
      ...,
      tools[]{
        _key,
        name,
        logo {
          asset->{
            _id,
            url,
            metadata {
              dimensions
            }
          },
          hotspot,
          crop
        }
      }
    },
    _type == "studyMoreLikeThis" => {
      ...,
      heading {
        regular,
        bold
      },
      items[]->{
        _id,
        client,
        slug,
        year,
        "category": category->name,
        "industry": industry->name,
        tagline,
        metric,
        metricLabel,
        "thumb": thumb.asset->url
      }
    },
    _type == "studyClosingCta" => {
      ...,
      heading {
        regular,
        bold
      },
      body,
      cta {
        ...,
        ${linkFields}
      }
    },
    _type == "portfolioFeatured" => {
      ...,
      caseStudy->{
        _id,
        client,
        slug,
        year,
        "category": category->name,
        "industry": industry->name,
        tagline,
        metric,
        metricLabel,
        thumb
      }
    },
    _type == "portfolioGrid" => {
      ...,
      items[]->{
        _id,
        client,
        title,
        slug,
        year,
        "category": category->name,
        "industry": industry->name,
        tagline,
        metric,
        metricLabel,
        thumb
      }
    },
    _type == "portfolioMetrics" => {
      ...,
      items[]{
        value,
        label
      }
    },
    _type == "portfolioCta" => {
      ...,
      heading,
      body,
      cta {
        ...,
        ${linkFields}
      }
    },
    _type == "place" => {
      ...,
      message,
      backgroundGraphic {
        ...,
        asset->
      }
    },
    _type == "awards" => {
      ...,
      eyebrow,
      items[]{
        title,
        recognitions,
        cta {
          ...,
          ${linkFields}
        }
      },
      featuredTitle,
      featuredBadge {
        ...,
        asset->
      }
    },
    _type == "press" => {
      ...,
      eyebrow,
      heading,
      cardTitle,
      cardBody,
      ctaLabel,
      file {
        ...,
        asset->
      }
    },
    _type == "studyTechStack" => {
      ...,
      eyebrow,
      tools[]->{
        name,
        image {
          ...,
          asset->
        }
      }
    },
  }
`

export const settingsQuery = defineQuery(`
  *[_type == "siteSettings" && (_id == "siteSettings" || _id == "drafts.siteSettings")][0]{
    ...,
    phoneNumber,
    instagram,
    facebook,
    linkedin,
    github,
    x,
    tiktok,
    logoPicture {
      ...,
      asset->
    },
    ogImage {
      ...,
      asset->
    },
    navLinks[]{
      _key,
      "name": label,
      "slug": "/" + page->slug.current
    },
    cta {
      buttonText,
      link {
        linkType,
        href,
        "page": page->slug.current,
        "post": post->slug.current,
        "service": service->slug.current,
        "project": project->slug.current,
        openInNewTab
      }
    },
    footerColumns[]{
      _key,
      title,
      links[]{
        _key,
        label,
        accent,
        "href": select(
          linkType == "page" => "/" + page->slug.current,
          linkType == "service" => "/services/" + service->slug.current,
          linkType == "href" => href
        )
      }
    },
    legalLinks[]->{
      _id,
      name,
      "href": "/" + slug.current
    },
    cookieSettings{
      enabled,
      bannerTitle,
      bannerDescription[]{
        ...,
        markDefs[]{
          ...,
          ${linkReference}
        }
      },
      preferencesTitle,
      preferencesDescription,
      acceptAllLabel,
      initialSaveLabel,
      customizeLabel,
      rejectAllLabel,
      savePreferencesLabel,
      backLabel,
      footerButtonLabel,
      categories[]{
        _key,
        title,
        description,
        required,
        defaultEnabled,
        lockedLabel
      }
    }
  }
`)

export const seoSettingsQuery = defineQuery(`
  *[_type == "seoSettings" && (_id == "seoSettings" || _id == "drafts.seoSettings")][0]{
    ${seoSettingsFields}
  }
`)

export const pageQuery = defineQuery(`
  *[_type == 'page' && (
    ($slug == "" && pageType == 'home') ||
    ($slug != "" && slug.current == $slug)
  )][0]{
    _id,
    _type,
    name,
    slug,
    pageType,
    ${seoFields},
    heading,
    subheading,
    ${sharedPageBuilderProjection},
  }
`)

// Dedicated home page query - filters only by pageType
export const homePageQuery = defineQuery(`
  *[_type == 'page' && pageType == 'home'][0]{
    _id,
    _type,
    name,
    slug,
    pageType,
    ${seoFields},
    heading,
    subheading,
    ${sharedPageBuilderProjection},
  }
`)

export const allPostsQuery = defineQuery(`
  *[_type == "post" && defined(slug.current)] | order(date desc, _updatedAt desc) {
    ${postFields}
  }
`)

export const morePostsQuery = defineQuery(`
  *[_type == "post" && _id != $skip && defined(slug.current)] | order(date desc, _updatedAt desc) [0...$limit] {
    ${postFields}
  }
`)

export const postQuery = defineQuery(`
  *[_type == "post" && slug.current == $slug] [0] {
    content[]{
      ${portableTextWithLinks}
    },
    ${postFields}
  }
`)

export const postPagesSlugs = defineQuery(`
  *[_type == "post" && defined(slug.current)]
  {"slug": slug.current}
`)

export const pagesSlugs = defineQuery(`
  *[_type == "page" && defined(slug.current)]
  {"slug": slug.current}
`)

export const ALL_INSIGHTS_QUERY = defineQuery(`
  *[_type == "post" && defined(slug.current)] | order(publishedAt desc, _updatedAt desc) {
    _id,
    title,
    slug,
    excerpt,
    "category": category->{_id, title, slug},
    publishedAt,
    readTime,
    featured,
    "cover": coverImage.asset->url,
    author->{name, role, portrait},
  }
`)

export const INSIGHT_BY_SLUG_QUERY = defineQuery(`
  *[_type == "post" && slug.current == $slug][0]{
    _id,
    _type,
    title,
    slug,
    ${seoFields},
    excerpt,
    coverImage {
      ...,
      asset->
    },
    "cover": coverImage.asset->url,
    "category": category->{_id, title, slug},
    publishedAt,
    readTime,
    featured,
    stats[]{
      value,
      label
    },
    ${sharedPageBuilderProjection},
    author->{name, role, bio, portrait},
    relatedInsights[]->{
      _id,
      title,
      slug,
      excerpt,
      "category": category->{_id, title, slug},
      publishedAt,
      readTime,
      "cover": coverImage.asset->url,
      author->{name, role, portrait},
    }
  }
`)

export const ALL_INSIGHT_SLUGS_QUERY = defineQuery(`
  *[_type == "post" && defined(slug.current)]{
    "slug": slug.current
  }
`)

export const allProjectsQuery = defineQuery(`
  *[_type == "project" && defined(slug.current)] | order(_createdAt desc) {
    _id,
    client,
    year,
    slug,
    "category": category->name,
    "industry": industry->name,
    tagline,
    metric,
    metricLabel,
    thumb
  }
`)

export const projectBySlugQuery = defineQuery(`
  *[_type == "project" && slug.current == $slug][0]{
    _id,
    _type,
    client,
    year,
    slug,
    ${seoFields},
    "category": category->name,
    "industry": industry->name,
    tagline,
    metric,
    metricLabel,
    thumb,
    ${sharedPageBuilderProjection},
    publishedAt
  }
`)

export const serviceQuery = defineQuery(`
  *[_type == "service" && slug.current == $slug][0]{
    _id,
    _type,
    name,
    slug,
    ${seoFields},
    price,
    category,
    tag,
    duration,
    ${sharedPageBuilderProjection},
  }
`)

export const allServicesQuery = defineQuery(`
  *[_type == "service" && defined(slug.current)]{
    _id,
    slug,
  }
`)

// Server-side re-resolution of a single `freeResources` item, keyed by the
// hosting page slug + the item `_key`. Used by /api/resource to avoid trusting
// any client-supplied URL (SEC-1). Returns the canonical, editor-set values only.
export const resourceByKeyQuery = defineQuery(`
  coalesce(
    *[_type in ["page", "service", "project", "post"] && (
      ($pageSlug == "" && _type == "page" && pageType == "home") ||
      ($pageSlug != "" && slug.current == $pageSlug)
    )][0]{
      "item": pageBuilder[_type == "freeResources"][0].items[_key == $itemKey]->{
        title,
        externalLink,
        askForEmail,
        "fileUrl": file.asset.asset->url
      }
    }.item,
    *[_type == "freeResource" && _id == $itemKey][0]{
      title,
      externalLink,
      askForEmail,
      "fileUrl": file.asset.asset->url
    }
  )
`)

export const freeResourceBySlugQuery = defineQuery(`
  *[_type == "freeResource" && slug.current == $slug][0]{
    _id,
    _type,
    title,
    "slug": slug.current,
    ${seoFields},
    description,
    badge,
    cta,
    file {
      type,
      asset {
        asset->{
          url
        }
      }
    },
    externalLink,
    askForEmail,
    downloadCta {
      heading,
      subheading,
      buttonText
    },
    ${sharedPageBuilderProjection}
  }
`)