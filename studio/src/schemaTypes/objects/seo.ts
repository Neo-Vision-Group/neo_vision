import {defineArrayMember, defineField, defineType} from 'sanity'

const createSeoImageField = ({
  name,
  title,
  description,
  fieldset,
}: {
  name: string
  title: string
  description: string
  fieldset: string
}) =>
  defineField({
    name,
    title,
    type: 'image',
    description,
    fieldset,
    options: {
      hotspot: true,
      aiAssist: {
        imageDescriptionField: 'alt',
      },
    },
    fields: [
      defineField({
        name: 'alt',
        title: 'Alternative Text',
        type: 'string',
        description:
          'Describe the image for accessibility and social previews. Keep it specific to what the image communicates.',
      }),
    ],
  })

export const seo = defineType({
  name: 'seo',
  title: 'SEO',
  type: 'object',
  options: {
    collapsible: true,
    collapsed: false,
  },
  fieldsets: [
    {name: 'searchBasics', title: 'Search Basics'},
    {name: 'indexing', title: 'Indexing and Robots'},
    {name: 'alternates', title: 'Canonical and Alternate URLs'},
    {name: 'openGraph', title: 'Open Graph'},
    {name: 'twitter', title: 'Twitter / X'},
    {name: 'socialFallbacks', title: 'Social Fallbacks'},
    {name: 'structuredData', title: 'Structured Data'},
    {name: 'editorial', title: 'Editorial and Search Presentation'},
    {name: 'technical', title: 'Technical Metadata'},
  ],
  fields: [
    defineField({
      name: 'metaTitle',
      title: 'Meta Title',
      type: 'string',
      description:
        'Main SEO title for search engines. Aim for roughly 50 to 60 characters. This can differ from the visible page heading.',
      fieldset: 'searchBasics',
    }),
    defineField({
      name: 'metaDescription',
      title: 'Meta Description',
      type: 'text',
      rows: 3,
      description:
        'Summary shown in search results. Aim for roughly 140 to 160 characters and write it to earn the click.',
      fieldset: 'searchBasics',
    }),
    defineField({
      name: 'metaKeywords',
      title: 'Meta Keywords',
      type: 'array',
      of: [defineArrayMember({type: 'string'})],
      description:
        'Optional keyword list for legacy use cases. Modern Google ranking relies very little on this field.',
      fieldset: 'searchBasics',
    }),
    defineField({
      name: 'seoTitleSuffix',
      title: 'SEO Title Suffix',
      type: 'string',
      description:
        'Optional suffix to append to the meta title, such as a brand name or campaign label.',
      fieldset: 'searchBasics',
    }),
    defineField({
      name: 'canonicalUrl',
      title: 'Canonical URL',
      type: 'url',
      description:
        'Full canonical URL for this page. Use when the canonical destination differs from the default routed URL.',
      fieldset: 'alternates',
    }),
    defineField({
      name: 'robotsMode',
      title: 'Robots Mode',
      type: 'string',
      description:
        'Choose whether robots directives should be inherited, use a simple preset, or be managed manually.',
      initialValue: 'inherit',
      options: {
        list: [
          {title: 'Inherit Global Defaults', value: 'inherit'},
          {title: 'Index and Follow', value: 'indexFollow'},
          {title: 'No Index and No Follow', value: 'noIndexNoFollow'},
          {title: 'Custom Robots Directives', value: 'custom'},
        ],
      },
      fieldset: 'indexing',
    }),
    defineField({
      name: 'robots',
      title: 'Robots Directive',
      type: 'string',
      description:
        'Advanced robots directive string, for example "index,follow,max-image-preview:large". Only used when Robots Mode is set to Custom.',
      hidden: ({parent}) => parent?.robotsMode !== 'custom',
      fieldset: 'indexing',
    }),
    defineField({
      name: 'googleBot',
      title: 'Googlebot Directive',
      type: 'string',
      description:
        'Optional Googlebot-specific override for advanced crawling rules.',
      hidden: ({parent}) => parent?.robotsMode !== 'custom',
      fieldset: 'indexing',
    }),
    defineField({
      name: 'noIndex',
      title: 'No Index',
      type: 'boolean',
      description:
        'Prevent search engines from indexing this page. Useful for gated, duplicate, or campaign-only pages.',
      initialValue: false,
      fieldset: 'indexing',
    }),
    defineField({
      name: 'noFollow',
      title: 'No Follow',
      type: 'boolean',
      description: 'Ask search engines not to follow links on this page.',
      initialValue: false,
      fieldset: 'indexing',
    }),
    defineField({
      name: 'noArchive',
      title: 'No Archive',
      type: 'boolean',
      description:
        'Ask search engines not to show a cached version of this page.',
      initialValue: false,
      fieldset: 'indexing',
    }),
    defineField({
      name: 'noSnippet',
      title: 'No Snippet',
      type: 'boolean',
      description:
        'Ask search engines not to show a text snippet for this page in results.',
      initialValue: false,
      fieldset: 'indexing',
    }),
    defineField({
      name: 'noImageIndex',
      title: 'No Image Index',
      type: 'boolean',
      description: 'Ask search engines not to index images found on this page.',
      initialValue: false,
      fieldset: 'indexing',
    }),
    defineField({
      name: 'maxSnippet',
      title: 'Max Snippet Length',
      type: 'number',
      description:
        'Optional maximum number of text characters search engines may show in result snippets.',
      fieldset: 'indexing',
    }),
    defineField({
      name: 'maxImagePreview',
      title: 'Max Image Preview',
      type: 'string',
      description:
        'Optional image preview size, for example "none", "standard", or "large".',
      fieldset: 'indexing',
    }),
    defineField({
      name: 'maxVideoPreview',
      title: 'Max Video Preview Length',
      type: 'number',
      description:
        'Optional maximum number of seconds allowed for video previews in search results. Use -1 for no limit if your frontend later supports that behavior.',
      fieldset: 'indexing',
    }),
    defineField({
      name: 'paginationPrevUrl',
      title: 'Previous Page URL',
      type: 'url',
      description:
        'Full URL of the previous page in a paginated sequence, if applicable.',
      fieldset: 'alternates',
    }),
    defineField({
      name: 'paginationNextUrl',
      title: 'Next Page URL',
      type: 'url',
      description:
        'Full URL of the next page in a paginated sequence, if applicable.',
      fieldset: 'alternates',
    }),
    defineField({
      name: 'ogTitle',
      title: 'Open Graph Title',
      type: 'string',
      description:
        'Title used by Facebook, LinkedIn, and other Open Graph consumers when this page is shared.',
      fieldset: 'openGraph',
    }),
    defineField({
      name: 'ogDescription',
      title: 'Open Graph Description',
      type: 'text',
      rows: 3,
      description: 'Social sharing summary for Open Graph platforms.',
      fieldset: 'openGraph',
    }),
    createSeoImageField({
      name: 'ogImage',
      title: 'Open Graph Image',
      description:
        'Primary Open Graph share image. Use a strong focal point and leave safe space for cropping across social platforms.',
      fieldset: 'openGraph',
    }),
    defineField({
      name: 'ogType',
      title: 'Open Graph Type',
      type: 'string',
      description:
        'Open Graph content type. Use "website" for most marketing pages and "article" for editorial content.',
      options: {
        list: [
          {title: 'Website', value: 'website'},
          {title: 'Article', value: 'article'},
          {title: 'Profile', value: 'profile'},
        ],
      },
      fieldset: 'openGraph',
    }),
    defineField({
      name: 'ogUrl',
      title: 'Open Graph URL',
      type: 'url',
      description:
        'Explicit URL to expose in Open Graph tags when it should differ from the canonical or routed URL.',
      fieldset: 'openGraph',
    }),
    defineField({
      name: 'ogSiteName',
      title: 'Open Graph Site Name',
      type: 'string',
      description: 'Brand or publication name to expose in Open Graph tags.',
      fieldset: 'openGraph',
    }),
    defineField({
      name: 'ogLocale',
      title: 'Open Graph Locale',
      type: 'string',
      description: 'Locale code for Open Graph tags, such as "en_US" or "ro_RO".',
      fieldset: 'openGraph',
    }),
    defineField({
      name: 'twitterCard',
      title: 'Twitter Card Type',
      type: 'string',
      initialValue: 'summary_large_image',
      description:
        'Card layout used when this page is shared on X or other Twitter Card consumers.',
      options: {
        list: [
          {title: 'Summary', value: 'summary'},
          {title: 'Summary Large Image', value: 'summary_large_image'},
        ],
      },
      fieldset: 'twitter',
    }),
    defineField({
      name: 'twitterTitle',
      title: 'Twitter Title',
      type: 'string',
      description: 'Share title override for X/Twitter cards.',
      fieldset: 'twitter',
    }),
    defineField({
      name: 'twitterDescription',
      title: 'Twitter Description',
      type: 'text',
      rows: 3,
      description: 'Share description override for X/Twitter cards.',
      fieldset: 'twitter',
    }),
    createSeoImageField({
      name: 'twitterImage',
      title: 'Twitter Image',
      description:
        'Share image override for X/Twitter cards. Add alt text so previews remain accessible.',
      fieldset: 'twitter',
    }),
    defineField({
      name: 'twitterSite',
      title: 'Twitter Site Handle',
      type: 'string',
      description:
        'Brand-level X/Twitter handle, including the @ symbol, such as "@neovision".',
      fieldset: 'twitter',
    }),
    defineField({
      name: 'twitterCreator',
      title: 'Twitter Creator Handle',
      type: 'string',
      description:
        'Creator or author X/Twitter handle for article-style pages, including the @ symbol.',
      fieldset: 'twitter',
    }),
    defineField({
      name: 'socialTitle',
      title: 'Shared Social Title',
      type: 'string',
      description:
        'Fallback social title to use when a platform-specific title is not supplied.',
      fieldset: 'socialFallbacks',
    }),
    defineField({
      name: 'socialDescription',
      title: 'Shared Social Description',
      type: 'text',
      rows: 3,
      description:
        'Fallback social description to use when a platform-specific description is not supplied.',
      fieldset: 'socialFallbacks',
    }),
    createSeoImageField({
      name: 'socialImage',
      title: 'Shared Social Image',
      description:
        'Fallback social image used when no Open Graph or Twitter-specific image is supplied.',
      fieldset: 'socialFallbacks',
    }),
    defineField({
      name: 'socialImageAlt',
      title: 'Shared Social Image Alt Text',
      type: 'string',
      description:
        'Optional fallback alt text if your frontend later supports a shared social-image alt value.',
      fieldset: 'socialFallbacks',
    }),
    defineField({
      name: 'schemaType',
      title: 'Schema Type',
      type: 'string',
      description:
        'Primary Schema.org type this page should emit when structured data is generated.',
      options: {
        list: [
          {title: 'Web Page', value: 'WebPage'},
          {title: 'About Page', value: 'AboutPage'},
          {title: 'Service', value: 'Service'},
          {title: 'Article', value: 'Article'},
          {title: 'FAQ Page', value: 'FAQPage'},
          {title: 'Contact Page', value: 'ContactPage'},
        ],
      },
      fieldset: 'structuredData',
    }),
    defineField({
      name: 'structuredDataMode',
      title: 'Structured Data Mode',
      type: 'string',
      initialValue: 'inherit',
      description:
        'Choose whether structured data should inherit defaults, be generated by page type, or use a custom JSON-LD payload.',
      options: {
        list: [
          {title: 'Inherit Global Defaults', value: 'inherit'},
          {title: 'Generated from Page Type', value: 'generated'},
          {title: 'Custom JSON-LD', value: 'custom'},
        ],
      },
      fieldset: 'structuredData',
    }),
    defineField({
      name: 'structuredData',
      title: 'Custom Structured Data JSON-LD',
      type: 'text',
      rows: 10,
      description:
        'Raw JSON-LD payload for advanced structured data needs. Enter valid JSON only. This is used when Structured Data Mode is set to Custom.',
      hidden: ({parent}) => parent?.structuredDataMode !== 'custom',
      fieldset: 'structuredData',
    }),
    defineField({
      name: 'enableBreadcrumbSchema',
      title: 'Enable Breadcrumb Schema',
      type: 'boolean',
      description:
        'Declare that this page should emit breadcrumb structured data when frontend support is added.',
      initialValue: false,
      fieldset: 'structuredData',
    }),
    defineField({
      name: 'enableFaqSchema',
      title: 'Enable FAQ Schema',
      type: 'boolean',
      description:
        'Declare that this page should emit FAQ structured data when frontend support is added.',
      initialValue: false,
      fieldset: 'structuredData',
    }),
    defineField({
      name: 'searchTitle',
      title: 'Search-Specific Title',
      type: 'string',
      description:
        'Optional search-specific title override if you want search snippets to differ from the main meta title.',
      fieldset: 'editorial',
    }),
    defineField({
      name: 'searchDescription',
      title: 'Search-Specific Description',
      type: 'text',
      rows: 3,
      description:
        'Optional search-specific description override if you want search snippets to differ from the main meta description.',
      fieldset: 'editorial',
    }),
    defineField({
      name: 'breadcrumbTitle',
      title: 'Breadcrumb Title',
      type: 'string',
      description:
        'Optional shorter label for breadcrumbs if the page title is too long or too marketing-heavy.',
      fieldset: 'editorial',
    }),
    defineField({
      name: 'locale',
      title: 'Locale',
      type: 'string',
      description:
        'Human-facing locale or BCP 47 code for this page, such as "en", "en-US", or "ro-RO".',
      fieldset: 'editorial',
    }),
    defineField({
      name: 'themeColor',
      title: 'Theme Color',
      type: 'string',
      description:
        'Optional browser theme color, usually a hex value such as "#E30613".',
      fieldset: 'technical',
    }),
    defineField({
      name: 'applicationName',
      title: 'Application Name',
      type: 'string',
      description:
        'Optional application name for browser metadata if it should differ from the main brand name.',
      fieldset: 'technical',
    }),
    defineField({
      name: 'category',
      title: 'Metadata Category',
      type: 'string',
      description: 'Optional metadata category label for this page.',
      fieldset: 'technical',
    }),
    defineField({
      name: 'referrer',
      title: 'Referrer Policy',
      type: 'string',
      description:
        'Optional referrer policy value, such as "origin-when-cross-origin" or "strict-origin-when-cross-origin".',
      fieldset: 'technical',
    }),
    defineField({
      name: 'formatDetection',
      title: 'Format Detection',
      type: 'string',
      description:
        'Optional advanced mobile format-detection configuration, such as disabling automatic phone-number linking.',
      fieldset: 'technical',
    }),
  ],
})
