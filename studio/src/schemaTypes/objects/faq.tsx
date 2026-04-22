import { defineField, defineType } from "sanity";

export const faq = defineType({
  name: "faq",
  title: "FAQ",
  type: "object",
  fields: [
    defineField({
      name: "eyebrow",
      title: "Eyebrow",
      type: "string",
      initialValue: "FREQUENTLY ASKED",
    }),
    defineField({
      name: "heading",
      title: "Heading",
      type: "string",
      initialValue: "Common questions.",
    }),
    defineField({
      name: "items",
      title: "FAQ Items",
      type: "array",
      of: [
        {
          type: "object",
          fields: [
            defineField({
              name: "question",
              title: "Question",
              type: "string",
              validation: (r) => r.required(),
            }),
            defineField({
              name: "answer",
              title: "Answer",
              type: "array",
              of: [{ type: "block" }],
              description: "Supports paragraphs, links, inline emphasis.",
              validation: (r) => r.required(),
            }),
          ],
          preview: {
            select: { title: "question" },
          },
        },
      ],
      validation: (r) => r.required().min(1),
    }),
  ],
  preview: {
    select: { title: "heading" },
  },
});
