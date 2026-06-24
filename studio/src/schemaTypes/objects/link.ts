import {defineField, defineType} from 'sanity'
import {LinkIcon} from '@sanity/icons'

type LinkParent = {
  linkType?: 'href' | 'page' | 'post' | 'service' | 'project'
}

/**
 * Link schema object. This link object lets the user first select the type of link and then
 * then enter the URL or a document reference - depending on the type selected.
 * Learn more: https://www.sanity.io/docs/studio/object-type
 */

export const link = defineType({
  name: 'link',
  title: 'Link',
  type: 'object',
  icon: LinkIcon,
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
          {title: 'Service', value: 'service'},
          {title: 'Project', value: 'project'},
        ],
        layout: 'radio',
      },
    }),
    defineField({
      name: 'href',
      title: 'URL',
      type: 'url',
      hidden: ({parent}) => parent?.linkType !== 'href',
      validation: (Rule) =>
        // Custom validation to ensure URL is provided if the link type is 'href'
        Rule.custom((value, context) => {
          const parent = context.parent as LinkParent
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
        // Custom validation to ensure page reference is provided if the link type is 'page'
        Rule.custom((value, context) => {
          const parent = context.parent as LinkParent
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
        // Custom validation to ensure post reference is provided if the link type is 'post'
        Rule.custom((value, context) => {
          const parent = context.parent as LinkParent
          if (parent?.linkType === 'post' && !value) {
            return 'Post reference is required when Link Type is Post'
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
          const parent = context.parent as LinkParent
          if (parent?.linkType === 'service' && !value) {
            return 'Service reference is required when Link Type is Service'
          }
          return true
        }),
    }),
    defineField({
      name: 'project',
      title: 'Project',
      type: 'reference',
      to: [{type: 'project'}],
      hidden: ({parent}) => parent?.linkType !== 'project',
      validation: (Rule) =>
        Rule.custom((value, context) => {
          const parent = context.parent as LinkParent
          if (parent?.linkType === 'project' && !value) {
            return 'Project reference is required when Link Type is Project'
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
})
