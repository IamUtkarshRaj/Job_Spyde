'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'

export async function login(formData: FormData) {
  const supabase = await createClient()

  const email = formData.get('email') as string
  const password = formData.get('password') as string

  if (!email || !password) {
    return redirect('/login?error=' + encodeURIComponent('Please enter both email and password.'))
  }

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    console.error('Login error:', error.message, '| Status:', error.status)

    // Map Supabase errors to user-friendly messages
    let userMessage = error.message

    if (error.message.includes('Invalid login credentials')) {
      userMessage = 'Invalid email or password. Please check and try again.'
    } else if (error.message.includes('Email not confirmed')) {
      userMessage = 'Your email is not verified. Please check your inbox for a confirmation link.'
    } else if (error.message.includes('rate limit') || error.status === 429) {
      userMessage = 'Too many login attempts. Please wait a few minutes and try again.'
    } else if (error.message.includes('User not found')) {
      userMessage = 'No account found with this email. Please sign up first.'
    }

    return redirect('/login?error=' + encodeURIComponent(userMessage))
  }

  revalidatePath('/', 'layout')
  redirect('/dashboard')
}

export async function signup(formData: FormData) {
  const supabase = await createClient()
  
  const email = formData.get('email') as string
  const password = formData.get('password') as string
  const firstName = formData.get('first_name') as string
  const lastName = formData.get('last_name') as string
  const origin = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'

  if (!email || !password) {
    return redirect('/signup?error=' + encodeURIComponent('Please enter both email and password.'))
  }

  if (password.length < 6) {
    return redirect('/signup?error=' + encodeURIComponent('Password must be at least 6 characters long.'))
  }

  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${origin}/auth/callback`,
      data: {
        first_name: firstName,
        last_name: lastName,
        full_name: `${firstName} ${lastName}`.trim(),
      },
    },
  })

  if (error) {
    console.error('Signup error:', error.message, '| Status:', error.status)

    let userMessage = error.message

    if (error.message.includes('rate limit') || error.status === 429) {
      userMessage = 'Too many signup attempts. Please try again in 15 minutes.'
    } else if (error.message.includes('already registered') || error.message.includes('User already registered')) {
      userMessage = 'An account with this email already exists. Try signing in instead.'
    } else if (error.message.includes('valid email')) {
      userMessage = 'Please enter a valid email address.'
    } else if (error.message.includes('password')) {
      userMessage = 'Password is too weak. Use at least 6 characters.'
    }

    return redirect(`/signup?error=${encodeURIComponent(userMessage)}`)
  }

  return redirect('/signup?message=Check email to continue sign in process')
}
