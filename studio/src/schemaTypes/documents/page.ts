import {defineField, defineType} from 'sanity'
import {DocumentIcon} from '@sanity/icons'

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
      name: 'description',
      title: 'Description',
      type: 'text',
      validation: (Rule) => Rule.required(),
      description: 'The description of this page. Important for SEO.'
    }),
    defineField({
      name: 'keywords',
      title: 'Keywords',
      type: 'array',
      of: [{type: 'string'}],
      validation: (Rule) => Rule.required(),
      description: 'The keywords of this page. Important for SEO. (though less relevant for Google today)'
    }),
    defineField({
      name: 'pageBuilder',
      title: 'Page builder',
      type: 'array',
      of: [
        {type: 'pageHero'},
        {type: 'contactHero'},
        {type: 'contactForm'},
        {type: 'homeHero'},
        {type: 'list'},
        {type: 'cta'},
        {type: 'methodology'},
        {type: 'origin'},
        {type: 'portfolio'},
        {type: 'pricing'},
        {type: 'signature'},
        {type: 'story'},
        {type: 'team'},
        {type: 'testimonials'},
        {type: 'whatWeDo'},
        {type: 'why'},
        {type: 'engineeringServices'},
        {type: 'industries'},
        {type: 'faq'},
        {type: 'insightsFeatured'},
        {type: 'insightsGrid'},
        {type: 'insightsResources'},
        {type: 'insightsCta'}
      ],
      options: {
        insertMenu: {
          // Configure the "Add Item" menu to display a thumbnail preview of the content type. https://www.sanity.io/docs/studio/array-type#efb1fe03459d
          views: [
            {
              name: 'grid',
              previewImageUrl: (schemaTypeName) =>
                `/static/page-builder-thumbnails/${schemaTypeName}.webp`,
            },
          ],
        },
      },
    }),
  ],
})
