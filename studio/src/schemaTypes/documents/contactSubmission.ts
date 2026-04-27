import { defineField, defineType } from "sanity";

/**
 * Submission captured from the /contact form. Written by
 * `src/app/api/contact/route.ts` via the Sanity write client. Editors
 * see these in Studio so every inbound lead is visible even if the
 * Resend notification email fails.
 *
 * Status lifecycle: new → reviewed → responded → archived.
 */
export const contactSubmission = defineType({
  name: "contactSubmission",
  title: "Contact submission",
  type: "document",
  // Keep submissions read-only-ish in Studio — editors mainly update status.
  fields: [
    defineField({
      name: "name",
      title: "Name",
      type: "string",
      validation: (r) => r.required(),
    }),
    defineField({
      name: "email",
      title: "Email",
      type: "string",
      validation: (r) => r.required().email(),
    }),
    defineField({
      name: "company",
      title: "Company",
      type: "string",
    }),
    defineField({
      name: "phone",
      title: "Phone",
      type: "string",
    }),
    defineField({
      name: "projectType",
      title: "Project type",
      type: "string",
    }),
    defineField({
      name: "budget",
      title: "Budget",
      type: "string",
    }),
    defineField({
      name: "hearAboutUs",
      title: "How they heard about us",
      type: "string",
    }),
    defineField({
      name: "message",
      title: "Message",
      type: "text",
      rows: 6,
      validation: (r) => r.required(),
    }),
    defineField({
      name: "source",
      title: "Source page",
      type: "string",
      description: 'Page the form was submitted from, e.g. "/contact", "/services/ai".',
    }),
    defineField({
      name: "receivedAt",
      title: "Received at",
      type: "datetime",
      readOnly: true,
      validation: (r) => r.required(),
    }),
    defineField({
      name: "status",
      title: "Status",
      type: "string",
      initialValue: "new",
      options: {
        list: [
          { title: "New", value: "new" },
          { title: "Reviewed", value: "reviewed" },
          { title: "Responded", value: "responded" },
          { title: "Archived", value: "archived" },
        ],
        layout: "radio",
      },
    }),
    defineField({
      name: "notes",
      title: "Internal notes",
      type: "text",
      rows: 3,
    }),
  ],
  preview: {
    select: { title: "name", subtitle: "email", description: "status" },
    prepare: ({ title, subtitle, description }) => ({
      title: title as string,
      subtitle: `${subtitle ?? "—"}  ·  ${description ?? "new"}`,
    }),
  },
  orderings: [
    {
      title: "Received (newest first)",
      name: "receivedDesc",
      by: [{ field: "receivedAt", direction: "desc" }],
    },
  ],
});
