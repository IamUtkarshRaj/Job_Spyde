import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            request.cookies.set(name, value)
          )
          response = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Protected routes checking
  const protectedRoutes = ['/dashboard', '/jobs', '/discover', '/digest', '/resume', '/profile']
  
  const isProtectedRoute = protectedRoutes.some(route => 
    request.nextUrl.pathname === route || request.nextUrl.pathname.startsWith(`${route}/`)
  )

  const isSetupRoute = request.nextUrl.pathname === '/profile/setup'

  if (!user && (isProtectedRoute || request.nextUrl.pathname.startsWith('/onboarding') || isSetupRoute)) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // Redirect to dashboard if logged in and visiting login
  if (user && request.nextUrl.pathname === '/login') {
     return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  // Onboarding enforcement
  if (user && isProtectedRoute && !isSetupRoute) {
    // Check completion status efficiently
    let isCompleted = user.user_metadata?.onboarding_completed

    // Fallback to database check if not in metadata
    if (isCompleted === undefined) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('onboarding_completed')
        .eq('id', user.id)
        .single()
      
      isCompleted = profile?.onboarding_completed ?? false
    }

    if (!isCompleted) {
       return NextResponse.redirect(new URL('/profile/setup', request.url))
    }
  }

  return response
}
