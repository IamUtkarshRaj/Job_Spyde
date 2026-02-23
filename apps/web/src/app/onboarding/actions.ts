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

  const preferences = {
    roles,
    locations,
    remote_preference,
    keywords
  }

  const { error } = await supabase
    .from('profiles')
    .upsert({ 
       id: user.id, 
       preferences: preferences
    })

  if (error) {
    console.error('Error saving profile:', error)
    return { error: 'Failed to save preferences' }
  }

  redirect('/dashboard')
}
