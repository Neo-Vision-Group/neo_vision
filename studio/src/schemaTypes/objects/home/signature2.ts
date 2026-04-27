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
            defineField({
              name: 'graphic',
              title: 'Card Graphic',
              type: 'image',
              hidden: ({parent}) => !parent?.highlighted,
              description:
                'Optional black-and-white line graphic for the highlighted card. White lines render red on the frontend.',
            }),
          ],
          preview: {
            select: {
              title: 'title',
              highlighted: 'highlighted',
              graphic: 'graphic',
            },
            prepare({title, highlighted, graphic}) {
              return {
                title: title || 'Untitled step',
                subtitle: highlighted ? 'Highlighted' : 'Standard',
                media: graphic,
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
