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
        <div className="space-y-8 max-w-5xl mx-auto relative z-10 w-full">
            <div className="flex justify-between items-end flex-wrap gap-4">
                <div>
                    <h2 className="text-4xl font-bold tracking-tighter aurora-text mb-1">Professional Profile</h2>
                    <p className="text-slate-400 font-light">This intelligence is used by the AI to filter and match jobs for you.</p>
                </div>
                <Link
                    href="/onboarding"
                    className="magnetic-btn text-sm px-5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white hover:bg-white/10 transition-all font-semibold"
                >
                    Update Profile
                </Link>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Basic Info */}
                <div className="lg:col-span-1 space-y-6">
                    <div className="glass-panel ghost-border rounded-2xl p-8 text-center flex flex-col items-center">
                        <div className="w-24 h-24 rounded-full bg-gradient-to-br from-[var(--color-accent-primary)]/20 to-[var(--color-neon-teal)]/20 border border-white/10 flex items-center justify-center mb-5 shadow-[0_0_20px_rgba(133,173,255,0.1)] relative group">
                            <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-[var(--color-accent-primary)]/20 to-[var(--color-neon-teal)]/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                            <UserCircle size={48} className="text-slate-400 relative z-10" />
                        </div>
                        <h3 className="font-bold text-lg text-white truncate w-full">{user.email}</h3>
                        <p className="text-xs text-slate-500 mt-2 font-medium">Member since {new Date(user.created_at).toLocaleDateString()}</p>
                    </div>

                    <div className="glass-panel ghost-border rounded-2xl p-6 space-y-5">
                        <h4 className="text-sm font-bold text-white uppercase tracking-widest flex items-center gap-2">
                            <Sparkles size={16} className="text-[var(--color-neon-teal)]" /> AI Persona
                        </h4>
                        <div className="space-y-4 pt-2 border-t border-white/5">
                            <div className="flex items-center gap-3 text-sm text-slate-400 font-medium">
                                <Briefcase size={18} className="text-[var(--color-accent-primary)]" />
                                <span>{preferences.experience_level || 'Experience not set'}</span>
                            </div>
                            <div className="flex items-center gap-3 text-sm text-slate-400 font-medium">
                                <Globe size={18} className="text-[var(--color-soft-violet)]" />
                                <span>{preferences.remote_preference ? 'Open to Remote / Global' : 'On-site Local Only'}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Detailed Preferences */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="glass-panel ghost-border rounded-3xl p-8 relative overflow-hidden">
                        <div className="absolute -top-20 -right-20 w-64 h-64 bg-[var(--color-accent-primary)]/5 blur-3xl rounded-full pointer-events-none" />
                        
                        <h4 className="text-xl font-bold text-white mb-8 flex items-center gap-2 relative z-10">
                            <Sparkles size={24} className="text-[var(--color-neon-teal)]" /> Intelligence Criteria
                        </h4>

                        <div className="space-y-8 relative z-10">
                            <section>
                                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest block mb-4">Target Roles</label>
                                <div className="flex flex-wrap gap-2.5">
                                    {roles.length > 0 ? roles.map((role: string) => (
                                        <span key={role} className="px-4 py-1.5 rounded-full bg-[var(--color-accent-primary)]/10 border border-[var(--color-accent-primary)]/30 text-[var(--color-accent-primary)] text-sm font-semibold backdrop-blur-md transition-all hover:bg-[var(--color-accent-primary)]/20">
                                            {role}
                                        </span>
                                    )) : <span className="text-slate-500 italic text-sm font-light">No roles set</span>}
                                </div>
                            </section>

                            <section>
                                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest block mb-4">Target Locations</label>
                                <div className="flex flex-wrap gap-2.5">
                                    {locations.length > 0 ? locations.map((loc: string) => (
                                        <span key={loc} className="px-4 py-1.5 rounded-full bg-[var(--color-soft-violet)]/10 border border-[var(--color-soft-violet)]/30 text-[var(--color-soft-violet)] text-sm font-semibold backdrop-blur-md flex items-center gap-2 transition-all hover:bg-[var(--color-soft-violet)]/20">
                                            <MapPin size={14} /> {loc}
                                        </span>
                                    )) : <span className="text-slate-500 italic text-sm font-light">No locations set</span>}
                                </div>
                            </section>

                            <section>
                                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest block mb-4">Expertise Signals</label>
                                <div className="flex flex-wrap gap-2.5">
                                    {keywords.length > 0 ? keywords.map((word: string) => (
                                        <span key={word} className="px-4 py-1.5 rounded-full bg-[var(--color-neon-teal)]/10 border border-[var(--color-neon-teal)]/30 text-[var(--color-neon-teal)] text-sm font-semibold backdrop-blur-md flex items-center gap-2 transition-all hover:bg-[var(--color-neon-teal)]/20">
                                            <Tag size={14} /> {word}
                                        </span>
                                    )) : <span className="text-slate-500 italic text-sm font-light">No signals set</span>}
                                </div>
                            </section>
                        </div>
                    </div>

                    {/* Resume Section */}
                    <div className="glass-panel ghost-border rounded-3xl p-8">
                        <h4 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                            <FileText size={24} className="text-[var(--color-neon-teal)]" /> Core Memory (Resume)
                        </h4>
                        {resume ? (
                            <div className="bg-white/[0.02] rounded-2xl p-6 border border-white/5 shadow-sm">
                                <p className="text-slate-400 text-sm leading-relaxed whitespace-pre-wrap line-clamp-[8] font-light">
                                    {resume.resume_text}
                                </p>
                                <div className="mt-6 pt-5 border-t border-white/5 flex justify-between items-center text-xs text-slate-500 font-medium">
                                    <span>Last sync: {new Date(resume.created_at).toLocaleDateString()}</span>
                                    <Link href="/resume" className="text-[var(--color-neon-teal)] hover:text-white font-bold transition-colors">Update Memory &rarr;</Link>
                                </div>
                            </div>
                        ) : (
                            <div className="text-center py-10 border-2 border-dashed border-white/10 rounded-2xl bg-white/[0.01] group hover:border-white/20 transition-colors">
                                <FileText size={40} className="text-slate-500 mx-auto mb-4 group-hover:text-[var(--color-neon-teal)] transition-colors" />
                                <p className="text-slate-400 text-sm mb-6 font-light">You haven&apos;t uploaded your core memory yet.</p>
                                <Link href="/onboarding" className="text-sm font-bold text-white hover:text-white bg-white/10 hover:bg-white/15 px-6 py-2.5 rounded-xl border border-white/10 transition-all">
                                    Upload Document
                                </Link>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}
