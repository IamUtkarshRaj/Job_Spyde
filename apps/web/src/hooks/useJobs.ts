'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/utils/supabase/client'
import type { Job } from '@/components/JobCard'

type StatusFilter = 'all' | 'discovered' | 'saved' | 'prepared' | 'applied' | 'interview' | 'offer' | 'rejected' | 'ghosted'

export function useJobs(statusFilter: StatusFilter = 'all') {
  const [jobs, setJobs] = useState<Job[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchJobs = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        setError('Not authenticated')
        return
      }

      let query = supabase
        .from('jobs')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (statusFilter !== 'all') {
        query = query.eq('status', statusFilter)
      }

      const { data, error: dbError } = await query

      if (dbError) {
        setError(dbError.message)
        return
      }

      setJobs(data || [])
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [statusFilter])

  useEffect(() => {
    fetchJobs()
  }, [fetchJobs])

  const updateJobStatus = async (jobId: string, newStatus: Job['status']) => {
    const supabase = createClient()
    const { error: updateError } = await supabase
      .from('jobs')
      .update({ status: newStatus })
      .eq('id', jobId)

    if (updateError) {
      console.error('Failed to update job status:', updateError)
      return false
    }

    // Optimistic update
    setJobs(prev =>
      prev.map(j => j.id === jobId ? { ...j, status: newStatus } : j)
    )
    return true
  }

  return { jobs, loading, error, refetch: fetchJobs, updateJobStatus, setJobs }
}
