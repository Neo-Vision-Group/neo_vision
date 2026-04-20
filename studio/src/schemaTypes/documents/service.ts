import { defineType, defineField } from 'sanity'

export const service = defineType({
    name: 'service',
    title: 'Service',
    description: 'This is a service that can be used in a page.',
    type: 'document',
    fields: [
        defineField({
            name: 'title',
            title: 'Service Name',
            type: 'string',
        })
    ]
})