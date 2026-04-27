import { defineField, defineType } from "sanity";

export const place = defineType({
  name: "place",
  title: "Place",
  type: "object",
  fields: [
    defineField({
      name: "message",
      title: "Bottom Text",
      type: "text",
      rows: 3,
      initialValue:
        "Serving clients in Romania, UK, US, and Western Europe · Remote-first with on-site FDE deployment",
      description: "Single text block shown over the graphic at the bottom of the section.",
    }),
    defineField({
      name: "backgroundGraphic",
      title: "Background Graphic",
      type: "image",
      options: {
        hotspot: true,
      },
      description: "Background graphic/image for the section.",
    }),
  ],
  preview: {
    select: {
      title: "message",
    },
    prepare: ({title}) => ({
      title: "Place",
      subtitle: title || "Bottom-aligned message over background graphic",
    }),
  },
});
