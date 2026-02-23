'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'
import { generateResumeDraft as callAgentResume } from '@/lib/agent'

export async function updateStatus(jobId: string, status: string) {
  const supabase = await createClient()
  const { error } = await supabase
    .from('jobs')
    .update({ status })
    .eq('id', jobId)

  if (error) {
    console.error('Update status error:', error)
    return { error: 'Failed' }
  }
  
  // Log status event
  const { data: { user } } = await supabase.auth.getUser()
  if (user) {
    await supabase.from('status_events').insert({
      user_id: user.id,
      job_id: jobId,
      to_status: status,
      // from_status: TODO: fetch previous status if needed, skipping for MVP speed
      note: `Status updated to ${status}`
    })
  }

  revalidatePath(`/jobs/${jobId}`)
  revalidatePath('/dashboard')
}

export async function generateResume(jobId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Unauthorized' }

  // 1. Fetch Job
  const { data: job } = await supabase.from('jobs').select('*').eq('id', jobId).single()
  if (!job) return { error: 'Job not found' }

  // 2. Fetch Profile
  const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single()

  // 3. Fetch Base Resume
  const { data: resumes } = await supabase.from('resumes').select('*').eq('user_id', user.id).order('created_at', { ascending: false }).limit(1)
  const baseResumeText = resumes?.[0]?.resume_text || "No resume text available."

  try {
    // 4. Call Agent
    const draftData = await callAgentResume({
      user_profile: profile?.preferences || {},
      base_resume_text: baseResumeText,
      job_description: job.description || "",
      job_title: job.title,
      company: job.company
    })

    // 5. Save Draft
    const { error: draftError } = await supabase.from('drafts').insert({
      user_id: user.id,
      job_id: jobId,
      draft_json: draftData
    })

    if (draftError) {
      console.error('Draft save error:', draftError)
      return { error: 'Failed to save draft' }
    }

    // Update status to "prepared"
    await updateStatus(jobId, 'prepared')

    revalidatePath(`/jobs/${jobId}`)
    return { success: true }

  } catch (err) {
    console.error('Agent error:', err)
    return { error: 'Failed to generate draft' }
  }
}
