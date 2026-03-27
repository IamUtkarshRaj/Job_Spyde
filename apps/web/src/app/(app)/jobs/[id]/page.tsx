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
                <h2 className="text-2xl font-bold text-white tracking-tight">Intelligence Not Found</h2>
                <div className="text-slate-500 font-light">The target profile you are looking for does not exist or has been wiped from memory.</div>
                <Link href="/dashboard" className="text-[var(--color-neon-teal)] hover:text-white font-medium flex items-center gap-2 transition-colors">
                    <ArrowLeft size={16} /> Return to Dashboard
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
        <div className="max-w-5xl mx-auto space-y-8 relative z-10 w-full">
            {/* Header */}
            <div>
                <Link
                    href="/dashboard"
                    className="inline-flex items-center text-xs uppercase tracking-widest font-bold text-slate-500 hover:text-white mb-6 transition-colors"
                >
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to Core
                </Link>

                <div className="glass-panel ghost-border rounded-3xl p-6 flex flex-col md:flex-row justify-between items-start gap-6 relative overflow-hidden">
                    <div className="absolute -top-32 -left-32 w-64 h-64 bg-[var(--color-accent-primary)]/10 blur-3xl rounded-full pointer-events-none" />

                    <div className="flex bg-black/30 rounded-2xl p-4 h-24 w-24 items-center justify-center border border-white/10 shadow-inner relative z-10">
                        <Building className="h-10 w-10 text-[var(--color-accent-primary)]" />
                    </div>
                    
                    <div className="flex-1 space-y-3 relative z-10">
                        <h1 className="text-3xl font-bold tracking-tight text-white">{job.title}</h1>
                        <div className="flex flex-wrap items-center gap-4 text-sm text-slate-400 font-medium">
                            <div className="flex items-center gap-1.5 text-white">
                                <Building size={16} className="text-[var(--color-accent-primary)]" />
                                {job.company}
                            </div>
                            <div className="flex items-center gap-1.5">
                                <MapPin size={16} className="text-[var(--color-soft-violet)]" />
                                {job.location}
                            </div>
                            {job.posted_at && (
                                <div className="flex items-center gap-1.5">
                                    <Calendar size={16} className="text-[var(--color-neon-teal)]" />
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

                    <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto relative z-10">
                        <a
                            href={job.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center justify-center gap-2 rounded-xl bg-white/5 border border-white/10 px-5 py-3 text-sm font-bold text-white hover:bg-white/10 transition-all duration-200 shadow-sm"
                        >
                            <Globe size={16} />
                            View Source
                        </a>
                        <form action={markApplied}>
                            <button
                                className="magnetic-btn w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-[var(--color-neon-teal)] text-slate-950 px-5 py-3 text-sm font-bold shadow-[0_0_20px_rgba(105,246,184,0.3)] hover:shadow-[0_0_30px_rgba(105,246,184,0.5)] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                                disabled={job.status === 'applied'}
                            >
                                <Send size={16} />
                                {job.status === 'applied' ? 'Committed' : 'Commit Payload'}
                            </button>
                        </form>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Content */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="glass-panel ghost-border rounded-3xl overflow-hidden">
                        <div className="border-b border-white/5 px-8 py-5 flex items-center gap-2">
                            <Sparkles size={18} className="text-[var(--color-accent-primary)]" />
                            <h2 className="font-bold text-white uppercase tracking-widest text-xs">Intelligence Readout</h2>
                        </div>
                        <div className="p-8 text-slate-400 leading-relaxed whitespace-pre-line text-sm font-light">
                            {job.description}
                        </div>
                    </div>
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                    {/* Status Card */}
                    <div className="glass-panel ghost-border rounded-3xl p-6">
                        <h3 className="font-bold text-white mb-5 uppercase tracking-widest text-xs">Lifecycle State</h3>
                        <div className="space-y-3">
                            <form action={markInterview}>
                                <button className={`w-full flex items-center justify-between p-4 rounded-xl border transition-all duration-300 font-medium text-sm ${job.status === 'interview' ? 'bg-[var(--color-neon-teal)]/10 border-[var(--color-neon-teal)]/30 text-[var(--color-neon-teal)] shadow-[0_0_15px_rgba(105,246,184,0.1)]' : 'bg-white/[0.02] border-white/5 text-slate-400 hover:border-[var(--color-neon-teal)]/30 hover:bg-[var(--color-neon-teal)]/5 hover:text-white'}`}>
                                    <span className="flex items-center gap-2 tracking-wide"><Clock size={16} /> Interview Active</span>
                                    {job.status === 'interview' && <CheckCircle size={16} />}
                                </button>
                            </form>
                            <form action={markOffer}>
                                <button className={`w-full flex items-center justify-between p-4 rounded-xl border transition-all duration-300 font-medium text-sm ${job.status === 'offer' ? 'bg-[var(--color-neon-teal)]/10 border-[var(--color-neon-teal)]/30 text-[var(--color-neon-teal)] shadow-[0_0_15px_rgba(105,246,184,0.1)]' : 'bg-white/[0.02] border-white/5 text-slate-400 hover:border-[var(--color-neon-teal)]/30 hover:bg-[var(--color-neon-teal)]/5 hover:text-white'}`}>
                                    <span className="flex items-center gap-2 tracking-wide"><CheckCircle size={16} /> Offer Secured</span>
                                    {job.status === 'offer' && <CheckCircle size={16} />}
                                </button>
                            </form>
                            <form action={markRejected}>
                                <button className={`w-full flex items-center justify-between p-4 rounded-xl border transition-all duration-300 font-medium text-sm ${job.status === 'rejected' ? 'bg-[var(--color-error)]/10 border-[var(--color-error)]/30 text-[var(--color-error)] shadow-[0_0_15px_rgba(255,113,108,0.1)]' : 'bg-white/[0.02] border-white/5 text-slate-400 hover:border-[var(--color-error)]/30 hover:bg-[var(--color-error)]/5 hover:text-white'}`}>
                                    <span className="flex items-center gap-2 tracking-wide"><XCircle size={16} /> Connection Terminated</span>
                                    {job.status === 'rejected' && <CheckCircle size={16} />}
                                </button>
                            </form>
                        </div>
                    </div>

                    {/* Resume Card */}
                    <div className="glass-panel ghost-border rounded-3xl p-6">
                        <div className="flex items-center justify-between mb-5">
                            <h3 className="font-bold text-white uppercase tracking-widest text-xs">Tailored Payload</h3>
                            <form action={handleGenerateResume}>
                                <button className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-950 bg-[var(--color-neon-teal)] border border-[var(--color-neon-teal)] px-3 py-1.5 rounded-lg hover:brightness-110 shadow-[0_0_15px_rgba(105,246,184,0.3)] transition-all duration-300">
                                    <Sparkles size={12} />
                                    Synthesize
                                </button>
                            </form>
                        </div>

                        {drafts && drafts.length > 0 ? (
                            <div className="space-y-4">
                                {drafts.map((draft: any) => (
                                    <div key={draft.id} className="p-4 bg-white/[0.02] rounded-2xl border border-white/5 hover:border-white/10 transition-colors text-sm group">
                                        <div className="font-bold text-white mb-1.5 text-xs tracking-wider uppercase">V.{draft.id.substring(0,6)} <span className="text-slate-500 font-normal ml-2">{new Date(draft.created_at).toLocaleDateString()}</span></div>
                                        <div className="text-slate-400 mb-3 line-clamp-2 font-light leading-relaxed">{draft.content?.summary}</div>
                                        <div className="text-xs text-[var(--color-neon-teal)] font-bold cursor-pointer group-hover:text-white flex items-center gap-1.5 transition-colors">
                                            <FileText size={14} /> Open Document Payload
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-8 bg-white/[0.01] rounded-2xl border-2 border-dashed border-white/10 group hover:border-[var(--color-neon-teal)]/30 transition-colors">
                                <FileText size={32} className="text-slate-500 mx-auto mb-3 group-hover:text-[var(--color-neon-teal)] transition-colors" />
                                <p className="text-slate-400 font-light text-sm mb-3">Awaiting synthesis.</p>
                                <form action={handleGenerateResume}>
                                    <button className="text-sm font-bold text-[var(--color-neon-teal)] hover:text-white transition-colors border-b border-[var(--color-neon-teal)] pb-0.5">
                                        Generate Tailored Payload
                                    </button>
                                </form>
                            </div>
                        )}

                        {currentDraft?.content?.cover_letter_paragraph && (
                            <div className="mt-6 pt-5 border-t border-white/5 relative">
                                <h4 className="absolute -top-2.5 left-0 bg-[var(--color-bg-secondary)] px-2 text-[10px] font-bold text-[var(--color-accent-primary)] uppercase tracking-widest">Cover Letter Inject</h4>
                                <div className="p-4 bg-[var(--color-accent-primary)]/5 rounded-2xl text-sm text-slate-400 font-light leading-relaxed italic border border-[var(--color-accent-primary)]/20 shadow-[0_0_10px_rgba(133,173,255,0.1)]">
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
