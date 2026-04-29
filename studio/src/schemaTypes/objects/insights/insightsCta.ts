import {defineField, defineType} from 'sanity'

export const insightsCta = defineType({
  name: 'insightsCta',
  title: 'Insights CTA',
  description: 'Closing call-to-action section used on insights pages and articles.',
  type: 'object',
  fields: [
    defineField({
      name: 'heading',
      title: 'Heading',
      type: 'object',
      fields: [
        defineField({name: 'regular', type: 'string'}),
        defineField({name: 'bold', type: 'string'}),
      ],
    }),
    defineField({
      name: 'body',
      title: 'Body',
      type: 'text',
    }),
    defineField({
      name: 'cta',
      title: 'CTA',
      type: 'object',
      fields: [
        defineField({name: 'label', type: 'string'}),
        defineField({name: 'href', type: 'string'}),
      ],
    }),
  ],
  preview: {
    select: {
      heading: 'heading',
    },
    prepare({heading}) {
      return {
        title: 'Question CTA',
        subtitle: heading?.regular || 'CTA',
      }
    },
  },
})
