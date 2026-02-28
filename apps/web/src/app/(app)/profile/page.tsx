import { createClient } from '@/utils/supabase/server'
import { User, Briefcase, MapPin, Globe, Tag, FileText, UserCircle, Sparkles } from 'lucide-react'
import Link from 'next/link'

export default async function ProfilePage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return null

    const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

    const { data: resume } = await supabase
        .from('resumes')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .single()

    const preferences = profile?.preferences || {}
    const roles = Array.isArray(preferences.roles) ? preferences.roles : []
    const locations = Array.isArray(preferences.locations) ? preferences.locations : []
    const keywords = Array.isArray(preferences.keywords) ? preferences.keywords : []

    return (
        <div className="space-y-8 max-w-4xl mx-auto">
            <div className="flex justify-between items-end">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight text-slate-100">Professional Profile</h2>
                    <p className="text-slate-500 mt-1">This information is used by the AI to filter and match jobs for you.</p>
                </div>
                <Link
                    href="/onboarding"
                    className="text-sm px-4 py-2 rounded-xl bg-slate-800 border border-slate-700 text-slate-300 hover:text-slate-100 transition-all"
                >
                    Update Profile
                </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Basic Info */}
                <div className="md:col-span-1 space-y-6">
                    <div className="glass-card p-6 text-center">
                        <div className="w-20 h-20 rounded-full bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center mx-auto mb-4">
                            <UserCircle size={40} className="text-indigo-400" />
                        </div>
                        <h3 className="font-semibold text-slate-200 truncate">{user.email}</h3>
                        <p className="text-xs text-slate-500 mt-1">Member since {new Date(user.created_at).toLocaleDateString()}</p>
                    </div>

                    <div className="glass-card p-6 space-y-4">
                        <h4 className="text-sm font-semibold text-slate-300 uppercase tracking-wider">AI Persona</h4>
                        <div className="space-y-3">
                            <div className="flex items-center gap-3 text-sm text-slate-400">
                                <Briefcase size={16} className="text-indigo-400" />
                                <span>{preferences.experience_level || 'Experience not set'}</span>
                            </div>
                            <div className="flex items-center gap-3 text-sm text-slate-400">
                                <Globe size={16} className="text-indigo-400" />
                                <span>{preferences.remote_preference ? 'Open to Remote' : 'On-site Only'}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Detailed Preferences */}
                <div className="md:col-span-2 space-y-6">
                    <div className="glass-card p-6">
                        <h4 className="text-lg font-semibold text-slate-200 mb-6 flex items-center gap-2">
                            <Sparkles size={20} className="text-indigo-400" /> Job Matching Criteria
                        </h4>

                        <div className="space-y-6">
                            <section>
                                <label className="text-xs font-medium text-slate-500 uppercase tracking-widest block mb-3">Target Roles</label>
                                <div className="flex flex-wrap gap-2">
                                    {roles.length > 0 ? roles.map((role: string) => (
                                        <span key={role} className="px-3 py-1 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs font-medium">
                                            {role}
                                        </span>
                                    )) : <span className="text-slate-600 italic text-sm">No roles set</span>}
                                </div>
                            </section>

                            <section>
                                <label className="text-xs font-medium text-slate-500 uppercase tracking-widest block mb-3">Target Locations</label>
                                <div className="flex flex-wrap gap-2">
                                    {locations.length > 0 ? locations.map((loc: string) => (
                                        <span key={loc} className="px-3 py-1 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-300 text-xs font-medium flex items-center gap-1.5">
                                            <MapPin size={12} /> {loc}
                                        </span>
                                    )) : <span className="text-slate-600 italic text-sm">No locations set</span>}
                                </div>
                            </section>

                            <section>
                                <label className="text-xs font-medium text-slate-500 uppercase tracking-widest block mb-3">Expertise Keywords</label>
                                <div className="flex flex-wrap gap-2">
                                    {keywords.length > 0 ? keywords.map((word: string) => (
                                        <span key={word} className="px-3 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs font-medium flex items-center gap-1.5">
                                            <Tag size={12} /> {word}
                                        </span>
                                    )) : <span className="text-slate-600 italic text-sm">No keywords set</span>}
                                </div>
                            </section>
                        </div>
                    </div>

                    {/* Resume Section */}
                    <div className="glass-card p-6">
                        <h4 className="text-lg font-semibold text-slate-200 mb-4 flex items-center gap-2">
                            <FileText size={20} className="text-indigo-400" /> Active Resume
                        </h4>
                        {resume ? (
                            <div className="bg-slate-900/50 rounded-xl p-4 border border-slate-800/50">
                                <p className="text-slate-400 text-sm leading-relaxed whitespace-pre-wrap line-clamp-[10]">
                                    {resume.resume_text}
                                </p>
                                <div className="mt-4 pt-4 border-t border-slate-800/50 flex justify-between items-center text-xs text-slate-500">
                                    <span>Last updated: {new Date(resume.created_at).toLocaleDateString()}</span>
                                    <Link href="/resume" className="text-indigo-400 hover:text-indigo-300 font-medium">Update Resume &rarr;</Link>
                                </div>
                            </div>
                        ) : (
                            <div className="text-center py-8 border-2 border-dashed border-slate-800 rounded-2xl">
                                <FileText size={32} className="text-slate-700 mx-auto mb-2" />
                                <p className="text-slate-500 text-sm mb-4">You haven&apos;t uploaded a resume yet.</p>
                                <Link href="/onboarding" className="text-sm font-semibold text-indigo-400 hover:text-indigo-300">
                                    Upload Now
                                </Link>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}
