'use client'

import dynamic from 'next/dynamic'

const PDFViewer = dynamic(
    () => import('@/components/sections/free-resources/PDFViewer'),
    {ssr: false, loading: () => <p>Loading PDF Viewer...</p>},
)

export default function PDFViewerClient({fileUrl}: {fileUrl: string}) {
    return <PDFViewer fileUrl={fileUrl} />
}
