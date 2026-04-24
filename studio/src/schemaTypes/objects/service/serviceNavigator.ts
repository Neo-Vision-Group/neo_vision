import {defineArrayMember, defineField, defineType} from 'sanity'

export const serviceNavigator = defineType({
  name: 'serviceNavigator',
  title: 'Service Navigator',
  description:
    'Decision-style "What We Do" section for the services listing page, based on the demo and Figma layout.',
  type: 'object',
  fields: [
    defineField({
      name: 'eyebrow',
      title: 'Eyebrow',
      type: 'string',
      initialValue: 'WHAT WE DO',
    }),
    defineField({
      name: 'headingRegular',
      title: 'Heading Regular',
      type: 'string',
      initialValue: 'Not sure which service you need?',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'headingBold',
      title: 'Heading Bold',
      type: 'string',
      initialValue: 'Start here.',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'cards',
      title: 'Cards',
      type: 'array',
      of: [
        defineArrayMember({
          type: 'object',
          fields: [
            defineField({
              name: 'prompt',
              title: 'Prompt',
              type: 'string',
              validation: (Rule) => Rule.required(),
            }),
            defineField({
              name: 'details',
              title: 'Details',
              type: 'string',
            }),
            defineField({
              name: 'cta',
              title: 'CTA',
              type: 'button',
              validation: (Rule) => Rule.required(),
            }),
          ],
          preview: {
            select: {
              title: 'prompt',
              subtitle: 'cta.buttonText',
            },
          },
        }),
      ],
      validation: (Rule) => Rule.required().min(1).max(5),
    }),
    defineField({
      name: 'closingText',
      title: 'Closing Text',
      type: 'text',
      rows: 2,
      initialValue: "Still unsure? Book a 30-min call - we'll figure it out together",
    }),
    defineField({
      name: 'closingCta',
      title: 'Closing CTA',
      type: 'button',
      validation: (Rule) => Rule.required(),
    }),
  ],
  preview: {
    select: {
      title: 'headingRegular',
      subtitle: 'headingBold',
    },
    prepare: ({title, subtitle}) => ({
      title: 'Service Navigator',
      subtitle: [title, subtitle].filter(Boolean).join(' '),
    }),
  },
})
