import {defineField, defineType} from 'sanity'

export const insightsFeatured = defineType({
  name: 'insightsFeatured',
  title: 'Insights Featured',
  description: 'Single featured insight card for editorial landing pages.',
  type: 'object',
  fields: [
    defineField({
      name: 'insight',
      title: 'Featured Insight',
      type: 'reference',
      to: [{type: 'post'}],
      validation: (Rule) => Rule.required(),
    }),
  ],
  preview: {
    select: {
      insight: 'insight.title',
    },
    prepare({insight}) {
      return {
        title: 'Featured Insight',
        subtitle: insight,
      }
    },
  },
})
