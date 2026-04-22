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

export const homePageQuery = defineQuery(`
  *[_type == 'page' && pageType == 'home'][0]{
    _id,
    _type,
    name,
    pageType,
    "pageBuilder": pageBuilder[]{
      ...,
      _type == "homeHero" => {
        ...,
        primaryCta {
          ...,
          link {
            ...,
            _type == "link" => {
              "page": page->slug.current,
              "post": post->slug.current
            }
          }
        },
        secondaryCta {
          ...,
          link {
            ...,
            _type == "link" => {
              "page": page->slug.current,
              "post": post->slug.current
            }
          }
        }
      },
      _type == "callToAction" => {
        ...,
        button {
          ...,
          link {
            ...,
            _type == "link" => {
              "page": page->slug.current,
              "post": post->slug.current
            }
          }
        }
      },
      _type == "infoSection" => {
        content[]{
          ...,
          markDefs[]{
            ...,
            _type == "link" => {
              "page": page->slug.current,
              "post": post->slug.current
            }
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
          link {
            ...,
            _type == "link" => {
              "page": page->slug.current,
              "post": post->slug.current
            }
          }
        },
        subtext
      },
      _type == "engineeringServices" => {
        ...,
        services[]->{
          ...
        }
      }
    },
  }
`)

export const getPageQuery = defineQuery(`
  *[_type == 'page' && slug.current == $slug][0]{
    _id,
    _type,
    name,
    slug,
    heading,
    subheading,
    "pageBuilder": pageBuilder[]{
      ...,
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
          link {
            ...,
            _type == "link" => {
              "page": page->slug.current,
              "post": post->slug.current
            }
          }
        },
        subtext
      },
      _type == "engineeringServices" => {
        ...,
        services[]->{
          ...
        }
      }
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