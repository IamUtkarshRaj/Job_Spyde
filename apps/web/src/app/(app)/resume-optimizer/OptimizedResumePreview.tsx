'use client'

import { useState } from 'react'
import { CheckCircle2, AlertTriangle, Sparkles, ArrowLeft, FileDown, RefreshCw, ChevronDown, ChevronUp } from 'lucide-react'

interface OptimizedResumePreviewProps {
    optimizedData: any
    originalData: {
        profile: any
        experience: any[]
        education: any[]
        projects: any[]
        skills: string
        certifications: any[]
    }
    onBack: () => void
    onReOptimize: () => void
    onGeneratePDF: () => void
    jobTitle: string
    company: string
}

export function OptimizedResumePreview({
    optimizedData,
    originalData,
    onBack,
    onReOptimize,
    onGeneratePDF,
    jobTitle,
    company,
}: OptimizedResumePreviewProps) {
    const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
        summary: true,
        experience: true,
        projects: true,
        skills: true,
    })

    const keywordMatches = optimizedData?.keyword_matches || []
    const missingKeywords = optimizedData?.missing_keywords || []
    const matchScore = keywordMatches.length > 0 
        ? Math.round((keywordMatches.length / (keywordMatches.length + missingKeywords.length)) * 100) 
        : 0

    const toggleSection = (key: string) => {
        setExpandedSections(prev => ({ ...prev, [key]: !prev[key] }))
    }

    return (
        <div className="space-y-8">
            {/* Header with actions */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-white tracking-tight">Optimized Resume</h2>
                    <p className="text-sm text-slate-500 mt-1">
                        Tailored for <span className="text-[var(--color-accent-primary)] font-semibold">{jobTitle}</span>
                        {company && <> at <span className="text-[var(--color-neon-teal)] font-semibold">{company}</span></>}
                    </p>
                </div>
                <div className="flex gap-3">
                    <button
                        onClick={onBack}
                        className="inline-flex items-center gap-2 px-4 py-2.5 bg-white/5 border border-white/10 text-slate-300 hover:bg-white/10 text-xs font-bold uppercase tracking-widest rounded-xl transition-all active:scale-95"
                    >
                        <ArrowLeft size={14} /> Back to Edit
                    </button>
                    <button
                        onClick={onReOptimize}
                        className="inline-flex items-center gap-2 px-4 py-2.5 bg-[var(--color-soft-violet)]/10 border border-[var(--color-soft-violet)]/30 text-[var(--color-soft-violet)] hover:bg-[var(--color-soft-violet)]/20 text-xs font-bold uppercase tracking-widest rounded-xl transition-all active:scale-95"
                    >
                        <RefreshCw size={14} /> Re-optimize
                    </button>
                    <button
                        onClick={onGeneratePDF}
                        className="inline-flex items-center gap-2 px-6 py-2.5 bg-[var(--color-accent-primary)] text-white hover:bg-[var(--color-accent-hover)] hover:shadow-[0_0_20px_rgba(133,173,255,0.4)] text-xs font-bold uppercase tracking-widest rounded-xl transition-all active:scale-95"
                    >
                        <FileDown size={14} /> Generate PDF
                    </button>
                </div>
            </div>

            {/* Keyword Analysis Panel */}
            <div className="glass-panel ghost-border rounded-3xl p-8 relative overflow-hidden">
                <div className="absolute -top-32 -right-32 w-96 h-96 bg-[var(--color-neon-teal)]/5 blur-[80px] rounded-full pointer-events-none" />
                
                <div className="relative z-10">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-lg font-bold text-white flex items-center gap-2">
                            <Sparkles size={18} className="text-[var(--color-accent-primary)]" />
                            Keyword Match Analysis
                        </h3>
                        <div className="flex items-center gap-3">
                            <div className="text-right">
                                <span className="text-3xl font-black text-white">{matchScore}%</span>
                                <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">Match Score</p>
                            </div>
                            <div 
                                className="w-14 h-14 rounded-full flex items-center justify-center"
                                style={{
                                    background: `conic-gradient(var(--color-neon-teal) ${matchScore * 3.6}deg, rgba(255,255,255,0.05) 0deg)`,
                                }}
                            >
                                <div className="w-10 h-10 rounded-full bg-[var(--color-bg-primary)] flex items-center justify-center">
                                    <CheckCircle2 size={16} className="text-[var(--color-neon-teal)]" />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Matched Keywords */}
                    {keywordMatches.length > 0 && (
                        <div className="mb-5">
                            <p className="text-[10px] font-bold text-[var(--color-neon-teal)] uppercase tracking-widest mb-3 flex items-center gap-2">
                                <CheckCircle2 size={12} /> Matched Keywords ({keywordMatches.length})
                            </p>
                            <div className="flex flex-wrap gap-2">
                                {keywordMatches.map((kw: string, i: number) => (
                                    <span
                                        key={i}
                                        className="px-3 py-1.5 rounded-lg bg-[var(--color-neon-teal)]/10 border border-[var(--color-neon-teal)]/20 text-[var(--color-neon-teal)] text-[11px] font-bold"
                                    >
                                        {kw}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Missing Keywords */}
                    {missingKeywords.length > 0 && (
                        <div>
                            <p className="text-[10px] font-bold text-amber-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                                <AlertTriangle size={12} /> Not in Resume ({missingKeywords.length})
                            </p>
                            <div className="flex flex-wrap gap-2">
                                {missingKeywords.map((kw: string, i: number) => (
                                    <span
                                        key={i}
                                        className="px-3 py-1.5 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-400/80 text-[11px] font-medium"
                                    >
                                        {kw}
                                    </span>
                                ))}
                            </div>
                            <p className="text-[10px] text-slate-600 mt-3 italic">
                                These keywords appear in the JD but not in your resume. Consider adding relevant ones if truthful.
                            </p>
                        </div>
                    )}
                </div>
            </div>

            {/* Optimized Summary */}
            <SectionCard
                title="Professional Summary"
                color="var(--color-accent-primary)"
                expanded={expandedSections.summary}
                onToggle={() => toggleSection('summary')}
                original={originalData.profile?.professional_summary || ''}
                optimized={optimizedData?.optimized_profile?.professional_summary || ''}
            />

            {/* Optimized Experience */}
            <div className="glass-panel ghost-border rounded-3xl p-8 relative overflow-hidden">
                <button onClick={() => toggleSection('experience')} className="flex justify-between items-center w-full mb-6 relative z-10">
                    <h3 className="text-lg font-bold text-white">Experience</h3>
                    {expandedSections.experience ? <ChevronUp size={18} className="text-slate-500" /> : <ChevronDown size={18} className="text-slate-500" />}
                </button>
                {expandedSections.experience && (
                    <div className="space-y-6 relative z-10">
                        {(optimizedData?.optimized_experience || []).map((exp: any, idx: number) => (
                            <div key={idx} className="p-5 rounded-2xl bg-white/[0.02] border border-white/5">
                                <div className="flex justify-between items-start mb-3">
                                    <div>
                                        <h4 className="text-sm font-bold text-white">{exp.title}</h4>
                                        <p className="text-xs text-[var(--color-soft-violet)] font-semibold">{exp.company}</p>
                                    </div>
                                    <span className="text-[10px] text-slate-500 font-mono">{exp.dates}</span>
                                </div>
                                <p className="text-xs text-slate-300 leading-relaxed whitespace-pre-line">{exp.description}</p>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Optimized Projects */}
            <div className="glass-panel ghost-border rounded-3xl p-8 relative overflow-hidden">
                <button onClick={() => toggleSection('projects')} className="flex justify-between items-center w-full mb-6 relative z-10">
                    <h3 className="text-lg font-bold text-white">Projects</h3>
                    {expandedSections.projects ? <ChevronUp size={18} className="text-slate-500" /> : <ChevronDown size={18} className="text-slate-500" />}
                </button>
                {expandedSections.projects && (
                    <div className="space-y-6 relative z-10">
                        {(optimizedData?.optimized_projects || []).map((proj: any, idx: number) => (
                            <div key={idx} className="p-5 rounded-2xl bg-white/[0.02] border border-white/5">
                                <div className="flex justify-between items-start mb-2">
                                    <h4 className="text-sm font-bold text-white">{proj.name}</h4>
                                    {proj.url && <span className="text-[10px] text-slate-500 font-mono truncate max-w-[200px]">{proj.url}</span>}
                                </div>
                                <div className="flex flex-wrap gap-1.5 mb-3">
                                    {(proj.technologies || '').split(',').filter(Boolean).map((tech: string, i: number) => (
                                        <span key={i} className="px-2 py-0.5 rounded bg-[var(--color-neon-teal)]/10 text-[var(--color-neon-teal)] text-[10px] font-bold">
                                            {tech.trim()}
                                        </span>
                                    ))}
                                </div>
                                <p className="text-xs text-slate-300 leading-relaxed">{proj.description}</p>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Optimized Skills */}
            <div className="glass-panel ghost-border rounded-3xl p-8 relative overflow-hidden">
                <button onClick={() => toggleSection('skills')} className="flex justify-between items-center w-full mb-6 relative z-10">
                    <h3 className="text-lg font-bold text-white">Skills</h3>
                    {expandedSections.skills ? <ChevronUp size={18} className="text-slate-500" /> : <ChevronDown size={18} className="text-slate-500" />}
                </button>
                {expandedSections.skills && (
                    <div className="flex flex-wrap gap-2 relative z-10">
                        {(optimizedData?.optimized_skills || '').split(',').filter(Boolean).map((skill: string, i: number) => (
                            <span
                                key={i}
                                className="px-3 py-1.5 rounded-lg bg-amber-400/10 border border-amber-400/20 text-amber-300 text-[11px] font-bold"
                            >
                                {skill.trim()}
                            </span>
                        ))}
                    </div>
                )}
            </div>

            {/* Bottom action bar */}
            <div className="flex justify-center pt-4">
                <button
                    onClick={onGeneratePDF}
                    className="inline-flex items-center gap-3 px-10 py-4 bg-gradient-to-r from-[var(--color-accent-primary)] to-[var(--color-neon-teal)] text-white hover:shadow-[0_0_30px_rgba(133,173,255,0.4)] text-sm font-bold uppercase tracking-widest rounded-2xl transition-all active:scale-95"
                >
                    <FileDown size={18} /> Download Optimized Resume PDF
                </button>
            </div>
        </div>
    )
}


/* ── Reusable Section Card with original vs optimized ── */
function SectionCard({ title, color, expanded, onToggle, original, optimized }: {
    title: string
    color: string
    expanded: boolean
    onToggle: () => void
    original: string
    optimized: string
}) {
    const [showOriginal, setShowOriginal] = useState(false)

    return (
        <div className="glass-panel ghost-border rounded-3xl p-8 relative overflow-hidden">
            <button onClick={onToggle} className="flex justify-between items-center w-full mb-6 relative z-10">
                <h3 className="text-lg font-bold text-white">{title}</h3>
                {expanded ? <ChevronUp size={18} className="text-slate-500" /> : <ChevronDown size={18} className="text-slate-500" />}
            </button>
            {expanded && (
                <div className="relative z-10 space-y-4">
                    <div className="flex gap-2 mb-4">
                        <button
                            onClick={() => setShowOriginal(false)}
                            className={`px-4 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all ${
                                !showOriginal 
                                    ? 'bg-[var(--color-accent-primary)]/20 text-[var(--color-accent-primary)] border border-[var(--color-accent-primary)]/30' 
                                    : 'bg-white/5 text-slate-500 border border-white/5'
                            }`}
                        >
                            Optimized
                        </button>
                        <button
                            onClick={() => setShowOriginal(true)}
                            className={`px-4 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all ${
                                showOriginal 
                                    ? 'bg-white/10 text-white border border-white/10' 
                                    : 'bg-white/5 text-slate-500 border border-white/5'
                            }`}
                        >
                            Original
                        </button>
                    </div>
                    <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/5">
                        <p className="text-sm text-slate-300 leading-relaxed whitespace-pre-line">
                            {showOriginal ? (original || 'No original content') : (optimized || 'No optimized content')}
                        </p>
                    </div>
                </div>
            )}
        </div>
    )
}
