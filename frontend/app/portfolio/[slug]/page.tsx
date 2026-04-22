import type { Metadata } from "next";
import { notFound } from "next/navigation";
import PageBuilderPage from "@/components/PageBuilder";
import { sanityFetch } from "@/sanity/lib/live";
import { PageQueryResult } from "@/sanity.types";

const projectQuery = `*[_type == "project" && slug.current == $slug][0]{
  _id,
  client,
  year,
  slug,
  category,
  industry,
  tagline,
  metric,
  metricLabel,
  thumb,
  challenge,
  approach,
  keyWins,
  whatWeBuilt,
  numbers,
  testimonial,
  detailTestimonial,
  techStack,
  closingCta,
  publishedAt
}`

const allProjectsQuery = `*[_type == "project"]{
  _id,
  client,
  year,
  slug,
  category,
  industry,
  tagline,
  metric,
  metricLabel,
  thumb
}`

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateStaticParams() {
  const projects = await sanityFetch({ query: allProjectsQuery })
  const slugs = projects.data?.map((p: any) => ({ slug: p.slug.current })) ?? []
  return slugs
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params
  const project = await sanityFetch({ query: projectQuery, params: { slug } })
  
  if (!project.data) return { title: "Case study — Neo Vision Technologies" }
  
  return {
    title: `${project.data.client} — Neo Vision Technologies`,
    description: project.data.tagline ?? undefined,
    openGraph: {
      title: `${project.data.client} — Neo Vision Technologies`,
      description: project.data.tagline ?? undefined,
      url: `/portfolio/${slug}`,
      type: "article",
    },
  }
}

export default async function CaseStudyDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params
  const project = await sanityFetch({ query: projectQuery, params: { slug } })
  
  if (!project.data) notFound()

  const allProjects = await sanityFetch({ query: allProjectsQuery })
  const relatedProjects = (allProjects.data ?? [])
    .filter((p: any) => p._id !== project.data._id)
    .slice(0, 3)

  // Create a page builder structure from the project data
  const caseStudyPageData = {
    _id: project.data._id,
    _type: "page",
    name: project.data.client,
    slug: project.data.slug,
    pageType: "home",
    heading: null,
    subheading: null,
    pageBuilder: [
      {
        _key: "hero",
        _type: "pageHero",
        eyebrow: `${project.data.category ?? ""}${project.data.year ? ` · ${project.data.year}` : ""}`,
        heading: project.data.client,
        headingType: "simple" as const,
        subheading: project.data.tagline ?? undefined,
      },
      {
        _key: "hero-image",
        _type: "studyHeroImage",
        image: project.data.thumb?.asset?.url ?? undefined,
        alt: project.data.client,
      },
      ...(project.data.challenge
        ? [
            {
              _key: "challenge",
              _type: "studyChallenge",
              eyebrow: project.data.challenge.eyebrow ?? "THE CHALLENGE",
              heading: project.data.challenge.heading,
              body: project.data.challenge.body,
              issues: project.data.challenge.issues,
            },
          ]
        : []),
      ...(project.data.approach
        ? [
            {
              _key: "approach",
              _type: "studyApproach",
              eyebrow: project.data.approach.eyebrow ?? "OUR APPROACH",
              heading: project.data.approach.heading,
              body: project.data.approach.body,
              callout: project.data.approach.callout,
            },
          ]
        : []),
      ...(project.data.keyWins
        ? [
            {
              _key: "key-wins",
              _type: "studyKeyWins",
              eyebrow: project.data.keyWins.eyebrow ?? "THE KEY WINS",
              heading: project.data.keyWins.heading,
              comparison: project.data.keyWins.comparison,
            },
          ]
        : []),
      ...(project.data.whatWeBuilt
        ? [
            {
              _key: "what-we-built",
              _type: "studyWhatWeBuilt",
              eyebrow: project.data.whatWeBuilt.eyebrow ?? "WHAT WE BUILT",
              heading: project.data.whatWeBuilt.heading,
              features: project.data.whatWeBuilt.features,
            },
          ]
        : []),
      ...(project.data.numbers
        ? [
            {
              _key: "numbers",
              _type: "studyNumbers",
              eyebrow: project.data.numbers.eyebrow ?? "THE NUMBERS",
              heading: project.data.numbers.heading,
              footnote: project.data.numbers.footnote,
              stats: project.data.numbers.stats,
            },
          ]
        : []),
      ...(project.data.testimonial
        ? [
            {
              _key: "testimonial",
              _type: "studyTestimonial",
              eyebrow: project.data.detailTestimonial?.eyebrow ?? "TESTIMONIAL",
              quote: project.data.testimonial,
            },
          ]
        : []),
      ...(project.data.techStack
        ? [
            {
              _key: "tech-stack",
              _type: "studyTechStack",
              eyebrow: project.data.techStack.eyebrow ?? "TECH STACK",
              tools: project.data.techStack.tools,
            },
          ]
        : []),
      {
        _key: "more-like-this",
        _type: "studyMoreLikeThis",
        heading: {
          regular: "More work like",
          bold: "this.",
        },
        items: relatedProjects.map((p: any) => ({
          _id: p._id,
          client: p.client,
          slug: p.slug.current,
          year: p.year,
          category: p.category,
          industry: p.industry,
          tagline: p.tagline,
          metric: p.metric,
          metricLabel: p.metricLabel,
          thumb: p.thumb?.asset?.url,
        })),
      },
      ...(project.data.closingCta
        ? [
            {
              _key: "closing-cta",
              _type: "studyClosingCta",
              eyebrow: "START",
              heading: project.data.closingCta.heading,
              body: project.data.closingCta.body,
              cta: project.data.closingCta.cta,
            },
          ]
        : []),
    ],
  }

  return (
    <div className="">
      <PageBuilderPage page={caseStudyPageData as PageQueryResult} />
    </div>
  )
}
