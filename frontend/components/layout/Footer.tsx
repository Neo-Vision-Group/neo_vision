import {headers} from 'next/headers'
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

type NormalizedFooterLink = NormalizedFooterColumn['links'][number]

type NormalizedLegalLink = {
  _key: string
  label: string
  href: string
}

type NormalizedSocialLink = {
  _key: string
  label: string
  href: string
}

const SOCIAL_PLATFORM_LABELS = {
  instagram: 'Instagram',
  facebook: 'Facebook',
  linkedin: 'LinkedIn',
  github: 'GitHub',
  x: 'X',
  tiktok: 'TikTok',
} as const

export default async function Footer() {
  const nonce = (await headers()).get('x-nonce') ?? undefined
  const {data: settings} = await sanityFetch({
    query: settingsQuery,
  })

  const logoUrl = settings?.logoPicture?.asset?.url
  const rawColumns = settings?.footerColumns ?? []
  type FooterColumn = NonNullable<(typeof rawColumns)[number]>
  type FooterLink = NonNullable<NonNullable<FooterColumn['links']>[number]>
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

  const legalLinks = (settings?.legalLinks ?? []).flatMap((link, index): NormalizedLegalLink[] => {
    if (!link?.name || !link?.href) {
      return []
    }

    return [
      {
        _key: link._id ?? `legal-link-${index}`,
        label: link.name,
        href: link.href,
      },
    ]
  })

  const socialLinks = ([
    ['instagram', settings?.instagram],
    ['facebook', settings?.facebook],
    ['linkedin', settings?.linkedin],
    ['github', settings?.github],
    ['x', settings?.x],
    ['tiktok', settings?.tiktok],
  ] as const)
    .filter(([, href]) => Boolean(href))
    .map(
      ([platform, href], index): NormalizedSocialLink => ({
        _key: `social-${platform}-${index}`,
        label: SOCIAL_PLATFORM_LABELS[platform],
        href: href!,
      }),
    )

  const contactColumn: NormalizedFooterColumn | null = {
    _key: 'contact-details',
    title: 'Contact',
    links: [
      ...(settings?.email
        ? [
            {
              _key: 'contact-email',
              label: settings.email,
              href: `mailto:${settings.email}`,
              accent: false,
            },
          ]
        : []),
      ...(settings?.phoneNumber
        ? [
            {
              _key: 'contact-phone',
              label: settings.phoneNumber,
              href: `tel:${settings.phoneNumber.replace(/\s+/g, '')}`,
              accent: false,
            },
          ]
        : []),
      ...(settings?.location
        ? [
            {
              _key: 'contact-location',
              label: settings.location,
              href: '',
              accent: false,
            },
          ]
        : []),
      ...socialLinks.map(({_key, label, href}) => ({
        _key,
        label,
        href,
        accent: false,
      })),
    ],
  }

  const columnsWithoutSocial = columns.map((column) => ({
    ...column,
    links: column.links.filter(
      (link) =>
        !/instagram\.com|facebook\.com|linkedin\.com|github\.com|x\.com|twitter\.com|tiktok\.com/i.test(
          link.href,
        ),
    ),
  }))
  const contentColumns = columnsWithoutSocial.filter((column) => column.links.length > 0)
  const displayColumns = contactColumn.links.length > 0 ? [...contentColumns, contactColumn] : contentColumns

  return (
    <FooterClient
      columns={displayColumns}
      title={settings?.brandName || settings?.title || 'Neo xAi'}
      email={settings?.email}
      logo={logoUrl}
      location={settings?.location}
      phoneNumber={settings?.phoneNumber}
      copyright={settings?.legalName}
      legalLinks={legalLinks}
      nonce={nonce}
    />
  )
}
