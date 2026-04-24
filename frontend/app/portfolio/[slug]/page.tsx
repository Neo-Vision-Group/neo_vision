import type { Metadata } from "next";
import { notFound } from "next/navigation";
import PageBuilderPage from "@/components/PageBuilder";
import { sanityFetch } from "@/sanity/lib/live";
import { client } from "@/sanity/lib/client";
import type { AllProjectsQueryResult, PageQueryResult, ProjectBySlugQueryResult } from "@/sanity.types";
import { projectBySlugQuery, allProjectsQuery } from "@/sanity/lib/queries";
import { urlForImage } from "@/sanity/lib/utils";
import type { CaseStudyCardData } from "@/components/partials/CaseStudyCard";

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateStaticParams() {
  const projects = await client.fetch<AllProjectsQueryResult>(allProjectsQuery)
  return projects.map((p) => ({ slug: p.slug.current }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params
  const project = (await sanityFetch({
    query: projectBySlugQuery,
    params: { slug },
  })) as { data: ProjectBySlugQueryResult | null }
  
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
  const project = (await sanityFetch({
    query: projectBySlugQuery,
    params: { slug },
  })) as { data: ProjectBySlugQueryResult | null }
  
  const projectData = project.data
  if (!projectData) notFound()

  const allProjects = (await sanityFetch({ query: allProjectsQuery })) as {
    data: AllProjectsQueryResult
  }
  const relatedProjects = (allProjects.data ?? [])
    .filter((p) => p._id !== projectData._id)
    .slice(0, 3)

  // Use the pageBuilder from the project document
  // If pageBuilder has studyHero blocks, use them; otherwise construct from fields
  let pageBuilder: unknown[] = projectData.pageBuilder || [];

  // If no pageBuilder or no studyHero, construct one from basic fields
  if (pageBuilder.length === 0) {
    pageBuilder = [
      {
        _key: "hero",
        _type: "studyHero",
        eyebrow: `${projectData.category ?? ""}${projectData.year ? ` · ${projectData.year}` : ""}`,
        heading: projectData.client,
        subheading: projectData.tagline ?? undefined,
        heroImage: projectData.thumb,
      },
      {
        _key: "challenge",
        _type: "studyChallenge",
        eyebrow: projectData.challenge?.eyebrow ?? "THE CHALLENGE",
        heading: projectData.challenge?.heading,
        body: projectData.challenge?.body,
        issues: projectData.challenge?.issues,
      },
      {
        _key: "approach",
        _type: "studyApproach",
        eyebrow: projectData.approach?.eyebrow ?? "OUR APPROACH",
        heading: projectData.approach?.heading,
        body: projectData.approach?.body,
        callout: projectData.approach?.callout,
      },
      {
        _key: "key-wins",
        _type: "studyKeyWins",
        eyebrow: projectData.keyWins?.eyebrow ?? "THE KEY WINS",
        heading: projectData.keyWins?.heading,
        comparison: projectData.keyWins?.comparison,
      },
      {
        _key: "what-we-built",
        _type: "studyWhatWeBuilt",
        eyebrow: projectData.whatWeBuilt?.eyebrow ?? "WHAT WE BUILT",
        heading: projectData.whatWeBuilt?.heading,
        features: projectData.whatWeBuilt?.features,
      },
      {
        _key: "numbers",
        _type: "studyNumbers",
        eyebrow: projectData.numbers?.eyebrow ?? "THE NUMBERS",
        heading: projectData.numbers?.heading,
        footnote: projectData.numbers?.footnote,
        stats: projectData.numbers?.stats,
      },
      {
        _key: "testimonial",
        _type: "studyTestimonial",
        eyebrow: projectData.detailTestimonial?.eyebrow ?? "TESTIMONIAL",
        quote: projectData.testimonial,
      },
      {
        _key: "tech-stack",
        _type: "studyTechStack",
        eyebrow: projectData.techStack?.eyebrow ?? "TECH STACK",
        tools: projectData.techStack?.tools,
      },
      {
        _key: "more-like-this",
        _type: "studyMoreLikeThis",
        heading: {
          regular: "More work like",
          bold: "this.",
        },
        items: relatedProjects.map(
          (p): CaseStudyCardData => ({
            _id: p._id,
            client: p.client,
            slug: p.slug.current,
            year: p.year,
            category: p.category,
            industry: p.industry,
            tagline: p.tagline,
            metric: p.metric,
            metricLabel: p.metricLabel,
            thumb: p.thumb
              ? urlForImage(p.thumb).width(1200).height(900).fit("crop").url()
              : null,
          }),
        ),
      },
    ];

    if (projectData.closingCta) {
      pageBuilder.push({
        _key: "closing-cta",
        _type: "studyClosingCta",
        eyebrow: "START",
        heading: projectData.closingCta.heading,
        body: projectData.closingCta.body,
        cta: projectData.closingCta.cta,
      });
    }
  }

  const caseStudyPageData: NonNullable<PageQueryResult> = {
    _id: projectData._id,
    _type: "page",
    name: projectData.client,
    slug: projectData.slug,
    pageType: "home",
    heading: null,
    subheading: null,
    pageBuilder: pageBuilder as unknown as NonNullable<PageQueryResult>["pageBuilder"],
  }

  return (
    <div className="">
      <PageBuilderPage page={caseStudyPageData} />
    </div>
  )
}
