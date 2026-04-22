import { defineType, defineField } from 'sanity'

export const portfolioCta = defineType({
  name: 'portfolioCta',
  title: 'Portfolio CTA',
  description: 'Industry CTA section for the portfolio page',
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
      type: 'text',
      validation: (Rule) => Rule.required()
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
      title: 'Portfolio CTA',
      subtitle: `${heading?.regular} ${heading?.bold}`
    })
  }
})
