'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

const AGENT_URL = process.env.AGENT_URL || 'http://127.0.0.1:8000'

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
    status: 'saved'
  })

  if (error) {
    console.error('Save job error:', error)
    return { error: 'Failed to save job' }
  }

  revalidatePath('/dashboard')
  return { success: true }
}
