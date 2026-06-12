import {defineArrayMember, defineField, defineType} from 'sanity'

const highlightCard = defineArrayMember({
  type: 'object',
  fields: [
    defineField({
      name: 'value',
      title: 'Value',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'label',
      title: 'Label',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
  ],
  preview: {
    select: {
      title: 'value',
      subtitle: 'label',
    },
  },
})

export const serviceHero = defineType({
  name: 'serviceHero',
  title: 'Service Hero',
  description:
    'Service detail hero with breadcrumb trail, multi-line headline, supporting copy, CTA, and the before/after CTA highlight cards from the Figma design.',
  type: 'object',
  initialValue: {
    breadcrumb: {
      rootLabel: 'Services',
    },
  },
  fields: [
    defineField({
      name: 'breadcrumb',
      title: 'Breadcrumb',
      type: 'object',
      description:
        'Optional breadcrumb overrides. Leave category/current blank to fall back to the parent service metadata.',
      fields: [
        defineField({
          name: 'rootLabel',
          title: 'Root Label',
          type: 'string',
          initialValue: 'Services',
        }),
        defineField({
          name: 'categoryLabel',
          title: 'Category Label',
          type: 'string',
        }),
        defineField({
          name: 'currentLabel',
          title: 'Current Label',
          type: 'string',
        }),
      ],
    }),
    defineField({
      name: 'eyebrow',
      title: 'Eyebrow',
      type: 'string',
      description: 'Small clash label above the headline.',
    }),
    defineField({
      name: 'headlineLines',
      title: 'Headline Lines',
      type: 'array',
      description: '1-3 stacked headline lines. Leave empty to fall back to the service name.',
      validation: (Rule) => Rule.max(3),
      of: [
        defineArrayMember({
          type: 'string',
          validation: (Rule) => Rule.required(),
        }),
      ],
    }),
    defineField({
      name: 'description',
      title: 'Description',
      type: 'text',
      rows: 3,
      description: 'Supporting copy below the headline.',
    }),
    defineField({
      name: 'cta',
      title: 'Primary CTA',
      type: 'button',
      description: 'Displayed between the leading and trailing highlight cards.',
    }),
    defineField({
      name: 'leadingHighlights',
      title: 'Highlights Before CTA',
      type: 'array',
      description: 'Cards rendered before the CTA on desktop.',
      of: [highlightCard],
    }),
    defineField({
      name: 'trailingHighlights',
      title: 'Highlights After CTA',
      type: 'array',
      description: 'Cards rendered after the CTA on desktop.',
      of: [highlightCard],
    }),
  ],
  preview: {
    select: {
      headlineLines: 'headlineLines',
      eyebrow: 'eyebrow',
      currentLabel: 'breadcrumb.currentLabel',
    },
    prepare({headlineLines, eyebrow, currentLabel}) {
      const title =
        headlineLines?.filter(Boolean)?.join(' / ') || currentLabel || 'Service Hero'

      return {
        title,
        subtitle: eyebrow || 'Service detail hero',
      }
    },
  },
})
