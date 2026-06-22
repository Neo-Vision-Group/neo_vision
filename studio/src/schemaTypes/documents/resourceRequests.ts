import {defineField, defineType} from 'sanity'

export const resourceRequest = defineType({
    name: 'resourceRequest',
    title: 'Resource Request',
    type: 'document',
    fields: [
        defineField({
            name: 'email',
            title: 'Email',
            type: 'email'
        }),
        defineField({
            name: 'resourceRequested',
            title: 'Resource Requested',
            type: 'string',
        }),
        defineField({
            name: "receivedAt",
            title: "Received at",
            type: "datetime",
            readOnly: true,
            validation: (r) => r.required(),
        }),
        defineField({
            name: 'freeResourceRequested',
            title: 'Free Resource Requested',
            type: 'reference',
            to: [{type: 'freeResource'}]
        })
    ]
})
