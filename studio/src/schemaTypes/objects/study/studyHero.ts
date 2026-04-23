import { defineType, defineField } from 'sanity'

export const studyHero = defineType({
  name: 'studyHero',
  title: 'Study Hero',
  description: 'Hero section for case study detail page with text and image',
  type: 'object',
  fields: [
    defineField({
      name: 'eyebrow',
      title: 'Eyebrow',
      type: 'string',
      description: 'Category and year (e.g., "FinTech · 2024")'
    }),
    defineField({
      name: 'heading',
      title: 'Heading',
      type: 'string',
      validation: (Rule) => Rule.required()
    }),
    defineField({
      name: 'subheading',
      title: 'Subheading',
      type: 'string'
    }),
    defineField({
      name: 'chapters',
      title: 'Chapters',
      type: 'array',
      of: [{ type: 'string' }],
      description: 'Optional chapter navigation items'
    }),
    defineField({
      name: 'heroImage',
      title: 'Hero Image',
      type: 'image',
      options: { hotspot: true }
    })
  ],
  preview: {
    select: {
      heading: 'heading',
      eyebrow: 'eyebrow',
      media: 'heroImage'
    },
    prepare: ({ heading, eyebrow, media }) => ({
      title: heading ?? 'Study Hero',
      subtitle: eyebrow ?? 'Hero section',
      media
    })
  }
})