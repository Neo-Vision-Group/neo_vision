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
      name: "cover",
      title: "Cover image",
      type: "image",
      options: { hotspot: true },
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
      name: "body",
      title: "Body",
      type: "array",
      of: [
        {
          type: "block",
          styles: [
            { title: "Normal", value: "normal" },
            { title: "H2", value: "h2" },
            { title: "H3", value: "h3" },
            { title: "Quote", value: "blockquote" },
          ],
          marks: {
            decorators: [
              { title: "Strong", value: "strong" },
              { title: "Emphasis", value: "em" },
              { title: "Code", value: "code" },
            ],
            annotations: [
              {
                name: "link",
                type: "object",
                title: "Link",
                fields: [{ name: "href", title: "URL", type: "url" }],
              },
            ],
          },
        },
        { type: "image", options: { hotspot: true } },
        {
          type: "object",
          name: "pullquote",
          title: "Pullquote",
          fields: [
            { name: "quote", type: "text", rows: 3 },
            { name: "attribution", type: "string" },
          ],
          preview: { select: { title: "quote" } },
        },
        {
          type: "object",
          name: "keyPoint",
          title: "Key point callout",
          fields: [
            { name: "label", type: "string", initialValue: "Key Point" },
            { name: "body", type: "text", rows: 3 },
          ],
          preview: { select: { title: "label", subtitle: "body" } },
        },
        {
          type: "object",
          name: "comparisonTable",
          title: "Comparison table",
          fields: [
            {
              name: "headers",
              type: "array",
              of: [{ type: "string" }],
            },
            {
              name: "rows",
              type: "array",
              of: [
                {
                  type: "object",
                  fields: [
                    {
                      name: "cells",
                      type: "array",
                      of: [{ type: "string" }],
                    },
                  ],
                },
              ],
            },
          ],
          preview: { prepare: () => ({ title: "Comparison table" }) },
        },
      ],
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
  ],
  preview: {
    select: { title: "title", subtitle: "publishedAt", media: "cover" },
  },
});
