import {defineField, defineType} from 'sanity'

export const pricing = defineType({
  name: 'pricing',
  title: 'Pricing',
  description: 'Reusable pricing section for any page-builder document.',
  type: 'object',
  fields: [
    defineField({
      name: 'eyebrow',
      title: 'Eyebrow',
      type: 'string',
      initialValue: 'PRICING',
    }),
    defineField({
      name: 'headingPrimary',
      title: 'Heading Primary',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'headingSecondary',
      title: 'Heading Secondary',
      type: 'string',
      description: 'Muted continuation of the heading, shown after the primary copy.',
    }),
    defineField({
      name: 'tiers',
      title: 'Pricing Cards',
      type: 'array',
      validation: (Rule) => Rule.required().min(1).max(4),
      of: [
        defineField({
          name: 'tier',
          title: 'Pricing Card',
          type: 'object',
          fields: [
            defineField({
              name: 'width',
              title: 'Card Width',
              type: 'string',
              initialValue: 'half',
              options: {
                list: [
                  {title: 'Half width', value: 'half'},
                  {title: 'Full width', value: 'full'},
                ],
                layout: 'radio',
              },
              validation: (Rule) => Rule.required(),
            }),
            defineField({
              name: 'priceLayout',
              title: 'Price Layout',
              type: 'string',
              initialValue: 'stacked',
              options: {
                list: [
                  {title: 'Stacked price', value: 'stacked'},
                  {title: 'Split title + price', value: 'split'},
                  {title: 'Inline price + meta', value: 'inline'},
                ],
                layout: 'radio',
              },
              validation: (Rule) => Rule.required(),
            }),
            defineField({
              name: 'badge',
              title: 'Badge',
              type: 'string',
              description: 'Optional small label shown above the title.',
            }),
            defineField({
              name: 'title',
              title: 'Title',
              type: 'string',
              validation: (Rule) => Rule.required(),
            }),
            defineField({
              name: 'price',
              title: 'Price',
              type: 'string',
              validation: (Rule) => Rule.required(),
            }),
            defineField({
              name: 'meta',
              title: 'Meta',
              type: 'string',
              description:
                'Optional secondary pricing detail such as duration. Used in the inline price layout.',
            }),
            defineField({
              name: 'description',
              title: 'Description',
              type: 'text',
              rows: 4,
            }),
            defineField({
              name: 'ctaStyle',
              title: 'CTA Style',
              type: 'string',
              initialValue: 'textLink',
              options: {
                list: [
                  {title: 'Text link', value: 'textLink'},
                  {title: 'Filled button', value: 'button'},
                ],
                layout: 'radio',
              },
              validation: (Rule) => Rule.required(),
            }),
            defineField({
              name: 'cta',
              title: 'CTA',
              type: 'button',
            }),
          ],
          preview: {
            select: {
              title: 'title',
              price: 'price',
              width: 'width',
              layout: 'priceLayout',
            },
            prepare({title, price, width, layout}) {
              const details = [width, layout, price].filter(Boolean).join(' • ')
              return {
                title: title || 'Pricing card',
                subtitle: details,
              }
            },
          },
        }),
      ],
    }),
  ],
  preview: {
    select: {
      title: 'eyebrow',
      headingPrimary: 'headingPrimary',
      headingSecondary: 'headingSecondary',
    },
    prepare({title, headingPrimary, headingSecondary}) {
      return {
        title: title || 'Pricing',
        subtitle: [headingPrimary, headingSecondary].filter(Boolean).join(' '),
      }
    },
  },
})
