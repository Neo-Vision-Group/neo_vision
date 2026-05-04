import type { SanityImageSource } from "@sanity/image-url";
import type { ArticleCardData } from "@/components/partials/ArticleCard";
import type { PageBuilderSection } from "@/sanity/lib/types";
import type { Seo } from "@/sanity.types";

export type InsightAuthorData = {
  name?: string | null;
  role?: string | null;
  bio?: string | null;
  portrait?: SanityImageSource | null;
};

export type InsightStat = {
  value?: string;
  label?: string;
};

export type InsightDoc = {
  _id?: string;
  _type?: string;
  title?: string;
  slug?: { current?: string } | string | null;
  excerpt?: string | null;
  seo?: Seo | null;
  coverImage?: SanityImageSource | null;
  cover?: string | null;
  category?: string | null;
  publishedAt?: string | null;
  readTime?: number | null;
  featured?: boolean | null;
  pageBuilder?: PageBuilderSection[];
  author?: InsightAuthorData | null;
  relatedInsights?: ArticleCardData[];
  stats?: InsightStat[];
};
