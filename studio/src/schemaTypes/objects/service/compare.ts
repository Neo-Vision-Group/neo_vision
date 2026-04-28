import {defineArrayMember, defineField, defineType} from 'sanity'

const defaultRows = [
  {label: 'AI-native delivery'},
  {label: 'Production engineering'},
  {label: 'Embedded FDE model'},
  {label: 'Proven ROI first'},
  {label: 'Post-launch ownership'},
  {label: 'Price efficiency'},
]

const defaultColumns = [
  {
    name: 'Neo Vision',
    highlightColumn: true,
    values: [
      {available: true},
      {available: true},
      {available: true},
      {available: true},
      {available: true},
      {available: true},
    ],
  },
  {
    name: 'Big Consultancy',
    values: [
      {available: false},
      {available: false},
      {available: true},
      {available: false},
      {available: false},
      {available: false},
    ],
  },
  {
    name: 'Offshore Dev',
    values: [
      {available: false},
      {available: true},
      {available: false},
      {available: false},
      {available: false},
      {available: true},
    ],
  },
  {
    name: 'AI Consultancy',
    values: [
      {available: true},
      {available: false},
      {available: false},
      {available: false},
      {available: false},
      {available: false},
    ],
  },
  {
    name: 'Freelancers',
    values: [
      {available: false},
      {available: false},
      {available: false},
      {available: false},
      {available: false},
      {available: true},
    ],
  },
]

export const compare = defineType({
  name: 'compare',
  title: 'Compare',
  description: 'Comparison table for service detail pages.',
  type: 'object',
  initialValue: {
    eyebrow: 'HOW WE COMPARE',
    heading: {
      highlighted: 'Neo Vision',
      regular: 'vs the alternatives.',
    },
    rows: defaultRows,
    columns: defaultColumns,
    closing: {
      lead: "Not sure who you're comparing us against?",
      highlight: "Let's talk.",
      followup: "We'll be honest about whether we're the right fit.",
    },
  },
  fields: [
    defineField({
      name: 'eyebrow',
      title: 'Eyebrow',
      type: 'string',
      initialValue: 'HOW WE COMPARE',
    }),
    defineField({
      name: 'heading',
      title: 'Heading',
      type: 'object',
      validation: (Rule) => Rule.required(),
      fields: [
        defineField({
          name: 'highlighted',
          title: 'Highlighted Text',
          type: 'string',
          validation: (Rule) => Rule.required(),
        }),
        defineField({
          name: 'regular',
          title: 'Regular Text',
          type: 'string',
          validation: (Rule) => Rule.required(),
        }),
      ],
    }),
    defineField({
      name: 'rows',
      title: 'Rows',
      type: 'array',
      validation: (Rule) => Rule.required().min(1),
      of: [
        defineArrayMember({
          type: 'object',
          fields: [
            defineField({
              name: 'label',
              title: 'Label',
              type: 'string',
              validation: (Rule) => Rule.required(),
            }),
          ],
          preview: {
            select: {
              title: 'label',
            },
          },
        }),
      ],
    }),
    defineField({
      name: 'columns',
      title: 'Columns',
      type: 'array',
      validation: (Rule) => Rule.required().min(1),
      of: [
        defineArrayMember({
          type: 'object',
          fields: [
            defineField({
              name: 'name',
              title: 'Name',
              type: 'string',
              validation: (Rule) => Rule.required(),
            }),
            defineField({
              name: 'highlightColumn',
              title: 'Highlight Column',
              type: 'boolean',
              initialValue: false,
            }),
            defineField({
              name: 'values',
              title: 'Values',
              type: 'array',
              validation: (Rule) => Rule.required().min(1),
              of: [
                defineArrayMember({
                  type: 'object',
                  fields: [
                    defineField({
                      name: 'available',
                      title: 'Available',
                      type: 'boolean',
                      initialValue: false,
                    }),
                  ],
                  preview: {
                    select: {
                      available: 'available',
                    },
                    prepare: ({available}) => ({
                      title: available ? 'Included' : 'Not included',
                    }),
                  },
                }),
              ],
            }),
          ],
          preview: {
            select: {
              title: 'name',
              highlighted: 'highlightColumn',
            },
            prepare: ({title, highlighted}) => ({
              title,
              subtitle: highlighted ? 'Highlighted column' : 'Comparison column',
            }),
          },
        }),
      ],
    }),
    defineField({
      name: 'closing',
      title: 'Closing Copy',
      type: 'object',
      validation: (Rule) => Rule.required(),
      fields: [
        defineField({
          name: 'lead',
          title: 'Lead',
          type: 'string',
          validation: (Rule) => Rule.required(),
        }),
        defineField({
          name: 'highlight',
          title: 'Highlighted Text',
          type: 'string',
          validation: (Rule) => Rule.required(),
        }),
        defineField({
          name: 'followup',
          title: 'Follow-up',
          type: 'string',
          validation: (Rule) => Rule.required(),
        }),
      ],
    }),
  ],
  preview: {
    select: {
      headingHighlighted: 'heading.highlighted',
      headingRegular: 'heading.regular',
    },
    prepare: ({headingHighlighted, headingRegular}) => ({
      title: 'Compare',
      subtitle: [headingHighlighted, headingRegular].filter(Boolean).join(' '),
    }),
  },
})
