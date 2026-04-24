import type { PortableTextBlock } from "@portabletext/react";
import type { SanityImageSource } from "@sanity/image-url";
import type { ArticleCardData } from "@/components/partials/ArticleCard";
import type { PageBuilderSection } from "@/sanity/lib/types";

export type InsightAuthorData = {
  name?: string | null;
  role?: string | null;
  bio?: string | null;
  portrait?: SanityImageSource | null;
};

export type InsightDoc = {
  _id?: string;
  _type?: string;
  title?: string;
  slug?: { current?: string } | string | null;
  excerpt?: string | null;
  category?: string | null;
  cover?: SanityImageSource | null;
  publishedAt?: string | null;
  readTime?: number | null;
  featured?: boolean | null;
  body?: PortableTextBlock[];
  pageBuilder?: PageBuilderSection[];
  author?: InsightAuthorData | null;
  relatedInsights?: ArticleCardData[];
};
