import { defineType, defineField } from 'sanity'

export const origin = defineType({
    name: 'origin',
    title: 'Origin',
    description: 'This is the origin section used on the Home Page.',
    type: 'object',
    fields: [
        defineField({ name: "eyebrow", type: "string", initialValue: "THE ORIGIN" }),
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
            name: 'subtext',
            title: 'Subtext',
            type: 'text',
        })
    ]
})