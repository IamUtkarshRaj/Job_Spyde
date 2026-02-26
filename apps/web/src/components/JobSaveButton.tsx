'use client'

import { saveJob } from '@/app/discover/actions'
import { useState } from 'react'
import { Check, Bookmark } from 'lucide-react'

export function JobSaveButton({ job }: { job: any }) {
    const [loading, setLoading] = useState(false)
    const [saved, setSaved] = useState(false)

    const handleSave = async () => {
        setLoading(true)
        const res = await saveJob(job)
        setLoading(false)
        if (res?.success) {
            setSaved(true)
        }
    }

    if (saved) {
        return (
            <button disabled className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-green-500/15 text-green-300 text-sm rounded-lg font-medium border border-green-500/20">
                <Check size={14} />
                Saved
            </button>
        )
    }

    return (
        <button
            onClick={handleSave}
            disabled={loading}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 gradient-bg text-white hover:brightness-110 text-sm rounded-lg font-medium shadow-md shadow-indigo-500/15 disabled:opacity-50 transition-all duration-200"
        >
            <Bookmark size={14} />
            {loading ? 'Saving...' : 'Save Job'}
        </button>
    )
}
