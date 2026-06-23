import { defineType, defineField } from 'sanity'

export const emailTemplate = defineType({
    name: 'emailTemplate',
    title: 'Email',
    type: 'document',
    fields: [
        defineField({
            name: 'type',
            title: 'Type',
            type: 'string',
            options: {
                list: [
                    {title: 'Contact Email Tempalte', value: 'contact'},
                    {title: 'Resource Request Email', value: 'resource'},
                ]
            }
        }),
        defineField({
            name: 'subject',
            title: 'Subject',
            type: 'string',
            validation: (Rule) => Rule.required(),
        }),
        defineField({
            name: 'title',
            title: 'Title',
            type: 'string',
            validation: (Rule) => Rule.required(),
        }),
        defineField({
            name: 'body',
            title: 'Body',
            type: 'array',
            of: [
                {
                    type: 'block',
                    styles: [
                        {title: 'Normal', value: 'normal'},
                    ],
                    lists: [],
                    marks: {
                        decorators: [
                            {title: 'Strong', value: 'strong'},
                            {title: 'Emphasis', value: 'em'},
                        ],
                        annotations: [
                            {
                                name: 'link',
                                type: 'object',
                                title: 'Link',
                                fields: [
                                    {name: 'href', title: 'URL', type: 'url'},
                                ],
                            },
                        ],
                    },
                },
            ],
            validation: (Rule) => Rule.required(),
        }),
        defineField({
            name: 'footer',
            title: 'Footer Note',
            type: 'array',
            of: [
                {
                    type: 'block',
                    styles: [
                        {title: 'Normal', value: 'normal'},
                    ],
                    lists: [],
                    marks: {
                        decorators: [
                            {title: 'Strong', value: 'strong'},
                            {title: 'Emphasis', value: 'em'},
                        ],
                        annotations: [
                            {
                                name: 'link',
                                type: 'object',
                                title: 'Link',
                                fields: [
                                    {name: 'href', title: 'URL', type: 'url'},
                                ],
                            },
                        ],
                    },
                },
            ],
        })
    ],
})