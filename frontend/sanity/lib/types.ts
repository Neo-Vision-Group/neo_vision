import {PageQueryResult} from '@/sanity.types'

export type PageBuilderSection = NonNullable<NonNullable<PageQueryResult>['pageBuilder']>[number]
export type ExtractPageBuilderType<T extends PageBuilderSection['_type']> = Extract<
  PageBuilderSection,
  {_type: T}
>

// Represents a Link after GROQ dereferencing (page/post become slug strings)
export type DereferencedLink = {
  _type: 'link'
  linkType?: 'href' | 'page' | 'post' | 'service' | 'project'
  href?: string
  page?: string | null
  post?: string | null
  service?: string | null
  project?: string | null
  openInNewTab?: boolean
}

export type NavPageType = {
  _key?: string
  name: string
  slug: string
}
