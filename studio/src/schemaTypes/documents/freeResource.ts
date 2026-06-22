import { defineType, defineField } from 'sanity'
import {
  universalPageBuilderBlocks,
  universalPageBuilderComponents,
  universalPageBuilderOptions,
} from '../pageBuilderBlocks'

export const freeResource = defineType({
    name: 'freeResource',
    title: 'Free Resource',
    type: 'document',
    fields: [
        defineField({
            name: 'title',
            title: 'Title',
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
            name: 'description',
            title: 'Description',
            type: 'text',
        }),
        defineField({
            name: 'badge',
            title: 'Badge',
            type: 'string',
            validation: (Rule) => Rule.required(),
        }),
        defineField({
            name: "cta",
            title: "Call to Action",
            type: "string",
            validation: (Rule) => Rule.required(),
        }),
        defineField({
            name: 'file',
            title: 'File',
            description: 'Upload the free resource file here. This file can be: a PDF, an image, or an HTML file (rendered through an IFrame).',
            type: 'object',
            fields: [
                defineField({
                    name: 'type',
                    title: 'File Type',
                    type: 'string',
                    options: {
                        list: [
                            {title: 'PDF', value: 'pdf'},
                            {title: 'Image', value: 'image'},
                            {title: 'HTML (IFrame)', value: 'html'},
                        ],
                    },
                    validation: (Rule) => Rule.required(),
                }),
                defineField({
                    name: 'asset',
                    title: 'Asset',
                    type: 'file',
                })
            ]
        }),
        defineField({
            name: 'externalLink',
            title: 'External Link',
            description: 'Alternatively, provide an external URL for the resource. This will override the file upload if both are provided.',
            type: 'url',
        }),
        defineField({
            name: 'pageBuilder',
            title: 'Page Builder',
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
        defineField({
            name: 'askForEmail',
            title: 'Ask for Email',
            type: 'boolean',
            description: 'If enabled, users will be prompted to enter their email address before downloading the resource.',
        })
    ]
})
