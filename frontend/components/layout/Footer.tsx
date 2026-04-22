import {settingsQuery} from '@/sanity/lib/queries'
import {sanityFetch} from '@/sanity/lib/live'
import {Footer as FooterClient} from './FooterClient'

export default async function Footer() {
  const {data: settings} = await sanityFetch({
    query: settingsQuery,
  })

  const logoUrl = settings?.logoPicture?.asset?.url;

  return (
    <FooterClient
      columns={settings?.footerColumns || []}
      title={settings?.brandName || settings?.title || 'Neo xAi'}
      email={settings?.email}
      logo={logoUrl}
      location={settings?.location}
      copyright={settings?.legalName}
    />
  )
}
