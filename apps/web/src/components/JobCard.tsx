import { Calendar, MapPin, Building2, ExternalLink } from 'lucide-react'

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
    const statusColors = {
        discovered: 'bg-gray-100 text-gray-800',
        saved: 'bg-blue-100 text-blue-800',
        prepared: 'bg-yellow-100 text-yellow-800',
        applied: 'bg-green-100 text-green-800',
        interview: 'bg-purple-100 text-purple-800',
        offer: 'bg-pink-100 text-pink-800',
        rejected: 'bg-red-100 text-red-800',
        ghosted: 'bg-gray-400 text-white',
    }

    return (
        <div className="border rounded-lg p-4 shadow-sm hover:shadow-md transition bg-card text-card-foreground">
            <div className="flex justify-between items-start mb-2">
                <div>
                    <h3 className="font-semibold text-lg">{job.title}</h3>
                    <div className="flex items-center text-sm text-muted-foreground gap-1">
                        <Building2 size={14} />
                        <span>{job.company}</span>
                    </div>
                </div>
                <span className={`text-xs px-2 py-1 rounded-full font-medium ${statusColors[job.status] || 'bg-gray-100'}`}>
                    {job.status.charAt(0).toUpperCase() + job.status.slice(1)}
                </span>
            </div>

            <div className="flex flex-col gap-1 mt-2 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                    <MapPin size={14} />
                    <span>{job.location || 'Remote'}</span>
                </div>
                {job.posted_at && (
                    <div className="flex items-center gap-1">
                        <Calendar size={14} />
                        <span>{new Date(job.posted_at).toLocaleDateString()}</span>
                    </div>
                )}
            </div>

            <div className="mt-4 flex justify-between items-center">
                <div className="flex items-center gap-1">
                    {job.match_score !== null && (
                        <div className="text-sm font-medium">
                            Match: <span className={job.match_score > 80 ? 'text-green-600' : 'text-yellow-600'}>{job.match_score}%</span>
                        </div>
                    )}
                </div>

                <a href={`/jobs/${job.id}`} className="text-sm font-medium text-blue-600 hover:underline">
                    View Details
                </a>
            </div>
        </div>
    )
}
