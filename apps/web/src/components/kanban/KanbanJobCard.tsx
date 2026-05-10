'use client'

import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { MapPin, Building2, ExternalLink, GripVertical, Zap } from 'lucide-react'
import { Badge } from '@/components/ui/Badge'
import type { Job } from '@/components/JobCard'

interface KanbanJobCardProps {
  job: Job
  overlay?: boolean
}

export function KanbanJobCard({ job, overlay = false }: KanbanJobCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: job.id, data: { type: 'job', job } })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
    zIndex: isDragging ? 50 : undefined,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`
        group relative rounded-xl p-4
        bg-[var(--color-bg-secondary)]/80 backdrop-blur-md
        border border-white/[0.06]
        hover:border-[var(--color-accent-primary)]/25
        transition-all duration-300 cursor-grab active:cursor-grabbing
        ${isDragging ? 'shadow-[0_20px_60px_rgba(133,173,255,0.15)] scale-[1.02] rotate-[1deg]' : 'hover:shadow-[0_8px_30px_rgba(0,0,0,0.3)]'}
        ${overlay ? 'shadow-[0_25px_60px_rgba(133,173,255,0.2)] rotate-[2deg] scale-105' : ''}
      `}
    >
      {/* Drag handle */}
      <div
        {...attributes}
        {...listeners}
        className="absolute top-2 right-2 p-1 text-slate-600 hover:text-slate-400 transition-colors opacity-0 group-hover:opacity-100"
      >
        <GripVertical size={14} />
      </div>

      {/* Hover glow overlay */}
      <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-[var(--color-accent-primary)]/0 to-[var(--color-neon-teal)]/[0.03] opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

      <div className="relative z-10">
        {/* Title */}
        <h4 className="text-sm font-semibold text-white leading-snug line-clamp-2 mb-2 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-white group-hover:to-[var(--color-neon-teal)] transition-all duration-300">
          {job.title}
        </h4>

        {/* Company */}
        <div className="flex items-center gap-1.5 text-xs text-slate-400 mb-2">
          <Building2 size={12} className="text-slate-500 shrink-0" />
          <span className="truncate">{job.company}</span>
        </div>

        {/* Location */}
        <div className="flex items-center gap-1.5 text-xs text-slate-500 mb-3">
          <MapPin size={12} className="shrink-0" />
          <span className="truncate">{job.location || 'Remote'}</span>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-2.5 border-t border-white/[0.04]">
          {job.match_score !== null && job.match_score !== undefined ? (
            <Badge variant="match" score={job.match_score}>
              <Zap size={10} /> {job.match_score}%
            </Badge>
          ) : (
            <span className="text-[10px] text-slate-600 font-medium uppercase tracking-wider">
              {job.source || 'Manual'}
            </span>
          )}

          {job.url && (
            <a
              href={job.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[10px] font-semibold text-slate-500 hover:text-[var(--color-neon-teal)] transition-colors flex items-center gap-1"
              onClick={(e) => e.stopPropagation()}
            >
              <ExternalLink size={10} />
            </a>
          )}
        </div>
      </div>
    </div>
  )
}
