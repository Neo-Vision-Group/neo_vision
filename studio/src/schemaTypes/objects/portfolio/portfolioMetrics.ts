import { defineType, defineField } from 'sanity'

export const portfolioMetrics = defineType({
  name: 'portfolioMetrics',
  title: 'Portfolio Metrics',
  description: 'Metrics strip for the portfolio page',
  type: 'object',
  fields: [
    defineField({
      name: 'items',
      title: 'Metrics',
      type: 'array',
      of: [
        {
          type: 'object',
          fields: [
            defineField({
              name: 'value',
              title: 'Value',
              type: 'string',
              validation: (Rule) => Rule.required()
            }),
            defineField({
              name: 'label',
              title: 'Label',
              type: 'string',
              validation: (Rule) => Rule.required()
            })
          ]
        }
      ],
      validation: (Rule) => Rule.required()
    })
  ],
  preview: {
    select: {
      items: 'items'
    },
    prepare: ({ items }) => ({
      title: 'Portfolio Metrics',
      subtitle: `${items?.length || 0} metrics`
    })
  }
})
