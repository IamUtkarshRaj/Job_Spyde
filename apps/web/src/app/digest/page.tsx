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
    if (!user) return <div className="p-8 text-center text-gray-500">Please sign in to view your digest.</div>

    // Calculate stats
    // 1. New Jobs (discovered in last 24 hours)
    const yesterday = new Date()
    yesterday.setDate(yesterday.getDate() - 1)

    const { count: newJobsCount } = await supabase
        .from('jobs')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .eq('status', 'discovered')
        .gte('created_at', yesterday.toISOString())

    // 2. Saved Jobs (active pipeline)
    const { count: savedJobsCount } = await supabase
        .from('jobs')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .in('status', ['saved', 'prepared', 'interview', 'offer'])

    // 3. Applied this week
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

    return (
        <div className="space-y-8 max-w-5xl mx-auto">
            <div>
                <h1 className="text-3xl font-bold tracking-tight text-gray-900">Daily Digest</h1>
                <p className="text-gray-500 mt-1">Your daily job search insights and AI-powered recommendations.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="p-6 bg-white border border-gray-100 rounded-xl shadow-sm flex flex-col justify-between">
                    <div>
                        <div className="flex items-center gap-2 text-sm font-medium text-gray-500 mb-2">
                            <Sparkles size={16} className="text-yellow-500" />
                            New Jobs (24h)
                        </div>
                        <p className="text-4xl font-bold text-gray-900">{stats.new_jobs_count}</p>
                    </div>
                    <div className="mt-4 text-xs text-gray-400">Fresh opportunities found</div>
                </div>

                <div className="p-6 bg-white border border-gray-100 rounded-xl shadow-sm flex flex-col justify-between">
                    <div>
                        <div className="flex items-center gap-2 text-sm font-medium text-gray-500 mb-2">
                            <Inbox size={16} className="text-blue-500" />
                            Active Pipeline
                        </div>
                        <p className="text-4xl font-bold text-gray-900">{stats.saved_jobs_count}</p>
                    </div>
                    <div className="mt-4 text-xs text-gray-400">Jobs in progress</div>
                </div>

                <div className="p-6 bg-white border border-gray-100 rounded-xl shadow-sm flex flex-col justify-between">
                    <div>
                        <div className="flex items-center gap-2 text-sm font-medium text-gray-500 mb-2">
                            <TrendingUp size={16} className="text-green-500" />
                            Applied (This Week)
                        </div>
                        <p className="text-4xl font-bold text-gray-900">{stats.applied_count}</p>
                    </div>
                    <div className="mt-4 text-xs text-gray-400">Keep up the momentum!</div>
                </div>
            </div>

            <div className="bg-gradient-to-br from-indigo-50 to-blue-50 border border-indigo-100 rounded-xl p-8 shadow-sm">
                <div className="flex items-start gap-4">
                    <div className="bg-white p-2 rounded-lg shadow-sm">
                        <BarChart3 className="h-6 w-6 text-indigo-600" />
                    </div>
                    <div>
                        <h2 className="text-xl font-semibold text-gray-900 mb-4">Suggested Actions</h2>
                        <ul className="space-y-3">
                            {agentResponse.suggested_actions && agentResponse.suggested_actions.length > 0 ? (
                                agentResponse.suggested_actions.map((action: string, i: number) => (
                                    <li key={i} className="flex items-start gap-3 text-gray-700 bg-white/60 p-3 rounded-lg border border-indigo-100/50">
                                        <CheckCircle className="mt-0.5 h-5 w-5 text-indigo-600 shrink-0" />
                                        <span className="font-medium">{action}</span>
                                    </li>
                                ))
                            ) : (
                                <li className="text-gray-500 italic">No specific actions for today. Keep checking for new jobs!</li>
                            )}
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    )
}
