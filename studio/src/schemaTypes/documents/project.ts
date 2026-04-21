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
            name: 'title',
            title: 'Project Name',
            type: 'string',
        })
    ]
})