import { defineField, defineType } from "sanity";

/**
 * Service document — powers the Services listing and each
 * `/services/[slug]` detail page. The detail page's section structure
 * matches Figma `224:11385`:
 *
 *   Hero → isThisForYou → soundFamiliar → whatYouGet → howWeBuild →
 *   pricing → workShowcase → faq → closingCta
 *
 * Listing-level fields live at the top; detail-only fields are
 * grouped under their respective sections.
 */
export const service = defineType({
  name: "service",
  title: "Service",
  type: "document",
  groups: [
    { name: "listing", title: "Listing" },
    { name: "hero", title: "Detail — Hero" },
    { name: "isThisForYou", title: "Detail — Is This For You" },
    { name: "soundFamiliar", title: "Detail — Sound Familiar" },
    { name: "whatYouGet", title: "Detail — What You Get" },
    { name: "howWeBuild", title: "Detail — How We Build" },
    { name: "pricing", title: "Detail — Pricing" },
    { name: "workShowcase", title: "Detail — Work Showcase" },
    { name: "faq", title: "Detail — FAQ" },
    { name: "closingCta", title: "Detail — Closing CTA" },
  ],
  fields: [
    // --- LISTING FIELDS ----------------------------------------------
    defineField({
      name: "name",
      title: "Name",
      type: "string",
      group: "listing",
      validation: (r) => r.required(),
    }),
    defineField({
      name: "slug",
      title: "Slug",
      type: "slug",
      group: "listing",
      options: { source: "name", maxLength: 64 },
      validation: (r) => r.required(),
    }),
    defineField({
      name: "category",
      title: "Category",
      type: "string",
      group: "listing",
      options: {
        list: [
          { title: "Engineering", value: "engineering" },
          { title: "AI Transformation", value: "ai" },
          { title: "Design", value: "design" },
          { title: "Strategy", value: "strategy" },
        ],
      },
    }),
    defineField({
      name: "headline",
      title: "Headline",
      type: "string",
      group: "listing",
    }),
    defineField({
      name: "description",
      title: "Short description",
      type: "text",
      rows: 2,
      group: "listing",
    }),
    defineField({
      name: "body",
      title: "Long-form body (deprecated, kept for back-compat)",
      type: "array",
      of: [{ type: "block" }],
      group: "listing",
    }),
    defineField({
      name: "priceFrom",
      title: "Starting price",
      type: "string",
      group: "listing",
      description: 'Displayed as "from €5K" on the listing page.',
    }),
    defineField({
      name: "featured",
      title: "Featured on home page?",
      type: "boolean",
      group: "listing",
      initialValue: false,
    }),
    defineField({
      name: "order",
      title: "Sort order",
      type: "number",
      group: "listing",
    }),

    // --- DETAIL PAGE FIELDS ------------------------------------------
    defineField({
      name: "detailHero",
      title: "Hero",
      type: "object",
      group: "hero",
      fields: [
        { name: "eyebrow", type: "string" },
        {
          name: "heading",
          type: "object",
          fields: [
            { name: "faded", type: "string" },
            { name: "bold", type: "string" },
          ],
        },
        { name: "subheading", type: "text", rows: 3 },
        {
          name: "navTabs",
          type: "array",
          of: [{ type: "string" }],
          description: 'In-page anchor labels, e.g. ["Is this for you?", "Pricing", "FAQ"].',
        },
      ],
    }),

    defineField({
      name: "isThisForYou",
      title: "Is This For You",
      type: "object",
      group: "isThisForYou",
      fields: [
        { name: "eyebrow", type: "string", initialValue: "IS THIS FOR YOU?" },
        { name: "heading", type: "string" },
        {
          name: "checklist",
          type: "array",
          of: [{ type: "string" }],
          description: "Each string becomes a checkmark bullet.",
        },
        { name: "badgeValue", type: "string", description: 'Big orange metric, e.g. "50+".' },
        { name: "badgeLabel", type: "string", description: "Caption under the badge." },
      ],
    }),

    defineField({
      name: "soundFamiliar",
      title: "Sound Familiar",
      type: "object",
      group: "soundFamiliar",
      fields: [
        { name: "eyebrow", type: "string", initialValue: "SOUND FAMILIAR?" },
        { name: "heading", type: "string" },
        {
          name: "painPoints",
          type: "array",
          of: [
            {
              type: "object",
              fields: [
                { name: "title", type: "string" },
                { name: "body", type: "text", rows: 2 },
              ],
              preview: { select: { title: "title" } },
            },
          ],
        },
      ],
    }),

    defineField({
      name: "whatYouGet",
      title: "What You Get",
      type: "object",
      group: "whatYouGet",
      fields: [
        { name: "eyebrow", type: "string", initialValue: "WHAT YOU GET" },
        { name: "heading", type: "string" },
        {
          name: "features",
          type: "array",
          of: [
            {
              type: "object",
              fields: [
                { name: "title", type: "string" },
                { name: "body", type: "text", rows: 2 },
                { name: "eyebrow", type: "string", description: "Small tag above the title." },
              ],
              preview: { select: { title: "title", subtitle: "eyebrow" } },
            },
          ],
        },
      ],
    }),

    defineField({
      name: "howWeBuild",
      title: "How We Build",
      type: "object",
      group: "howWeBuild",
      fields: [
        { name: "eyebrow", type: "string", initialValue: "HOW WE BUILD" },
        { name: "heading", type: "string" },
        {
          name: "phases",
          type: "array",
          of: [
            {
              type: "object",
              fields: [
                { name: "number", type: "string" },
                { name: "title", type: "string" },
                { name: "duration", type: "string" },
                { name: "body", type: "text", rows: 3 },
                { name: "image", type: "image", options: { hotspot: true } },
              ],
              preview: { select: { title: "title", subtitle: "duration" } },
            },
          ],
        },
      ],
    }),

    defineField({
      name: "pricing",
      title: "Pricing",
      type: "object",
      group: "pricing",
      fields: [
        { name: "eyebrow", type: "string", initialValue: "PRICING" },
        { name: "heading", type: "string" },
        { name: "subheading", type: "text", rows: 2 },
        {
          name: "tiers",
          type: "array",
          of: [
            {
              type: "object",
              fields: [
                { name: "title", type: "string" },
                { name: "price", type: "string" },
                { name: "duration", type: "string" },
                {
                  name: "includes",
                  type: "array",
                  of: [{ type: "string" }],
                },
                { name: "ctaLabel", type: "string" },
                { name: "ctaHref", type: "string" },
                { name: "featured", type: "boolean", initialValue: false },
              ],
              preview: { select: { title: "title", subtitle: "price" } },
            },
          ],
        },
        { name: "footnote", type: "text", rows: 2 },
      ],
    }),

    defineField({
      name: "workShowcase",
      title: "Work Showcase",
      type: "object",
      group: "workShowcase",
      fields: [
        { name: "eyebrow", type: "string", initialValue: "OUR WORK" },
        { name: "heading", type: "string" },
        {
          name: "items",
          type: "array",
          of: [{ type: "reference", to: [{ type: "project" }] }],
          validation: (r) => r.max(6),
        },
      ],
    }),

    defineField({
      name: "faq",
      title: "FAQ",
      type: "object",
      group: "faq",
      fields: [
        { name: "eyebrow", type: "string", initialValue: "FAQ" },
        { name: "heading", type: "string" },
        {
          name: "items",
          type: "array",
          of: [{ type: "faq" }],
        },
      ],
    }),

    defineField({
      name: "closingCta",
      title: "Closing CTA",
      type: "object",
      group: "closingCta",
      fields: [
        {
          name: "heading",
          type: "object",
          fields: [
            { name: "regular", type: "string" },
            { name: "bold", type: "string" },
          ],
        },
        { name: "body", type: "text", rows: 2 },
        { name: "microcopy", type: "string" },
        { name: "cta", type: "button" },
      ],
    }),
  ],
  preview: {
    select: { title: "name", subtitle: "category" },
  },
});
