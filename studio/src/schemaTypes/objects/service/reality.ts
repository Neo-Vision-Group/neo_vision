import {defineField, defineType} from 'sanity'

export const reality = defineType({
  name: 'reality',
  title: 'Reality It',
  description: 'Displays a heading with fading, body text, and point cards.',
  type: 'object',
  fields: [
    defineField({
      name: 'eyebrow',
      title: 'Eyebrow',
      type: 'string',
      initialValue: 'WHY IT COMPOUNDS',
    }),
    defineField({
      name: 'heading',
      title: 'Heading',
      type: 'object',
      fields: [
        defineField({
          name: 'faded',
          title: 'Faded',
          type: 'string',
        }),
        defineField({
          name: 'bold',
          title: 'Bold',
          type: 'string',
          validation: (Rule) => Rule.required(),
        }),
      ],
    }),
    defineField({
      name: 'body',
      title: 'Body',
      type: 'text',
    }),
    defineField({
      name: 'points',
      title: 'Points',
      type: 'array',
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
              name: 'body',
              title: 'Body',
              type: 'text',
            }),
          ],
        },
      ],
    }),
    defineField({
      name: 'cta',
      title: 'CTA',
      type: 'button',
    }),
  ],
})