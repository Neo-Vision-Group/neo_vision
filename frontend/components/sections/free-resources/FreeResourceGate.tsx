'use client'
import { useState, useEffect } from 'react'
import { ResourceRequestPopUp } from '@/components/partials/ResourceRequestPopUp'
import Image from 'next/image'
import dynamic from 'next/dynamic'
import { useLeadMagnet } from '@/hooks/useLeadMagnet'
import HTMLViewer from './HTMLViewer'
import type { FreeResourcesData } from '@/app/free-resources/[slug]/page'

const PDFViewer = dynamic(() => import('./PDFViewer'), {
    ssr: false,
    loading: () => <p>Loading PDF Viewer...</p>,
})

export default function FreeResourceGate({ resource }: { resource: FreeResourcesData }) {
    const { hasAccess, unlockResources } = useLeadMagnet()

    const [isPopupOpen, setIsPopupOpen] = useState(false)

    useEffect(() => {
        if (resource.askForEmail && hasAccess === false) {
            setIsPopupOpen(true)
        }
    }, [resource.askForEmail, hasAccess])

    useEffect(() => {
        if (hasAccess) {
            setIsPopupOpen(false)
        }
    }, [hasAccess])

    const handleClosePopup = () => {
        unlockResources()
        setIsPopupOpen(false)
    }

    if (!resource.file) return null

    return (
        <div>
            {resource.file.type === 'pdf' && (
                <PDFViewer
                    fileUrl={resource.file.asset?.asset?.url ?? ''}
                    title={resource.title}
                    downloadCta={resource.downloadCta}
                    downloadUrl={resource.file.asset?.asset?.url}
                />
            )}
            {resource.file.type === 'image' && (
                <Image
                    src={resource.file.asset?.asset?.url ?? ''}
                    alt={resource.title ?? 'Free Resource'}
                    width={1200}
                    height={800}
                />
            )}
            {resource.file.type === 'html' && (
                <HTMLViewer
                    src={resource.file.asset?.asset?.url ?? ''}
                    title={resource.title ?? 'Free Resource'}
                />
            )}
            <ResourceRequestPopUp 
                isOpen={isPopupOpen} 
                resourceName={resource?.title ?? 'resource'}
                isClosable={false}
                pageSlug={resource.slug ?? ''}
                itemKey={resource?._id ?? ''}
                onClose={handleClosePopup}
            />
        </div>
    )
}
