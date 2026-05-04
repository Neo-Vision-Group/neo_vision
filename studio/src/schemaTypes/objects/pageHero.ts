import { defineType, defineField } from 'sanity'

export const pageHero = defineType({
  name: 'pageHero',
  title: 'Page Hero',
  description: 'Standard page hero with eyebrow, heading, and optional subheading.',
  type: 'object',
  fields: [
    defineField({
      name: 'eyebrow',
      title: 'Eyebrow',
      type: 'string',
      description: 'Small text above the heading (optional)',
    }),
    defineField({
      name: 'heading',
      title: 'Heading',
      type: 'blockContentTextOnly',
      description: 'Headline text (supports inline styling via portable text)',
    }),
    defineField({
      name: 'subheading',
      title: 'Subheading',
      type: 'text',
      rows: 3,
      description: 'Optional supporting text below the heading',
    }),
    defineField({
      name: 'stats',
      title: 'Stat Cards',
      type: 'array',
      description: 'Optional statistics to display with counting animation',
      of: [
        {
          type: 'object',
          fields: [
            defineField({
              name: 'number',
              title: 'Number',
              type: 'number',
              description: 'The target number for the counting animation',
              validation: (Rule) => Rule.required(),
            }),
            defineField({
              name: 'suffix',
              title: 'Suffix',
              type: 'string',
              description: 'Optional suffix (e.g., "+", "%", "K", "M")',
            }),
            defineField({
              name: 'label',
              title: 'Label',
              type: 'string',
              description: 'Description text below the number',
              validation: (Rule) => Rule.required(),
            }),
          ],
          preview: {
            select: {
              number: 'number',
              suffix: 'suffix',
              label: 'label',
            },
            prepare({ number, suffix, label }) {
              return {
                title: `${number}${suffix || ''} - ${label}`,
              }
            },
          },
        },
      ],
    }),
    defineField({
      name: 'featured',
      title: 'Featured Case Study',
      type: 'reference',
      to: [{ type: 'project' }, { type: 'post' }],
      description: 'Optional featured case study to display as a card in the hero',
    }),
  ],
  preview: {
    select: {
      heading: 'heading',
      eyebrow: 'eyebrow',
    },
    prepare({ heading, eyebrow }) {
      const firstBlock = Array.isArray(heading) ? heading[0] : null
      const title = firstBlock?.children?.map((c: { text?: string }) => c.text).join('') || 'Page Hero'
      return {
        title,
        subtitle: eyebrow || 'Standard page hero',
      }
    },
  },
})
