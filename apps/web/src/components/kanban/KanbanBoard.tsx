'use client'

import { useState, useCallback, useMemo } from 'react'
import {
  DndContext,
  DragOverlay,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragStartEvent,
  type DragEndEvent,
  type DragOverEvent,
} from '@dnd-kit/core'
import { sortableKeyboardCoordinates } from '@dnd-kit/sortable'
import { KanbanColumn, KANBAN_COLUMNS, type ColumnId } from './KanbanColumn'
import { KanbanJobCard } from './KanbanJobCard'
import type { Job } from '@/components/JobCard'

interface KanbanBoardProps {
  jobs: Job[]
  onStatusChange: (jobId: string, newStatus: Job['status']) => Promise<boolean>
  onJobsReorder: (updatedJobs: Job[]) => void
}

export function KanbanBoard({ jobs, onStatusChange, onJobsReorder }: KanbanBoardProps) {
  const [activeJob, setActiveJob] = useState<Job | null>(null)

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 5 },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  // Group jobs by status/column
  const columnJobs = useMemo(() => {
    const grouped: Record<ColumnId, Job[]> = {
      discovered: [],
      saved: [],
      applied: [],
      interview: [],
      offer: [],
      rejected: [],
    }

    jobs.forEach((job) => {
      const status = job.status as ColumnId
      // Map 'prepared' and 'ghosted' into their closest columns
      if (status === 'prepared' as any) {
        grouped.saved.push(job)
      } else if (status === 'ghosted' as any) {
        grouped.rejected.push(job)
      } else if (grouped[status]) {
        grouped[status].push(job)
      } else {
        grouped.discovered.push(job)
      }
    })

    return grouped
  }, [jobs])

  const findColumnForJob = useCallback(
    (jobId: string): ColumnId | null => {
      for (const [colId, colJobs] of Object.entries(columnJobs)) {
        if (colJobs.some((j) => j.id === jobId)) {
          return colId as ColumnId
        }
      }
      return null
    },
    [columnJobs]
  )

  const handleDragStart = useCallback(
    (event: DragStartEvent) => {
      const { active } = event
      const job = jobs.find((j) => j.id === active.id)
      if (job) setActiveJob(job)
    },
    [jobs]
  )

  const handleDragOver = useCallback((event: DragOverEvent) => {
    // We handle movement in dragEnd for simplicity
  }, [])

  const handleDragEnd = useCallback(
    async (event: DragEndEvent) => {
      const { active, over } = event
      setActiveJob(null)

      if (!over) return

      const activeId = active.id as string
      const overId = over.id as string

      // Determine the target column
      let targetColumn: ColumnId | null = null

      // Check if dropped directly on a column
      if (KANBAN_COLUMNS.some((c) => c.id === overId)) {
        targetColumn = overId as ColumnId
      } else {
        // Dropped on another card — find which column that card is in
        targetColumn = findColumnForJob(overId)
      }

      if (!targetColumn) return

      const sourceColumn = findColumnForJob(activeId)
      if (sourceColumn === targetColumn) return // No change

      // Optimistic update
      const updatedJobs = jobs.map((j) =>
        j.id === activeId ? { ...j, status: targetColumn as Job['status'] } : j
      )
      onJobsReorder(updatedJobs)

      // Persist to DB
      const success = await onStatusChange(activeId, targetColumn as Job['status'])
      if (!success) {
        // Revert on failure
        onJobsReorder(jobs)
      }
    },
    [jobs, onStatusChange, onJobsReorder, findColumnForJob]
  )

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
    >
      <div className="flex gap-4 overflow-x-auto pb-6 -mx-2 px-2 scrollbar-thin">
        {KANBAN_COLUMNS.map((column) => (
          <KanbanColumn
            key={column.id}
            column={column}
            jobs={columnJobs[column.id]}
          />
        ))}
      </div>

      <DragOverlay dropAnimation={{
        duration: 250,
        easing: 'cubic-bezier(0.16, 1, 0.3, 1)',
      }}>
        {activeJob ? <KanbanJobCard job={activeJob} overlay /> : null}
      </DragOverlay>
    </DndContext>
  )
}
