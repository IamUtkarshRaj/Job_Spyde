'use client'

import { Briefcase, Building, MapPin, CheckCircle2 } from 'lucide-react'

interface SavedJobsSidebarProps {
    savedJobs: any[]
    selectedJob: any
    onSelectJob: (job: any) => void
}

export function SavedJobsSidebar({ savedJobs, selectedJob, onSelectJob }: SavedJobsSidebarProps) {
    return (
        <div className="glass-panel ghost-border rounded-3xl p-6 h-[calc(100vh-200px)] overflow-y-auto custom-scrollbar">
            <h3 className="text-sm font-bold text-slate-500 uppercase tracking-widest mb-6 flex items-center gap-2">
                <Briefcase size={16} className="text-[var(--color-soft-violet)]" /> Saved Intelligence
            </h3>

            <div className="space-y-4">
                {savedJobs.map((job) => {
                    const isSelected = selectedJob?.id === job.id
                    return (
                        <div 
                            key={job.id}
                            onClick={() => onSelectJob(job)}
                            className={`
                                p-4 rounded-2xl border transition-all cursor-pointer group
                                ${isSelected 
                                    ? 'bg-[var(--color-soft-violet)]/10 border-[var(--color-soft-violet)] shadow-[0_0_15px_rgba(167,139,250,0.1)]' 
                                    : 'bg-white/[0.02] border-white/5 hover:border-white/10 hover:bg-white/[0.04]'
                                }
                            `}
                        >
                            <div className="flex justify-between items-start mb-2">
                                <h4 className={`text-sm font-bold transition-colors ${isSelected ? 'text-white' : 'text-slate-300 group-hover:text-white'}`}>
                                    {job.title}
                                </h4>
                                {isSelected && <CheckCircle2 size={14} className="text-[var(--color-soft-violet)] shrink-0" />}
                            </div>
                            
                            <div className="space-y-1.5 mt-2">
                                <div className="flex items-center gap-2 text-[10px] text-slate-500 font-medium">
                                    <Building size={12} /> {job.company}
                                </div>
                                <div className="flex items-center gap-2 text-[10px] text-slate-500 font-medium">
                                    <MapPin size={12} /> {job.location || 'Remote'}
                                </div>
                            </div>
                        </div>
                    )
                })}

                {savedJobs.length === 0 && (
                    <div className="text-center py-12">
                        <p className="text-slate-500 text-xs font-medium">No saved jobs found.</p>
                        <p className="text-[10px] text-slate-600 mt-2">Save some jobs to start optimizing.</p>
                    </div>
                )}
            </div>
        </div>
    )
}
