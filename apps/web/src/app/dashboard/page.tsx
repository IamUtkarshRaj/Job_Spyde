import { createClient } from '@/utils/supabase/server'
import { JobCard } from '@/components/JobCard'
import Link from 'next/link'
import { PlusCircle } from 'lucide-react'

export default async function DashboardPage({
    searchParams,
}: {
    searchParams: Promise<{ tab?: string }>
}) {
    const { tab: tabParam } = await searchParams
    const tab = tabParam || 'discovered'

    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    let query = supabase
        .from('jobs')
        .select('*')
        .eq('user_id', user!.id)
        .order('created_at', { ascending: false })

    if (tab === 'discovered') {
        query = query.eq('status', 'discovered')
    } else if (tab === 'saved') {
        query = query.in('status', ['saved', 'prepared', 'interview', 'offer'])
    } else if (tab === 'applied') {
        query = query.in('status', ['applied', 'rejected', 'ghosted'])
    }

    const { data: jobs } = await query

    const tabs = [
        { id: 'discovered', label: 'Discovered' },
        { id: 'saved', label: 'Saved & In Progress' },
        { id: 'applied', label: 'Applied & History' },
    ]

    return (
        <div className="space-y-8">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight text-gray-900">Dashboard</h2>
                    <p className="text-gray-500 mt-1">Track and manage your job search pipeline.</p>
                </div>
                <Link
                    href="/discover"
                    className="inline-flex items-center justify-center gap-2 rounded-lg text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-blue-600 text-white hover:bg-blue-700 h-10 px-5 py-2 shadow-sm hover:shadow"
                >
                    <PlusCircle size={16} />
                    Discover Jobs
                </Link>
            </div>

            <div className="border-b border-gray-200">
                <nav className="-mb-px flex space-x-8" aria-label="Tabs">
                    {tabs.map((t) => (
                        <Link
                            key={t.id}
                            href={`/dashboard?tab=${t.id}`}
                            className={`
                whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors
                ${tab === t.id
                                    ? 'border-blue-500 text-blue-600'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}
              `}
                        >
                            {t.label}
                        </Link>
                    ))}
                </nav>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {jobs && jobs.length > 0 ? (
                    jobs.map((job) => (
                        <JobCard key={job.id} job={job} />
                    ))
                ) : (
                    <div className="col-span-full flex flex-col items-center justify-center py-16 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200 text-center">
                        <div className="bg-white p-4 rounded-full shadow-sm mb-4">
                            <svg className="h-8 w-8 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                            </svg>
                        </div>
                        <h3 className="text-lg font-medium text-gray-900">No jobs found</h3>
                        <p className="mt-1 text-gray-500 max-w-sm">
                            We couldn't find any jobs in this category.
                            {tab === 'discovered' && " Try updating your preferences or checking back later."}
                        </p>
                        {tab === 'discovered' && (
                            <Link href="/discover" className="mt-4 text-blue-600 hover:text-blue-800 font-medium">
                                Start discovering jobs &rarr;
                            </Link>
                        )}
                    </div>
                )}
            </div>
        </div>
    )
}
