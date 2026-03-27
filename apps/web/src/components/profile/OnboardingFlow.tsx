'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Check, ChevronRight, ChevronLeft, Save, Sparkles, AlertCircle } from 'lucide-react'
import { TagsInput } from './fields/TagsInput'
import { ResumeDropzone } from './fields/ResumeDropzone'
import { 
    updateProfile, 
    upsertSkills, 
    upsertExperiences, 
    upsertEducation,
    completeOnboarding 
} from '@/lib/profile-actions'

const STEPS = [
    { id: 1, title: 'Identity', description: 'Basic details' },
    { id: 2, title: 'Education', description: 'Academic background' },
    { id: 3, title: 'Experience', description: 'Work history' },
    { id: 4, title: 'Skills & Resume', description: 'Core competencies' },
    { id: 5, title: 'Preferences', description: 'Career goals' },
    { id: 6, title: 'Review', description: 'Finalizer' }
]

export function OnboardingFlow({ initialProfile, initialSkills }: { initialProfile: any, initialSkills: string[] }) {
    const router = useRouter()
    const [step, setStep] = useState(1)
    const [isSaving, setIsSaving] = useState(false)
    const [error, setError] = useState<string | null>(null)

    // Form States
    const [profile, setProfileData] = useState({
        full_name: initialProfile?.full_name || '',
        email: initialProfile?.email || '',
        phone: initialProfile?.phone || '',
        location: initialProfile?.location || '',
        linkedin_url: initialProfile?.linkedin_url || '',
        github_url: initialProfile?.github_url || '',
        target_role: initialProfile?.target_role || '',
        years_of_experience: initialProfile?.years_of_experience || 0,
        professional_summary: initialProfile?.professional_summary || '',
        preferred_work_mode: initialProfile?.preferred_work_mode || 'Hybrid',
        expected_salary_range: initialProfile?.expected_salary_range || '',
        willing_to_relocate: initialProfile?.willing_to_relocate || false
    })

    const [skills, setSkills] = useState<string[]>(initialSkills || [])

    // For simplicity in this onboarding, we are capturing basic singular education/experience to satisfy the flow,
    // which can be expanded to arrays in the full dashboard.
    const [education, setEducation] = useState({
        institution_name: '',
        degree: '',
        field_of_study: '',
        start_year: null,
        end_year: null
    })

    const [experience, setExperience] = useState({
        company_name: '',
        role_title: '',
        start_date: '',
        end_date: '',
        is_current: false
    })

    const handleNext = async () => {
        setIsSaving(true)
        setError(null)
        try {
            // Auto-save progress at each step boundary
            await updateProfile(profile)

            if (step === 2 && education.institution_name) {
                await upsertEducation([education])
            }
            if (step === 3 && experience.company_name) {
                await upsertExperiences([experience])
            }
            if (step === 4) {
                await upsertSkills(skills)
            }

            if (step < STEPS.length) {
                setStep(s => s + 1)
            } else {
                // Final completion
                await completeOnboarding(100) // 100% complete
                router.push('/dashboard')
            }
        } catch (err: any) {
            setError(err.message || 'Failed to save progress')
        } finally {
            setIsSaving(false)
        }
    }

    const calculateLocalProgress = () => {
        return Math.round(((step - 1) / (STEPS.length - 1)) * 100)
    }

    return (
        <div className="w-full max-w-3xl mx-auto h-[85vh] flex flex-col mt-6 relative z-10 glass-panel ghost-border rounded-2xl overflow-hidden shadow-2xl">
            {/* Header / Stepper */}
            <div className="p-6 md:p-8 border-b border-white/5 bg-black/20 relative flex-shrink-0">
                <div className="absolute top-0 left-0 h-1 bg-gradient-to-r from-[var(--color-accent-primary)] via-[var(--color-neon-teal)] to-[var(--color-soft-violet)] transition-all duration-500" style={{ width: `${calculateLocalProgress()}%` }} />
                
                <div className="flex justify-between items-center relative z-10">
                    <div>
                        <h2 className="text-xl font-semibold text-white mb-1.5 flex items-center gap-2 tracking-tight">
                            <Sparkles className="text-[var(--color-neon-teal)]" size={20} /> 
                            Professional Intelligence
                        </h2>
                        <p className="text-slate-400 font-light text-sm">Complete your profile to unlock AI matching.</p>
                    </div>
                    <div className="text-right hidden md:block">
                        <div className="text-[11px] font-bold text-[var(--color-accent-primary)] uppercase tracking-widest">{calculateLocalProgress()}% Complete</div>
                        <div className="text-[11px] text-slate-500 mt-1">Step {step} of {STEPS.length}</div>
                    </div>
                </div>

                {/* Progress Indicators */}
                <div className="flex gap-2 mt-6 overflow-x-auto pb-1 scrollbar-none">
                    {STEPS.map(s => (
                        <div key={s.id} className="min-w-[90px] flex-1">
                            <div className={`h-1.5 rounded-full mb-2.5 transition-colors ${step >= s.id ? 'bg-[var(--color-neon-teal)] shadow-[0_0_8px_rgba(105,246,184,0.4)]' : 'bg-white/10'}`} />
                            <p className={`text-[10px] font-bold uppercase tracking-wider ${step >= s.id ? 'text-white' : 'text-slate-500'}`}>{s.title}</p>
                        </div>
                    ))}
                </div>
            </div>

            {/* Content Area - Scrollable */}
            <div className="flex-1 overflow-y-auto p-6 md:p-10 pb-32 animate-in fade-in slide-in-from-bottom-4 duration-500 relative">
                {error && (
                    <div className="mb-6 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 flex items-center gap-3 text-sm">
                        <AlertCircle size={16} /> {error}
                    </div>
                )}

                {/* Step 1: Identity */}
                {step === 1 && (
                    <div className="space-y-5 max-w-2xl">
                        <h3 className="text-lg font-semibold text-white mb-4">Basic Identity</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            <label className="block space-y-1.5">
                                <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-widest">Full Name <span className="text-red-400">*</span></span>
                                <input required type="text" value={profile.full_name} onChange={e => setProfileData({...profile, full_name: e.target.value})} className="w-full bg-white/[0.02] border border-white/10 rounded-lg px-3.5 py-2.5 text-sm text-white focus:border-[var(--color-accent-primary)] focus:ring-1 focus:ring-[var(--color-accent-primary)] outline-none transition-all" placeholder="John Doe" />
                            </label>
                            <label className="block space-y-1.5">
                                <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-widest">Phone</span>
                                <input type="tel" value={profile.phone} onChange={e => setProfileData({...profile, phone: e.target.value})} className="w-full bg-white/[0.02] border border-white/10 rounded-lg px-3.5 py-2.5 text-sm text-white focus:border-[var(--color-accent-primary)] focus:ring-1 focus:ring-[var(--color-accent-primary)] outline-none transition-all" placeholder="+1 234 567 8900" />
                            </label>
                        </div>
                        <label className="block space-y-1.5">
                            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-widest">Base Location <span className="text-red-400">*</span></span>
                            <input required type="text" value={profile.location} onChange={e => setProfileData({...profile, location: e.target.value})} className="w-full bg-white/[0.02] border border-white/10 rounded-lg px-3.5 py-2.5 text-sm text-white focus:border-[var(--color-accent-primary)] focus:ring-1 focus:ring-[var(--color-accent-primary)] outline-none transition-all" placeholder="San Francisco, CA" />
                        </label>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            <label className="block space-y-1.5">
                                <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-widest">LinkedIn URL</span>
                                <input type="url" value={profile.linkedin_url} onChange={e => setProfileData({...profile, linkedin_url: e.target.value})} className="w-full bg-white/[0.02] border border-white/10 rounded-lg px-3.5 py-2.5 text-sm text-white focus:border-[var(--color-accent-primary)] outline-none transition-all" placeholder="https://linkedin.com/in/..." />
                            </label>
                            <label className="block space-y-1.5">
                                <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-widest">GitHub URL</span>
                                <input type="url" value={profile.github_url} onChange={e => setProfileData({...profile, github_url: e.target.value})} className="w-full bg-white/[0.02] border border-white/10 rounded-lg px-3.5 py-2.5 text-sm text-white focus:border-[var(--color-accent-primary)] outline-none transition-all" placeholder="https://github.com/..." />
                            </label>
                        </div>
                    </div>
                )}

                {/* Step 2: Education */}
                {step === 2 && (
                    <div className="space-y-5 max-w-2xl">
                        <h3 className="text-lg font-semibold text-white mb-4">Highest Education</h3>
                        <label className="block space-y-1.5">
                            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-widest">Institution Name</span>
                            <input type="text" value={education.institution_name} onChange={e => setEducation({...education, institution_name: e.target.value})} className="w-full bg-white/[0.02] border border-white/10 rounded-lg px-3.5 py-2.5 text-sm text-white focus:border-[var(--color-accent-primary)] outline-none transition-all" placeholder="University of Technology" />
                        </label>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            <label className="block space-y-1.5">
                                <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-widest">Degree</span>
                                <input type="text" value={education.degree} onChange={e => setEducation({...education, degree: e.target.value})} className="w-full bg-white/[0.02] border border-white/10 rounded-lg px-3.5 py-2.5 text-sm text-white focus:border-[var(--color-accent-primary)] outline-none transition-all" placeholder="e.g. B.S., M.S." />
                            </label>
                            <label className="block space-y-1.5">
                                <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-widest">Field of Study</span>
                                <input type="text" value={education.field_of_study} onChange={e => setEducation({...education, field_of_study: e.target.value})} className="w-full bg-white/[0.02] border border-white/10 rounded-lg px-3.5 py-2.5 text-sm text-white focus:border-[var(--color-accent-primary)] outline-none transition-all" placeholder="Computer Science" />
                            </label>
                        </div>
                    </div>
                )}

                {/* Step 3: Experience */}
                {step === 3 && (
                    <div className="space-y-5 max-w-2xl">
                        <h3 className="text-lg font-semibold text-white mb-4">Current or Most Recent Role</h3>
                        <label className="block space-y-1.5">
                            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-widest">Company Name</span>
                            <input type="text" value={experience.company_name} onChange={e => setExperience({...experience, company_name: e.target.value})} className="w-full bg-white/[0.02] border border-white/10 rounded-lg px-3.5 py-2.5 text-sm text-white focus:border-[var(--color-accent-primary)] outline-none transition-all" placeholder="Tech Corp Inc." />
                        </label>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            <label className="block space-y-1.5">
                                <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-widest">Role Title</span>
                                <input type="text" value={experience.role_title} onChange={e => setExperience({...experience, role_title: e.target.value})} className="w-full bg-white/[0.02] border border-white/10 rounded-lg px-3.5 py-2.5 text-sm text-white focus:border-[var(--color-accent-primary)] outline-none transition-all" placeholder="Software Engineer" />
                            </label>
                            <label className="block space-y-1.5">
                                <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-widest">Years of Exp.</span>
                                <input type="number" min="0" value={profile.years_of_experience} onChange={e => setProfileData({...profile, years_of_experience: parseInt(e.target.value)})} className="w-full bg-white/[0.02] border border-white/10 rounded-lg px-3.5 py-2.5 text-sm text-white focus:border-[var(--color-accent-primary)] outline-none transition-all" placeholder="3" />
                            </label>
                        </div>
                        <label className="block space-y-1.5 pt-2">
                            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-widest">Professional Summary</span>
                            <textarea rows={4} value={profile.professional_summary} onChange={e => setProfileData({...profile, professional_summary: e.target.value})} className="w-full bg-white/[0.02] border border-white/10 rounded-lg px-3.5 py-2.5 text-sm text-white focus:border-[var(--color-accent-primary)] outline-none transition-all resize-none" placeholder="Briefly describe your background, strengths, and what you bring to the table..." />
                        </label>
                    </div>
                )}

                {/* Step 4: Skills & Resume */}
                {step === 4 && (
                    <div className="space-y-8 max-w-2xl">
                        <div>
                            <h3 className="text-lg font-semibold text-white mb-2">Core Competencies</h3>
                            <p className="text-slate-400 mb-4 text-xs font-light">Add the exact technical and soft skills you want to be matched on.</p>
                            <TagsInput value={skills} onChange={setSkills} placeholder="Type a skill and press Enter..." />
                        </div>
                        
                        <div className="pt-6 border-t border-white/5">
                            <h3 className="text-lg font-semibold text-white mb-2">Upload Resume</h3>
                            <p className="text-slate-400 mb-4 text-xs font-light">Our AI will use this as your core memory for tailoring applications.</p>
                            <ResumeDropzone onUploaded={(path, name, size) => {
                                console.log('Uploaded fully to', path)
                            }} />
                        </div>
                    </div>
                )}

                {/* Step 5: Preferences */}
                {step === 5 && (
                    <div className="space-y-5 max-w-2xl">
                        <h3 className="text-lg font-semibold text-white mb-4">Career Objectives</h3>
                        
                        <label className="block space-y-1.5">
                            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-widest">Target Role <span className="text-red-400">*</span></span>
                            <input required type="text" value={profile.target_role} onChange={e => setProfileData({...profile, target_role: e.target.value})} className="w-full bg-white/[0.02] border border-white/10 rounded-lg px-3.5 py-2.5 text-sm text-white focus:border-[var(--color-accent-primary)] outline-none transition-all" placeholder="e.g. Senior Frontend Engineer" />
                        </label>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-1 mt-2">
                            <label className="block space-y-1.5">
                                <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-widest">Work Mode</span>
                                <select 
                                    value={profile.preferred_work_mode} 
                                    onChange={e => setProfileData({...profile, preferred_work_mode: e.target.value})}
                                    className="w-full bg-white/[0.02] border border-white/10 rounded-lg px-3.5 py-2.5 text-sm text-white focus:border-[var(--color-accent-primary)] outline-none transition-all appearance-none cursor-pointer"
                                >
                                    <option className="bg-[#0b0c10]">Remote</option>
                                    <option className="bg-[#0b0c10]">Hybrid</option>
                                    <option className="bg-[#0b0c10]">On-site</option>
                                </select>
                            </label>

                            <label className="block space-y-1.5">
                                <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-widest">Expected Salary</span>
                                <input type="text" value={profile.expected_salary_range} onChange={e => setProfileData({...profile, expected_salary_range: e.target.value})} className="w-full bg-white/[0.02] border border-white/10 rounded-lg px-3.5 py-2.5 text-sm text-white focus:border-[var(--color-accent-primary)] outline-none transition-all" placeholder="$120k - $150k" />
                            </label>
                        </div>
                        
                        <div className="pt-3 flex items-center gap-2">
                            <input 
                                type="checkbox" id="relocate"
                                checked={profile.willing_to_relocate}
                                onChange={e => setProfileData({...profile, willing_to_relocate: e.target.checked})}
                                className="w-4 h-4 rounded border-white/20 bg-white/5 accent-[var(--color-neon-teal)] cursor-pointer"
                            />
                            <label htmlFor="relocate" className="text-xs font-medium text-slate-300 cursor-pointer select-none">
                                I am willing to relocate for the right opportunity
                            </label>
                        </div>
                    </div>
                )}

                {/* Step 6: Review */}
                {step === 6 && (
                    <div className="space-y-6 max-w-xl mx-auto text-center items-center flex flex-col pt-6">
                        <div className="w-20 h-20 rounded-full bg-[var(--color-neon-teal)]/10 flex items-center justify-center mb-2 shadow-[0_0_30px_rgba(105,246,184,0.15)] relative animate-pulse">
                            <Sparkles size={32} className="text-[var(--color-neon-teal)]" />
                        </div>
                        <div>
                            <h3 className="text-2xl font-bold text-white mb-2">Intelligence Gathered</h3>
                            <p className="text-slate-400 text-sm leading-relaxed font-light">
                                Your professional profile is strictly locked and tailored. The AI will now use this context to find and track your perfect roles.
                            </p>
                        </div>
                        
                        <div className="w-full glass-panel ghost-border rounded-xl p-5 text-left space-y-3 mt-4">
                            <div className="flex justify-between items-center pb-2.5 border-b border-white/5">
                                <span className="text-slate-500 font-semibold uppercase tracking-wider text-[11px]">Primary Target</span>
                                <span className="text-white text-sm font-medium">{profile.target_role || 'Not Set'}</span>
                            </div>
                            <div className="flex justify-between items-center pb-2.5 border-b border-white/5">
                                <span className="text-slate-500 font-semibold uppercase tracking-wider text-[11px]">Location Base</span>
                                <span className="text-white text-sm font-medium">{profile.location || 'Not Set'}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-slate-500 font-semibold uppercase tracking-wider text-[11px]">Skills Sourced</span>
                                <span className="text-[var(--color-neon-teal)] text-sm font-bold">{skills.length} core tags</span>
                            </div>
                        </div>
                    </div>
                )}

            </div>

            {/* Bottom Actions - Fixed */}
            <div className="flex-shrink-0 p-5 md:p-6 bg-black/40 backdrop-blur-xl border-t border-white/5 flex justify-between items-center z-20">
                <button 
                    onClick={() => setStep(s => Math.max(1, s - 1))}
                    disabled={step === 1 || isSaving}
                    className={`flex items-center gap-1.5 px-4 py-2 text-sm rounded-lg font-semibold transition-all ${step === 1 ? 'opacity-0 pointer-events-none' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}
                >
                    <ChevronLeft size={16} /> Back
                </button>
                
                <button 
                    onClick={handleNext}
                    disabled={isSaving || (step === 1 && (!profile.full_name || !profile.location))}
                    className="flex items-center gap-1.5 px-6 py-2.5 text-sm rounded-lg bg-gradient-to-r from-[var(--color-accent-primary)] to-[var(--color-neon-teal)] text-slate-900 font-bold tracking-wide hover:shadow-[0_0_15px_rgba(105,246,184,0.3)] hover:scale-[1.02] transition-all disabled:opacity-50 disabled:pointer-events-none disabled:scale-100"
                >
                    {isSaving ? (
                        <>Saving <span className="animate-pulse">...</span></>
                    ) : step === 6 ? (
                        <>Complete Setup <Check size={16} /></>
                    ) : (
                        <>Continue <ChevronRight size={16} /></>
                    )}
                </button>
            </div>
        </div>
    )
}
