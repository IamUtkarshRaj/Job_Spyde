'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

const AGENT_URL = process.env.AGENT_URL || 'http://127.0.0.1:8000'

export async function saveJob(jobData: any) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Unauthorized' }

  // 1. Sanitize posted_at (DB expects timestamp)
  let validPostedAt = null
  if (jobData.posted_at && jobData.posted_at !== 'Recent' && !isNaN(Date.parse(jobData.posted_at))) {
    validPostedAt = new Date(jobData.posted_at).toISOString()
  }

  // 2. Prepare Match Score (DB expects integer)
  const matchScore = jobData.match_score ? parseInt(jobData.match_score, 10) : null

  // 3. Perform UPSERT based on (user_id, url) to handle duplicates
  // Note: This relies on a UNIQUE constraint on url, or user_id + url.
  // If no unique constraint exists, this acts as a regular insert.
  const { error } = await supabase.from('jobs').upsert({
    user_id: user.id,
    title: jobData.title,
    company: jobData.company,
    location: jobData.location,
    source: jobData.source,
    url: jobData.url,
    description: jobData.description,
    posted_at: validPostedAt,
    match_score: matchScore,
    status: 'saved'
  }, { onConflict: 'user_id,url' })

  if (error) {
    console.error('Save job error:', JSON.stringify(error, null, 2))
    return { error: `Failed to save job: ${error.message || 'Unknown DB error'}` }
  }

  revalidatePath('/dashboard')
  revalidatePath('/discover')
  return { success: true }
}
