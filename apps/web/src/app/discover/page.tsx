import { discoverJobs } from './actions'
import { JobSaveButton } from '@/components/JobSaveButton'
import Link from 'next/link'

export default async function DiscoverPage() {
    const jobs = await discoverJobs()

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-3xl font-bold tracking-tight">Discover Jobs</h2>
                <Link href="/dashboard" className="text-blue-600 hover:underline">
                    ← Back to Dashboard
                </Link>
            </div>

            <p className="text-muted-foreground">Jobs recommended based on your profile preferences.</p>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {jobs && jobs.length > 0 ? (
                    jobs.map((job: any, index: number) => (
                        <div key={index} className="border rounded-lg p-4 shadow-sm hover:shadow-md transition bg-card text-card-foreground flex flex-col justify-between">
                            <div>
                                <h3 className="font-semibold text-lg">{job.title}</h3>
                                <div className="text-sm text-muted-foreground mb-2">{job.company} • {job.location}</div>
                                <div className="flex items-center gap-2 mb-4">
                                    <span className="text-xs bg-slate-100 px-2 py-1 rounded">Match: {job.match_score}%</span>
                                </div>
                                <p className="text-sm text-muted-foreground line-clamp-3 mb-4">
                                    {job.description}
                                </p>
                            </div>
                            <div className="flex justify-between items-center mt-auto">
                                <a href={job.url} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline">View Posting</a>
                                <JobSaveButton job={job} />
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="col-span-full text-center py-12">
                        <p className="text-muted-foreground">No jobs found. Try updating your profile preferences.</p>
                    </div>
                )}
            </div>
        </div>
    )
}
