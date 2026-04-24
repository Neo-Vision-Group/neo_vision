import {defineField, defineType} from 'sanity'

export const press = defineType({
  name: 'press',
  title: 'Press',
  description: 'Displays a press and media callout card with a downloadable press kit CTA.',
  type: 'object',
  fields: [
    defineField({
      name: 'eyebrow',
      title: 'Eyebrow',
      type: 'string',
      initialValue: 'PRESS & MEDIA',
    }),
    defineField({
      name: 'heading',
      title: 'Heading',
      type: 'string',
      validation: (Rule) => Rule.required(),
      initialValue: "How we're different.",
    }),
    defineField({
      name: 'cardTitle',
      title: 'Card Title',
      type: 'string',
      validation: (Rule) => Rule.required(),
      initialValue: 'Press Kit',
    }),
    defineField({
      name: 'cardBody',
      title: 'Card Body',
      type: 'text',
      rows: 3,
      validation: (Rule) => Rule.required(),
      initialValue:
        'Brand assets, company boilerplate, founder bio, key statistics, and media contact.',
    }),
    defineField({
      name: 'ctaLabel',
      title: 'CTA Label',
      type: 'string',
      validation: (Rule) => Rule.required(),
      initialValue: 'Download press kit',
    }),
    defineField({
      name: 'file',
      title: 'Press Kit File',
      type: 'file',
      description: 'Upload the file that should download when visitors click the CTA.',
      validation: (Rule) => Rule.required(),
    }),
  ],
  preview: {
    select: {
      title: 'heading',
      subtitle: 'ctaLabel',
    },
    prepare: ({title, subtitle}) => ({
      title: title ?? 'Press',
      subtitle,
    }),
  },
})
