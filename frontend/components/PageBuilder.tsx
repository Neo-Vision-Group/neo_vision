'use client'

import {SanityDocument} from 'next-sanity'
import {useOptimistic} from 'next-sanity/hooks'
import {useEffect} from 'react'

import BlockRenderer from '@/components/BlockRenderer'
import {PageTransitionMarker} from '@/components/transition/PageTransitionMarker'
import {PageQueryResult} from '@/sanity.types'
import {dataAttr} from '@/sanity/lib/utils'
import {PageBuilderSection} from '@/sanity/lib/types'

type PageBuilderPageProps = {
  page: PageQueryResult
  deferRouteReadySignal?: boolean
}

type PageData = {
  _id: string
  _type: string
  pageBuilder?: PageBuilderSection[]
}

/**
 * The PageBuilder component is used to render the blocks from the `pageBuilder` field in the Page type in your Sanity Studio.
 */

function RenderSections({
  pageBuilderSections,
  page,
}: {
  pageBuilderSections: PageBuilderSection[]
  page: PageQueryResult
}) {
  if (!page) {
    return null
  }

  return (
    <div
      data-sanity={dataAttr({
        id: page._id,
        type: page._type,
        path: `pageBuilder`,
      }).toString()}
    >
      <div>
        {pageBuilderSections.map((block: PageBuilderSection, index: number) => (
          <div key={block._key}>
            <BlockRenderer
              index={index}
              block={block}
              pageId={page._id}
              pageType={page._type}
            />
          </div>
        ))}
      </div>
    </div>
  )
}

function RenderEmptyState({page}: {page: PageQueryResult}) {
  if (!page) {
    return null
  }

  return (
    <div
      className="container mt-10"
      data-sanity={dataAttr({
        id: page._id,
        type: 'page',
        path: `pageBuilder`,
      }).toString()}
    >
      <div className="prose">
        <h2 className="">This page has no content!</h2>
        <p className="">Open the page in Sanity Studio to add content.</p>
      </div>
    </div>
  )
}

function useScrollToHash() {
  useEffect(() => {
    const hash = window.location.hash
    if (!hash) return

    let attempts = 0
    const maxAttempts = 20
    const delay = 100

    const tryScroll = () => {
      const element = document.querySelector(hash)
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'start' })
        return true
      }
      return false
    }

    const interval = setInterval(() => {
      attempts++
      if (tryScroll() || attempts >= maxAttempts) {
        clearInterval(interval)
      }
    }, delay)

    return () => clearInterval(interval)
  }, [])
}

export default function PageBuilder({
  page,
  deferRouteReadySignal = false,
}: PageBuilderPageProps) {
  useScrollToHash()

  const pageBuilderSections = useOptimistic<
    PageBuilderSection[] | undefined,
    SanityDocument<PageData>
  >(page?.pageBuilder || [], (currentSections, action) => {

    // The action contains updated document data from Sanity
    // when someone makes an edit in the Studio

    // If the edit was to a different document, ignore it
    if (action.id !== page?._id) {
      return currentSections
    }

    // If there are sections in the updated document, use them
    if (action.document.pageBuilder) {
      // Reconcile References. https://www.sanity.io/docs/enabling-drag-and-drop#ffe728eea8c1
      return action.document.pageBuilder.map(
        (section) => currentSections?.find((s) => s._key === section?._key) || section,
      )
    }

    // Otherwise keep the current sections
    return currentSections
  })

  return (
    <>
      {pageBuilderSections && pageBuilderSections.length > 0 ? (
        <RenderSections pageBuilderSections={pageBuilderSections} page={page} />
      ) : (
        <RenderEmptyState page={page} />
      )}
      {!deferRouteReadySignal ? <PageTransitionMarker /> : null}
    </>
  )
}
