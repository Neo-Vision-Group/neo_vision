import { defineType, defineField } from 'sanity'

export const studyTestimonial = defineType({
  name: 'studyTestimonial',
  title: 'Study Testimonial',
  description: 'Testimonial section for case study detail page',
  type: 'object',
  fields: [
    defineField({
      name: 'eyebrow',
      title: 'Eyebrow',
      type: 'string',
      initialValue: 'TESTIMONIAL'
    }),
    defineField({
      name: 'quote',
      title: 'Quote',
      type: 'object',
      fields: [
        defineField({
          name: 'quote',
          title: 'Quote Text',
          type: 'text',
          validation: (Rule) => Rule.required()
        }),
        defineField({
          name: 'attribution',
          title: 'Attribution',
          type: 'string',
          validation: (Rule) => Rule.required()
        }),
        defineField({
          name: 'source',
          title: 'Source',
          type: 'string'
        }),
        defineField({
          name: 'accent',
          title: 'Accent Style',
          type: 'boolean',
          initialValue: false
        })
      ]
    })
  ],
  preview: {
    select: {
      quote: 'quote'
    },
    prepare: ({ quote }) => ({
      title: 'Study Testimonial',
      subtitle: quote?.attribution
    })
  }
})
