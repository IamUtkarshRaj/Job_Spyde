import { Calendar, MapPin, Building2, ExternalLink } from 'lucide-react'
import { Badge } from '@/components/ui/Badge'

// Define the Job interface based on schema
export interface Job {
    id: string
    title: string
    company: string
    location: string | null
    source: string | null
    url: string | null
    description: string | null
    posted_at: string | null
    match_score: number | null
    status: 'discovered' | 'saved' | 'prepared' | 'applied' | 'interview' | 'offer' | 'rejected' | 'ghosted'
    created_at: string
}

export function JobCard({ job }: { job: Job }) {
    return (
        <div className="glass-panel ghost-border p-6 rounded-2xl group hover:-translate-y-1.5 hover:shadow-[0_20px_40px_rgba(0,0,0,0.4)] hover:border-[var(--color-accent-primary)]/30 transition-all duration-500 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-[var(--color-accent-primary)]/0 to-[var(--color-neon-teal)]/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
            <div className="flex justify-between items-start mb-4 relative z-10">
                <div className="min-w-0 flex-1">
                    <h3 className="font-semibold text-lg text-white truncate group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-white group-hover:to-[var(--color-neon-teal)] transition-all duration-300">{job.title}</h3>
                    <div className="flex items-center text-sm text-slate-400 gap-2 mt-1">
                        <Building2 size={16} className="shrink-0 text-slate-500" />
                        <span className="truncate flex-1">{job.company}</span>
                    </div>
                </div>
                <Badge variant={job.status} className="ml-3 shrink-0">
                    {job.status.charAt(0).toUpperCase() + job.status.slice(1)}
                </Badge>
            </div>

            <div className="flex flex-col gap-2.5 mt-5 text-sm text-slate-400">
                <div className="flex items-center gap-2">
                    <MapPin size={16} className="shrink-0 text-slate-500" />
                    <span className="truncate">{job.location || 'Remote'}</span>
                </div>
                {job.posted_at && (
                    <div className="flex items-center gap-2">
                        <Calendar size={16} className="shrink-0 text-slate-500" />
                        <span>{new Date(job.posted_at).toLocaleDateString()}</span>
                    </div>
                )}
            </div>

            <div className="mt-5 pt-4 border-t border-white/5 flex justify-between items-center relative z-10 transition-colors group-hover:border-white/10">
                <div className="flex items-center gap-1">
                    {job.match_score !== null && (
                        <Badge variant="match" score={job.match_score}>
                            {job.match_score}% Match
                        </Badge>
                    )}
                </div>

                <a
                    href={`/jobs/${job.id}`}
                    className="text-sm font-semibold text-[var(--color-neon-teal)] hover:text-white transition-colors border-b border-transparent hover:border-white pb-0.5"
                >
                    View Details
                </a>
            </div>
        </div>
    )
}
