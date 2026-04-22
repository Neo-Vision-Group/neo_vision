import { PageHero } from "@/components/sections/PageHero";
import { SectionsWrapper } from "@/components/SectionsWrapper";
import { PortfolioGrid } from "@/components/sections/portfolio/PortfolioGrid";
import { PortfolioMetrics } from "@/components/sections/portfolio/Metrics";
import { PortfolioCta } from "@/components/sections/portfolio/PortfolioCta";

export default function PortfolioPage() {

  const hero = {
    eyebrow: "OUR WORK",
    headingType: "multipart" as const,
    headingMultipart: {
      regular: "200+ Products",
      bold: "Shipped.",
    },
    subheading: "Here are a few we're most proud of.",
  };

  const grid = {
    items: [
      {
        _id: "case-1",
        client: "Forbes Romania",
        slug: "forbes-romania",
        year: "2025",
        category: "Engineering + AI",
        industry: "media",
        tagline: "Headless NLP-powered personalization that increased traffic by 42%.",
        metric: "+42%",
        metricLabel: "Traffic increase",
      },
      {
        _id: "case-2",
        client: "Confidas",
        slug: "confidas",
        year: "2024",
        category: "Engineering + AI",
        industry: "fintech",
        tagline: "AI-powered NLP content personalization.",
        metric: "+42%",
        metricLabel: "Engagement",
      },
    ],
    serviceFilters: [
      { label: "All", value: "all" },
      { label: "Engineering", value: "engineering" },
      { label: "AI Transformation", value: "ai" },
      { label: "Design", value: "design" },
      { label: "Strategy", value: "strategy" },
    ],
    industryFilters: [
      { label: "All", value: "all" },
      { label: "Media", value: "media" },
      { label: "Healthcare", value: "healthcare" },
      { label: "Fintech", value: "fintech" },
      { label: "E-Commerce", value: "ecommerce" },
      { label: "EdTech", value: "edtech" },
      { label: "SaaS", value: "saas" },
      { label: "Construction", value: "construction" },
    ],
  };

  const metrics = {
    items: [
      { value: "200+", label: "Projects" },
      { value: "10+", label: "Industries served" },
      { value: "15+", label: "Countries" },
      { value: "4.8/5", label: "Average rating" },
    ],
  };

  const cta = {
    heading: {
      regular: "Don't see your industry?",
      bold: "We've probably built in it.",
    },
    body: "500+ projects across healthcare, fintech, consumer apps, education, e-commerce, SaaS, media, and more. Let's talk about your project.",
    cta: {
      label: "Start a project",
      href: "/contact",
    },
  };

  return (
    <>
      {/* Hero */}
      <PageHero data={hero} />

      {/* Filters + Grid */}
      <SectionsWrapper id="all-work" eyebrow="ALL WORK">
        <PortfolioGrid data={grid} />
      </SectionsWrapper>

      {/* Metrics */}
      <SectionsWrapper id="metrics" eyebrow="IMPACT">
        <PortfolioMetrics data={metrics} />
      </SectionsWrapper>

      {/* Industry CTA */}
      <SectionsWrapper id="industry-cta" eyebrow="YOUR INDUSTRY">
        <PortfolioCta data={cta} />
      </SectionsWrapper>
    </>
  );
}
