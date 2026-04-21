import {settingsQuery} from '@/sanity/lib/queries'
import {sanityFetch} from '@/sanity/lib/live'
import NavClient from './NavClient'

export default async function Nav() {
  const {data: settings} = await sanityFetch({
    query: settingsQuery,
  })

  console.log('Nav settings:', JSON.stringify(settings, null, 2))
  console.log('Nav links:', settings?.navLinks)

  return (
    <NavClient
      pages={settings?.navLinks || []}
      title={settings?.brandName || settings?.title || 'Neo xAi'}
      email={settings?.email}
      logo={settings?.logoPicture?.asset?.url}
      cta={settings?.cta}
    />
  )
}
