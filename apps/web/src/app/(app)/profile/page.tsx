import { createClient } from '@/utils/supabase/server'
import { User, Briefcase, MapPin, Globe, Tag, FileText, UserCircle, Sparkles, GraduationCap, Award, Calendar, DollarSign } from 'lucide-react'
import Link from 'next/link'

export default async function ProfilePage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return null

    // Fetch all profile data in parallel to optimize load times
    const [
        { data: dbProfile },
        { data: skills }, 
        { data: experiences }, 
        { data: education }, 
        { data: resume }
    ] = await Promise.all([
        supabase.from('profiles').select('*').eq('id', user.id).single(),
        supabase.from('profile_skills').select('skill_name').eq('user_id', user.id),
        supabase.from('profile_experiences').select('*').eq('user_id', user.id).order('start_date', { ascending: false }),
        supabase.from('profile_education_entries').select('*').eq('user_id', user.id).order('end_year', { ascending: false }),
        supabase.from('resumes').select('*').eq('user_id', user.id).order('created_at', { ascending: false }).limit(1).single()
    ])

    const profile = dbProfile || null

    const completionScore = profile?.profile_completion || 0

    return (
        <div className="space-y-8 max-w-[1200px] mx-auto relative z-10 w-full pb-20">
            {/* Header Area */}
            <div className="flex justify-between items-end flex-wrap gap-4 glass-panel ghost-border rounded-3xl p-8 relative overflow-hidden bg-gradient-to-r from-black/40 to-[var(--color-bg-primary)]">
                <div className="absolute right-0 top-0 w-96 h-96 bg-[var(--color-accent-primary)]/10 blur-[100px] pointer-events-none rounded-full" />
                
                <div className="flex items-center gap-6 relative z-10 w-full lg:w-auto">
                    <div className="w-24 h-24 rounded-full bg-gradient-to-br from-[var(--color-accent-primary)]/20 to-[var(--color-neon-teal)]/20 border border-white/10 flex items-center justify-center shadow-[0_0_30px_rgba(133,173,255,0.15)] flex-shrink-0">
                        <UserCircle size={48} className="text-slate-300" />
                    </div>
                    <div>
                        <h2 className="text-4xl font-black tracking-tighter text-white mb-2">{profile?.full_name || user.email}</h2>
                        <p className="text-xl text-[var(--color-neon-teal)] font-medium mb-1">{profile?.target_role || 'No Target Role Set'}</p>
                        <div className="flex items-center gap-4 text-sm text-slate-400 font-medium">
                            <span className="flex items-center gap-1.5"><MapPin size={16} /> {profile?.location || 'Unknown Location'}</span>
                            <span className="flex items-center gap-1.5"><Briefcase size={16} /> {profile?.years_of_experience || 0} Years Exp.</span>
                        </div>
                    </div>
                </div>

                <div className="relative z-10 flex flex-col items-end gap-3 w-full lg:w-auto mt-6 lg:mt-0">
                    <div className="text-right">
                        <div className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Intelligence Status</div>
                        <div className="flex items-center gap-3">
                            <div className="w-32 h-2 bg-white/5 rounded-full overflow-hidden">
                                <div className="h-full bg-gradient-to-r from-[var(--color-accent-primary)] to-[var(--color-neon-teal)]" style={{ width: `${completionScore}%` }} />
                            </div>
                            <span className="text-[var(--color-neon-teal)] font-black">{completionScore}%</span>
                        </div>
                    </div>
                    <Link
                        href="/profile/setup"
                        className="magnetic-btn text-sm px-6 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white hover:bg-white/15 transition-all font-semibold flex items-center gap-2"
                    >
                        Edit Intelligence
                    </Link>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Left Column */}
                <div className="lg:col-span-1 space-y-6">
                    {/* Summary */}
                    <div className="glass-panel ghost-border rounded-3xl p-6">
                        <h4 className="text-sm font-bold text-slate-500 uppercase tracking-widest mb-4">Professional Summary</h4>
                        <p className="text-slate-300 text-sm leading-relaxed font-light">
                            {profile?.professional_summary || <span className="italic text-slate-500">No summary provided. Edit profile to add one.</span>}
                        </p>
                    </div>

                    {/* Preferences */}
                    <div className="glass-panel ghost-border rounded-3xl p-6 space-y-5">
                        <h4 className="text-sm font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
                            <Sparkles size={16} className="text-[var(--color-soft-violet)]" /> Career Preferences
                        </h4>
                        <div className="space-y-4 pt-2 border-t border-white/5">
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-slate-500 flex items-center gap-2"><Globe size={16} /> Work Mode</span>
                                <span className="text-white font-medium">{profile?.preferred_work_mode || 'Any'}</span>
                            </div>
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-slate-500 flex items-center gap-2"><MapPin size={16} /> Relocation</span>
                                <span className="text-white font-medium">{profile?.willing_to_relocate ? 'Open' : 'No'}</span>
                            </div>
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-slate-500 flex items-center gap-2"><DollarSign size={16} /> Expected Salary</span>
                                <span className="text-[var(--color-neon-teal)] font-medium">{profile?.expected_salary_range || 'Not disclosed'}</span>
                            </div>
                        </div>
                    </div>

                    {/* Socials */}
                    <div className="glass-panel ghost-border rounded-3xl p-6">
                        <h4 className="text-sm font-bold text-slate-500 uppercase tracking-widest mb-4">External Links</h4>
                        <div className="space-y-3">
                            {profile?.linkedin_url && <a href={profile.linkedin_url} target="_blank" rel="noreferrer" className="block text-sm text-[var(--color-accent-primary)] hover:underline truncate">LinkedIn Profile</a>}
                            {profile?.github_url && <a href={profile.github_url} target="_blank" rel="noreferrer" className="block text-sm text-[var(--color-accent-primary)] hover:underline truncate">GitHub Profile</a>}
                            {!profile?.linkedin_url && !profile?.github_url && <span className="text-slate-500 italic text-sm font-light">No links provided</span>}
                        </div>
                    </div>
                </div>

                {/* Right Column */}
                <div className="lg:col-span-2 space-y-6">
                    
                    {/* Skills */}
                    <div className="glass-panel ghost-border rounded-3xl p-8">
                        <h4 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                            <Tag size={20} className="text-[var(--color-accent-primary)]" /> Core Competencies
                        </h4>
                        <div className="flex flex-wrap gap-2.5">
                            {skills && skills.length > 0 ? skills.map((s: any) => (
                                <span key={s.skill_name} className="px-4 py-1.5 rounded-full bg-[var(--color-accent-primary)]/10 border border-[var(--color-accent-primary)]/30 text-[var(--color-accent-primary)] text-sm font-semibold backdrop-blur-md">
                                    {s.skill_name}
                                </span>
                            )) : <span className="text-slate-500 italic text-sm font-light">No skills mapped yet.</span>}
                        </div>
                    </div>

                    {/* Experience */}
                    <div className="glass-panel ghost-border rounded-3xl p-8">
                        <h4 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                            <Briefcase size={20} className="text-[var(--color-soft-violet)]" /> Experience
                        </h4>
                        <div className="space-y-6 relative before:absolute before:inset-0 before:left-[11px] before:-top-2 before:-bottom-2 before:w-[2px] before:bg-white/5">
                            {experiences && experiences.length > 0 ? experiences.map((exp: any) => (
                                <div key={exp.id} className="relative pl-8">
                                    <div className="absolute left-0 top-1.5 w-6 h-6 rounded-full bg-[var(--color-bg-primary)] border-4 border-white/10 flex items-center justify-center shadow-lg" />
                                    <h5 className="text-lg font-bold text-white">{exp.role_title}</h5>
                                    <p className="text-[var(--color-soft-violet)] font-semibold text-sm mb-2">{exp.company_name}</p>
                                    <div className="flex items-center gap-4 text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                                        {exp.start_date || 'Unknown'} — {exp.is_current ? 'Present' : (exp.end_date || 'Unknown')}
                                    </div>
                                    {exp.description && <p className="text-slate-400 text-sm leading-relaxed">{exp.description}</p>}
                                </div>
                            )) : <span className="text-slate-500 italic text-sm font-light relative pl-8">No experience recorded.</span>}
                        </div>
                    </div>

                    {/* Education */}
                    <div className="glass-panel ghost-border rounded-3xl p-8">
                        <h4 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                            <GraduationCap size={20} className="text-[var(--color-neon-teal)]" /> Education
                        </h4>
                        <div className="space-y-6 relative before:absolute before:inset-0 before:left-[11px] before:-top-2 before:-bottom-2 before:w-[2px] before:bg-white/5">
                            {education && education.length > 0 ? education.map((edu: any) => (
                                <div key={edu.id} className="relative pl-8">
                                    <div className="absolute left-0 top-1.5 w-6 h-6 rounded-full bg-[var(--color-bg-primary)] border-4 border-[var(--color-neon-teal)]/20 shadow-lg" />
                                    <h5 className="text-lg font-bold text-white">{edu.institution_name}</h5>
                                    <p className="text-[var(--color-neon-teal)] font-medium text-sm mb-1">{edu.degree} in {edu.field_of_study}</p>
                                </div>
                            )) : <span className="text-slate-500 italic text-sm font-light relative pl-8">No education recorded.</span>}
                        </div>
                    </div>

                </div>
            </div>
        </div>
    )
}
