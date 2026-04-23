import type { Metadata } from "next";
import { notFound } from "next/navigation";
import PageBuilderPage from "@/components/PageBuilder";
import { sanityFetch } from "@/sanity/lib/live";
import { client } from "@/sanity/lib/client";
import { PageQueryResult } from "@/sanity.types";
import { projectBySlugQuery, allProjectsQuery } from "@/sanity/lib/queries";

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateStaticParams() {
  const projects = await client.fetch(allProjectsQuery)
  const slugs = projects?.map((p: any) => ({ slug: p.slug.current })) ?? []
  return slugs
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params
  const project = await sanityFetch({ query: projectBySlugQuery, params: { slug } })
  
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
  const project = await sanityFetch({ query: projectBySlugQuery, params: { slug } })
  
  if (!project.data) notFound()

  const allProjects = await sanityFetch({ query: allProjectsQuery })
  const relatedProjects = (allProjects.data ?? [])
    .filter((p: any) => p._id !== project.data._id)
    .slice(0, 3)

  // Use the pageBuilder from the project document
  // If pageBuilder has studyHero blocks, use them; otherwise construct from fields
  let pageBuilder = project.data.pageBuilder || [];

  // If no pageBuilder or no studyHero, construct one from basic fields
  if (pageBuilder.length === 0) {
    pageBuilder = [
      {
        _key: "hero",
        _type: "studyHero",
        eyebrow: `${project.data.category ?? ""}${project.data.year ? ` · ${project.data.year}` : ""}`,
        heading: project.data.client,
        subheading: project.data.tagline ?? undefined,
        heroImage: project.data.thumb,
      },
      {
        _key: "challenge",
        _type: "studyChallenge",
        eyebrow: project.data.challenge?.eyebrow ?? "THE CHALLENGE",
        heading: project.data.challenge?.heading,
        body: project.data.challenge?.body,
        issues: project.data.challenge?.issues,
      },
      {
        _key: "approach",
        _type: "studyApproach",
        eyebrow: project.data.approach?.eyebrow ?? "OUR APPROACH",
        heading: project.data.approach?.heading,
        body: project.data.approach?.body,
        callout: project.data.approach?.callout,
      },
      {
        _key: "key-wins",
        _type: "studyKeyWins",
        eyebrow: project.data.keyWins?.eyebrow ?? "THE KEY WINS",
        heading: project.data.keyWins?.heading,
        comparison: project.data.keyWins?.comparison,
      },
      {
        _key: "what-we-built",
        _type: "studyWhatWeBuilt",
        eyebrow: project.data.whatWeBuilt?.eyebrow ?? "WHAT WE BUILT",
        heading: project.data.whatWeBuilt?.heading,
        features: project.data.whatWeBuilt?.features,
      },
      {
        _key: "numbers",
        _type: "studyNumbers",
        eyebrow: project.data.numbers?.eyebrow ?? "THE NUMBERS",
        heading: project.data.numbers?.heading,
        footnote: project.data.numbers?.footnote,
        stats: project.data.numbers?.stats,
      },
      {
        _key: "testimonial",
        _type: "studyTestimonial",
        eyebrow: project.data.detailTestimonial?.eyebrow ?? "TESTIMONIAL",
        quote: project.data.testimonial,
      },
      {
        _key: "tech-stack",
        _type: "studyTechStack",
        eyebrow: project.data.techStack?.eyebrow ?? "TECH STACK",
        tools: project.data.techStack?.tools,
      },
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
    ];

    if (project.data.closingCta) {
      pageBuilder.push({
        _key: "closing-cta",
        _type: "studyClosingCta",
        eyebrow: "START",
        heading: project.data.closingCta.heading,
        body: project.data.closingCta.body,
        cta: project.data.closingCta.cta,
      });
    }
  }

  const caseStudyPageData = {
    _id: project.data._id,
    _type: "page",
    name: project.data.client,
    slug: project.data.slug,
    pageType: "home",
    heading: null,
    subheading: null,
    pageBuilder,
  }

  return (
    <div className="">
      <PageBuilderPage page={caseStudyPageData as PageQueryResult} />
    </div>
  )
}
