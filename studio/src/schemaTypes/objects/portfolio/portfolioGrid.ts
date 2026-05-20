import { defineType, defineField } from 'sanity'

export const portfolioGrid = defineType({
  name: 'portfolioGrid',
  title: 'Portfolio Grid',
  description: 'Filterable grid of case studies for the portfolio page',
  type: 'object',
  fields: [
    defineField({
      name: 'items',
      title: 'Case Studies',
      description: 'Filters are automatically populated from the selected case studies',
      type: 'array',
      of: [
        {
          type: 'reference',
          to: [{ type: 'project' }]
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
      title: 'Portfolio Grid',
      subtitle: `${items?.length || 0} case studies`
    })
  }
})
