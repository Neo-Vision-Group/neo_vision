import {defineField, defineType} from 'sanity'

export const whyRomania = defineType({
  name: 'whyRomania',
  title: 'Why Romania',
  description:
    'Highlights the location, talent density, and operating advantages behind the team.',
  type: 'object',
  fields: [
    defineField({
      name: 'eyebrow',
      title: 'Eyebrow',
      type: 'string',
      initialValue: 'WHY ROMANIA',
    }),
    defineField({
      name: 'title',
      title: 'Title',
      type: 'blockContentTextOnly',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'body',
      title: 'Body',
      type: 'blockContentTextOnly',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'highlights',
      title: 'Highlights',
      type: 'array',
      of: [
        defineField({
          name: 'highlight',
          title: 'Highlight',
          type: 'object',
          fields: [
            defineField({
              name: 'stat',
              title: 'Stat',
              type: 'string',
              validation: (Rule) => Rule.required(),
            }),
            defineField({
              name: 'description',
              title: 'Description',
              type: 'text',
              rows: 3,
              validation: (Rule) => Rule.required(),
            }),
          ],
          preview: {
            select: {
              title: 'stat',
              subtitle: 'description',
            },
          },
        }),
      ],
      validation: (Rule) => Rule.min(1).max(6),
    }),
  ],
  preview: {
    select: {
      title: 'eyebrow',
      subtitle: 'title',
    },
    prepare: ({title, subtitle}) => ({
      title: title ?? 'Why Romania',
      subtitle,
    }),
  },
})
