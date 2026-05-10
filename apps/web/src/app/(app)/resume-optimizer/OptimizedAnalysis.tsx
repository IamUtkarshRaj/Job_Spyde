'use client'

import { Sparkles, BarChart3, ArrowRight } from 'lucide-react'

interface OptimizedAnalysisProps {
    jobDescription: string
    setJobDescription: (jd: string) => void
    selectedJob: any
    onOptimize: () => void
    isOptimizing: boolean
}

export function OptimizedAnalysis({ jobDescription, setJobDescription, selectedJob, onOptimize, isOptimizing }: OptimizedAnalysisProps) {
    const canOptimize = (!!selectedJob || jobDescription.length > 20) && !isOptimizing

    return (
        <div className="glass-panel ghost-border rounded-3xl p-8 relative overflow-hidden group">
            <div className="absolute -top-32 -left-32 w-96 h-96 bg-[var(--color-neon-teal)]/5 blur-[80px] rounded-full pointer-events-none group-hover:bg-[var(--color-neon-teal)]/10 transition-colors duration-1000" />

            <div className="flex justify-between items-center mb-8 relative z-10">
                <div>
                    <h2 className="text-xl font-bold text-white flex items-center gap-2">
                        <BarChart3 size={20} className="text-[var(--color-neon-teal)]" /> Job Description Analysis
                    </h2>
                    <p className="text-xs text-slate-500 mt-1">Extracting neural matching parameters</p>
                </div>
            </div>

            <div className="space-y-6 relative z-10">
                <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 hover:bg-white/[0.04] transition-colors group/textarea">
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-3 flex items-center gap-2 transition-colors group-hover/textarea:text-slate-400">
                        Target Context (Paste JD here if not selected)
                    </label>
                    <textarea 
                        rows={8}
                        className="w-full px-4 py-3 bg-black/30 border border-transparent rounded-xl text-slate-300 placeholder-slate-600 focus:outline-none focus:border-[var(--color-neon-teal)]/30 focus:shadow-[0_0_15px_rgba(105,246,184,0.1)] text-sm transition-all font-mono leading-relaxed resize-none"
                        value={jobDescription}
                        onChange={(e) => setJobDescription(e.target.value)}
                        placeholder="Paste job description here to check keyword matching..."
                    />
                </div>

                <div className="flex flex-wrap gap-4 pt-2">
                    <button 
                        onClick={onOptimize}
                        disabled={!canOptimize}
                        className={`
                            flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-8 py-3 
                            text-xs rounded-xl font-extrabold transition-all duration-300 active:scale-95
                            ${canOptimize
                                ? 'bg-[var(--color-accent-primary)] text-white hover:bg-[var(--color-accent-hover)] hover:shadow-[0_0_20px_rgba(133,173,255,0.4)]'
                                : 'bg-slate-900 text-slate-500 cursor-not-allowed opacity-50 border border-white/5'
                            }
                        `}
                    >
                        {isOptimizing ? (
                            <>
                                <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                                Optimizing...
                            </>
                        ) : (
                            <>
                                <Sparkles size={16} />
                                Optimize Resume
                                <ArrowRight size={14} className="ml-1" />
                            </>
                        )}
                    </button>
                </div>

                {!selectedJob && (
                    <div className="mt-4 p-4 rounded-xl bg-orange-500/10 border border-orange-500/20 flex items-start gap-3">
                        <BarChart3 size={18} className="text-orange-500 shrink-0 mt-0.5" />
                        <p className="text-[10px] text-orange-200/70 font-medium leading-relaxed">
                            <span className="text-orange-500 font-bold uppercase mr-1">Advisory:</span> 
                            Select a saved job from the sidebar or paste a job description to activate the optimization engine.
                        </p>
                    </div>
                )}
            </div>
        </div>
    )
}
