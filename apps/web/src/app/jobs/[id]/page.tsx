import { createClient } from '@/utils/supabase/server'
import Link from 'next/link'
import { generateResume, updateStatus } from './actions'
import { ArrowLeft, MapPin, Building, Calendar, Globe, FileText, CheckCircle, Clock, XCircle, Send } from 'lucide-react'

export default async function JobDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params
    const supabase = await createClient()

    const { data: job } = await supabase.from('jobs').select('*').eq('id', id).single()

    if (!job) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-4">
                <h2 className="text-xl font-semibold text-gray-900">Job not found</h2>
                <div className="text-gray-500">The job you are looking for does not exist or has been removed.</div>
                <Link href="/dashboard" className="text-blue-600 hover:text-blue-800 font-medium flex items-center gap-2">
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
                    className="inline-flex items-center text-sm font-medium text-gray-500 hover:text-gray-900 mb-6 transition-colors"
                >
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to Dashboard
                </Link>

                <div className="flex flex-col md:flex-row justify-between items-start gap-6 bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
                    <div className="flex bg-gray-50 rounded-lg p-4 h-24 w-24 items-center justify-center border border-gray-200">
                        <Building className="h-10 w-10 text-gray-400" />
                    </div>
                    <div className="flex-1 space-y-2">
                        <h1 className="text-2xl font-bold tracking-tight text-gray-900">{job.title}</h1>
                        <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
                            <div className="flex items-center gap-1.5 font-medium text-gray-700">
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
                        </div>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
                        <a
                            href={job.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center justify-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors shadow-sm"
                        >
                            <Globe size={16} />
                            View Listing
                        </a>
                        <form action={markApplied}>
                            <button
                                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
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
                    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                        <div className="border-b border-gray-200 px-6 py-4 bg-gray-50">
                            <h2 className="font-semibold text-gray-900">Job Description</h2>
                        </div>
                        <div className="p-6 text-gray-700 leading-relaxed whitespace-pre-line">
                            {job.description}
                        </div>
                    </div>
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                    {/* Status Card */}
                    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
                        <h3 className="font-semibold text-gray-900 mb-4">Application Status</h3>
                        <div className="space-y-3">
                            <form action={markInterview}>
                                <button className={`w-full flex items-center justify-between p-3 rounded-lg border transition-all ${job.status === 'interview' ? 'bg-purple-50 border-purple-200 text-purple-700 font-medium' : 'bg-white border-gray-200 text-gray-600 hover:border-purple-300 hover:bg-purple-50/50'}`}>
                                    <span className="flex items-center gap-2"><Clock size={16} /> Interviewing</span>
                                    {job.status === 'interview' && <CheckCircle size={16} />}
                                </button>
                            </form>
                            <form action={markOffer}>
                                <button className={`w-full flex items-center justify-between p-3 rounded-lg border transition-all ${job.status === 'offer' ? 'bg-green-50 border-green-200 text-green-700 font-medium' : 'bg-white border-gray-200 text-gray-600 hover:border-green-300 hover:bg-green-50/50'}`}>
                                    <span className="flex items-center gap-2"><CheckCircle size={16} /> Offer Received</span>
                                    {job.status === 'offer' && <CheckCircle size={16} />}
                                </button>
                            </form>
                            <form action={markRejected}>
                                <button className={`w-full flex items-center justify-between p-3 rounded-lg border transition-all ${job.status === 'rejected' ? 'bg-red-50 border-red-200 text-red-700 font-medium' : 'bg-white border-gray-200 text-gray-600 hover:border-red-300 hover:bg-red-50/50'}`}>
                                    <span className="flex items-center gap-2"><XCircle size={16} /> Rejected</span>
                                    {job.status === 'rejected' && <CheckCircle size={16} />}
                                </button>
                            </form>
                        </div>
                    </div>

                    {/* Resume Card */}
                    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="font-semibold text-gray-900">Resume Drafts</h3>
                            <form action={handleGenerateResume}>
                                <button className="text-xs font-medium text-blue-600 hover:text-blue-800 bg-blue-50 px-2 py-1 rounded-md border border-blue-100 hover:border-blue-200 transition-colors">
                                    + Generate New
                                </button>
                            </form>
                        </div>

                        {drafts && drafts.length > 0 ? (
                            <div className="space-y-3">
                                {drafts.map((draft: any) => (
                                    <div key={draft.id} className="p-3 bg-gray-50 rounded-lg border border-gray-100 text-sm">
                                        <div className="font-medium text-gray-900 mb-1">Draft from {new Date(draft.created_at).toLocaleDateString()}</div>
                                        <div className="text-gray-500 mb-2 line-clamp-2">{draft.content?.summary}</div>
                                        {/* In a real app, Link to view/edit draft */}
                                        <div className="text-xs text-blue-600 font-medium cursor-pointer hover:underline flex items-center gap-1">
                                            <FileText size={12} /> View Full Resume
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-6 bg-gray-50 rounded-lg border border-dashed border-gray-200">
                                <p className="text-sm text-gray-500 mb-2">No tailored resumes yet.</p>
                                <form action={handleGenerateResume}>
                                    <button className="text-sm font-medium text-blue-600 hover:underline">
                                        Generate one now
                                    </button>
                                </form>
                            </div>
                        )}

                        {currentDraft?.content?.cover_letter_paragraph && (
                            <div className="mt-4 pt-4 border-t border-gray-100">
                                <h4 className="text-xs font-semibold text-gray-900 mb-2 uppercase tracking-wide">Cover Letter Snippet</h4>
                                <div className="p-3 bg-blue-50/50 rounded-lg text-sm text-gray-700 italic border border-blue-100">
                                    "{currentDraft.content.cover_letter_paragraph}"
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}
