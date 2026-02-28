'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export async function uploadResume(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return redirect('/login')
  }

  const file = formData.get('resumeFile') as File
  const text = formData.get('resumeText') as string

  let storagePath = ''

  if (file && file.size > 0) {
    const fileName = `${user.id}/${Date.now()}_${file.name}`
    const { error: uploadError } = await supabase.storage
      .from('resumes')
      .upload(fileName, file)

    if (uploadError) {
      console.error('Upload error:', uploadError)
      // return { error: 'Failed to upload file' }
    } else {
      storagePath = fileName
    }
  }

  const { error: dbError } = await supabase
    .from('resumes')
    .insert({
      user_id: user.id,
      storage_path: storagePath,
      resume_text: text
    })

  if (dbError) {
    console.error('DB error:', dbError)
    return { error: 'Failed to save resume info' }
  }

  revalidatePath('/resume')
  return { success: true }
}
