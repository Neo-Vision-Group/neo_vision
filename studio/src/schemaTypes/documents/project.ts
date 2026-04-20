import { defineType, defineField } from 'sanity'

export const project = defineType({
    name: 'project',
    title: 'Project',
    description: 'This is a project that can be used in a page.',
    type: 'document',
    fields: [
        defineField({
            name: 'title',
            title: 'Project Name',
            type: 'string',
        })
    ]
})