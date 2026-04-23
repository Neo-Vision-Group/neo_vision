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
      name: 'headingType',
      title: 'Heading Type',
      type: 'string',
      options: {
        list: [
          { title: 'Simple (single style)', value: 'simple' },
          { title: 'Multi-part (faded + bold + trailing)', value: 'multipart' },
        ],
        layout: 'radio',
      },
      initialValue: 'simple',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'heading',
      title: 'Heading (Simple)',
      type: 'string',
      description: 'Full-weight headline text',
      hidden: ({ parent }) => parent?.headingType !== 'simple',
      validation: (Rule) =>
        Rule.custom((value, context) => {
          const parent = context.parent as any
          if (parent?.headingType === 'simple' && !value) {
            return 'Heading is required when using Simple heading type'
          }
          return true
        }),
    }),
    defineField({
      name: 'headingMultipart',
      title: 'Heading (Multi-part)',
      type: 'object',
      description: 'Headline with multiple text styles',
      hidden: ({ parent }) => parent?.headingType !== 'multipart',
      fields: [
        defineField({
          name: 'faded',
          title: 'Faded Text',
          type: 'string',
          description: 'First part with 70% opacity (optional)',
        }),
        defineField({
          name: 'regular',
          title: 'Regular Text',
          type: 'string',
          description: 'Regular weight text (optional)',
        }),
        defineField({
          name: 'bold',
          title: 'Bold Text',
          type: 'string',
          description: 'Bold weight text (optional)',
        }),
        defineField({
          name: 'trailing',
          title: 'Trailing Text',
          type: 'string',
          description: 'Third line with 70% opacity (optional)',
        }),
      ],
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
      headingType: 'headingType',
      heading: 'heading',
      multipart: 'headingMultipart',
      eyebrow: 'eyebrow',
    },
    prepare({ headingType, heading, multipart, eyebrow }) {
      const title =
        headingType === 'simple'
          ? heading
          : [multipart?.faded, multipart?.regular, multipart?.bold, multipart?.trailing]
              .filter(Boolean)
              .join(' ')
      return {
        title: title || 'Page Hero',
        subtitle: eyebrow || 'Standard page hero',
      }
    },
  },
})
