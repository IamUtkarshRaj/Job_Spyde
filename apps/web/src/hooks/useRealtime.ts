'use client'

import { useEffect } from 'react'
import { createClient } from '@/utils/supabase/client'
import type { Job } from '@/components/JobCard'

/**
 * Subscribes to realtime Supabase changes on the `jobs` table
 * and calls the provided callback whenever an INSERT, UPDATE, or DELETE occurs.
 */
export function useRealtime(
  userId: string | undefined,
  onJobChange: (payload: {
    eventType: 'INSERT' | 'UPDATE' | 'DELETE'
    new: Job | null
    old: Partial<Job> | null
  }) => void
) {
  useEffect(() => {
    if (!userId) return

    const supabase = createClient()

    const channel = supabase
      .channel('jobs-realtime')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'jobs',
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          onJobChange({
            eventType: payload.eventType as 'INSERT' | 'UPDATE' | 'DELETE',
            new: (payload.new as Job) || null,
            old: (payload.old as Partial<Job>) || null,
          })
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [userId, onJobChange])
}
