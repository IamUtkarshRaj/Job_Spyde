import { createClient } from '@/utils/supabase/server'
import { CheckCircle, BarChart3, TrendingUp, Sparkles, Inbox } from 'lucide-react'

const AGENT_URL = process.env.AGENT_URL || 'http://localhost:8000'

async function getDigestSuggestion(stats: any) {
    try {
        const res = await fetch(`${AGENT_URL}/v1/generate_digest`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                user_id: stats.user_id,
                new_jobs_count: stats.new_jobs_count,
                saved_jobs_count: stats.saved_jobs_count,
                applied_count: stats.applied_count
            }),
            cache: 'no-store'
        })

        if (!res.ok) return { suggested_actions: ["Review your dashboard for updates."] }
        return await res.json()
    } catch (e) {
        return { suggested_actions: ["Could not connect to AI service. Check your connection."] }
    }
}

export default async function DigestPage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return <div className="p-8 text-center text-slate-500">Please sign in to view your digest.</div>

    // Calculate stats
    const yesterday = new Date()
    yesterday.setDate(yesterday.getDate() - 1)

    const { count: newJobsCount } = await supabase
        .from('jobs')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .eq('status', 'discovered')
        .gte('created_at', yesterday.toISOString())

    const { count: savedJobsCount } = await supabase
        .from('jobs')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .in('status', ['saved', 'prepared', 'interview', 'offer'])

    const lastWeek = new Date()
    lastWeek.setDate(lastWeek.getDate() - 7)
    const { count: appliedCount } = await supabase
        .from('status_events')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .eq('to_status', 'applied')
        .gte('created_at', lastWeek.toISOString())

    const stats = {
        user_id: user.id,
        new_jobs_count: newJobsCount || 0,
        saved_jobs_count: savedJobsCount || 0,
        applied_count: appliedCount || 0
    }

    const agentResponse = await getDigestSuggestion(stats)

    const statCards = [
        { label: 'New Jobs (24h)', value: stats.new_jobs_count, icon: Sparkles, color: 'text-amber-300', caption: 'Fresh opportunities found' },
        { label: 'Active Pipeline', value: stats.saved_jobs_count, icon: Inbox, color: 'text-blue-300', caption: 'Jobs in progress' },
        { label: 'Applied (This Week)', value: stats.applied_count, icon: TrendingUp, color: 'text-green-300', caption: 'Keep up the momentum!' },
    ]

    return (
        <div className="space-y-8 max-w-5xl mx-auto">
            <div>
                <h1 className="text-3xl font-bold tracking-tight text-slate-100">Daily Digest</h1>
                <p className="text-slate-500 mt-1">Your daily job search insights and AI-powered recommendations.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {statCards.map((stat) => {
                    const Icon = stat.icon
                    return (
                        <div key={stat.label} className="glass-card p-6 flex flex-col justify-between">
                            <div>
                                <div className="flex items-center gap-2 text-sm font-medium text-slate-500 mb-2">
                                    <Icon size={16} className={stat.color} />
                                    {stat.label}
                                </div>
                                <p className={`text-4xl font-bold ${stat.color}`}>{stat.value}</p>
                            </div>
                            <div className="mt-4 text-xs text-slate-600">{stat.caption}</div>
                        </div>
                    )
                })}
            </div>

            <div className="glass-card p-8 glow-indigo bg-gradient-to-br from-indigo-500/5 to-blue-500/5">
                <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-xl gradient-bg flex items-center justify-center shrink-0 shadow-lg shadow-indigo-500/20">
                        <BarChart3 className="h-5 w-5 text-white" />
                    </div>
                    <div className="flex-1">
                        <h2 className="text-xl font-semibold text-slate-200 mb-4">Suggested Actions</h2>
                        <ul className="space-y-3">
                            {agentResponse.suggested_actions && agentResponse.suggested_actions.length > 0 ? (
                                agentResponse.suggested_actions.map((action: string, i: number) => (
                                    <li key={i} className="flex items-start gap-3 text-slate-300 bg-slate-800/30 p-3 rounded-xl border border-slate-700/20">
                                        <CheckCircle className="mt-0.5 h-5 w-5 text-indigo-400 shrink-0" />
                                        <span className="font-medium text-sm">{action}</span>
                                    </li>
                                ))
                            ) : (
                                <li className="text-slate-500 italic text-sm">No specific actions for today. Keep checking for new jobs!</li>
                            )}
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    )
}
