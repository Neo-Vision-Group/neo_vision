import { defineType, defineField } from 'sanity'

export const studyClosingCta = defineType({
  name: 'studyClosingCta',
  title: 'Study Closing CTA',
  description: 'Closing CTA section for case study detail page',
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
          validation: (Rule) => Rule.required()
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
      title: 'Body Text',
      type: 'text'
    }),
    defineField({
      name: 'cta',
      title: 'CTA Button',
      type: 'button'
    })
  ],
  preview: {
    select: {
      heading: 'heading'
    },
    prepare: ({ heading }) => ({
      title: 'Study Closing CTA',
      subtitle: `${heading?.regular} ${heading?.bold}`
    })
  }
})
