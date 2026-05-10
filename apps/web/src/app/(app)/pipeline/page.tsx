'use client'

import { useState, useCallback, useEffect } from 'react'
import { KanbanBoard } from '@/components/kanban/KanbanBoard'
import { useJobs } from '@/hooks/useJobs'
import { useRealtime } from '@/hooks/useRealtime'
import { useAgentStatus } from '@/hooks/useAgentStatus'
import { triggerAgentRun } from '@/lib/api/agent'
import { createClient } from '@/utils/supabase/client'
import type { Job } from '@/components/JobCard'
import {
  Loader2,
  Radar,
  Sparkles,
  Kanban,
  LayoutGrid,
  Zap,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react'

export default function PipelinePage() {
  const { jobs, loading, error, refetch, updateJobStatus, setJobs } = useJobs('all')
  const [userId, setUserId] = useState<string | undefined>()
  const [runId, setRunId] = useState<string | null>(null)
  const [scouting, setScouting] = useState(false)
  const [scoutError, setScoutError] = useState<string | null>(null)
  const { status: agentStatus, polling } = useAgentStatus(runId)

  // Get user on mount
  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) setUserId(user.id)
    })
  }, [])

  // Realtime subscription
  const handleRealtimeChange = useCallback(
    (payload: { eventType: 'INSERT' | 'UPDATE' | 'DELETE'; new: Job | null; old: Partial<Job> | null }) => {
      if (payload.eventType === 'INSERT' && payload.new) {
        setJobs((prev) => [payload.new!, ...prev.filter(j => j.id !== payload.new!.id)])
      } else if (payload.eventType === 'UPDATE' && payload.new) {
        setJobs((prev) => prev.map(j => j.id === payload.new!.id ? payload.new! : j))
      } else if (payload.eventType === 'DELETE' && payload.old?.id) {
        setJobs((prev) => prev.filter(j => j.id !== payload.old!.id))
      }
    },
    [setJobs]
  )

  useRealtime(userId, handleRealtimeChange)

  // When agent run completes, refetch jobs
  useEffect(() => {
    if (agentStatus?.status === 'completed') {
      refetch()
      setScouting(false)
    } else if (agentStatus?.status === 'failed') {
      setScoutError(agentStatus.error || 'Agent run failed')
      setScouting(false)
    }
  }, [agentStatus, refetch])

  const handleRunScout = async () => {
    setScouting(true)
    setScoutError(null)
    try {
      const result = await triggerAgentRun({
        query: 'software engineer',
        location: 'remote',
      })
      setRunId(result.run_id)
    } catch (err: any) {
      setScoutError(err.message)
      setScouting(false)
    }
  }

  const handleStatusChange = async (jobId: string, newStatus: Job['status']) => {
    return updateJobStatus(jobId, newStatus)
  }

  const handleJobsReorder = (updatedJobs: Job[]) => {
    setJobs(updatedJobs)
  }

  // Stats
  const totalJobs = jobs.length
  const appliedCount = jobs.filter(j => ['applied', 'interview', 'offer'].includes(j.status)).length
  const interviewCount = jobs.filter(j => j.status === 'interview').length
  const offerCount = jobs.filter(j => j.status === 'offer').length

  return (
    <div className="space-y-8 relative z-10 w-full mb-12">
      {/* Hero Section */}
      <section>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <Kanban size={28} className="text-[var(--color-neon-teal)]" />
              <h1 className="text-4xl md:text-5xl font-bold tracking-tighter aurora-text">
                Job Pipeline
              </h1>
            </div>
            <p className="text-slate-400 text-sm font-light max-w-lg">
              Drag and drop jobs between stages to track your application journey. Changes sync in real-time.
            </p>
          </div>

          <button
            onClick={handleRunScout}
            disabled={scouting || polling}
            className="magnetic-btn inline-flex items-center justify-center gap-2 rounded-xl text-sm font-bold transition-all duration-300 bg-[var(--color-neon-teal)] text-slate-950 hover:shadow-[0_0_20px_rgba(105,246,184,0.4)] h-11 px-6 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed shrink-0"
          >
            {scouting || polling ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                AI Scouting...
              </>
            ) : (
              <>
                <Sparkles size={16} />
                Run AI Scout
              </>
            )}
          </button>
        </div>
      </section>

      {/* Agent Status Indicator */}
      {(scouting || polling) && (
        <div className="flex items-center gap-3 px-5 py-3 rounded-xl bg-[var(--color-accent-primary)]/5 border border-[var(--color-accent-primary)]/15 backdrop-blur-md">
          <div className="relative">
            <Radar size={18} className="text-[var(--color-accent-primary)] animate-pulse" />
            <div className="absolute inset-0 animate-ping">
              <Radar size={18} className="text-[var(--color-accent-primary)] opacity-30" />
            </div>
          </div>
          <div>
            <p className="text-sm font-semibold text-white">AI Scout Active</p>
            <p className="text-xs text-slate-400">
              {agentStatus?.status === 'running'
                ? 'Processing discovered jobs...'
                : 'Initializing intelligence pipeline...'}
            </p>
          </div>
        </div>
      )}

      {agentStatus?.status === 'completed' && (
        <div className="flex items-center gap-3 px-5 py-3 rounded-xl bg-[var(--color-success)]/5 border border-[var(--color-success)]/15">
          <CheckCircle2 size={18} className="text-[var(--color-success)]" />
          <p className="text-sm font-medium text-[var(--color-success)]">
            Scout complete — {agentStatus.result?.jobs?.length || 0} jobs processed
          </p>
        </div>
      )}

      {scoutError && (
        <div className="flex items-center gap-3 px-5 py-3 rounded-xl bg-[var(--color-error)]/5 border border-[var(--color-error)]/15">
          <AlertCircle size={18} className="text-[var(--color-error)]" />
          <p className="text-sm font-medium text-[var(--color-error)]">{scoutError}</p>
        </div>
      )}

      {/* Quick Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Total Jobs', value: totalJobs, color: 'var(--color-accent-primary)' },
          { label: 'Applied', value: appliedCount, color: 'var(--color-success)' },
          { label: 'Interviews', value: interviewCount, color: 'var(--color-soft-violet)' },
          { label: 'Offers', value: offerCount, color: 'var(--color-neon-teal)' },
        ].map((stat) => (
          <div
            key={stat.label}
            className="glass-panel ghost-border p-4 rounded-xl flex items-center gap-4"
          >
            <div
              className="w-10 h-10 rounded-lg flex items-center justify-center text-lg font-bold"
              style={{
                backgroundColor: `color-mix(in srgb, ${stat.color} 10%, transparent)`,
                color: stat.color,
              }}
            >
              {stat.value}
            </div>
            <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider">
              {stat.label}
            </span>
          </div>
        ))}
      </div>

      {/* Kanban Board */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-24 glass-panel relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full animate-[shimmer_2s_infinite]" />
          <Loader2 className="w-10 h-10 text-[var(--color-neon-teal)] animate-spin relative z-10 mb-4" />
          <p className="text-slate-400 animate-pulse relative z-10 font-medium text-sm">Loading pipeline...</p>
        </div>
      ) : error ? (
        <div className="bg-[var(--color-error)]/10 border border-[var(--color-error)]/20 p-6 rounded-2xl text-[var(--color-error)] text-sm font-medium">
          {error}
        </div>
      ) : (
        <KanbanBoard
          jobs={jobs}
          onStatusChange={handleStatusChange}
          onJobsReorder={handleJobsReorder}
        />
      )}
    </div>
  )
}
