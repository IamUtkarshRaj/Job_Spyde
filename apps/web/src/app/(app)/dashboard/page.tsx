import { createClient } from '@/utils/supabase/server'
import { JobCard } from '@/components/JobCard'
import Link from 'next/link'
import { PlusCircle, Briefcase, Bookmark, Send, Zap, Radar } from 'lucide-react'

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

    // Fetch data and counts in parallel
    const [
        { data: jobs },
        { count: discoveredCount },
        { count: savedCount },
        { count: appliedCount }
    ] = await Promise.all([
        query,
        supabase.from('jobs').select('*', { count: 'exact', head: true }).eq('user_id', user!.id).eq('status', 'discovered'),
        supabase.from('jobs').select('*', { count: 'exact', head: true }).eq('user_id', user!.id).in('status', ['saved', 'prepared']),
        supabase.from('jobs').select('*', { count: 'exact', head: true }).eq('user_id', user!.id).in('status', ['applied', 'interview', 'offer'])
    ])

    const tabs = [
        { id: 'discovered', label: 'Discovered Tasks' },
        { id: 'saved', label: 'Active Pipeline' },
        { id: 'applied', label: 'Application History' },
    ]

    const summaryStats = [
        { label: 'Active Discoveries', value: discoveredCount || 0, icon: Briefcase, color: 'text-[var(--color-accent-primary)]' },
        { label: 'Saved Pipeline', value: savedCount || 0, icon: Bookmark, color: 'text-[var(--color-neon-teal)]' },
        { label: 'Total Applications', value: appliedCount || 0, icon: Send, color: 'text-[var(--color-success)]' },
        { label: 'Next Inference', value: 'Review', icon: Zap, color: 'text-[var(--color-soft-violet)]', isText: true },
    ]

    return (
        <div className="space-y-8 relative z-10 w-full mb-12">
            {/* Hero Header — Stitch */}
            <section className="mb-8">
                <h2 className="text-5xl md:text-6xl font-bold tracking-tighter aurora-text max-w-4xl leading-[1.1] mb-4">
                    Your Intelligent Career Command Center
                </h2>
                <p className="text-slate-400 text-lg max-w-xl">
                    Real-time monitoring of your application ecosystem. Powered by JobSpyde&apos;s neural matching engine.
                </p>
            </section>

            {/* Action Bar */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="flex items-center gap-4">
                    <div className="hidden sm:flex items-center gap-2">
                        <span className="text-xs font-mono text-slate-500">Sync Status:</span>
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-widest bg-[var(--color-neon-teal)]/10 text-[var(--color-neon-teal)] border border-[var(--color-neon-teal)]/20 shadow-[0_0_10px_rgba(105,246,184,0.2)]">Live</span>
                    </div>
                </div>
                <Link
                    href="/discover"
                    className="w-full sm:w-auto magnetic-btn inline-flex items-center justify-center gap-2 rounded-xl text-sm font-bold transition-all duration-300 bg-[var(--color-neon-teal)] text-slate-950 hover:shadow-[0_0_20px_rgba(105,246,184,0.4)] h-11 px-6 hover:scale-105"
                >
                    <PlusCircle size={18} />
                    Trigger Discovery
                </Link>
            </div>

            {/* KPI Dashboard — Stitch Glass Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                {summaryStats.map((stat) => {
                    const Icon = stat.icon
                    return (
                        <div key={stat.label} className="glass-panel ghost-border p-6 rounded-2xl flex flex-col gap-4">
                            <div className="flex justify-between items-start">
                                <Icon size={20} className={stat.color} />
                                <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-widest">{stat.label}</span>
                            </div>
                            <div>
                                <h3 className={`text-3xl font-bold text-white`}>
                                    {stat.isText ? stat.value : stat.value}
                                </h3>
                            </div>
                            <div className="flex gap-1 mt-1">
                                <div className={`h-1 flex-1 rounded-full`} style={{ backgroundColor: `var(--color-accent-primary)` }}></div>
                                <div className="h-1 flex-1 rounded-full" style={{ backgroundColor: `rgba(133,173,255,0.4)` }}></div>
                                <div className="h-1 flex-1 bg-slate-800 rounded-full"></div>
                            </div>
                        </div>
                    )
                })}
            </div>

            {/* Smart Tabs */}
            <div className="border-b border-white/10 mt-10">
                <nav className="-mb-px flex space-x-6 md:space-x-8 overflow-x-auto no-scrollbar" aria-label="Tabs">
                    {tabs.map((t) => (
                        <Link
                            key={t.id}
                            href={`/dashboard?tab=${t.id}`}
                            className={`
                                whitespace-nowrap py-4 px-1 border-b-2 font-semibold text-sm transition-all duration-300
                                ${tab === t.id
                                    ? 'border-[var(--color-neon-teal)] text-white shadow-[0_10px_20px_-10px_rgba(105,246,184,0.3)]'
                                    : 'border-transparent text-slate-400 hover:text-white hover:border-white/10'
                                }
                            `}
                        >
                            {t.label}
                        </Link>
                    ))}
                </nav>
            </div>

            {/* Job Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 pt-4">
                {jobs && jobs.length > 0 ? (
                    jobs.map((job) => (
                        <JobCard key={job.id} job={job} />
                    ))
                ) : (
                    <div className="col-span-full flex flex-col items-center justify-center py-24 glass-panel text-center border-dashed border-white/10 bg-white/[0.01]">
                        <div className="w-16 h-16 rounded-2xl bg-[var(--color-bg-primary)] border border-white/10 flex items-center justify-center mb-6 shadow-inner">
                            <Radar size={28} className="text-slate-500" />
                        </div>
                        <h3 className="text-xl font-bold text-white mb-2">No active signals</h3>
                        <p className="text-slate-400 max-w-sm text-sm font-medium leading-relaxed">
                            We couldn&apos;t find any roles in this pipeline segment.
                            {tab === 'discovered' && " Try tuning your agent preferences to discover new targets."}
                        </p>
                        {tab === 'discovered' && (
                            <Link href="/discover" className="mt-8 text-[var(--color-neon-teal)] hover:text-white font-bold text-sm transition-colors border-b border-transparent hover:border-[var(--color-neon-teal)] pb-0.5 inline-flex items-center gap-2">
                                Launch Agent Scanner <Zap size={14}/>
                            </Link>
                        )}
                    </div>
                )}
            </div>
        </div>
    )
}
