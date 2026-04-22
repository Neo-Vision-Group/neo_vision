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
      type: 'array',
      of: [
        {
          type: 'reference',
          to: [{ type: 'project' }]
        }
      ],
      validation: (Rule) => Rule.required()
    }),
    defineField({
      name: 'serviceFilters',
      title: 'Service Filters',
      type: 'array',
      of: [
        {
          type: 'object',
          fields: [
            defineField({
              name: 'label',
              title: 'Label',
              type: 'string',
              validation: (Rule) => Rule.required()
            }),
            defineField({
              name: 'value',
              title: 'Value',
              type: 'string',
              validation: (Rule) => Rule.required()
            })
          ]
        }
      ]
    }),
    defineField({
      name: 'industryFilters',
      title: 'Industry Filters',
      type: 'array',
      of: [
        {
          type: 'object',
          fields: [
            defineField({
              name: 'label',
              title: 'Label',
              type: 'string',
              validation: (Rule) => Rule.required()
            }),
            defineField({
              name: 'value',
              title: 'Value',
              type: 'string',
              validation: (Rule) => Rule.required()
            })
          ]
        }
      ]
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
