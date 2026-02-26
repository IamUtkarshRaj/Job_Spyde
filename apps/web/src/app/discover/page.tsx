import { discoverJobs } from './actions'
import { JobSaveButton } from '@/components/JobSaveButton'
import Link from 'next/link'
import { Badge } from '@/components/ui/Badge'
import { ArrowLeft } from 'lucide-react'

export default async function DiscoverPage() {
    const jobs = await discoverJobs()

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-3xl font-bold tracking-tight text-slate-100">Discover Jobs</h2>
                <Link href="/dashboard" className="text-sm text-indigo-400 hover:text-indigo-300 flex items-center gap-1.5 transition-colors">
                    <ArrowLeft size={14} /> Back to Dashboard
                </Link>
            </div>

            <p className="text-slate-500">Jobs recommended based on your profile preferences.</p>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {jobs && jobs.length > 0 ? (
                    jobs.map((job: any, index: number) => (
                        <div key={index} className="glass-card glass-card-lift p-5 flex flex-col justify-between">
                            <div>
                                <h3 className="font-semibold text-lg text-slate-100">{job.title}</h3>
                                <div className="text-sm text-slate-500 mb-3">{job.company} • {job.location}</div>
                                <div className="flex items-center gap-2 mb-4">
                                    <Badge variant="match" score={job.match_score}>
                                        {job.match_score}% Match
                                    </Badge>
                                </div>
                                <p className="text-sm text-slate-400 line-clamp-3 mb-4 leading-relaxed">
                                    {job.description}
                                </p>
                            </div>
                            <div className="flex justify-between items-center mt-auto pt-4 border-t border-slate-800/30">
                                <a href={job.url} target="_blank" rel="noopener noreferrer" className="text-sm text-indigo-400 hover:text-indigo-300 font-medium transition-colors">
                                    View Posting
                                </a>
                                <JobSaveButton job={job} />
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="col-span-full text-center py-12">
                        <p className="text-slate-500">No jobs found. Try updating your profile preferences.</p>
                    </div>
                )}
            </div>
        </div>
    )
}
