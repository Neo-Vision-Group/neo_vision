import { defineType, defineField } from 'sanity'
import { CaseIcon } from '@sanity/icons'

export const project = defineType({
    name: 'project',
    title: 'Project',
    description: 'This is a project that can be used in a page.',
    type: 'document',
    icon: CaseIcon,
    fields: [
        defineField({
            name: 'client',
            title: 'Client',
            type: 'string',
            validation: (Rule) => Rule.required()
        }),
        defineField({
            name: 'year',
            title: 'Year',
            type: 'string',
            validation: (Rule) => Rule.required()
        }),
        defineField({
            name: 'slug',
            title: 'Slug',
            type: 'slug',
            validation: (Rule) => Rule.required()
        }),
        defineField({
            name: 'category',
            title: 'Category',
            type: 'string',
            options: { list: ["engineering", "ai"] },
            validation: (Rule) => Rule.required()
        }),
        defineField({
            name: 'title',
            title: 'Title',
            type: 'string',
            validation: (Rule) => Rule.required()
        }),
        defineField({
            name: 'tagline',
            title: 'Tagline',
            type: 'string',
            validation: (Rule) => Rule.required()
        }),
        defineField({
            name: 'description',
            title: 'Description',
            type: 'text',
            validation: (Rule) => Rule.required()
        }),
        defineField({
            name: 'image',
            title: 'Image',
            type: 'image',
            validation: (Rule) => Rule.required()
        }),
        defineField({
            name: 'link',
            title: 'Link',
            type: 'url',
            validation: (Rule) => Rule.required()
        })
    ]
})