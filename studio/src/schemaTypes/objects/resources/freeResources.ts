import {defineField, defineType} from 'sanity'

export const freeResources = defineType({
  name: 'freeResources',
  title: 'Free Resources',
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
      name: 'items',
      title: 'Resources',
      type: 'array',
      of: [
        defineField({
          name: 'resource',
          type: 'object',
          fields: [
            defineField({name: 'title', type: 'string', validation: (Rule) => Rule.required()}),
            defineField({name: 'description', type: 'text'}),
            defineField({
              name: 'file',
              title: 'File',
              type: 'file',
              description: 'Upload a file to download. Takes priority over external URL.',
            }),
            defineField({
              name: 'externalUrl',
              title: 'External URL',
              type: 'url',
              description: 'Use if the resource is hosted elsewhere.',
            }),
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