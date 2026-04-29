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

export const page = defineType({
  name: 'page',
  title: 'Page',
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
      name: 'pageType',
      title: 'Page Type',
      type: 'string',
      options: {
        list: [
          {title: 'Home', value: 'home'},
          {title: 'Services', value: 'services'},
          {title: 'Insights', value: 'insights'},
          {title: 'Case Studies', value: 'caseStudies'},
        ],
        layout: 'radio',
      },
      description: 'Select the type of page this represents',
    }),
    defineField({
      name: 'seo',
      title: 'SEO Override',
      type: 'seo',
      description:
        'Page-level SEO overrides. Leave any field blank to inherit the default value from SEO Settings.',
    }),
    defineField({
      name: 'pageBuilder',
      title: 'Page builder',
      type: 'array',
      of: universalPageBuilderBlocks,
      options: universalPageBuilderOptions,
      components: universalPageBuilderComponents,
    }),
  ],
})
