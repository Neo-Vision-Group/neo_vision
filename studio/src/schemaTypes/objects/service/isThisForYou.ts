import {defineType, defineField} from 'sanity'

export const isThisForYou = defineType({
  name: 'isThisForYou',
  title: 'Is This For You?',
  description: 'Target audience section for service detail page',
  type: 'object',
  fields: [
    defineField({
      name: 'eyebrow',
      title: 'Eyebrow',
      type: 'string',
      initialValue: 'IS THIS FOR YOU?'
    }),
    defineField({
      name: 'heading',
      title: 'Heading',
      type: 'string',
      validation: (Rule) => Rule.required()
    }),
    defineField({
      name: 'items',
      title: 'Items',
      type: 'array',
      of: [
        {
          type: 'object',
          fields: [
            defineField({
              name: 'text',
              title: 'Text',
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
      heading: 'heading'
    },
    prepare: ({heading}) => ({
      title: 'Is This For You?',
      subtitle: heading
    })
  }
})