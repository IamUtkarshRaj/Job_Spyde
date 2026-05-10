'use client'

import dynamic from 'next/dynamic'
import { useState, useCallback } from 'react'
import { FileDown, Eye, X, Loader2 } from 'lucide-react'

// Dynamic import to avoid SSR issues with @react-pdf/renderer
const PDFDownloadLink = dynamic(
    () => import('@react-pdf/renderer').then(mod => mod.PDFDownloadLink),
    { ssr: false }
)

const BlobProvider = dynamic(
    () => import('@react-pdf/renderer').then(mod => mod.BlobProvider),
    { ssr: false }
)

// Import the PDF template
import { ResumePDF } from './ResumePDF'

interface ResumePDFViewerProps {
    data: any
    profileName: string
    company: string
    onClose: () => void
}

export function ResumePDFViewer({ data, profileName, company, onClose }: ResumePDFViewerProps) {
    const [showPreview, setShowPreview] = useState(true)
    
    const fileName = `${(profileName || 'resume').replace(/\s+/g, '_')}_${(company || 'optimized').replace(/\s+/g, '_')}_${new Date().toISOString().slice(0, 10)}.pdf`

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="glass-panel ghost-border rounded-3xl p-6 relative overflow-hidden">
                <div className="flex justify-between items-center relative z-10">
                    <div>
                        <h3 className="text-lg font-bold text-white flex items-center gap-2">
                            <Eye size={18} className="text-[var(--color-accent-primary)]" />
                            Resume PDF Preview
                        </h3>
                        <p className="text-xs text-slate-500 mt-1 font-mono">{fileName}</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <PDFDownloadLink
                            document={<ResumePDF data={data} />}
                            fileName={fileName}
                        >
                            {({ loading }: { loading: boolean }) => (
                                <button
                                    disabled={loading}
                                    className="inline-flex items-center gap-2 px-6 py-3 bg-[var(--color-accent-primary)] text-white hover:bg-[var(--color-accent-hover)] hover:shadow-[0_0_20px_rgba(133,173,255,0.4)] text-xs font-bold uppercase tracking-widest rounded-xl transition-all active:scale-95 disabled:opacity-50"
                                >
                                    {loading ? (
                                        <>
                                            <Loader2 size={14} className="animate-spin" />
                                            Generating...
                                        </>
                                    ) : (
                                        <>
                                            <FileDown size={14} />
                                            Download PDF
                                        </>
                                    )}
                                </button>
                            )}
                        </PDFDownloadLink>
                        <button
                            onClick={onClose}
                            className="p-2.5 rounded-xl bg-white/5 border border-white/10 text-slate-400 hover:bg-white/10 hover:text-white transition-all"
                        >
                            <X size={16} />
                        </button>
                    </div>
                </div>
            </div>

            {/* PDF Inline Preview using BlobProvider */}
            {showPreview && (
                <div className="glass-panel ghost-border rounded-3xl overflow-hidden relative" style={{ minHeight: '80vh' }}>
                    <BlobProvider document={<ResumePDF data={data} />}>
                        {({ url, loading, error }: { url: string | null; loading: boolean; error: Error | null }) => {
                            if (loading) {
                                return (
                                    <div className="flex flex-col items-center justify-center py-32">
                                        <div className="w-12 h-12 border-2 border-[var(--color-accent-primary)] border-t-transparent rounded-full animate-spin mb-4" />
                                        <p className="text-sm text-slate-400 font-medium">Rendering PDF preview...</p>
                                    </div>
                                )
                            }
                            if (error) {
                                return (
                                    <div className="flex flex-col items-center justify-center py-32">
                                        <p className="text-sm text-red-400 font-medium mb-2">Failed to render preview</p>
                                        <p className="text-xs text-slate-500">{error.message}</p>
                                    </div>
                                )
                            }
                            if (url) {
                                return (
                                    <iframe
                                        src={url}
                                        className="w-full border-0 bg-white rounded-3xl"
                                        style={{ height: '85vh' }}
                                        title="Resume PDF Preview"
                                    />
                                )
                            }
                            return null
                        }}
                    </BlobProvider>
                </div>
            )}
        </div>
    )
}
