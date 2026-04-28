import {cookies} from 'next/headers'
import {RouteLoading} from '@/components/RouteLoading'
import {FirstLoadIntro} from '@/components/partials/FirstLoadIntro'
import {RouteLoadingBoundary} from '@/components/RouteLoadingBoundary'
import {INTRO_COOKIE_NAME} from '@/lib/intro'

export async function InitialRouteLoading({label}: {label: string}) {
  const cookieStore = await cookies()
  const hasSeenIntro = cookieStore.get(INTRO_COOKIE_NAME)?.value === '1'

  if (!hasSeenIntro) {
    return <FirstLoadIntro />
  }

  return (
    <RouteLoadingBoundary>
      <RouteLoading label={label} />
    </RouteLoadingBoundary>
  )
}
