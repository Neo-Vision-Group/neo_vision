import {defineField, defineType} from 'sanity'

export const insightsResources = defineType({
  name: 'insightsResources',
  title: 'Insights Resources',
  type: 'object',
  fields: [
    defineField({
      name: 'eyebrow',
      title: 'Eyebrow',
      type: 'string',
    }),
    defineField({
      name: 'heading',
      title: 'Heading',
      type: 'object',
      fields: [
        defineField({name: 'faded', type: 'string'}),
        defineField({name: 'bold', type: 'string'}),
      ],
    }),
    defineField({
      name: 'body',
      title: 'Body',
      type: 'text',
    }),
    defineField({
      name: 'items',
      title: 'Resources',
      type: 'array',
      of: [
        defineField({
          name: 'resource',
          type: 'object',
          fields: [
            defineField({name: 'title', type: 'string', validation: (Rule) => Rule.required()}),
            defineField({name: 'category', type: 'string'}),
            defineField({name: 'description', type: 'text'}),
            defineField({name: 'iconLetter', type: 'string'}),
            defineField({name: 'downloadUrl', type: 'url'}),
            defineField({name: 'externalUrl', type: 'url'}),
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
        title: 'Free Resources',
        subtitle: `${items?.length || 0} items`,
      }
    },
  },
})
