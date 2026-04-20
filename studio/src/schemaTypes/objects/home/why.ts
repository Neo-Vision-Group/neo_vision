import { defineType, defineField } from 'sanity'

export const why = defineType({
    name: 'why',
    title: 'Why us',
    description: 'This is a Why us section that can be used in a page.',
    type: 'object',
    fields: [
        defineField({ name: "eyebrow", type: "string", initialValue: "WHY TWELVETEN" }),
        defineField({ name: "heading", type: "string" }),
        defineField({
            name: "points",
            type: "array",
            of: [
                {
                    type: "object",
                    fields: [
                        { name: "title", type: "string" },
                        { name: "body", type: "text" },
                    ],
                },
            ],
        }),
      ],
})