import {defineField, defineType} from 'sanity'

export const techStack = defineType({
  name: 'techStack',
  title: 'Tech Stack',
  description: 'Displays grouped tools, platforms, and partners in a matrix layout.',
  type: 'object',
  fields: [
    defineField({
      name: 'eyebrow',
      title: 'Eyebrow',
      type: 'string',
      initialValue: 'TRUSTED BY',
    }),
    defineField({
      name: 'headingRegular',
      title: 'Heading Regular',
      type: 'string',
      initialValue: 'The tools and partners',
    }),
    defineField({
      name: 'headingBold',
      title: 'Heading Bold',
      type: 'string',
      validation: (Rule) => Rule.required(),
      initialValue: 'behind our work.',
    }),
    defineField({
      name: 'groups',
      title: 'Groups',
      type: 'array',
      validation: (Rule) => Rule.min(1),
      of: [
        defineField({
          name: 'group',
          title: 'Group',
          type: 'object',
          fields: [
            defineField({
              name: 'title',
              title: 'Title',
              type: 'string',
              validation: (Rule) => Rule.required(),
            }),
            defineField({
              name: 'items',
              title: 'Items',
              type: 'array',
              validation: (Rule) => Rule.min(1),
              of: [
                defineField({
                  name: 'item',
                  title: 'Item',
                  type: 'object',
                  fields: [
                    defineField({
                      name: 'name',
                      title: 'Name',
                      type: 'string',
                      validation: (Rule) => Rule.required(),
                    }),
                    defineField({
                      name: 'logo',
                      title: 'Logo',
                      type: 'image',
                      options: {hotspot: true},
                    }),
                  ],
                  preview: {
                    select: {
                      title: 'name',
                      media: 'logo',
                    },
                  },
                }),
              ],
            }),
          ],
          preview: {
            select: {
              title: 'title',
              items: 'items',
            },
            prepare: ({title, items}) => ({
              title: title ?? 'Group',
              subtitle: `${items?.length ?? 0} item(s)`,
            }),
          },
        }),
      ],
    }),
    defineField({
      name: 'closingNote',
      title: 'Closing Note',
      type: 'text',
      rows: 3,
    }),
  ],
  preview: {
    select: {
      title: 'eyebrow',
      subtitle: 'headingBold',
    },
    prepare: ({title, subtitle}) => ({
      title: title ?? 'Tech Stack',
      subtitle,
    }),
  },
})
