import { defineType, defineField } from 'sanity'

export const studyMoreLikeThis = defineType({
  name: 'studyMoreLikeThis',
  title: 'Study More Like This',
  description: 'More like this section for case study detail page',
  type: 'object',
  fields: [
    defineField({
      name: 'heading',
      title: 'Heading',
      type: 'object',
      fields: [
        defineField({
          name: 'regular',
          title: 'Regular Text',
          type: 'string',
          initialValue: 'More work like'
        }),
        defineField({
          name: 'bold',
          title: 'Bold Text',
          type: 'string',
          initialValue: 'this.'
        })
      ]
    }),
    defineField({
      name: 'items',
      title: 'Related Case Studies',
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
      title: 'Study More Like This',
      subtitle: `${items?.length || 0} related projects`
    })
  }
})
