import {defineField, defineType} from 'sanity'
import {DocumentIcon} from '@sanity/icons'
import {
  universalPageBuilderBlocks,
  universalPageBuilderComponents,
  universalPageBuilderOptions,
} from '../pageBuilderBlocks'

/**
 * Page schema.  Define and edit the fields for the 'page' content type.
 * Learn more: https://www.sanity.io/docs/studio/schema-types
 */

export const service = defineType({
  name: 'service',
  title: 'Service',
  type: 'document',
  icon: DocumentIcon,
  fields: [
    defineField({
      name: 'name',
      title: 'Name',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'description',
      title: 'Description',
      type: 'text',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'price',
      title: 'Price',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'category',
      title: 'Category',
      type: 'string',
      options: {list: ['engineering', 'ai']},
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'tag',
      title: 'Tag',
      type: 'string',
      description: 'Text like "Best Seller" or "Popular" to display on the service card.',
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
      name: 'duration',
      title: 'Duration',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'pageBuilder',
      title: 'Page builder',
      type: 'array',
      of: universalPageBuilderBlocks,
      options: universalPageBuilderOptions,
      components: universalPageBuilderComponents,
    }),
    defineField({
      name: 'seo',
      title: 'SEO Override',
      type: 'seo',
      description:
        'Page-level SEO overrides. Leave any field blank to inherit the default value from SEO Settings.',
    }),
  ],
})
