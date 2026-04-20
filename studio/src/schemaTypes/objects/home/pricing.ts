import { defineType, defineField } from 'sanity'

export const pricing = defineType({
    name: 'pricing',
    title: 'Pricing',
    description: 'This is a pricing section that can be used in a page.',
    type: 'object',
    fields: [
        defineField({ name: "eyebrow", title: 'Eyebrow', type: "string", initialValue: "PRICING" }),
        defineField({ name: "heading", title: 'Heading', type: "string" }),
        defineField({
          name: "cards",
          title: 'Services Categories',
          type: "array",
          of: [
            {
              type: "object",
              fields: [
                { name: "kind", title: 'Kind', type: "string", options: { list: ["engineering", "ai"] } },
                { name: "title", title: 'Title', type: "string" },
                { name: "items", title: 'Items', type: "array", of: [{ type: "reference", to: [{ type: "service" }] }] },
              ],
            },
          ],
        }),
        defineField({
          name: "callout",
          title: 'Callout',
          type: "object",
          fields: [
            { name: "heading", title: 'Callout Heading', type: "string" },
            { name: "body", title: 'Callout Body', type: "string" },
            { name: 'cta', title: 'Callout CTA', type: 'button' }
          ],
        }),
      ],
})