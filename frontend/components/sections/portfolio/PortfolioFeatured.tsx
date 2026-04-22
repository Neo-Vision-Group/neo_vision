import { CaseStudyCard, type CaseStudyCardData } from "@/components/partials/CaseStudyCard";
import { cleanStega } from "@/sanity/lib/utils";

export type PortfolioFeaturedData = {
  caseStudy?: {
    _id?: string;
    client?: string;
    slug?: string | { current?: string };
    year?: string;
    category?: string;
    industry?: string;
    tagline?: string;
    metric?: string;
    metricLabel?: string;
    thumb?: string;
  };
};

export function PortfolioFeatured({ data }: { data?: PortfolioFeaturedData }) {
  const cleanData = data ? cleanStega(data) : data;

  if (!cleanData?.caseStudy) {
    return null;
  }

  // Convert slug object to string if needed
  const caseStudy = {
    ...cleanData.caseStudy,
    slug: typeof cleanData.caseStudy.slug === 'string' 
      ? cleanData.caseStudy.slug 
      : cleanData.caseStudy.slug?.current ?? ''
  };

  return <CaseStudyCard item={caseStudy as CaseStudyCardData} featured />;
}
