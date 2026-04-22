import { defineType, defineField } from 'sanity'

export const cta = defineType({
    name: 'cta',
    title: 'CTA',
    description: 'This is a CTA section used on the Home Page.',
    type: 'object',
    fields: [
        defineField({
            name: "heading",
            title: 'Heading',
            type: "string",
            validation: (Rule) => Rule.required(),
        }),
        defineField({
            name: "body",
            title: "Body",
            type: "text",
            validation: (Rule) => Rule.required(),
        }),
        defineField({
            name: "cta",
            title: "CTA",
            type: "button",
            validation: (Rule) => Rule.required(),
        }),
        defineField({
            name: "subtext",
            title: "Subtext",
            type: "string",
        }),
    ],
    preview: {
        select: {
            title: 'heading',
            subtitle: 'body'
        }
    }
})