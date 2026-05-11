/**
 * Agent API Client — communicates with the FastAPI backend
 * Uses NEXT_PUBLIC_AGENT_URL for client-side calls
 */

import { createClient } from '@/utils/supabase/client'

const AGENT_API_URL = typeof window !== 'undefined'
  ? (process.env.NEXT_PUBLIC_AGENT_URL || '/api/agent')
  : (process.env.NEXT_PUBLIC_AGENT_URL || '/api/agent')

/**
 * Gets the current Supabase session token to pass to the agent API.
 */
async function getAuthHeaders(): Promise<Record<string, string>> {
  const supabase = createClient()
  const { data: { session } } = await supabase.auth.getSession()
  
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  }
  if (session?.access_token) {
    headers['Authorization'] = `Bearer ${session.access_token}`
  }
  return headers
}

export interface RunAgentPayload {
  query: string
  location: string
  resume?: string
  optimize_resume?: boolean
}

export interface AgentRunResponse {
  run_id: string
  status: string
}

export interface AgentStatusResponse {
  status: 'running' | 'completed' | 'failed' | 'not_found'
  result?: {
    jobs: any[]
    optimized_resume?: string
  }
  error?: string
}

export async function triggerAgentRun(payload: RunAgentPayload): Promise<AgentRunResponse> {
  const headers = await getAuthHeaders()
  const res = await fetch(`${AGENT_API_URL}/v1/agents/run`, {
    method: 'POST',
    headers,
    body: JSON.stringify(payload),
  })

  if (!res.ok) {
    throw new Error(`Agent run failed: ${res.statusText}`)
  }

  return res.json()
}

export async function getAgentStatus(runId: string): Promise<AgentStatusResponse> {
  const res = await fetch(`${AGENT_API_URL}/v1/agents/status/${runId}`)

  if (!res.ok) {
    throw new Error(`Status check failed: ${res.statusText}`)
  }

  return res.json()
}

export async function submitFeedback(data: {
  job_url: string
  feedback: string
}) {
  const headers = await getAuthHeaders()
  const res = await fetch(`${AGENT_API_URL}/v1/agents/feedback/`, {
    method: 'POST',
    headers,
    body: JSON.stringify(data),
  })

  if (!res.ok) {
    throw new Error(`Feedback submission failed: ${res.statusText}`)
  }

  return res.json()
}

export async function optimizeResume(data: {
  user_profile: any
  base_resume_text: string
  job_description: string
  job_title: string
  company: string
}) {
  // Use the new /v1/resume/optimize endpoint which is unauthenticated or uses the local model directly
  // Note: If /v1/resume/optimize requires auth in the future, we will use getAuthHeaders
  const res = await fetch(`${AGENT_API_URL}/v1/resume/optimize`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      job_title: data.job_title,
      company: data.company,
      job_description: data.job_description,
      base_resume_text: data.base_resume_text,
      user_profile: data.user_profile,
    }),
  })

  if (!res.ok) {
    throw new Error('Failed to optimize resume')
  }

  return res.json()
}
