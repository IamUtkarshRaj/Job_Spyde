import { createClient } from '@/utils/supabase/server'
import { uploadResume } from './actions'
import { FileText, UploadCloud, Sparkles, BrainCircuit, Activity } from 'lucide-react'

export default async function ResumePage() {
    const supabase = await createClient()
    const { data: resumes } = await supabase.from('resumes').select('*').order('created_at', { ascending: false }).limit(1)
    const currentResume = resumes && resumes.length > 0 ? resumes[0] : null

    return (
        <div className="max-w-5xl mx-auto space-y-8 relative z-10 w-full pb-12">
            <div className="flex flex-col gap-3 mb-10">
                <h1 className="text-4xl md:text-5xl font-extrabold tracking-tighter aurora-text py-1">Neural Core Memory</h1>
                <p className="text-slate-400 text-[15px] font-medium max-w-2xl">
                    Manage your raw experiential data that powers the JobSpyde autonomous matching engine.
                </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                
                {/* Left Column: Upload Form */}
                <div className="lg:col-span-7 space-y-8">
                    <div className="glass-panel ghost-border rounded-3xl p-8 relative overflow-hidden group">
                        <div className="absolute -top-32 -right-32 w-96 h-96 bg-[var(--color-neon-teal)]/5 blur-[80px] rounded-full pointer-events-none group-hover:bg-[var(--color-neon-teal)]/10 transition-colors duration-1000" />

                        <div className="flex justify-between items-center mb-8 relative z-10">
                            <div>
                                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                                    <UploadCloud size={20} className="text-[var(--color-neon-teal)]" /> Data Ingestion
                                </h2>
                                <p className="text-xs text-slate-500 mt-1">Upload unstructured experience parameters</p>
                            </div>
                            <div className="px-2 py-0.5 rounded bg-[var(--color-neon-teal)]/20 text-[var(--color-neon-teal)] text-[8px] font-black uppercase tracking-widest border border-[var(--color-neon-teal)]/30">Secure</div>
                        </div>

                        <form action={async (formData) => {
                            'use server'
                            await uploadResume(formData)
                        }} className="space-y-6 relative z-10">
                            <div className="p-4 rounded-2xl bg-white/[0.02] border whitespace-nowrap border-white/[0.05] hover:bg-white/[0.04] transition-colors">
                                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-3 flex items-center gap-2">
                                    <FileText size={12}/> Document Node (PDF/DOCX)
                                </label>
                                <input
                                    type="file"
                                    name="resumeFile"
                                    className="block w-full text-sm text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-[var(--color-neon-teal)]/10 file:text-[var(--color-neon-teal)] hover:file:bg-[var(--color-neon-teal)]/20 file:transition-all file:cursor-pointer file:shadow-inner focus:outline-none"
                                />
                            </div>

                            <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/[0.05] hover:bg-white/[0.04] transition-colors">
                                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-3 flex items-center gap-2">
                                    <BrainCircuit size={12}/> Raw Extracted Text Schema (For Max AI Precision)
                                </label>
                                <textarea
                                    name="resumeText"
                                    rows={10}
                                    className="w-full px-4 py-3 bg-black/30 border border-transparent rounded-xl text-slate-300 placeholder-slate-600 focus:outline-none focus:border-[var(--color-neon-teal)]/30 focus:shadow-[0_0_15px_rgba(105,246,184,0.1)] text-sm transition-all font-mono leading-relaxed resize-none"
                                    placeholder="Paste your raw unstructured resume text here for optimal parsing..."
                                    defaultValue={currentResume?.resume_text || ''}
                                    required
                                />
                            </div>

                            <div className="pt-2">
                                <button type="submit" className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3 bg-[var(--color-accent-primary)] text-white text-xs rounded-xl font-extrabold hover:shadow-[0_0_20px_rgba(133,173,255,0.4)] hover:bg-[var(--color-accent-hover)] transition-all duration-300 active:scale-95">
                                    <UploadCloud size={16} />
                                    Sync to Architecture
                                </button>
                            </div>
                        </form>
                    </div>
                </div>

                {/* Right Column: AI Assistant Panel */}
                <div className="lg:col-span-5 relative">
                    <div className="glass-panel ghost-border rounded-3xl p-8 relative overflow-hidden sticky top-28">
                        {/* AI Grain Overlay */}
                        <div className="absolute inset-0 pointer-events-none opacity-[0.03]" style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuAf1HPenoFjnxM5pSRIkjziuMDdbIlWg6lw7cwzf4VhdLZspGRxsCCpD0MwjhOpYVeVUOZQH8jGaW6aAIp_OYmC--UMWa4KQDGnA1vANnX0j5DmWqed75vqMSPK5ANvbgMep4lWYmKmcEb_u1D1ZO3fu6hnQqbRf2o07LJgKTHL90qIyBXqlfXP7f31cIBtIn6_VE7s3UGhG7TKWnYgGU1xHBj_VqlhDf_lwSFRd484QzYk3fpe-mKNfhrG2YkhsOfKo7K6z31m73zX')" }}></div>
                        
                        <div className="flex items-center gap-2 mb-8 relative z-10">
                            <Sparkles size={18} className="text-[var(--color-neon-teal)] animate-pulse" />
                            <h4 className="text-xs font-bold text-white tracking-widest uppercase">Memory Status Diagnostics</h4>
                        </div>

                        {currentResume ? (
                            <div className="space-y-6 relative z-10">
                                <div className="p-5 rounded-2xl bg-[var(--color-neon-teal)]/5 border-l-2 border-[var(--color-neon-teal)] transition-transform hover:-translate-y-1 duration-300">
                                    <div className="flex justify-between items-center mb-2">
                                        <p className="text-[10px] text-[var(--color-neon-teal)] font-bold uppercase tracking-wider">Sync Active</p>
                                        <Activity size={12} className="text-[var(--color-neon-teal)]" />
                                    </div>
                                    <p className="text-sm text-slate-300 font-medium leading-relaxed">
                                        Core memory synchronized on <span className="text-white font-bold">{new Date(currentResume.created_at).toLocaleDateString()}</span>
                                    </p>
                                    {currentResume.storage_path && (
                                        <p className="mt-3 text-[10px] text-slate-500 font-mono break-all py-1.5 px-3 bg-black/20 rounded border border-white/5">
                                            {currentResume.storage_path}
                                        </p>
                                    )}
                                </div>

                                <div className="p-5 rounded-2xl bg-white/[0.02] border-l-2 border-white/20 transition-transform hover:-translate-y-1 duration-300">
                                    <p className="text-xs text-slate-400 leading-relaxed mb-3">
                                        Memory validation complete. <span className="text-white font-bold">{currentResume.resume_text.length}</span> neural bytes processed and ready for autonomous mapping.
                                    </p>
                                    <div className="h-6 w-full bg-slate-900/50 rounded-lg overflow-hidden flex items-end px-1 gap-0.5">
                                        <div className="w-full bg-[var(--color-accent-primary)]/20 h-[30%] rounded-t-sm animate-pulse"></div>
                                        <div className="w-full bg-[var(--color-accent-primary)]/40 h-[45%] rounded-t-sm"></div>
                                        <div className="w-full bg-[var(--color-accent-primary)]/60 h-[70%] rounded-t-sm shadow-[0_0_10px_rgba(133,173,255,0.3)]"></div>
                                        <div className="w-full bg-[var(--color-accent-primary)] h-[100%] rounded-t-sm"></div>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="text-center py-12 relative z-10">
                                <div className="w-16 h-16 rounded-full bg-slate-900 flex items-center justify-center mx-auto mb-4 border border-white/10 shadow-[0_0_15px_rgba(255,255,255,0.02)]">
                                    <FileText size={24} className="text-slate-500" />
                                </div>
                                <h3 className="text-sm font-bold text-white mb-2">System Offline</h3>
                                <p className="text-xs text-slate-400 font-medium leading-relaxed max-w-[200px] mx-auto">Upload experience data to activate autonomous agents.</p>
                            </div>
                        )}

                        {/* Footer connection line */}
                        <div className="mt-8 pt-6 border-t border-white/5 relative z-10">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[var(--color-accent-primary)] to-[var(--color-neon-teal)] flex items-center justify-center">
                                    <BrainCircuit size={14} className="text-white" />
                                </div>
                                <div className="flex-1">
                                    <p className="text-[8px] text-slate-500 uppercase font-black tracking-widest">Neural Link</p>
                                    <div className="h-1 w-full bg-slate-800 rounded-full mt-1.5 overflow-hidden">
                                        <div className={`h-full bg-[var(--color-neon-teal)] ${currentResume ? 'w-full shadow-[0_0_8px_rgba(105,246,184,0.5)]' : 'w-0'} transition-all duration-1000`}></div>
                                    </div>
                                </div>
                            </div>
                        </div>

                    </div>
                </div>

            </div>
        </div>
    )
}
