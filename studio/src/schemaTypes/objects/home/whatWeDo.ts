import { defineType, defineField } from 'sanity'

export const whatWeDo = defineType({
    name: 'whatWeDo',
    title: 'What We Do',
    description: 'This is the What We Do section used on the Home Page.',
    type: 'object',
    fields: [
        defineField({ name: "eyebrow", type: "string", initialValue: "WHAT WE DO" }),
        defineField({ name: "heading", type: "string" }),
        defineField({
          name: "ctaSection",
          title: "CTA Section",
          type: "object",
          description: "The CTA section at the bottom with heading, subheading, and button",
          fields: [
            defineField({ name: "heading", type: "string", title: "CTA Heading" }),
            defineField({ name: "subheading", type: "text", rows: 2, title: "CTA Subheading" }),
            defineField({ name: "cta", type: "button", title: "CTA Button" }),
          ],
        }),
        defineField({
          name: "cards",
          type: "array",
          of: [
            {
              type: "object",
              fields: [
                { name: "kind", type: "string", options: { list: ["engineering", "ai"] } },
                {
                  name: "label",
                  title: "Label Text",
                  type: "string",
                  description: "Optional text label. Rendered in clash when no label image is provided.",
                },
                {
                  name: "labelImage",
                  title: "Label Image",
                  type: "image",
                  description: "Optional image label. When provided, it replaces the text label in the card UI.",
                  options: {
                    hotspot: true,
                  },
                },
                {
                  name: "labelImageLight",
                  title: "Label Image (Light Mode)",
                  type: "image",
                  description: "Optional image for light mode. Overrides Label Image in light mode.",
                  options: { hotspot: true },
                },
                {
                  name: "labelImageDark",
                  title: "Label Image (Dark Mode)",
                  type: "image",
                  description: "Optional image for dark mode. Overrides Label Image in dark mode.",
                  options: { hotspot: true },
                },
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
                  title: "Card CTA",
                  type: "button",
                  validation: (Rule) => Rule.required(),
                },
                { name: "texture", type: "boolean", description: "Optional background texture." },
              ],
            },
          ],
          validation: (Rule) => Rule.required().min(2).max(2),
        }),
    ]
})
