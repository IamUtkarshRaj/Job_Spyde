'use server'

import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'

export async function savePreferences(formData: FormData) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return redirect('/login')
  }

  const roles = (formData.get('roles') as string).split(',').map(s => s.trim())
  const locations = (formData.get('locations') as string).split(',').map(s => s.trim())
  const remote_preference = formData.get('remote') === 'on'
  const keywords = (formData.get('keywords') as string).split(',').map(s => s.trim())
  const experience_level = formData.get('experience_level') as string
  const resume_text = formData.get('resume_text') as string

  const preferences = {
    roles,
    locations,
    remote_preference,
    keywords,
    experience_level
  }

  // Save to Profiles
  const { error: profileError } = await supabase
    .from('profiles')
    .upsert({
      id: user.id,
      preferences: preferences
    })

  if (profileError) {
    console.error('Error saving profile:', profileError)
    return { error: 'Failed to save preferences' }
  }

  // Save to Resumes
  const { error: resumeError } = await supabase
    .from('resumes')
    .insert({
      user_id: user.id,
      resume_text: resume_text,
      storage_path: 'manual_paste'
    })

  if (resumeError) {
    // If it's a unique constraint error (user already has a resume), we update it instead
    if (resumeError.code === '23505') {
      const { error: updateError } = await supabase
        .from('resumes')
        .update({ resume_text: resume_text })
        .eq('user_id', user.id)

      if (updateError) {
        console.error('Error updating resume:', updateError)
      }
    } else {
      console.error('Error saving resume:', resumeError)
    }
  }

  redirect('/dashboard')
}
