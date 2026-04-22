import PageBuilder from '@/components/PageBuilder'
import {sanityFetch} from '@/sanity/lib/live'

export default async function Page() {
  const {data: homePage} = await sanityFetch({
    query: `*[_type == 'page' && pageType == 'home'][0]{
      ...,
      pageBuilder[]{
        ...,
        _type == "homeHero" => {
          ...,
          primaryCta {
            ...,
            linkType,
            href,
            "page": page->slug.current,
            "post": post->slug.current,
            openInNewTab
          },
          secondaryCta {
            ...,
            linkType,
            href,
            "page": page->slug.current,
            "post": post->slug.current,
            openInNewTab
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
            linkType,
            href,
            "page": page->slug.current,
            "post": post->slug.current,
            openInNewTab
          }
        },
        _type == "infoSection" => {
          content[]{
            ...,
            markDefs[]{
              ...,
              _type == "link" => {
                ...,
                linkType,
                href,
                "page": page->slug.current,
                "post": post->slug.current,
                openInNewTab
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
          heading,
          description,
          members[]{
            ...,
            image
          }
        },
        _type == "methodology" => {
          ...,
          heading,
          steps[]{
            ...,
            icon
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
            linkType,
            href,
            "page": page->slug.current,
            "post": post->slug.current,
            openInNewTab
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
        _type == "industries" => {
          ...,
          industries[]{
            ...,
            icon
          }
        },
        _type == "faq" => {
          ...,
          items[]{
            question,
            answer
          }
        },
        _type == "portfolioFeatured" => {
          ...,
          caseStudy->{
            _id,
            client,
            slug,
            year,
            category,
            industry,
            tagline,
            metric,
            metricLabel,
            thumb
          }
        },
        _type == "portfolioGrid" => {
          ...,
          items[]{
            _id,
            client,
            slug,
            year,
            category,
            industry,
            tagline,
            metric,
            metricLabel,
            thumb
          },
          serviceFilters[]{
            label,
            value
          },
          industryFilters[]{
            label,
            value
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
            linkType,
            href,
            "page": page->slug.current,
            "post": post->slug.current,
            openInNewTab
          }
        }
      }
    }`,
  })

  if (!homePage) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <h1 className="text-2xl font-bold">No home page found</h1>
        <p className="text-gray-600 mt-4">
          Please create a page in Sanity with pageType set to &quot;home&quot;
        </p>
      </div>
    )
  }

  return <PageBuilder page={homePage} />
}
