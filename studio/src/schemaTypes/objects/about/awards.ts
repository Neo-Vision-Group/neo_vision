import {defineField, defineType} from 'sanity'

export const awards = defineType({
  name: 'awards',
  title: 'Awards',
  description: 'Displays recognition cards and a featured badge callout.',
  type: 'object',
  fields: [
    defineField({
      name: 'eyebrow',
      title: 'Eyebrow',
      type: 'string',
      initialValue: 'RECOGNISED BY',
    }),
    defineField({
      name: 'items',
      title: 'Award Cards',
      type: 'array',
      validation: (Rule) => Rule.min(1),
      of: [
        defineField({
          name: 'item',
          title: 'Award Card',
          type: 'object',
          fields: [
            defineField({
              name: 'title',
              title: 'Title',
              type: 'string',
              validation: (Rule) => Rule.required(),
            }),
            defineField({
              name: 'recognitions',
              title: 'Recognitions',
              type: 'array',
              validation: (Rule) => Rule.min(1),
              of: [{type: 'string'}],
            }),
            defineField({
              name: 'cta',
              title: 'CTA',
              type: 'button',
            }),
          ],
          preview: {
            select: {
              title: 'title',
              recognitions: 'recognitions',
            },
            prepare: ({title, recognitions}) => ({
              title: title ?? 'Award Card',
              subtitle: `${recognitions?.length ?? 0} recognition(s)`,
            }),
          },
        }),
      ],
    }),
    defineField({
      name: 'featuredTitle',
      title: 'Featured Title',
      type: 'string',
    }),
    defineField({
      name: 'featuredBadge',
      title: 'Featured Badge',
      type: 'image',
      options: {hotspot: true},
    }),
  ],
  preview: {
    select: {
      title: 'eyebrow',
      subtitle: 'featuredTitle',
    },
    prepare: ({title, subtitle}) => ({
      title: title ?? 'Awards',
      subtitle,
    }),
  },
})
