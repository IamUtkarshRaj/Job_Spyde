'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

const AGENT_URL = process.env.AGENT_URL || 'http://localhost:8000'

export async function discoverJobs() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return []

  // Fetch preferences
  const { data: profile } = await supabase.from('profiles').select('preferences').eq('id', user.id).single()

  const defaults = {
    roles: [],
    locations: [],
    remote_preference: false,
    keywords: []
  }

  const payload = {
    ...defaults,
    ...(profile?.preferences || {})
  }

  try {
    const res = await fetch(`${AGENT_URL}/v1/discover_jobs`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      cache: 'no-store'
    })

    if (!res.ok) {
       console.error('Agent discover error:', await res.text())
       return []
    }

    return await res.json()
  } catch (err) {
    console.error('Failed to discover jobs:', err)
    return []
  }
}

export async function saveJob(jobData: any) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Unauthorized' }

  const { error } = await supabase.from('jobs').insert({
    user_id: user.id,
    title: jobData.title,
    company: jobData.company,
    location: jobData.location,
    source: jobData.source,
    url: jobData.url,
    description: jobData.description,
    posted_at: jobData.posted_at, // Ensure format is compatible or null
    match_score: jobData.match_score,
    status: 'discovered'
  })

  if (error) {
    console.error('Save job error:', error)
    return { error: 'Failed to save job' }
  }

  revalidatePath('/dashboard')
  return { success: true }
}
