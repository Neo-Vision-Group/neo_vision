import { defineType, defineField } from 'sanity'

export const studyHero = defineType({
  name: 'studyHero',
  title: 'Study Hero',
  description: 'Hero section for case study detail page with text, image, and metadata cards',
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
      name: 'details',
      title: 'Metadata Cards',
      type: 'array',
      description: 'Cards shown below the hero image, such as client, industry, services, timeline, and year.',
      of: [
        {
          type: 'object',
          fields: [
            defineField({
              name: 'label',
              title: 'Label',
              type: 'string',
              validation: (Rule) => Rule.required()
            }),
            defineField({
              name: 'value',
              title: 'Value',
              type: 'string',
              validation: (Rule) => Rule.required()
            })
          ],
          preview: {
            select: {
              title: 'label',
              subtitle: 'value'
            }
          }
        }
      ]
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
