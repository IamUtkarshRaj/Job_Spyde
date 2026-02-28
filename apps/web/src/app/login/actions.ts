'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'

export async function login(formData: FormData) {
  console.log('--- LOGIN ACTION START ---')

  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    if (!supabaseUrl || !supabaseKey) {
      console.error('Supabase environment variables are missing!')
      return redirect('/login?error=' + encodeURIComponent('Server configuration error. Please contact support.'))
    }

    const supabase = await createClient()

    const email = formData.get('email') as string
    const password = formData.get('password') as string

    if (!email || !password) {
      console.log('Missing email or password')
      return redirect('/login?error=' + encodeURIComponent('Please enter both email and password.'))
    }

    console.log('Attempting sign in for:', email)
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      console.error('Login error from Supabase:', error.message, '| Status:', error.status)

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

      console.log('Login fail redirecting with error:', userMessage)
      return redirect('/login?error=' + encodeURIComponent(userMessage))
    }

    console.log('Login success! User ID:', data.user?.id)
    revalidatePath('/', 'layout')
    return redirect('/dashboard')
  } catch (err: any) {
    if (err.digest?.includes('NEXT_REDIRECT')) {
      throw err // Re-throw Next.js redirect errors
    }
    console.error('UNEXPECTED SERVER ACTION CRASH:', err)
    return redirect('/login?error=' + encodeURIComponent('An unexpected server error occurred. Please try again.'))
  }
}

export async function signup(formData: FormData) {
  console.log('--- SIGNUP ACTION START ---')

  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    if (!supabaseUrl || !supabaseKey) {
      console.error('Supabase environment variables are missing!')
      return redirect('/signup?error=' + encodeURIComponent('Server configuration error. Please contact support.'))
    }

    const supabase = await createClient()

    const email = formData.get('email') as string
    const password = formData.get('password') as string
    const firstName = formData.get('first_name') as string
    const lastName = formData.get('last_name') as string
    const origin = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'

    if (!email || !password) {
      console.log('Missing email or password')
      return redirect('/signup?error=' + encodeURIComponent('Please enter both email and password.'))
    }

    if (password.length < 6) {
      console.log('Password too short')
      return redirect('/signup?error=' + encodeURIComponent('Password must be at least 6 characters long.'))
    }

    console.log('Attempting signup for:', email)
    const { data, error } = await supabase.auth.signUp({
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
      console.error('Signup error from Supabase:', error.message, '| Status:', error.status)

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

      console.log('Signup fail redirecting with error:', userMessage)
      return redirect(`/signup?error=${encodeURIComponent(userMessage)}`)
    }

    console.log('Signup success! Sending verify email link.')
    return redirect('/signup?message=Check email to continue sign in process')
  } catch (err: any) {
    if (err.digest?.includes('NEXT_REDIRECT')) {
      throw err
    }
    console.error('UNEXPECTED SIGNUP CRASH:', err)
    return redirect('/signup?error=' + encodeURIComponent('An unexpected error occurred during signup.'))
  }
}

export async function signOut() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  revalidatePath('/', 'layout')
  redirect('/login')
}
