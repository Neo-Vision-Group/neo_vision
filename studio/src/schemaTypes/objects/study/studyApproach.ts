import { defineType, defineField } from 'sanity'

export const studyApproach = defineType({
  name: 'studyApproach',
  title: 'Study Approach',
  description: 'Approach section for case study detail page',
  type: 'object',
  fields: [
    defineField({
      name: 'eyebrow',
      title: 'Eyebrow',
      type: 'string',
      initialValue: 'OUR APPROACH'
    }),
    defineField({
      name: 'heading',
      title: 'Heading',
      type: 'object',
      fields: [
        defineField({
          name: 'faded',
          title: 'Faded Text',
          type: 'string'
        }),
        defineField({
          name: 'bold',
          title: 'Bold Text',
          type: 'string',
          validation: (Rule) => Rule.required()
        })
      ]
    }),
    defineField({
      name: 'body',
      title: 'Body',
      type: 'text'
    }),
    defineField({
      name: 'callout',
      title: 'Callout',
      type: 'object',
      fields: [
        defineField({
          name: 'label',
          title: 'Label',
          type: 'string',
          initialValue: 'Approach'
        }),
        defineField({
          name: 'body',
          title: 'Body',
          type: 'text'
        })
      ]
    })
  ],
  preview: {
    select: {
      heading: 'heading'
    },
    prepare: ({ heading }) => ({
      title: 'Study Approach',
      subtitle: `${heading?.faded} ${heading?.bold}`
    })
  }
})
