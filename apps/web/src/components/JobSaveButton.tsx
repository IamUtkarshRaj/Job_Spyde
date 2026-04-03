'use client'

import { saveJob } from '@/app/(app)/discover/actions'
import { useState, useEffect } from 'react'
import { Check, Bookmark } from 'lucide-react'

export function JobSaveButton({ job }: { job: any }) {
    const [loading, setLoading] = useState(false)
    const [saved, setSaved] = useState(false)
    const [mounted, setMounted] = useState(false)

    useEffect(() => {
        setMounted(true)
    }, [])

    const handleSave = async (e: React.MouseEvent) => {
        // Prevent event bubbling if needed
        e.preventDefault()
        e.stopPropagation()
        
        setLoading(true)
        const res = await saveJob(job)
        setLoading(false)
        if (res?.success) {
            setSaved(true)
        }
    }

    // Return a similar-looking placeholder during hydration to prevent mismatch
    if (!mounted) {
        return (
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/5 text-slate-500 text-sm rounded-xl font-semibold border border-white/10 opacity-50">
                <Bookmark size={16} /> Save Job
            </div>
        )
    }

    if (saved) {
        return (
            <button disabled className="inline-flex items-center gap-2 px-4 py-2 bg-[var(--color-success)]/10 text-[var(--color-success)] text-sm rounded-xl font-bold border border-[var(--color-success)]/30 backdrop-blur-md transition-all shadow-[0_0_15px_rgba(105,246,184,0.15)]">
                <Check size={16} />
                Saved
            </button>
        )
    }

    return (
        <button
            onClick={handleSave}
            disabled={loading}
            className="magnetic-btn inline-flex items-center gap-2 px-4 py-2 bg-white/5 text-white hover:bg-white/10 text-sm rounded-xl font-semibold border border-white/10 shadow-[0_0_15px_rgba(133,173,255,0.1)] disabled:opacity-50 transition-all duration-300 hover:shadow-[0_0_20px_rgba(133,173,255,0.2)]"
        >
            <Bookmark size={16} className={loading ? "animate-pulse" : ""} />
            {loading ? 'Saving...' : 'Save Job'}
        </button>
    )
}
