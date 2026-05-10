'use client'

import { useDroppable } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { KanbanJobCard } from './KanbanJobCard'
import type { Job } from '@/components/JobCard'

export type ColumnId = 'discovered' | 'saved' | 'applied' | 'interview' | 'offer' | 'rejected'

interface ColumnConfig {
  id: ColumnId
  label: string
  color: string
  glowColor: string
  icon: string
}

export const KANBAN_COLUMNS: ColumnConfig[] = [
  { id: 'discovered', label: 'Discovered', color: 'var(--color-text-muted)', glowColor: 'rgba(113,117,132,0.3)', icon: '🔍' },
  { id: 'saved', label: 'Saved', color: 'var(--color-accent-primary)', glowColor: 'rgba(133,173,255,0.3)', icon: '📌' },
  { id: 'applied', label: 'Applied', color: 'var(--color-success)', glowColor: 'rgba(105,246,184,0.3)', icon: '📤' },
  { id: 'interview', label: 'Interview', color: 'var(--color-soft-violet)', glowColor: 'rgba(172,138,255,0.3)', icon: '🎯' },
  { id: 'offer', label: 'Offer', color: 'var(--color-neon-teal)', glowColor: 'rgba(105,246,184,0.4)', icon: '🎉' },
  { id: 'rejected', label: 'Rejected', color: 'var(--color-error)', glowColor: 'rgba(255,113,108,0.3)', icon: '✕' },
]

interface KanbanColumnProps {
  column: ColumnConfig
  jobs: Job[]
}

export function KanbanColumn({ column, jobs }: KanbanColumnProps) {
  const { setNodeRef, isOver } = useDroppable({
    id: column.id,
  })

  return (
    <div
      ref={setNodeRef}
      className={`
        flex flex-col min-w-[280px] w-[280px] shrink-0
        rounded-2xl
        bg-[var(--color-bg-primary)]/60 backdrop-blur-sm
        border transition-all duration-300
        ${isOver
          ? 'border-[color:var(--col-color)]/40 shadow-[0_0_30px_var(--col-glow)]'
          : 'border-white/[0.04] hover:border-white/[0.08]'
        }
      `}
      style={{
        '--col-color': column.color,
        '--col-glow': column.glowColor,
      } as React.CSSProperties}
    >
      {/* Column Header */}
      <div className="px-4 py-3.5 border-b border-white/[0.04] flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <span className="text-base">{column.icon}</span>
          <h3
            className="text-xs font-bold uppercase tracking-[0.12em]"
            style={{ color: column.color }}
          >
            {column.label}
          </h3>
        </div>
        <span
          className="text-[10px] font-bold px-2 py-0.5 rounded-full border"
          style={{
            color: column.color,
            backgroundColor: `color-mix(in srgb, ${column.color} 10%, transparent)`,
            borderColor: `color-mix(in srgb, ${column.color} 20%, transparent)`,
          }}
        >
          {jobs.length}
        </span>
      </div>

      {/* Cards Container */}
      <SortableContext items={jobs.map(j => j.id)} strategy={verticalListSortingStrategy}>
        <div className="flex-1 p-2.5 space-y-2.5 overflow-y-auto max-h-[calc(100vh-280px)] min-h-[120px]">
          {jobs.length > 0 ? (
            jobs.map((job) => (
              <KanbanJobCard key={job.id} job={job} />
            ))
          ) : (
            <div className={`
              flex items-center justify-center h-24
              rounded-xl border border-dashed
              text-xs text-slate-600 font-medium
              transition-all duration-300
              ${isOver ? 'border-[color:var(--col-color)]/30 bg-white/[0.02]' : 'border-white/[0.04]'}
            `}>
              Drop here
            </div>
          )}
        </div>
      </SortableContext>
    </div>
  )
}
