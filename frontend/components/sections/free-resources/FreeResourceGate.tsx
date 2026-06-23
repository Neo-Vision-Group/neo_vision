'use client'
import { useState, useEffect } from 'react'
import { ResourceRequestPopUp } from '@/components/partials/ResourceRequestPopUp'
import dynamic from 'next/dynamic'
import { useLeadMagnet } from '@/hooks/useLeadMagnet'
import HTMLViewer from './HTMLViewer'
import type { FreeResourcesData } from '@/app/free-resources/[slug]/page'

const PDFViewer = dynamic(() => import('./PDFViewer'), {
    ssr: false,
    loading: () => <p>Loading PDF Viewer...</p>,
})

const ImageViewer = dynamic(() => import('./ImageViewer'), {
    ssr: false,
    loading: () => <p>Loading Image Viewer...</p>,
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

    if (resource.askForEmail && hasAccess === null) {
        return <div className="min-h-[60vh]" />
    }

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
                <ImageViewer
                    src={resource.file.asset?.asset?.url ?? ''}
                    title={resource.title}
                    alt={resource.title ?? 'Free Resource'}
                    downloadCta={resource.downloadCta}
                    downloadUrl={resource.file.asset?.asset?.url}
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
                imageUrl={resource.file.type === 'image' ? (resource.file.asset?.asset?.url ?? '') : undefined}
                onClose={handleClosePopup}
            />
        </div>
    )
}
