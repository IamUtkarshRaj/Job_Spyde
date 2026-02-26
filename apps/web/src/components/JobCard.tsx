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
        <div className="glass-card glass-card-lift p-5">
            <div className="flex justify-between items-start mb-3">
                <div className="min-w-0 flex-1">
                    <h3 className="font-semibold text-lg text-slate-100 truncate">{job.title}</h3>
                    <div className="flex items-center text-sm text-slate-500 gap-1.5 mt-0.5">
                        <Building2 size={14} className="shrink-0" />
                        <span className="truncate">{job.company}</span>
                    </div>
                </div>
                <Badge variant={job.status} className="ml-2 shrink-0">
                    {job.status.charAt(0).toUpperCase() + job.status.slice(1)}
                </Badge>
            </div>

            <div className="flex flex-col gap-1.5 mt-3 text-sm text-slate-500">
                <div className="flex items-center gap-1.5">
                    <MapPin size={14} className="shrink-0" />
                    <span>{job.location || 'Remote'}</span>
                </div>
                {job.posted_at && (
                    <div className="flex items-center gap-1.5">
                        <Calendar size={14} className="shrink-0" />
                        <span>{new Date(job.posted_at).toLocaleDateString()}</span>
                    </div>
                )}
            </div>

            <div className="mt-4 pt-3 border-t border-slate-800/30 flex justify-between items-center">
                <div className="flex items-center gap-1">
                    {job.match_score !== null && (
                        <Badge variant="match" score={job.match_score}>
                            {job.match_score}% Match
                        </Badge>
                    )}
                </div>

                <a
                    href={`/jobs/${job.id}`}
                    className="text-sm font-medium text-indigo-400 hover:text-indigo-300 transition-colors"
                >
                    View Details
                </a>
            </div>
        </div>
    )
}
