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
          name: 'resource',
          type: 'object',
          fields: [
            defineField({name: 'title', type: 'string', validation: (Rule) => Rule.required()}),
            defineField({
              name: 'badge',
              title: 'Badge',
              type: 'string',
              description: 'Optional short label like "Email required".',
            }),
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
              validation: (Rule) =>
                Rule.uri({scheme: ['http', 'https']}).custom((value, context) => {
                  const parent = context.parent as {file?: unknown; emailIt?: boolean} | undefined
                  // An emailable resource must have a downloadable source: either an
                  // uploaded file or an external URL (feeds the /api/resource email flow).
                  if (parent?.emailIt && !parent.file && !value) {
                    return 'Provide a file or an external URL for an emailable resource.'
                  }
                  return true
                }),
            }),
            defineField({
              name: 'emailIt',
              title: 'Email this resource',
              type: 'boolean',
              options: {
                layout: 'checkbox' 
              },
              description: 'Check this box if you want this resource to be sent through email instead of directly accessed.'
            })
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
