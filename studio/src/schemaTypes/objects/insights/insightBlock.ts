import { defineType, defineField } from 'sanity'

export const insightBlock = defineType({
  name: 'insightBlock',
  title: 'Insight Block',
  description: 'A content block for insight pages with title, text, and optional section (quote, table, or card)',
  type: 'object',
  fields: [
    defineField({
      name: 'title',
      title: 'Title',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'text',
      title: 'Text',
      type: 'array',
      of: [
        {
          type: 'block',
          marks: {
            decorators: [
              { title: 'Strong', value: 'strong' },
              { title: 'Emphasis', value: 'em' },
            ],
            annotations: [
              {
                name: 'link',
                type: 'object',
                title: 'Link',
                fields: [{ name: 'href', title: 'URL', type: 'url' }],
              },
            ],
          },
        },
      ],
    }),
    defineField({
      name: 'sectionType',
      title: 'Section Type',
      type: 'string',
      options: {
        list: [
          { title: 'None', value: 'none' },
          { title: 'Quote', value: 'quote' },
          { title: 'Table', value: 'table' },
          { title: 'Card', value: 'card' },
        ],
        layout: 'radio',
      },
      initialValue: 'none',
    }),
    defineField({
      name: 'quote',
      title: 'Quote',
      type: 'object',
      hidden: ({ parent }) => parent.sectionType !== 'quote',
      fields: [
        defineField({
          name: 'quote',
          title: 'Quote Text',
          type: 'blockContentTextOnly',
        }),
        defineField({
          name: 'attribution',
          title: 'Attribution',
          type: 'string',
        }),
      ],
      preview: {
        select: {
          title: 'attribution',
        },
        prepare: ({ title }) => ({
          title: title || 'Quote',
        }),
      },
    }),
    defineField({
      name: 'table',
      title: 'Table',
      type: 'object',
      hidden: ({ parent }) => parent.sectionType !== 'table',
      fields: [
        defineField({
          name: 'headers',
          title: 'Headers',
          type: 'array',
          of: [{ type: 'string' }],
        }),
        defineField({
          name: 'rows',
          title: 'Rows',
          type: 'array',
          of: [
            {
              type: 'object',
              fields: [
                defineField({
                  name: 'cells',
                  title: 'Cells',
                  type: 'array',
                  of: [{ type: 'string' }],
                }),
              ],
            },
          ],
        }),
      ],
      preview: {
        prepare: () => ({ title: 'Table' }),
      },
    }),
    defineField({
      name: 'card',
      title: 'Card',
      type: 'object',
      hidden: ({ parent }) => parent.sectionType !== 'card',
      fields: [
        defineField({
          name: 'label',
          title: 'Label',
          type: 'string',
          initialValue: 'Key Point',
        }),
        defineField({
          name: 'body',
          title: 'Card Body',
          type: 'blockContentTextOnly',
        }),
      ],
      preview: {
        select: {
          title: 'label',
        },
        prepare: ({ title }) => ({
          title: title || 'Card',
        }),
      },
    }),
  ],
  preview: {
    select: {
      title: 'title',
      sectionType: 'sectionType',
    },
    prepare: ({ title, sectionType }) => ({
      title,
      subtitle: sectionType !== 'none' ? `Section: ${sectionType}` : 'No section',
    }),
  },
})
