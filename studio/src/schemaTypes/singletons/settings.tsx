import {CogIcon} from '@sanity/icons'
import {defineArrayMember, defineField, defineType} from 'sanity'
import type {Link, Settings} from '../../../sanity.types'

import * as demo from '../../lib/initialValues'

/**
 * Settings schema Singleton.  Singletons are single documents that are displayed not in a collection, handy for things like site settings and other global configurations.
 * Learn more: https://www.sanity.io/docs/create-a-link-to-a-single-edit-page-in-your-main-document-type-list
 */

export const settings = defineType({
  name: 'siteSettings',
  title: 'Settings',
  type: 'document',
  icon: CogIcon,
  fields: [
    defineField({
      name: 'title',
      description: 'This field is the title of your blog.',
      title: 'Title',
      type: 'string',
      initialValue: demo.title,
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'description',
      description: 'Used on the Homepage',
      title: 'Description',
      type: 'array',
      initialValue: demo.description,
      of: [
        // Define a minified block content field for the description. https://www.sanity.io/docs/block-content
        defineArrayMember({
          type: 'block',
          options: {},
          styles: [],
          lists: [],
          marks: {
            decorators: [],
            annotations: [
              {
                name: 'link',
                type: 'object',
                title: 'Link',
                fields: [
                  defineField({
                    name: 'linkType',
                    title: 'Link Type',
                    type: 'string',
                    initialValue: 'href',
                    options: {
                      list: [
                        {title: 'URL', value: 'href'},
                        {title: 'Page', value: 'page'},
                        {title: 'Post', value: 'post'},
                      ],
                      layout: 'radio',
                    },
                  }),
                  defineField({
                    name: 'href',
                    title: 'URL',
                    type: 'url',
                    hidden: ({parent}) => parent?.linkType !== 'href' && parent?.linkType != null,
                    validation: (Rule) =>
                      Rule.custom((value, context) => {
                        const parent = context.parent as Link
                        if (parent?.linkType === 'href' && !value) {
                          return 'URL is required when Link Type is URL'
                        }
                        return true
                      }),
                  }),
                  defineField({
                    name: 'page',
                    title: 'Page',
                    type: 'reference',
                    to: [{type: 'page'}],
                    hidden: ({parent}) => parent?.linkType !== 'page',
                    validation: (Rule) =>
                      Rule.custom((value, context) => {
                        const parent = context.parent as Link
                        if (parent?.linkType === 'page' && !value) {
                          return 'Page reference is required when Link Type is Page'
                        }
                        return true
                      }),
                  }),
                  defineField({
                    name: 'post',
                    title: 'Post',
                    type: 'reference',
                    to: [{type: 'post'}],
                    hidden: ({parent}) => parent?.linkType !== 'post',
                    validation: (Rule) =>
                      Rule.custom((value, context) => {
                        const parent = context.parent as Link
                        if (parent?.linkType === 'post' && !value) {
                          return 'Post reference is required when Link Type is Post'
                        }
                        return true
                      }),
                  }),
                  defineField({
                    name: 'openInNewTab',
                    title: 'Open in new tab',
                    type: 'boolean',
                    initialValue: false,
                  }),
                ],
              },
            ],
          },
        }),
      ],
    }),
    defineField({
      name: 'ogImage',
      title: 'Open Graph Image',
      type: 'image',
      description: 'Displayed on social cards and search engine results.',
      options: {
        hotspot: true,
        aiAssist: {
          imageDescriptionField: 'alt',
        },
      },
      fields: [
        defineField({
          name: 'alt',
          description: 'Important for accessibility and SEO.',
          title: 'Alternative text',
          type: 'string',
        }),
        defineField({
          name: 'metadataBase',
          type: 'url',
        }),
      ],
    }),
    // Brand Identity
    defineField({
      name: 'brandName',
      title: 'Brand Name',
      type: 'string',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'logoPicture',
      title: 'Logo Picture',
      type: 'image',
      description: 'Logo image for the site',
      options: {
        hotspot: true,
      },
      fields: [
        defineField({
          name: 'alt',
          title: 'Alternative text',
          type: 'string',
          description: 'Important for accessibility and SEO.',
        }),
      ],
    }),
    defineField({
      name: 'legalName',
      title: 'Legal Name',
      type: 'string',
      description: 'Full legal entity name',
    }),
    // Contact Information
    defineField({
      name: 'email',
      title: 'Email',
      type: 'string',
      validation: (rule) => rule.email(),
    }),
    defineField({
      name: 'phoneNumber',
      title: 'Phone Number',
      type: 'string',
    }),
    defineField({
      name: 'location',
      title: 'Location',
      type: 'string',
    }),
    // Social Media
    defineField({
      name: 'instagram',
      title: 'Instagram',
      type: 'url',
      description: 'Instagram profile URL',
    }),
    defineField({
      name: 'facebook',
      title: 'Facebook',
      type: 'url',
      description: 'Facebook profile URL',
    }),
    defineField({
      name: 'linkedin',
      title: 'LinkedIn',
      type: 'url',
      description: 'LinkedIn profile URL',
    }),
    defineField({
      name: 'github',
      title: 'GitHub',
      type: 'url',
      description: 'GitHub profile URL',
    }),
    defineField({
      name: 'x',
      title: 'X (Twitter)',
      type: 'url',
      description: 'X (formerly Twitter) profile URL',
    }),
    defineField({
      name: 'tiktok',
      title: 'TikTok',
      type: 'url',
      description: 'TikTok profile URL',
    }),
    // Navigation
    defineField({
      name: 'cta',
      title: 'CTA Button Link',
      type: 'button',
      description: 'URL or path for the main navigation CTA button',
    }),
    defineField({
      name: 'navLinks',
      title: 'Navigation Links',
      type: 'array',
      of: [
        defineArrayMember({
          type: 'object',
          fields: [
            defineField({
              name: 'label',
              title: 'Label',
              type: 'string',
              validation: (rule) => rule.required(),
            }),
            defineField({
              name: 'page',
              title: 'Page',
              type: 'reference',
              to: [{type: 'page'}],
              description: 'Link to an existing page',
            }),
            defineField({
              name: 'href',
              title: 'Link (deprecated)',
              type: 'string',
              hidden: true,
              description: 'Legacy field - use Page reference instead',
            }),
          ],
          preview: {
            select: {
              title: 'label',
              page: 'page.name',
            },
            prepare({title, page}) {
              return {
                title,
                subtitle: page || 'No page selected',
              }
            },
          },
        }),
      ],
    }),
    // Footer
    defineField({
      name: 'footerColumns',
      title: 'Footer Columns',
      type: 'array',
      of: [
        defineArrayMember({
          type: 'object',
          fields: [
            defineField({
              name: 'title',
              title: 'Column Title',
              type: 'string',
              validation: (rule) => rule.required(),
            }),
            defineField({
              name: 'links',
              title: 'Links',
              type: 'array',
              of: [
                defineArrayMember({
                  type: 'object',
                  fields: [
                    defineField({
                      name: 'label',
                      title: 'Label',
                      type: 'string',
                      validation: (rule) => rule.required(),
                    }),
                    defineField({
                      name: 'linkType',
                      title: 'Link Type',
                      type: 'string',
                      options: {
                        list: [
                          {title: 'Page', value: 'page'},
                          {title: 'Service', value: 'service'},
                          {title: 'URL', value: 'href'},
                        ],
                        layout: 'radio',
                      },
                      initialValue: 'page',
                      validation: (rule) => rule.required(),
                    }),
                    defineField({
                      name: 'page',
                      title: 'Page',
                      type: 'reference',
                      to: [{type: 'page'}],
                      hidden: ({parent}) => parent?.linkType !== 'page',
                      validation: (Rule) =>
                        Rule.custom((value, context) => {
                          const parent = context.parent as any
                          if (parent?.linkType === 'page' && !value) {
                            return 'Page reference is required when Link Type is Page'
                          }
                          return true
                        }),
                    }),
                    defineField({
                      name: 'service',
                      title: 'Service',
                      type: 'reference',
                      to: [{type: 'service'}],
                      hidden: ({parent}) => parent?.linkType !== 'service',
                      validation: (Rule) =>
                        Rule.custom((value, context) => {
                          const parent = context.parent as any
                          if (parent?.linkType === 'service' && !value) {
                            return 'Service reference is required when Link Type is Service'
                          }
                          return true
                        }),
                    }),
                    defineField({
                      name: 'href',
                      title: 'URL',
                      type: 'url',
                      hidden: ({parent}) => parent?.linkType !== 'href',
                      validation: (Rule) =>
                        Rule.custom((value, context) => {
                          const parent = context.parent as any
                          if (parent?.linkType === 'href' && !value) {
                            return 'URL is required when Link Type is URL'
                          }
                          return true
                        }),
                    }),
                    defineField({
                      name: 'accent',
                      title: 'Accent Style',
                      type: 'boolean',
                      initialValue: false,
                    }),
                  ],
                  preview: {
                    select: {
                      title: 'label',
                      linkType: 'linkType',
                      page: 'page.name',
                      service: 'service.title',
                      href: 'href',
                    },
                    prepare({title, linkType, page, service, href}) {
                      let subtitle = ''
                      if (linkType === 'page' && page) {
                        subtitle = `Page: ${page}`
                      } else if (linkType === 'service' && service) {
                        subtitle = `Service: ${service}`
                      } else if (linkType === 'href' && href) {
                        subtitle = `URL: ${href}`
                      } else {
                        subtitle = 'No link selected'
                      }
                      return {title, subtitle}
                    },
                  },
                }),
              ],
            }),
          ],
          preview: {
            select: {
              title: 'title',
              links: 'links',
            },
            prepare({title, links}) {
              return {
                title,
                subtitle: `${links?.length || 0} links`,
              }
            },
          },
        }),
      ],
    }),
    defineField({
      name: 'legalLinks',
      title: 'Legal Links',
      type: 'array',
      of: [
        defineArrayMember({
          type: 'reference',
          to: [
            {type: 'page'},
          ],
        }),
      ],
    }),
  ],
  preview: {
    prepare() {
      return {
        title: 'Settings',
      }
    },
  },
})
