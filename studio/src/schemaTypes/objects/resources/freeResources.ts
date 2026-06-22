import {defineField, defineType} from 'sanity'

export const freeResources = defineType({
  name: 'freeResources',
  title: 'Free Resources',
  description: 'Resource download grid with optional files, links, and supporting copy.',
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
        defineField({name: 'regular', type: 'string'}),
        defineField({name: 'trailing', type: 'string'}),
      ],
    }),
    defineField({
      name: 'body',
      title: 'Body',
      type: 'text',
    }),
    defineField({
      name: 'footnote',
      title: 'Footnote',
      type: 'text',
      description: 'Optional closing note shown below the resource grid.',
      rows: 3,
    }),
    defineField({
      name: 'items',
      title: 'Resources',
      type: 'array',
      of: [
        defineField({
          name: 'freeResourceItem',
          title: 'Free Resource Item',
          type: 'reference',
          to: [{type: 'freeResource'}],
        })
      ]
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
