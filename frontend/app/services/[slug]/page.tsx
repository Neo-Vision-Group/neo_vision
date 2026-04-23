import type { Metadata } from "next";
import { notFound } from "next/navigation";
import PageBuilderPage from "@/components/PageBuilder";
import { sanityFetch } from "@/sanity/lib/live";
import { client } from "@/sanity/lib/client";
import { PageQueryResult } from "@/sanity.types";
import { defineQuery } from "next-sanity";

const linkReference = /* groq */ `
  _type == "link" => {
    "page": page->slug.current,
    "post": post->slug.current
  }
`;

const linkFields = /* groq */ `
  link {
      ...,
      ${linkReference}
      }
`;

export const serviceQuery = defineQuery(`
  *[_type == "service" && slug.current == $slug][0]{
    _id,
    _type,
    name,
    slug,
    description,
    keywords,
    price,
    category,
    tag,
    duration,
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
      _type == "insightsCta" => {
        ...,
        cta {
          ...,
          ${linkFields}
        }
      },
      _type == "freeResources" => {
        ...,
        items[]{
          ...,
          "fileUrl": file.asset->url
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
        items[]->{
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
        categoryFilters[]{
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
          ${linkFields}
        }
      },
      _type == "place" => {
        ...,
        eyebrow,
        headingRegular,
        headingBold,
        body,
        backgroundGraphic {
          ...,
          asset->
        },
        locations,
        cta
      },
    },
  }
`);

const allServicesQuery = defineQuery(`
  *[_type == "service" && defined(slug.current)]{
    _id,
    slug,
  }
`);

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateStaticParams() {
  const services = await client.fetch(allServicesQuery);
  const slugs = services?.map((s: any) => ({ slug: s.slug.current })) ?? [];
  return slugs;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const service = await sanityFetch({ query: serviceQuery, params: { slug } });

  if (!service.data) return { title: "Service — Neo Vision Technologies" };

  return {
    title: `${service.data.name} — Neo Vision Technologies`,
    description: service.data.description ?? undefined,
    keywords: service.data.keywords ?? undefined,
    openGraph: {
      title: `${service.data.name} — Neo Vision Technologies`,
      description: service.data.description ?? undefined,
      url: `/services/${slug}`,
      type: "article",
    },
  };
}

export default async function ServiceDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const service = await sanityFetch({ query: serviceQuery, params: { slug } });

  if (!service.data) notFound();

  // Transform service data to match PageQueryResult shape for PageBuilder
  const pageData = {
    _id: service.data._id,
    _type: service.data._type,
    name: service.data.name,
    slug: service.data.slug,
    pageType: "service",
    heading: null,
    subheading: null,
    pageBuilder: service.data.pageBuilder,
  };

  return (
    <div className="">
      <PageBuilderPage page={pageData as PageQueryResult} />
    </div>
  );
}
