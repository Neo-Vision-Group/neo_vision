import {defineField, defineType} from 'sanity'

export const signature2 = defineType({
  name: 'signature2',
  title: 'Signature 2',
  description:
    'Alternative signature section with a split heading, horizontal step rail, and single CTA.',
  type: 'object',
  fields: [
    defineField({
      name: 'eyebrow',
      type: 'string',
      initialValue: 'OUR SIGNATURE MODEL',
    }),
    defineField({
      name: 'headingFaded',
      title: 'Heading (Faded Line)',
      type: 'string',
    }),
    defineField({
      name: 'headingBold',
      title: 'Heading (Bold Line)',
      type: 'string',
    }),
    defineField({
      name: 'body',
      type: 'text',
      rows: 4,
    }),
    defineField({
      name: 'steps',
      type: 'array',
      of: [
        defineField({
          name: 'step',
          type: 'object',
          fields: [
            defineField({name: 'title', type: 'string'}),
            defineField({
              name: 'highlighted',
              title: 'Highlighted card',
              type: 'boolean',
              initialValue: false,
            }),
          ],
          preview: {
            select: {
              title: 'title',
              highlighted: 'highlighted',
            },
            prepare({title, highlighted}) {
              return {
                title: title || 'Untitled step',
                subtitle: highlighted ? 'Highlighted' : 'Standard',
              }
            },
          },
        }),
      ],
      validation: (Rule) => Rule.max(4),
    }),
    defineField({
      name: 'cta',
      type: 'button',
    }),
  ],
})
