import { defineType, defineField } from 'sanity'

export const whatWeDo = defineType({
    name: 'whatWeDo',
    title: 'What We Do',
    description: 'This is the What We Do section used on the Home Page.',
    type: 'object',
    fields: [
        defineField({ name: "eyebrow", type: "string", initialValue: "WHAT WE DO" }),
        defineField({
          name: "cards",
          type: "array",
          of: [
            {
              type: "object",
              fields: [
                { name: "kind", type: "string", options: { list: ["engineering", "ai"] } },
                { name: "label", type: "string" },
                {
                  name: "title",
                  title: "Card Title",
                  type: "string",
                  validation: (Rule) => Rule.required(),
                },
                { 
                    name: "body",
                    title: "Description",
                    description: "The description text for the card.",
                    type: "text", 
                    validation: (Rule) => Rule.required() 
                },
                {
                  name: "services",
                  type: "array",
                  of: [
                    {
                      type: "reference",
                      to: [{ type: "service" }],
                    },
                  ],
                },
                {
                  name: "cta",
                  title: "CTA",
                  type: "button",
                  validation: (Rule) => Rule.required(),
                },
                { name: "texture", type: "image", description: "Optional background texture." },
              ],
            },
          ],
          validation: (Rule) => Rule.required().min(2).max(2),
        }),
    ]
})