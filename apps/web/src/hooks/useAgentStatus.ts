'use client'

import { useState, useEffect, useRef } from 'react'
import { getAgentStatus, type AgentStatusResponse } from '@/lib/api/agent'

/**
 * Polls the agent status endpoint every `intervalMs` milliseconds
 * until the status is 'completed' or 'failed'.
 */
export function useAgentStatus(runId: string | null, intervalMs = 2000) {
  const [status, setStatus] = useState<AgentStatusResponse | null>(null)
  const [polling, setPolling] = useState(false)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    if (!runId) {
      setStatus(null)
      setPolling(false)
      return
    }

    setPolling(true)

    const poll = async () => {
      try {
        const result = await getAgentStatus(runId)
        setStatus(result)

        if (result.status === 'completed' || result.status === 'failed' || result.status === 'not_found') {
          setPolling(false)
          if (intervalRef.current) {
            clearInterval(intervalRef.current)
            intervalRef.current = null
          }
        }
      } catch (err) {
        console.error('Agent status poll error:', err)
      }
    }

    // Initial poll
    poll()

    // Set up interval
    intervalRef.current = setInterval(poll, intervalMs)

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
    }
  }, [runId, intervalMs])

  return { status, polling }
}
