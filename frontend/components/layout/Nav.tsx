import {settingsQuery} from '@/sanity/lib/queries'
import {sanityFetch} from '@/sanity/lib/live'
import NavClient from './NavClient'

export default async function Nav() {
  const {data: settings} = await sanityFetch({
    query: settingsQuery,
  })

  const logoUrl = settings?.logoPicture?.asset?.url;

  return (
    <NavClient
      pages={settings?.navLinks || []}
      title={settings?.brandName || settings?.title || 'Neo xAi'}
      email={settings?.email}
      logo={logoUrl}
      cta={settings?.cta}
    />
  )
}
