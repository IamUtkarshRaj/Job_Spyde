import { createClient } from '@/utils/supabase/server'
import { CheckCircle, BarChart3, TrendingUp, Sparkles, Inbox } from 'lucide-react'

const AGENT_URL = process.env.AGENT_URL || 'http://127.0.0.1:8000'

async function getDigestSuggestion(stats: any) {
    try {
        const res = await fetch(`${AGENT_URL}/v1/agents/generate_digest`, {
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
        { label: 'New Jobs (24h)', value: stats.new_jobs_count, icon: Sparkles, color: 'text-[var(--color-accent-primary)]' },
        { label: 'Active Pipeline', value: stats.saved_jobs_count, icon: Inbox, color: 'text-[var(--color-soft-violet)]' },
        { label: 'Applied (This Week)', value: stats.applied_count, icon: TrendingUp, color: 'text-[var(--color-neon-teal)]' },
    ]

    return (
        <div className="space-y-8 max-w-5xl mx-auto relative z-10 w-full">
            <div className="flex flex-col gap-2">
                <h1 className="text-4xl font-bold tracking-tighter aurora-text py-1">Daily Digest</h1>
                <p className="text-slate-400 font-light">Your daily job search insights and AI-powered recommendations.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {statCards.map((stat) => {
                    const Icon = stat.icon
                    return (
                        <div key={stat.label} className="glass-panel ghost-border p-6 rounded-2xl flex flex-col justify-between group hover:-translate-y-1 transition-transform duration-300">
                            <div>
                                <div className="flex items-center gap-2 text-[10px] uppercase font-bold tracking-widest text-slate-500 mb-4">
                                    <Icon size={14} className={stat.color} />
                                    {stat.label}
                                </div>
                                <p className={`text-4xl font-bold ${stat.color}`}>{stat.value}</p>
                            </div>
                        </div>
                    )
                })}
            </div>

            <div className="glass-panel ghost-border rounded-3xl p-8 relative overflow-hidden">
                <div className="absolute -top-32 -left-32 w-96 h-96 bg-[var(--color-neon-teal)]/10 blur-3xl rounded-full pointer-events-none" />
                <div className="flex items-start gap-4 relative z-10">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-[var(--color-neon-teal)]/20 to-[var(--color-accent-primary)]/20 border border-[var(--color-neon-teal)]/30 flex items-center justify-center shrink-0 shadow-[0_0_20px_rgba(105,246,184,0.1)]">
                        <BarChart3 className="h-6 w-6 text-[var(--color-neon-teal)]" />
                    </div>
                    <div className="flex-1">
                        <h2 className="text-sm font-bold text-white mb-6 uppercase tracking-widest flex items-center gap-2">
                            Suggested Actions
                        </h2>
                        <ul className="space-y-4">
                            {agentResponse.suggested_actions && agentResponse.suggested_actions.length > 0 ? (
                                agentResponse.suggested_actions.map((action: string, i: number) => (
                                    <li key={i} className="flex items-start gap-4 text-white bg-white/[0.02] p-4 rounded-xl border border-white/5 hover:border-white/10 transition-colors">
                                        <CheckCircle className="mt-0.5 h-5 w-5 text-[var(--color-neon-teal)] shrink-0" />
                                        <span className="font-light text-sm leading-relaxed">{action}</span>
                                    </li>
                                ))
                            ) : (
                                <li className="text-slate-500 italic text-sm font-light">No specific actions for today. Keep checking for new jobs!</li>
                            )}
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    )
}
