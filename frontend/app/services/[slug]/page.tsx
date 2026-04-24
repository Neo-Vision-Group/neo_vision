import type { Metadata } from "next";
import { notFound } from "next/navigation";
import PageBuilderPage from "@/components/PageBuilder";
import { sanityFetch } from "@/sanity/lib/live";
import { client } from "@/sanity/lib/client";
import type { PageQueryResult, Slug } from "@/sanity.types";
import { serviceQuery, allServicesQuery } from "@/sanity/lib/queries";

type AllServicesSlugsResult = Array<{
  _id: string;
  slug: Slug;
}>;

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateStaticParams() {
  const services = await client.fetch<AllServicesSlugsResult>(allServicesQuery);
  return services.map((s) => ({ slug: s.slug.current }));
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
  const pageData: NonNullable<PageQueryResult> = {
    _id: service.data._id,
    _type: "page",
    name: service.data.name,
    slug: service.data.slug,
    pageType: "services",
    heading: null,
    subheading: null,
    pageBuilder:
      service.data.pageBuilder as unknown as NonNullable<PageQueryResult>["pageBuilder"],
  };

  return (
    <div className="">
      <PageBuilderPage page={pageData} />
    </div>
  );
}
