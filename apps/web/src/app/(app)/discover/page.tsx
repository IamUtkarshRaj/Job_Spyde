'use client'

import { useState, useEffect } from 'react'
import { JobSaveButton } from '@/components/JobSaveButton'
import Link from 'next/link'
import { Badge } from '@/components/ui/Badge'
import { ArrowLeft, Loader2, Sparkles } from 'lucide-react'
import { createClient } from '@/utils/supabase/client'

export default function DiscoverPage() {
    const [jobs, setJobs] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [statusMessage, setStatusMessage] = useState('Initializing agent...')

    useEffect(() => {
        const fetchJobs = async () => {
            setLoading(true)
            setError(null)
            setJobs([])

            try {
                const supabase = createClient()
                const { data: { user } } = await supabase.auth.getUser()
                if (!user) {
                    setError('You must be logged in to discover jobs.')
                    setLoading(false)
                    return
                }

                // Fetch preferences
                const { data: profile } = await supabase.from('profiles').select('preferences').eq('id', user.id).single()
                const prefs = profile?.preferences || {}

                const payload = {
                    user_id: user.id,
                    roles: prefs.roles || [],
                    locations: prefs.locations || [],
                    remote: prefs.remote_preference || false,
                    keywords: prefs.keywords || []
                }

                setStatusMessage('Scraping and matching jobs (this may take a minute)...')

                const AGENT_URL = process.env.NEXT_PUBLIC_AGENT_URL || 'http://127.0.0.1:8000'
                const response = await fetch(`${AGENT_URL}/v1/jobs/collect`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload),
                })

                if (!response.ok) throw new Error('Failed to connect to agent.')

                const data = await response.json()
                setJobs(data)
                setStatusMessage('Discovery complete!')
            } catch (err: any) {
                console.error('Discovery error:', err)
                setError(err.message || 'An error occurred while discovering jobs.')
            } finally {
                setLoading(false)
            }
        }

        fetchJobs()
    }, [])

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                    <h2 className="text-3xl font-bold tracking-tight text-slate-100">Live Discover</h2>
                    {loading && (
                        <div className="bg-indigo-500/10 text-indigo-400 text-xs px-2 py-1 rounded-full flex items-center gap-2 border border-indigo-500/20">
                            <Loader2 size={12} className="animate-spin" />
                            {statusMessage}
                        </div>
                    )}
                </div>
                <Link href="/dashboard" className="text-sm text-indigo-400 hover:text-indigo-300 flex items-center gap-1.5 transition-colors">
                    <ArrowLeft size={14} /> Back to Dashboard
                </Link>
            </div>

            <p className="text-slate-500 flex items-center gap-2">
                <Sparkles size={16} className="text-indigo-400" />
                AI is currently matching jobs across LinkedIn, Google Jobs, and Naukri...
            </p>

            {error && (
                <div className="bg-red-500/10 border border-red-500/20 p-4 rounded-xl text-red-400 text-sm">
                    {error}
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {jobs.map((job: any, index: number) => (
                    <div key={index} className="glass-card glass-card-lift p-5 flex flex-col justify-between transform animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <div>
                            <div className="flex justify-between items-start mb-2">
                                <h3 className="font-semibold text-lg text-slate-100 line-clamp-2">{job.title}</h3>
                                <Badge variant="match" score={job.match_score}>
                                    {job.match_score}%
                                </Badge>
                            </div>
                            <div className="text-sm text-slate-500 mb-3">{job.company} • {job.location}</div>
                            <p className="text-sm text-slate-400 line-clamp-3 mb-4 leading-relaxed">
                                {job.description}
                            </p>
                        </div>
                        <div className="flex justify-between items-center mt-auto pt-4 border-t border-slate-800/30">
                            <a href={job.url} target="_blank" rel="noopener noreferrer" className="text-sm text-indigo-400 hover:text-indigo-300 font-medium transition-colors">
                                View Posting
                            </a>
                            <JobSaveButton job={job} />
                        </div>
                    </div>
                ))}

                {!loading && jobs.length === 0 && !error && (
                    <div className="col-span-full text-center py-12 glass-card">
                        <p className="text-slate-500">No matching jobs found yet. Try broadening your profile preferences.</p>
                    </div>
                )}

                {loading && jobs.length === 0 && (
                    <div className="col-span-full py-20 flex flex-col items-center justify-center space-y-4">
                        <Loader2 className="w-10 h-10 text-indigo-500 animate-spin" />
                        <p className="text-slate-400 animate-pulse">{statusMessage}</p>
                    </div>
                )}
            </div>
        </div>
    )
}
