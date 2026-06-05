import {settingsQuery} from '@/sanity/lib/queries'
import {sanityFetch} from '@/sanity/lib/live'
import {NavPageType} from '@/sanity/lib/types'
import {SettingsQueryResult} from '@/sanity.types'
import NavClient from './NavClient'

type RawNavPage = NonNullable<NonNullable<SettingsQueryResult>['navLinks']>[number]
type RawCtaLink = NonNullable<NonNullable<NonNullable<SettingsQueryResult>['cta']>['link']>

export default async function Nav() {
  const {data: settings} = await sanityFetch({
    query: settingsQuery,
  })

  const logoUrl = settings?.logoPicture?.asset?.url
  const pages = (settings?.navLinks ?? [])
    .filter(
      (page: RawNavPage | null | undefined): page is RawNavPage => Boolean(page?.name && page?.slug)
    )
    .map(
      (page: RawNavPage, index: number): NavPageType => ({
        _key: page._key ?? `nav-link-${index}`,
        name: page.name!,
        slug: page.slug as string,
      })
    )
  const cta =
    settings?.cta?.buttonText || settings?.cta?.link
      ? {
          buttonText: settings.cta?.buttonText ?? undefined,
          link: settings.cta?.link
            ? {
                linkType: settings.cta.link.linkType ?? undefined,
                href: settings.cta.link.href ?? undefined,
                page: settings.cta.link.page ?? undefined,
                post: settings.cta.link.post ?? undefined,
                service: (settings.cta.link as RawCtaLink).service ?? undefined,
                project: (settings.cta.link as RawCtaLink).project ?? undefined,
                openInNewTab: settings.cta.link.openInNewTab ?? undefined,
              }
            : undefined,
        }
      : undefined

  return (
    <NavClient
      pages={pages}
      title={settings?.brandName || settings?.title || 'Neo xAi'}
      email={settings?.email}
      logo={logoUrl}
      cta={cta}
    />
  )
}
