import { defineType, defineField } from 'sanity'

export const signature = defineType({
    name: 'signature',
    title: 'Signature',
    description: 'This is a signature section that can be used in a page.',
    type: 'object',
    fields: [
        defineField({ name: "eyebrow", type: "string", initialValue: "OUR SIGNATURE MODEL" }),
        defineField({ name: "heading", type: "string" }),
        defineField({ name: "body", type: "text", rows: 3 }),
        defineField({ name: "secondaryLine", type: "string" }),
        defineField({
          name: "steps",
          type: "array",
          of: [
            {
              type: "object",
              fields: [
                { name: "title", type: "string" },
                { name: "duration", type: "string" },
                { name: "body", type: "text", rows: 3 },
                { name: "textured", type: "boolean", initialValue: false },
                {
                  name: "graphic",
                  title: "Graphic",
                  type: "image",
                  hidden: ({ parent }) => !parent?.textured,
                  description:
                    "Optional black-and-white line graphic for textured cards. White lines will render with the red overlay treatment on the frontend.",
                },
              ],
            },
          ],
        }),
        defineField({ name: "cta", type: "button" }),
        defineField({
          name: "valueCard",
          type: "object",
          fields: [
            { name: "value", type: "string" },
            { name: "body", type: "text", rows: 3 },
            {
              name: "graphic",
              title: "Graphic",
              type: "image",
              description:
                "Optional black-and-white line graphic for the value card. White lines will render with the red overlay treatment on the frontend.",
            },
          ],
        }),
      ],
})
