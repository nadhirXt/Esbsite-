import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
  const pathname = request.nextUrl.pathname
  const isDashboard = pathname.startsWith('/dashboard')
  const isAdmin = pathname.startsWith('/admin')
  const isAuthPage = pathname === '/login' || pathname === '/register'

  // Check if any Supabase auth cookie exists
  const hasAuthCookie = request.cookies.getAll().some(c => c.name.startsWith('sb-'))

  // Fast path for protected routes when no auth cookie is present: redirect directly
  if ((isDashboard || isAdmin) && !hasAuthCookie) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // Fast path for purely public pages when no auth cookie exists: avoid network roundtrip
  if (!isDashboard && !isAdmin && !isAuthPage && !hasAuthCookie) {
    return NextResponse.next({ request })
  }

  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          )
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()

  // Protect dashboard routes
  if (isDashboard && !user) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  const ADMIN_EMAILS = [
    'benelhadjbenelhadj@gmail.com',
    'benelhadjbenelhadj@outlook.com',
    'mohamed-nadhir.benelhadj@etu.enp-oran.dz',
  ]

  // Protect admin routes
  if (isAdmin) {
    if (!user) {
      return NextResponse.redirect(new URL('/login', request.url))
    }
    const userEmail = (user.email || '').toLowerCase()
    const isDesignatedAdmin = ADMIN_EMAILS.includes(userEmail) || user.user_metadata?.role === 'admin'

    if (!isDesignatedAdmin) {
      // Check admin role in database
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single()
      
      if (profile?.role !== 'admin') {
        return NextResponse.redirect(new URL('/dashboard', request.url))
      }
    }
  }

  // Redirect authenticated users away from auth pages
  if (isAuthPage && user) {
    const userEmail = (user.email || '').toLowerCase()
    const isDesignatedAdmin = ADMIN_EMAILS.includes(userEmail) || user.user_metadata?.role === 'admin'
    return NextResponse.redirect(new URL(isDesignatedAdmin ? '/admin' : '/dashboard', request.url))
  }

  return supabaseResponse
}
