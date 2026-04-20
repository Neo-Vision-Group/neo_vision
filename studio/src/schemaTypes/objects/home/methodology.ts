import { defineType, defineField } from 'sanity'

export const methodology = defineType({
    name: 'methodology',
    title: 'Methodology',
    description: 'This is a methodology section that can be used in a page.',
    type: 'object',
    fields: [
        { name: "eyebrow", type: "string", initialValue: "OUR METHODOLOGY" },
        { name: "heading", type: "string" },
        {
          name: "steps",
          type: "array",
          of: [
            {
              type: "object",
              fields: [
                { name: "title", type: "string" },
                { name: "body", type: "text", rows: 2 },
              ],
            },
          ],
        },
    ],
})