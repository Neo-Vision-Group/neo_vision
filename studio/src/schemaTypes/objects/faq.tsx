import { defineField, defineType } from "sanity";

/**
 * FAQ question + rich-text answer. Reused on About, Services listing,
 * Service [slug], Contact, Insight [slug] (newsletter/support block).
 */
export const faq = defineType({
  name: "faq",
  title: "FAQ",
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
});
