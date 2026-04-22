import {defineField, defineType} from 'sanity'

export const insightsGrid = defineType({
  name: 'insightsGrid',
  title: 'Insights Grid',
  type: 'object',
  fields: [
    defineField({
      name: 'items',
      title: 'Insights',
      type: 'array',
      of: [{type: 'reference', to: [{type: 'post'}]}],
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'categoryFilters',
      title: 'Category Filters',
      type: 'array',
      of: [
        defineField({
          name: 'filter',
          type: 'object',
          fields: [
            defineField({name: 'label', type: 'string', validation: (Rule) => Rule.required()}),
            defineField({name: 'value', type: 'string', validation: (Rule) => Rule.required()}),
          ],
        }),
      ],
    }),
  ],
  preview: {
    select: {
      items: 'items',
    },
    prepare({items}) {
      return {
        title: 'Insights Grid',
        subtitle: `${items?.length || 0} items`,
      }
    },
  },
})
