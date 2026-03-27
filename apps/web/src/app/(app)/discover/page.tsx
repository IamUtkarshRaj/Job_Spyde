'use client'

import { useState, useEffect } from 'react'
import { JobSaveButton } from '@/components/JobSaveButton'
import Link from 'next/link'
import { Badge } from '@/components/ui/Badge'
import { ArrowLeft, Loader2, Sparkles, Navigation } from 'lucide-react'
import { createClient } from '@/utils/supabase/client'

export default function DiscoverPage() {
    const [jobs, setJobs] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [statusMessage, setStatusMessage] = useState('Initializing agents...')

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
        <div className="space-y-8 relative z-10 w-full">
            <div className="flex justify-between items-center flex-wrap gap-4">
                <div className="flex items-center gap-4">
                    <h2 className="text-4xl font-bold tracking-tighter aurora-text py-1">Live Discover</h2>
                    {loading && (
                        <div className="bg-[var(--color-accent-primary)]/10 text-[var(--color-neon-teal)] text-xs font-medium px-3 py-1.5 rounded-full flex items-center gap-2 border border-[var(--color-neon-teal)]/20 shadow-[0_0_10px_rgba(105,246,184,0.2)] backdrop-blur-md">
                            <Loader2 size={14} className="animate-spin" />
                            {statusMessage}
                        </div>
                    )}
                </div>
                <Link href="/dashboard" className="text-sm font-semibold text-slate-400 hover:text-white flex items-center gap-2 transition-colors bg-white/5 border border-white/10 px-4 py-2 rounded-xl hover:bg-white/10">
                    <ArrowLeft size={16} /> Dashboard
                </Link>
            </div>

            <p className="text-slate-400 flex items-center gap-2 font-light">
                <Sparkles size={18} className="text-[var(--color-accent-primary)]" />
                Autonomous AI agents are sourcing and matching the exact opportunities for you.
            </p>

            {error && (
                <div className="bg-[var(--color-error)]/10 border border-[var(--color-error)]/20 p-5 rounded-2xl text-[var(--color-error)] text-sm font-medium">
                    {error}
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {jobs.map((job: any, index: number) => (
                    <div key={index} className="glass-panel ghost-border p-6 rounded-2xl flex flex-col justify-between group hover:border-[var(--color-accent-primary)]/30 transition-all duration-500" style={{ animationDelay: `${index * 50}ms` }}>
                        <div>
                            <div className="flex justify-between items-start mb-3">
                                <h3 className="font-bold text-xl text-white line-clamp-2 leading-tight group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-white group-hover:to-[var(--color-neon-teal)] transition-all duration-300">{job.title}</h3>
                                <Badge variant="match" score={job.match_score} className="ml-3 shrink-0 shadow-md">
                                    {job.match_score}%
                                </Badge>
                            </div>
                            <div className="text-sm font-medium text-slate-400 mb-4">{job.company} <span className="text-slate-600 mx-1">•</span> {job.location}</div>
                            <p className="text-sm text-slate-500 line-clamp-3 mb-6 leading-relaxed font-light">
                                {job.description}
                            </p>
                        </div>
                        <div className="flex justify-between items-center mt-auto pt-4 border-t border-white/5 relative z-20">
                            <a href={job.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-sm font-semibold text-slate-400 hover:text-white transition-colors">
                                <Navigation size={14} className="text-[var(--color-neon-teal)]" /> Check Posting
                            </a>
                            <div className="z-30">
                                <JobSaveButton job={job} />
                            </div>
                        </div>
                    </div>
                ))}

                {!loading && jobs.length === 0 && !error && (
                    <div className="col-span-full text-center py-20 glass-panel border-dashed">
                        <Sparkles size={32} className="mx-auto text-slate-500 mb-4" />
                        <h3 className="text-xl font-semibold text-white mb-2">Awaiting Signals</h3>
                        <p className="text-slate-400 font-light max-w-sm mx-auto">No matching jobs found yet. Adjust your intelligence parameters in your profile.</p>
                    </div>
                )}

                {loading && jobs.length === 0 && (
                    <div className="col-span-full py-24 flex flex-col items-center justify-center space-y-5 glass-panel opacity-50 relative overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full animate-[shimmer_2s_infinite]" />
                        <Loader2 className="w-12 h-12 text-[var(--color-neon-teal)] animate-spin relative z-10" />
                        <p className="text-slate-400 animate-pulse relative z-10 font-medium">{statusMessage}</p>
                    </div>
                )}
            </div>
        </div>
    )
}
