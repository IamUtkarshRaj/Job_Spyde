'use client'

import { useState, useEffect, useMemo } from 'react'
import { createClient } from '@/utils/supabase/client'
import type { Job } from '@/components/JobCard'
import {
  BarChart3,
  TrendingUp,
  Target,
  Briefcase,
  Send,
  MessageSquare,
  Trophy,
  XCircle,
  Ghost,
  Loader2,
  ArrowUpRight,
  Zap,
} from 'lucide-react'

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: any }> = {
  discovered: { label: 'Discovered', color: '#717584', icon: Target },
  saved: { label: 'Saved', color: '#85adff', icon: Briefcase },
  prepared: { label: 'Prepared', color: '#f59e0b', icon: Zap },
  applied: { label: 'Applied', color: '#69f6b8', icon: Send },
  interview: { label: 'Interview', color: '#ac8aff', icon: MessageSquare },
  offer: { label: 'Offer', color: '#69f6b8', icon: Trophy },
  rejected: { label: 'Rejected', color: '#ff716c', icon: XCircle },
  ghosted: { label: 'Ghosted', color: '#4a4d5e', icon: Ghost },
}

export default function AnalyticsPage() {
  const [jobs, setJobs] = useState<Job[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchJobs = async () => {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data } = await supabase
        .from('jobs')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      setJobs(data || [])
      setLoading(false)
    }
    fetchJobs()
  }, [])

  const stats = useMemo(() => {
    const statusCounts: Record<string, number> = {}
    Object.keys(STATUS_CONFIG).forEach((s) => (statusCounts[s] = 0))
    jobs.forEach((j) => {
      statusCounts[j.status] = (statusCounts[j.status] || 0) + 1
    })

    const total = jobs.length
    const applied = (statusCounts.applied || 0) + (statusCounts.interview || 0) + (statusCounts.offer || 0)
    const responseRate = applied > 0
      ? Math.round(((statusCounts.interview || 0) + (statusCounts.offer || 0)) / applied * 100)
      : 0
    const avgScore = jobs.filter(j => j.match_score).length > 0
      ? Math.round(jobs.filter(j => j.match_score).reduce((sum, j) => sum + (j.match_score || 0), 0) / jobs.filter(j => j.match_score).length)
      : 0

    // Sources breakdown
    const sources: Record<string, number> = {}
    jobs.forEach((j) => {
      const src = j.source || 'manual'
      sources[src] = (sources[src] || 0) + 1
    })

    // Weekly activity (last 4 weeks)
    const weeklyData: { week: string; count: number }[] = []
    for (let i = 3; i >= 0; i--) {
      const start = new Date()
      start.setDate(start.getDate() - (i + 1) * 7)
      const end = new Date()
      end.setDate(end.getDate() - i * 7)
      const count = jobs.filter((j) => {
        const d = new Date(j.created_at)
        return d >= start && d < end
      }).length
      weeklyData.push({
        week: `W${4 - i}`,
        count,
      })
    }

    return { statusCounts, total, applied, responseRate, avgScore, sources, weeklyData }
  }, [jobs])

  const maxBarValue = Math.max(...Object.values(stats.statusCounts), 1)
  const maxWeeklyValue = Math.max(...stats.weeklyData.map((w) => w.count), 1)

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-32 glass-panel relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full animate-[shimmer_2s_infinite]" />
        <Loader2 className="w-10 h-10 text-[var(--color-neon-teal)] animate-spin relative z-10 mb-4" />
        <p className="text-slate-400 animate-pulse relative z-10 font-medium text-sm">Loading analytics...</p>
      </div>
    )
  }

  return (
    <div className="space-y-8 relative z-10 w-full mb-12">
      {/* Header */}
      <section>
        <div className="flex items-center gap-3 mb-2">
          <BarChart3 size={28} className="text-[var(--color-soft-violet)]" />
          <h1 className="text-4xl md:text-5xl font-bold tracking-tighter aurora-text">
            Analytics
          </h1>
        </div>
        <p className="text-slate-400 text-sm font-light max-w-lg">
          Visual intelligence on your job search performance and application funnel.
        </p>
      </section>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
        {[
          { label: 'Total Tracked', value: stats.total, icon: Target, color: 'var(--color-accent-primary)', delta: '+' + stats.weeklyData[3]?.count + ' this week' },
          { label: 'Applications', value: stats.applied, icon: Send, color: 'var(--color-success)', delta: null },
          { label: 'Response Rate', value: stats.responseRate + '%', icon: TrendingUp, color: 'var(--color-soft-violet)', delta: null },
          { label: 'Avg Match', value: stats.avgScore + '%', icon: Zap, color: 'var(--color-neon-teal)', delta: null },
        ].map((kpi) => {
          const Icon = kpi.icon
          return (
            <div key={kpi.label} className="glass-panel ghost-border p-5 rounded-2xl flex flex-col gap-3 group hover:-translate-y-1">
              <div className="flex justify-between items-start">
                <div
                  className="w-9 h-9 rounded-lg flex items-center justify-center"
                  style={{
                    backgroundColor: `color-mix(in srgb, ${kpi.color} 12%, transparent)`,
                  }}
                >
                  <Icon size={18} style={{ color: kpi.color }} />
                </div>
                <ArrowUpRight size={14} className="text-slate-600 group-hover:text-slate-400 transition-colors" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-white">{kpi.value}</h3>
                <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-widest mt-1">{kpi.label}</p>
              </div>
              {kpi.delta && (
                <p className="text-[10px] text-[var(--color-neon-teal)] font-semibold">{kpi.delta}</p>
              )}
            </div>
          )
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Status Distribution — Custom bar chart */}
        <div className="glass-panel ghost-border p-6 rounded-2xl">
          <h3 className="text-sm font-bold text-white mb-1">Application Funnel</h3>
          <p className="text-xs text-slate-500 mb-6">Job distribution by pipeline stage</p>

          <div className="space-y-3">
            {Object.entries(STATUS_CONFIG).map(([key, cfg]) => {
              const count = stats.statusCounts[key] || 0
              const percentage = maxBarValue > 0 ? (count / maxBarValue) * 100 : 0
              const Icon = cfg.icon

              return (
                <div key={key} className="group flex items-center gap-3">
                  <div className="w-20 flex items-center gap-2 shrink-0">
                    <Icon size={13} style={{ color: cfg.color }} />
                    <span className="text-xs text-slate-400 font-medium truncate">{cfg.label}</span>
                  </div>
                  <div className="flex-1 h-7 bg-white/[0.03] rounded-lg overflow-hidden relative">
                    <div
                      className="h-full rounded-lg transition-all duration-700 ease-out relative overflow-hidden"
                      style={{
                        width: `${Math.max(percentage, 2)}%`,
                        backgroundColor: `color-mix(in srgb, ${cfg.color} 25%, transparent)`,
                      }}
                    >
                      <div
                        className="absolute inset-0 opacity-60"
                        style={{
                          background: `linear-gradient(90deg, ${cfg.color}40, ${cfg.color}15)`,
                        }}
                      />
                    </div>
                  </div>
                  <span
                    className="text-xs font-bold w-8 text-right tabular-nums"
                    style={{ color: cfg.color }}
                  >
                    {count}
                  </span>
                </div>
              )
            })}
          </div>
        </div>

        {/* Weekly Activity */}
        <div className="glass-panel ghost-border p-6 rounded-2xl">
          <h3 className="text-sm font-bold text-white mb-1">Weekly Activity</h3>
          <p className="text-xs text-slate-500 mb-6">Jobs added over the last 4 weeks</p>

          <div className="flex items-end gap-3 h-40">
            {stats.weeklyData.map((week, i) => {
              const height = maxWeeklyValue > 0 ? (week.count / maxWeeklyValue) * 100 : 0
              return (
                <div key={i} className="flex-1 flex flex-col items-center gap-2">
                  <span className="text-xs font-bold text-white tabular-nums">{week.count}</span>
                  <div className="w-full relative rounded-t-lg overflow-hidden" style={{ height: `${Math.max(height, 8)}%` }}>
                    <div
                      className="absolute inset-0 rounded-t-lg"
                      style={{
                        background: `linear-gradient(to top, var(--color-accent-primary), var(--color-neon-teal))`,
                        opacity: 0.3 + (i * 0.2),
                      }}
                    />
                  </div>
                  <span className="text-[10px] text-slate-500 font-semibold">{week.week}</span>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Source Breakdown */}
      <div className="glass-panel ghost-border p-6 rounded-2xl">
        <h3 className="text-sm font-bold text-white mb-1">Source Intelligence</h3>
        <p className="text-xs text-slate-500 mb-6">Where your opportunities come from</p>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          {Object.entries(stats.sources).map(([source, count]) => (
            <div
              key={source}
              className="flex flex-col items-center justify-center p-4 rounded-xl bg-white/[0.02] border border-white/[0.04] hover:border-[var(--color-accent-primary)]/20 transition-all duration-300 group"
            >
              <span className="text-xl font-bold text-white group-hover:aurora-text transition-all">{count}</span>
              <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mt-1.5">
                {source}
              </span>
            </div>
          ))}

          {Object.keys(stats.sources).length === 0 && (
            <div className="col-span-full text-center py-8 text-slate-500 text-sm">
              No source data yet. Run the AI Scout to start discovering jobs.
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
