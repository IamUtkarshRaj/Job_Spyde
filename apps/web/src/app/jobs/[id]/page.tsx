import { createClient } from '@/utils/supabase/server'
import Link from 'next/link'
import { generateResume, updateStatus } from './actions'
import { ArrowLeft, MapPin, Building, Calendar, Globe, FileText, CheckCircle, Clock, XCircle, Send, Sparkles } from 'lucide-react'
import { Badge } from '@/components/ui/Badge'

export default async function JobDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params
    const supabase = await createClient()

    const { data: job } = await supabase.from('jobs').select('*').eq('id', id).single()

    if (!job) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-4">
                <h2 className="text-xl font-semibold text-slate-200">Job not found</h2>
                <div className="text-slate-500">The job you are looking for does not exist or has been removed.</div>
                <Link href="/dashboard" className="text-indigo-400 hover:text-indigo-300 font-medium flex items-center gap-2 transition-colors">
                    <ArrowLeft size={16} /> Back to Dashboard
                </Link>
            </div>
        )
    }

    const { data: drafts } = await supabase.from('drafts').select('*').eq('job_id', id).order('created_at', { ascending: false })
    const currentDraft = drafts && drafts.length > 0 ? drafts[0] : null

    async function markApplied() {
        'use server'
        await updateStatus(id, 'applied')
    }

    async function markInterview() {
        'use server'
        await updateStatus(id, 'interview')
    }

    async function markOffer() {
        'use server'
        await updateStatus(id, 'offer')
    }

    async function markRejected() {
        'use server'
        await updateStatus(id, 'rejected')
    }

    async function handleGenerateResume() {
        'use server'
        await generateResume(id)
    }

    return (
        <div className="max-w-5xl mx-auto space-y-8">
            {/* Header */}
            <div>
                <Link
                    href="/dashboard"
                    className="inline-flex items-center text-sm font-medium text-slate-500 hover:text-slate-300 mb-6 transition-colors"
                >
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to Dashboard
                </Link>

                <div className="glass-card p-6 flex flex-col md:flex-row justify-between items-start gap-6">
                    <div className="flex bg-slate-800/60 rounded-xl p-4 h-20 w-20 items-center justify-center border border-slate-700/30">
                        <Building className="h-9 w-9 text-slate-500" />
                    </div>
                    <div className="flex-1 space-y-2">
                        <h1 className="text-2xl font-bold tracking-tight text-slate-100">{job.title}</h1>
                        <div className="flex flex-wrap items-center gap-4 text-sm text-slate-400">
                            <div className="flex items-center gap-1.5 font-medium text-slate-300">
                                <Building size={16} />
                                {job.company}
                            </div>
                            <div className="flex items-center gap-1.5">
                                <MapPin size={16} />
                                {job.location}
                            </div>
                            {job.posted_at && (
                                <div className="flex items-center gap-1.5">
                                    <Calendar size={16} />
                                    Posted {new Date(job.posted_at).toLocaleDateString()}
                                </div>
                            )}
                            {job.match_score !== null && (
                                <Badge variant="match" score={job.match_score}>
                                    {job.match_score}% Match
                                </Badge>
                            )}
                        </div>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
                        <a
                            href={job.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-800/50 border border-slate-700 px-4 py-2.5 text-sm font-medium text-slate-300 hover:border-indigo-500/30 hover:text-slate-100 transition-all duration-200"
                        >
                            <Globe size={16} />
                            View Listing
                        </a>
                        <form action={markApplied}>
                            <button
                                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl gradient-bg px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-indigo-500/20 hover:shadow-indigo-500/30 hover:brightness-110 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                                disabled={job.status === 'applied'}
                            >
                                <Send size={16} />
                                {job.status === 'applied' ? 'Applied' : 'Mark Applied'}
                            </button>
                        </form>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Content */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="glass-card overflow-hidden">
                        <div className="border-b border-slate-800/50 px-6 py-4 bg-slate-800/30">
                            <h2 className="font-semibold text-slate-200">Job Description</h2>
                        </div>
                        <div className="p-6 text-slate-400 leading-relaxed whitespace-pre-line text-sm">
                            {job.description}
                        </div>
                    </div>
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                    {/* Status Card */}
                    <div className="glass-card p-6">
                        <h3 className="font-semibold text-slate-200 mb-4">Application Status</h3>
                        <div className="space-y-3">
                            <form action={markInterview}>
                                <button className={`w-full flex items-center justify-between p-3 rounded-xl border transition-all duration-200 ${job.status === 'interview' ? 'bg-purple-500/15 border-purple-500/30 text-purple-300 font-medium' : 'bg-slate-800/30 border-slate-700/30 text-slate-400 hover:border-purple-500/20 hover:bg-purple-500/5'}`}>
                                    <span className="flex items-center gap-2"><Clock size={16} /> Interviewing</span>
                                    {job.status === 'interview' && <CheckCircle size={16} />}
                                </button>
                            </form>
                            <form action={markOffer}>
                                <button className={`w-full flex items-center justify-between p-3 rounded-xl border transition-all duration-200 ${job.status === 'offer' ? 'bg-green-500/15 border-green-500/30 text-green-300 font-medium' : 'bg-slate-800/30 border-slate-700/30 text-slate-400 hover:border-green-500/20 hover:bg-green-500/5'}`}>
                                    <span className="flex items-center gap-2"><CheckCircle size={16} /> Offer Received</span>
                                    {job.status === 'offer' && <CheckCircle size={16} />}
                                </button>
                            </form>
                            <form action={markRejected}>
                                <button className={`w-full flex items-center justify-between p-3 rounded-xl border transition-all duration-200 ${job.status === 'rejected' ? 'bg-red-500/15 border-red-500/30 text-red-300 font-medium' : 'bg-slate-800/30 border-slate-700/30 text-slate-400 hover:border-red-500/20 hover:bg-red-500/5'}`}>
                                    <span className="flex items-center gap-2"><XCircle size={16} /> Rejected</span>
                                    {job.status === 'rejected' && <CheckCircle size={16} />}
                                </button>
                            </form>
                        </div>
                    </div>

                    {/* Resume Card */}
                    <div className="glass-card p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="font-semibold text-slate-200">Resume Drafts</h3>
                            <form action={handleGenerateResume}>
                                <button className="inline-flex items-center gap-1.5 text-xs font-medium text-indigo-300 bg-indigo-500/10 border border-indigo-500/20 px-3 py-1.5 rounded-lg hover:bg-indigo-500/15 hover:border-indigo-500/30 transition-all duration-200">
                                    <Sparkles size={12} />
                                    Generate New
                                </button>
                            </form>
                        </div>

                        {drafts && drafts.length > 0 ? (
                            <div className="space-y-3">
                                {drafts.map((draft: any) => (
                                    <div key={draft.id} className="p-3 bg-slate-800/30 rounded-xl border border-slate-700/20 text-sm">
                                        <div className="font-medium text-slate-300 mb-1">Draft from {new Date(draft.created_at).toLocaleDateString()}</div>
                                        <div className="text-slate-500 mb-2 line-clamp-2">{draft.content?.summary}</div>
                                        <div className="text-xs text-indigo-400 font-medium cursor-pointer hover:text-indigo-300 flex items-center gap-1 transition-colors">
                                            <FileText size={12} /> View Full Resume
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-6 bg-slate-800/20 rounded-xl border border-dashed border-slate-700/30">
                                <p className="text-sm text-slate-500 mb-2">No tailored resumes yet.</p>
                                <form action={handleGenerateResume}>
                                    <button className="text-sm font-medium text-indigo-400 hover:text-indigo-300 transition-colors">
                                        Generate one now
                                    </button>
                                </form>
                            </div>
                        )}

                        {currentDraft?.content?.cover_letter_paragraph && (
                            <div className="mt-4 pt-4 border-t border-slate-800/30">
                                <h4 className="text-xs font-semibold text-slate-400 mb-2 uppercase tracking-wide">Cover Letter Snippet</h4>
                                <div className="p-3 bg-indigo-500/5 rounded-xl text-sm text-slate-400 italic border border-indigo-500/10">
                                    &ldquo;{currentDraft.content.cover_letter_paragraph}&rdquo;
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}
