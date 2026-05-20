import {defineField, defineType} from 'sanity'
import {TagIcon} from '@sanity/icons'

export const industry = defineType({
  name: 'industry',
  title: 'Industry',
  type: 'document',
  icon: TagIcon,
  fields: [
    defineField({
      name: 'name',
      title: 'Name',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      validation: (Rule) => Rule.required(),
      options: {
        source: 'name',
        maxLength: 96,
      },
    }),
    defineField({
      name: 'order',
      title: 'Sort Order',
      type: 'number',
      description: 'Used to control the order in filter lists',
      initialValue: 0,
    }),
  ],
  preview: {
    select: {
      title: 'name',
    },
  },
})
