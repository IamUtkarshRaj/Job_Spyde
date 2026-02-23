'use client'

import { saveJob } from '@/app/discover/actions'
import { useState } from 'react'

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
            <button disabled className="px-3 py-1 bg-green-100 text-green-700 text-sm rounded font-medium">
                Saved
            </button>
        )
    }

    return (
        <button
            onClick={handleSave}
            disabled={loading}
            className="px-3 py-1 bg-blue-600 text-white hover:bg-blue-700 text-sm rounded font-medium disabled:opacity-50"
        >
            {loading ? 'Saving...' : 'Save Job'}
        </button>
    )
}
