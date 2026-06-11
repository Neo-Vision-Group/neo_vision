import {defineField, defineType} from 'sanity'

export const steps = defineType({
  name: 'steps',
  title: 'Steps',
  description: 'Timeline section that explains the delivery process in ordered phases.',
  type: 'object',
  fields: [
    defineField({
      name: 'eyebrow',
      title: 'Eyebrow',
      type: 'string',
      initialValue: 'HOW WE BUILD IT',
    }),
    defineField({
      name: 'intro',
      title: 'Intro',
      type: 'string',
      initialValue: 'From brief to launch in',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'highlight',
      title: 'Highlighted text',
      type: 'string',
      initialValue: '6-14 weeks.',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'items',
      title: 'Steps',
      type: 'array',
      validation: (Rule) => Rule.required().min(1),
      of: [
        {
          type: 'object',
          fields: [
            defineField({
              name: 'title',
              title: 'Title',
              type: 'string',
              validation: (Rule) => Rule.required(),
            }),
            defineField({
              name: 'duration',
              title: 'Duration label',
              type: 'string',
            }),
            defineField({
              name: 'body',
              title: 'Body',
              type: 'text',
              rows: 4,
              validation: (Rule) => Rule.required(),
            }),
          ],
          preview: {
            select: {
              title: 'title',
              subtitle: 'duration',
            },
          },
        },
      ],
    }),
    defineField({
      name: 'visual',
      title: 'Visual',
      type: 'image',
      options: {hotspot: true},
      description: 'Optional supporting visual shown beside the timeline on larger screens.',
    }),
    defineField({
      name: 'visualAlt',
      title: 'Visual alt text',
      type: 'string',
      hidden: ({parent}) => !parent?.visual,
      validation: (Rule) =>
        Rule.custom((value, context) => {
          const parent = context.parent as {visual?: unknown} | undefined
          if (parent?.visual && !value) {
            return 'Alt text is required when a visual is provided.'
          }
          return true
        }),
    }),
  ],
  preview: {
    select: {
      title: 'eyebrow',
      subtitle: 'highlight',
      media: 'visual',
    },
    prepare: ({title, subtitle, media}) => ({
      title: title || 'Steps',
      subtitle,
      media,
    }),
  },
})
