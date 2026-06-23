import {CogIcon, SearchIcon} from '@sanity/icons'
import type {StructureBuilder, StructureResolver} from 'sanity/structure'

/**
 * Structure builder is useful whenever you want to control how documents are grouped and
 * listed in the studio or for adding additional in-studio previews or content to documents.
 * Learn more: https://www.sanity.io/docs/structure-builder-introduction
 */

const documentTypeList = (S: StructureBuilder, type: string, title: string) =>
  S.listItem().title(title).child(S.documentTypeList(type).title(title))

export const structure: StructureResolver = (S: StructureBuilder) =>
  S.list()
    .title('Website Content')
    .items([
      // Content
      S.divider().title('Content'),
      documentTypeList(S, 'post', 'Insights'),
      documentTypeList(S, 'project', 'Projects'),
      documentTypeList(S, 'service', 'Services'),
      documentTypeList(S, 'page', 'Pages'),

      // Leads
      S.divider().title('Leads'),
      documentTypeList(S, 'contactSubmission', 'Contact Submissions'),
      documentTypeList(S, 'resourceRequest', 'Resource Requests'),

      // Settings
      S.divider().title('Settings'),
      S.listItem()
        .title('Site Settings')
        .child(S.document().schemaType('siteSettings').documentId('siteSettings'))
        .icon(CogIcon),
      S.listItem()
        .title('SEO Settings')
        .child(S.document().schemaType('seoSettings').documentId('seoSettings'))
        .icon(SearchIcon),

      // Categories
      S.divider().title('Categories'),
      documentTypeList(S, 'insightCategory', 'Insight Categories'),
      documentTypeList(S, 'industry', 'Industry Categories'),

      // Resources
      S.divider().title('Resources'),
      documentTypeList(S, 'teamMember', 'Team Members'),
      documentTypeList(S, 'testimonial', 'Testimonials'),
      documentTypeList(S, 'technicalStack', 'Technical Stacks'),
      documentTypeList(S, 'freeResource', 'Free Resources'),
      documentTypeList(S, 'emailTemplate', 'Email Templates')
    ])
