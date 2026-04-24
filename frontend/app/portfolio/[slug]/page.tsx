import type { Metadata } from "next";
import { notFound } from "next/navigation";
import PageBuilderPage from "@/components/PageBuilder";
import { sanityFetch } from "@/sanity/lib/live";
import { client } from "@/sanity/lib/client";
import type { AllProjectsQueryResult, PageQueryResult, ProjectBySlugQueryResult } from "@/sanity.types";
import { projectBySlugQuery, allProjectsQuery } from "@/sanity/lib/queries";

type ProjectBlock = NonNullable<NonNullable<ProjectBySlugQueryResult>["pageBuilder"]>[number];
const RETIRED_PROJECT_BLOCKS = new Set([
  "studyWhatWeBuilt",
  "studyMoreLikeThis",
  "studyClosingCta",
]);

function enrichProjectBlocks(
  project: NonNullable<ProjectBySlugQueryResult>,
): ProjectBlock[] {
  const pageBuilder = (project.pageBuilder ?? []) as Array<Record<string, any>>;

  return pageBuilder
    .filter((block) => !RETIRED_PROJECT_BLOCKS.has(block._type))
    .map((block) => {
    if (block._type !== "studyHero") {
      return block as ProjectBlock;
    }

    const heroBlock = block as Record<string, any> & {
      details?: Array<{ _key?: string; label?: string; value?: string }>;
    };

    const details =
      heroBlock.details && heroBlock.details.length > 0
        ? heroBlock.details
        : [
            { _key: "client", label: "Client", value: project.client ?? "" },
            { _key: "industry", label: "Industry", value: project.industry ?? "" },
            { _key: "services", label: "Services", value: project.category ?? "" },
            { _key: "year", label: "Year", value: project.year ?? "" },
          ].filter((item) => item.value);

    return {
      ...heroBlock,
      eyebrow: heroBlock.eyebrow ?? project.category ?? undefined,
      heading: heroBlock.heading ?? project.client ?? undefined,
      subheading: heroBlock.subheading ?? project.tagline ?? undefined,
      heroImage: heroBlock.heroImage ?? project.thumb ?? undefined,
      details,
    } as unknown as ProjectBlock;
  });
}

export async function generateStaticParams() {
  const projects = await client.fetch<AllProjectsQueryResult>(allProjectsQuery);
  return projects.map((project) => ({ slug: project.slug.current }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const project = (await sanityFetch({
    query: projectBySlugQuery,
    params: { slug },
  })) as { data: ProjectBySlugQueryResult | null };

  if (!project.data) {
    return { title: "Case study - Neo Vision Technologies" };
  }

  return {
    title: `${project.data.client} - Neo Vision Technologies`,
    description: project.data.tagline ?? undefined,
    openGraph: {
      title: `${project.data.client} - Neo Vision Technologies`,
      description: project.data.tagline ?? undefined,
      url: `/portfolio/${slug}`,
      type: "article",
    },
  };
}

export default async function CaseStudyDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const project = (await sanityFetch({
    query: projectBySlugQuery,
    params: { slug },
  })) as { data: ProjectBySlugQueryResult | null };

  const projectData = project.data;
  if (!projectData) {
    notFound();
  }

  const caseStudyPageData: NonNullable<PageQueryResult> = {
    _id: projectData._id,
    _type: "page",
    name: projectData.client,
    slug: projectData.slug,
    pageType: "caseStudies",
    heading: null,
    subheading: null,
    pageBuilder: enrichProjectBlocks(projectData) as NonNullable<PageQueryResult>["pageBuilder"],
  };

  return <PageBuilderPage page={caseStudyPageData} />;
}
