import { defineType, defineField } from 'sanity'

export const contactHero = defineType({
  name: 'contactHero',
  title: 'Contact Hero',
  description: 'Hero section for contact page with faded/bold heading structure.',
  type: 'object',
  fields: [
    defineField({
      name: 'eyebrow',
      title: 'Eyebrow',
      type: 'string',
      initialValue: "LET'S TALK",
    }),
    defineField({
      name: 'heading',
      title: 'Heading',
      type: 'text',
      rows: 2,
      description: 'Main heading (use \\n for line breaks)',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'description',
      title: 'Description',
      type: 'text',
      rows: 3,
      validation: (Rule) => Rule.required(),
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
      name: 'steps',
      title: 'Process Steps',
      type: 'array',
      of: [
        {
          type: 'object',
          fields: [
            defineField({
              name: 'title',
              title: 'Step Title',
              type: 'string',
              validation: (Rule) => Rule.required(),
            }),
            defineField({
              name: 'description',
              title: 'Step Description',
              type: 'text',
              rows: 2,
              validation: (Rule) => Rule.required(),
            }),
          ],
          preview: {
            select: {
              title: 'title',
              description: 'description',
            },
            prepare({ title, description }) {
              return {
                title: title || 'Step',
                subtitle: description,
              }
            },
          },
        },
      ],
      validation: (Rule) => Rule.required().min(3).max(3),
    }),
    defineField({
      name: 'formConfig',
      title: 'Form Configuration',
      type: 'object',
      fields: [
        defineField({
          name: 'services',
          title: 'Service Options',
          type: 'array',
          of: [{ type: 'string' }],
          description: 'List of services for the dropdown',
        }),
        defineField({
          name: 'budgetRanges',
          title: 'Budget Range Options',
          type: 'array',
          of: [{ type: 'string' }],
        }),
        defineField({
          name: 'timelines',
          title: 'Timeline Options',
          type: 'array',
          of: [{ type: 'string' }],
        }),
        defineField({
          name: 'hearAboutUs',
          title: 'How Did You Hear About Us Options',
          type: 'array',
          of: [{ type: 'string' }],
        }),
      ],
    }),
  ],
  preview: {
    select: {
      heading: 'heading',
      eyebrow: 'eyebrow',
    },
    prepare({ heading, eyebrow }) {
      return {
        title: 'Contact Hero',
        subtitle: eyebrow || 'Contact page hero with form',
      }
    },
  },
})
