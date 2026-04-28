import {validatePreviewUrl} from '@sanity/preview-url-secret'
import {draftMode} from 'next/headers'
import {NextResponse} from 'next/server'

import {client} from '@/sanity/lib/client'
import {token} from '@/sanity/lib/token'

export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  const {isValid, redirectTo = '/'} = await validatePreviewUrl(
    client.withConfig({token}),
    request.url
  )

  if (!isValid) {
    return new NextResponse('Invalid secret', {status: 401})
  }

  const draftModeStore = await draftMode()
  if (!draftModeStore.isEnabled) {
    draftModeStore.enable()
  }

  return NextResponse.redirect(new URL(redirectTo, request.url))
}
