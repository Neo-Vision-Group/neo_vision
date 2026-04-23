import { defineField, defineType } from "sanity";

export const place = defineType({
  name: "place",
  title: "Place",
  type: "object",
  fields: [
    defineField({
      name: "eyebrow",
      title: "Eyebrow",
      type: "string",
      initialValue: "WHERE WE ARE",
    }),
    defineField({
      name: "headingRegular",
      title: "Heading (Regular)",
      type: "string",
      initialValue: "Want to meet the team?",
    }),
    defineField({
      name: "headingBold",
      title: "Heading (Bold)",
      type: "string",
      initialValue: "Come say hi.",
    }),
    defineField({
      name: "body",
      title: "Body Text",
      type: "text",
      initialValue: "We're based in Bucharest with remote teammates across Europe. Offices open to clients and collaborators by appointment.",
    }),
    defineField({
      name: "backgroundGraphic",
      title: "Background Graphic",
      type: "image",
      options: {
        hotspot: true,
      },
      description: "Background graphic/image for the section",
    }),
    defineField({
      name: "locations",
      title: "Locations",
      type: "array",
      of: [
        {
          type: "object",
          fields: [
            defineField({
              name: "city",
              title: "City",
              type: "string",
              validation: (r) => r.required(),
            }),
            defineField({
              name: "address",
              title: "Address",
              type: "string",
            }),
            defineField({
              name: "note",
              title: "Note (e.g., HQ, Remote)",
              type: "string",
            }),
          ],
          preview: {
            select: { title: "city", subtitle: "note" },
          },
        },
      ],
    }),
    defineField({
      name: "cta",
      title: "CTA Button",
      type: "object",
      fields: [
        defineField({
          name: "label",
          title: "Label",
          type: "string",
          initialValue: "Book a call",
        }),
        defineField({
          name: "href",
          title: "Link URL",
          type: "string",
          initialValue: "/contact",
        }),
      ],
    }),
  ],
  preview: {
    select: {
      title: "eyebrow",
      subtitle: "headingRegular",
    },
  },
});
