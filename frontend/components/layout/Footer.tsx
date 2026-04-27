import {settingsQuery} from '@/sanity/lib/queries'
import {sanityFetch} from '@/sanity/lib/live'
import {Footer as FooterClient} from './FooterClient'

type NormalizedFooterColumn = {
  _key: string
  title: string
  links: {
    _key: string
    label: string
    href: string
    accent: boolean
  }[]
}

export default async function Footer() {
  const {data: settings} = await sanityFetch({
    query: settingsQuery,
  })

  const logoUrl = settings?.logoPicture?.asset?.url
  const rawColumns = settings?.footerColumns ?? []
  type FooterColumn = NonNullable<(typeof rawColumns)[number]>
  type FooterLink = NonNullable<NonNullable<FooterColumn['links']>[number]>
  type NormalizedFooterLink = NormalizedFooterColumn['links'][number]
  const columns = rawColumns
    .map((column: FooterColumn, columnIndex: number) => {
      const links = (column?.links ?? [])
        .filter((link: FooterLink | null | undefined): link is NormalizedFooterLink =>
          Boolean(link?.label && link?.href),
        )
        .map((link: NormalizedFooterLink, linkIndex: number) => ({
          _key: link._key ?? `${column?._key ?? columnIndex}-link-${linkIndex}`,
          label: link.label,
          href: link.href,
          accent: link.accent ?? false,
        }))

      if (!column?.title || links.length === 0) {
        return null
      }

      return {
        _key: column._key ?? `footer-column-${columnIndex}`,
        title: column.title,
        links,
      }
    })
    .filter(
      (column: NormalizedFooterColumn | null): column is NormalizedFooterColumn => column !== null,
    )

  return (
    <FooterClient
      columns={columns}
      cookiePreferencesLabel={
        settings?.cookieSettings?.enabled ? settings.cookieSettings.footerButtonLabel : null
      }
      title={settings?.brandName || settings?.title || 'Neo xAi'}
      email={settings?.email}
      logo={logoUrl}
      location={settings?.location}
      phoneNumber={settings?.phoneNumber}
      copyright={settings?.legalName}
    />
  )
}
