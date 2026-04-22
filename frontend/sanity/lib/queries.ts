import {defineQuery} from 'next-sanity'

const linkReference = /* groq */ `
  _type == "link" => {
    "page": page->slug.current,
    "post": post->slug.current
  }
`

const linkFields = /* groq */ `
  link {
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
  "date": coalesce(date, _updatedAt),
  "author": author->{firstName, lastName, picture},
`

export const settingsQuery = defineQuery(`
  *[_type == "siteSettings" && (_id == "siteSettings" || _id == "drafts.siteSettings")][0]{
    ...,
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
    }
  }
`)

export const pageQuery = defineQuery(`
  select(
    $slug != "" => *[_type == 'page' && slug.current == $slug][0],
    *[_type == 'page' && pageType == 'home'][0]
  ){
    _id,
    _type,
    name,
    slug,
    pageType,
    heading,
    subheading,
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
      _type == "pageHero" => {
        ...,
        eyebrow,
        headingType,
        heading,
        headingMultipart {
          faded,
          regular,
          bold,
          trailing
        },
        subheading,
        stats[]{
          number,
          suffix,
          label
        }
      },
      _type == "contactHero" => {
        ...,
        eyebrow,
        heading,
        description,
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
      _type == "booking" => {
        ...,
        heading,
        description,
        services,
        budgetRanges,
        timelines,
        hearAboutUs
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
          logo
        },
        testimonials[]->{
          attribution,
          quote,
          profilePicture
        }
      },
      _type == "whatWeDo" => {
        ...,
        cards[]{
          ...,
          services[]->{
            ...
          }
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
        projects[]->{
          _id,
          client,
          year,
          slug,
          category,
          title,
          tagline,
          description,
          image,
          link
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
      _type == "ai" => {
        ...,
        services[]{
          ...,
          service->{
            ...
          }
        }
      },
      _type == "industry" => {
        ...
        industries[]->{
          ...
        }
      },
      _type == "faq" => {
        ...,
        items[]{
          ...
        }
      },
      _type == "insightsFeatured" => {
        ...,
        insight->{
          _id,
          title,
          slug,
          excerpt,
          category,
          "cover": cover.asset->url,
          publishedAt,
          readTime,
          featured,
          author->{name, role, portrait}
        }
      },
      _type == "insightsGrid" => {
        ...,
        items[]->{
          _id,
          title,
          slug,
          excerpt,
          category,
          "cover": cover.asset->url,
          publishedAt,
          readTime,
          featured,
          author->{name, role, portrait}
        }
      },
      _type == "insightsResources" => {
        ...,
        items[]{
          ...,
          downloadUrl,
          externalUrl
        }
      },
      _type == "insightsCta" => {
        ...,
        cta {
          ...,
          ${linkFields}
        }
      },
    },
  }
`)

export const sitemapData = defineQuery(`
  *[_type == "page" || _type == "post" && defined(slug.current)] | order(_type asc) {
    "slug": slug.current,
    _type,
    _updatedAt,
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
    ...,
    markDefs[]{
      ...,
      ${linkReference}
    }
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
    category,
    "cover": cover,
    publishedAt,
    readTime,
    featured,
    author->{name, role, portrait},
  }
`)

export const INSIGHT_BY_SLUG_QUERY = defineQuery(`
  *[_type == "post" && slug.current == $slug][0]{
    _id,
    title,
    slug,
    excerpt,
    category,
    "cover": cover,
    publishedAt,
    readTime,
    featured,
    body,
    author->{name, role, bio, portrait},
    relatedInsights[]->{
      _id,
      title,
      slug,
      excerpt,
      category,
      "cover": cover,
      publishedAt,
    }
  }
`)

export const ALL_INSIGHT_SLUGS_QUERY = defineQuery(`
  *[_type == "post" && defined(slug.current)]{
    "slug": slug.current
  }
`)