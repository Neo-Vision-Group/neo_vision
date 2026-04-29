import {SearchIcon} from '@sanity/icons'
import {defineField, defineType} from 'sanity'

export const seoSettings = defineType({
  name: 'seoSettings',
  title: 'SEO Settings',
  type: 'document',
  icon: SearchIcon,
  fields: [
    defineField({
      name: 'siteName',
      title: 'Site Name',
      type: 'string',
      description:
        'Primary brand or publication name used by default in SEO and social metadata across the site.',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'defaultSeo',
      title: 'Default SEO Values',
      type: 'seo',
      description:
        'Global SEO defaults for the site. Page-level SEO override fields should only be used when a specific page needs to differ from these values.',
    }),
    defineField({
      name: 'googleSiteVerification',
      title: 'Google Site Verification',
      type: 'string',
      description:
        'Verification token for Google Search Console ownership checks.',
    }),
    defineField({
      name: 'bingSiteVerification',
      title: 'Bing Site Verification',
      type: 'string',
      description:
        'Verification token for Bing Webmaster Tools ownership checks.',
    }),
    defineField({
      name: 'pinterestVerification',
      title: 'Pinterest Verification',
      type: 'string',
      description:
        'Verification token for Pinterest domain ownership.',
    }),
    defineField({
      name: 'yandexVerification',
      title: 'Yandex Verification',
      type: 'string',
      description:
        'Verification token for Yandex Webmaster domain ownership.',
    }),
    defineField({
      name: 'facebookDomainVerification',
      title: 'Facebook Domain Verification',
      type: 'string',
      description:
        'Verification token used for Facebook Business or Meta domain ownership.',
    }),
  ],
  preview: {
    prepare() {
      return {
        title: 'SEO Settings',
      }
    },
  },
})
