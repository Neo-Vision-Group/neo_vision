import { defineType, defineField } from 'sanity'

export const studyHeroImage = defineType({
  name: 'studyHeroImage',
  title: 'Study Hero Image',
  description: 'Hero image for case study detail page',
  type: 'object',
  fields: [
    defineField({
      name: 'image',
      title: 'Image',
      type: 'image',
      options: { hotspot: true },
      validation: (Rule) => Rule.required()
    }),
    defineField({
      name: 'alt',
      title: 'Alt Text',
      type: 'string'
    })
  ],
  preview: {
    select: {
      image: 'image',
      alt: 'alt'
    },
    prepare: ({ image, alt }) => ({
      title: 'Study Hero Image',
      subtitle: alt ?? 'Hero image'
    })
  }
})
