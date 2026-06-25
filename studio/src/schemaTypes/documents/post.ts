import {defineField, defineType} from 'sanity'

import {
  universalPageBuilderBlocks,
  universalPageBuilderComponents,
  universalPageBuilderOptions,
} from '../pageBuilderBlocks'

export const post = defineType({
  name: 'post',
  title: 'Insight',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'Title',
      type: 'string',
      validation: (r) => r.required(),
    }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: {source: 'title', maxLength: 96},
      validation: (r) => r.required(),
    }),
    defineField({
      name: 'publishedAt',
      title: 'Published at',
      type: 'datetime',
      initialValue: () => new Date().toISOString(),
    }),
    defineField({
      name: 'excerpt',
      title: 'Excerpt',
      type: 'text',
      rows: 3,
    }),
    defineField({
      name: 'coverImage',
      title: 'Cover image',
      type: 'image',
      options: {hotspot: true},
      description: 'Used by the insight hero, insight cards, and featured insight references.',
    }),
    defineField({
      name: 'author',
      title: 'Author',
      type: 'reference',
      to: [{ type: 'teamMember' }],
      validation: (Rule) =>
        Rule.required().custom(async (value, context) => {
          // If no author is selected yet, let Rule.required() handle it
          if (!value || !value._ref) {
            return true;
          }

          // Access the Sanity client from the context
          const client = context.getClient({ apiVersion: '2025-09-25' });

          // Fetch the isAuthor field of the referenced teamMember
          const isAuthor = await client.fetch(
            `*[_id == $ref][0].isAuthor`,
            { ref: value._ref }
          );

          // Return true if valid, or an error message string if invalid
          if (isAuthor === true) {
            return true;
          }

          return 'The selected team member must have "Is Author" checked.';
        }),
    }),
    defineField({
      name: 'category',
      title: 'Category',
      type: 'reference',
      to: [{type: 'insightCategory'}],
      description: 'Select a category for this insight. Categories are managed in the Insight Category section.',
    }),
    defineField({
      name: 'readTime',
      title: 'Read time (minutes)',
      type: 'number',
      description: "Displayed as 'X min read' in the article meta.",
    }),
    defineField({
      name: 'featured',
      title: 'Featured on insights listing?',
      type: 'boolean',
      initialValue: false,
    }),
    defineField({
      name: 'relatedInsights',
      title: 'Related insights (manual)',
      type: 'array',
      of: [{type: 'reference', to: [{type: 'post'}]}],
      validation: (r) => r.max(6),
      description: 'Optional. Leave empty to auto-pick by category.',
    }),
    defineField({
      name: 'order',
      title: 'Sort order',
      type: 'number',
    }),
    defineField({
      name: 'stats',
      title: 'Hero Stats',
      type: 'array',
      description: 'Optional metrics to display in the insight hero.',
      of: [
        {
          type: 'object',
          name: 'stat',
          fields: [
            {name: 'value', type: 'string', title: 'Value', description: 'e.g., "50%" or "10x"'},
            {name: 'label', type: 'string', title: 'Label', description: 'e.g., "Increase in efficiency"'},
          ],
        },
      ],
    }),
    defineField({
      name: 'sources',
      title: 'Sources & Citations',
      type: 'array',
      description: 'References and sources cited in this article. Improves GEO citation rate and credibility for AI engines.',
      of: [
        {
          type: 'object',
          name: 'source',
          fields: [
            {
              name: 'title',
              type: 'string',
              title: 'Source Title',
              description: 'Name of the source, publication, or reference',
              validation: (r) => r.required(),
            },
            {
              name: 'url',
              type: 'url',
              title: 'Source URL',
              description: 'Link to the original source',
            },
            {
              name: 'author',
              type: 'string',
              title: 'Author/Publisher',
              description: 'Optional author or publisher name',
            },
            {
              name: 'publishedDate',
              type: 'date',
              title: 'Publication Date',
              description: 'When the source was published',
            },
          ],
          preview: {
            select: {
              title: 'title',
              subtitle: 'author',
            },
          },
        },
      ],
    }),
    defineField({
      name: 'pageBuilder',
      title: 'Page Builder',
      type: 'array',
      description: 'Source of truth for renderable insight detail sections.',
      of: universalPageBuilderBlocks,
      options: universalPageBuilderOptions,
      components: universalPageBuilderComponents,
    }),
    defineField({
      name: 'seo',
      title: 'SEO Override',
      type: 'seo',
      description:
        'Page-level SEO overrides. Leave any field blank to inherit the default value from SEO Settings.',
    }),
  ],
  preview: {
    select: {title: 'title', subtitle: 'publishedAt'},
  },
})
