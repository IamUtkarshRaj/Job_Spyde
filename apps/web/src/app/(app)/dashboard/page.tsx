import { createClient } from '@/utils/supabase/server'
import { JobCard } from '@/components/JobCard'
import Link from 'next/link'
import { PlusCircle, Briefcase, Bookmark, Send, Zap } from 'lucide-react'

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

    // Fetch counts for summary strip
    const { count: discoveredCount } = await supabase
        .from('jobs').select('*', { count: 'exact', head: true })
        .eq('user_id', user!.id).eq('status', 'discovered')

    const { count: savedCount } = await supabase
        .from('jobs').select('*', { count: 'exact', head: true })
        .eq('user_id', user!.id).in('status', ['saved', 'prepared'])

    const { count: appliedCount } = await supabase
        .from('jobs').select('*', { count: 'exact', head: true })
        .eq('user_id', user!.id).in('status', ['applied', 'interview', 'offer'])

    const tabs = [
        { id: 'discovered', label: 'Discovered' },
        { id: 'saved', label: 'Saved & In Progress' },
        { id: 'applied', label: 'Applied & History' },
    ]

    const summaryStats = [
        { label: 'Jobs Found Today', value: discoveredCount || 0, icon: Briefcase, color: 'text-indigo-300' },
        { label: 'Saved', value: savedCount || 0, icon: Bookmark, color: 'text-blue-300' },
        { label: 'Applied', value: appliedCount || 0, icon: Send, color: 'text-green-300' },
        { label: 'Next Action', value: 'Review', icon: Zap, color: 'text-amber-300', isText: true },
    ]

    return (
        <div className="space-y-8">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight text-slate-100">Dashboard</h2>
                    <p className="text-slate-500 mt-1">Track and manage your job search pipeline.</p>
                </div>
                <Link
                    href="/discover"
                    className="inline-flex items-center justify-center gap-2 rounded-xl text-sm font-semibold transition-all duration-200 gradient-bg text-white hover:brightness-110 h-10 px-5 py-2 shadow-lg shadow-indigo-500/20 hover:shadow-indigo-500/30"
                >
                    <PlusCircle size={16} />
                    Discover Jobs
                </Link>
            </div>

            {/* Today Summary Strip */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {summaryStats.map((stat) => {
                    const Icon = stat.icon
                    return (
                        <div key={stat.label} className="glass-card p-4 flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-slate-800/80 flex items-center justify-center shrink-0">
                                <Icon size={18} className={stat.color} />
                            </div>
                            <div className="min-w-0">
                                <div className="text-xs text-slate-500 truncate">{stat.label}</div>
                                <div className={`text-xl font-bold ${stat.color}`}>
                                    {stat.isText ? stat.value : stat.value}
                                </div>
                            </div>
                        </div>
                    )
                })}
            </div>

            {/* Tabs */}
            <div className="border-b border-slate-800/50">
                <nav className="-mb-px flex space-x-6" aria-label="Tabs">
                    {tabs.map((t) => (
                        <Link
                            key={t.id}
                            href={`/dashboard?tab=${t.id}`}
                            className={`
                                whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm transition-all duration-200
                                ${tab === t.id
                                    ? 'border-indigo-400 text-indigo-300'
                                    : 'border-transparent text-slate-500 hover:text-slate-300 hover:border-slate-600'
                                }
                            `}
                        >
                            {t.label}
                        </Link>
                    ))}
                </nav>
            </div>

            {/* Job Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {jobs && jobs.length > 0 ? (
                    jobs.map((job) => (
                        <JobCard key={job.id} job={job} />
                    ))
                ) : (
                    <div className="col-span-full flex flex-col items-center justify-center py-16 glass-card text-center">
                        <div className="w-14 h-14 rounded-2xl bg-slate-800/80 flex items-center justify-center mb-4">
                            <Briefcase size={24} className="text-slate-500" />
                        </div>
                        <h3 className="text-lg font-medium text-slate-300">No jobs found</h3>
                        <p className="mt-1 text-slate-500 max-w-sm text-sm">
                            We couldn&apos;t find any jobs in this category.
                            {tab === 'discovered' && " Try updating your preferences or checking back later."}
                        </p>
                        {tab === 'discovered' && (
                            <Link href="/discover" className="mt-4 text-indigo-400 hover:text-indigo-300 font-medium text-sm transition-colors">
                                Start discovering jobs &rarr;
                            </Link>
                        )}
                    </div>
                )}
            </div>
        </div>
    )
}
