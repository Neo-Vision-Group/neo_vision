import { defineField, defineType } from "sanity";

export const post = defineType({
  name: "post",
  title: "Insight",
  type: "document",
  fields: [
    defineField({
      name: "title",
      title: "Title",
      type: "string",
      validation: (r) => r.required(),
    }),
    defineField({
      name: "slug",
      title: "Slug",
      type: "slug",
      options: { source: "title", maxLength: 96 },
      validation: (r) => r.required(),
    }),
    defineField({
      name: "publishedAt",
      title: "Published at",
      type: "datetime",
      initialValue: () => new Date().toISOString(),
    }),
    defineField({
      name: "excerpt",
      title: "Excerpt",
      type: "text",
      rows: 3,
    }),
    defineField({
      name: "coverImage",
      title: "Cover image",
      type: "image",
      options: { hotspot: true },
      description:
        "Used by the insight hero, insight cards, and featured insight references.",
    }),
    defineField({
      name: "author",
      title: "Author",
      type: "reference",
      to: [{ type: "teamMember" }],
    }),
    defineField({
      name: "category",
      title: "Category",
      type: "string",
      options: {
        list: [
          { title: "AI Transformation", value: "ai-transformation" },
          { title: "Engineering", value: "engineering" },
          { title: "Design Research", value: "design-research" },
          { title: "Systems Playbooks", value: "systems-playbooks" },
          { title: "Operators Notes", value: "operators-notes" },
        ],
      },
    }),
    defineField({
      name: "readTime",
      title: "Read time (minutes)",
      type: "number",
      description: "Displayed as 'X min read' in the article meta.",
    }),
    defineField({
      name: "featured",
      title: "Featured on insights listing?",
      type: "boolean",
      initialValue: false,
    }),
    defineField({
      name: "relatedInsights",
      title: "Related insights (manual)",
      type: "array",
      of: [{ type: "reference", to: [{ type: "post" }] }],
      validation: (r) => r.max(6),
      description: "Optional. Leave empty to auto-pick by category.",
    }),
    defineField({
      name: "order",
      title: "Sort order",
      type: "number",
    }),
    defineField({
      name: "pageBuilder",
      title: "Page Builder",
      type: "array",
      description: "Source of truth for renderable insight detail sections.",
      of: [
        { type: "insightBlock" },
        { type: "steps" },
        { type: "whyRomania" },
        { type: "compare" },
        { type: "techStack" },
        { type: "awards" },
        { type: "pricing" },
      ],
    }),
  ],
  preview: {
    select: { title: "title", subtitle: "publishedAt" },
  },
});

