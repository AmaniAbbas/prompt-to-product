import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import type { CookieOptions } from '@supabase/ssr'
import { createServerClient as createServiceClient } from '@/lib/supabase/server'

const ROLE_REDIRECTS: Record<string, string> = {
  coach: '/coach/dashboard',
  client: '/client/dashboard',
  admin: '/admin/dashboard',
}

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')

  if (!code) {
    return NextResponse.redirect(`${origin}/auth/login?error=invalid_token`)
  }

  // Capture session cookies and cache-control headers that @supabase/ssr
  // sets during token exchange. Applied to the response after the exchange.
  const cookiesToSet: { name: string; value: string; options: CookieOptions }[] = []
  const headersToSet: Record<string, string> = {}

  const sessionClient = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookies, headers) {
          cookies.forEach((c) => cookiesToSet.push(c))
          Object.assign(headersToSet, headers)
        },
      },
    }
  )

  const { data, error } = await sessionClient.auth.exchangeCodeForSession(code)

  let redirectTo: string

  if (error || !data.session) {
    redirectTo = `${origin}/auth/login?error=invalid_token`
  } else {
    // Role must be read server-side from the users table.
    // Never trust role from the session token or any client-supplied parameter.
    const serviceClient = createServiceClient()
    const { data: userData } = await serviceClient
      .from('users')
      .select('role')
      .eq('id', data.session.user.id)
      .single()

    const destination = userData?.role ? ROLE_REDIRECTS[userData.role] : undefined

    if (destination) {
      redirectTo = `${origin}${destination}`
    } else {
      // New user (no row in users table) or unrecognised role value.
      // Role assignment is handled in T-03-04.
      redirectTo = `${origin}/auth/setup`
    }
  }

  const response = NextResponse.redirect(redirectTo)

  // Propagate session cookies and cache-control headers onto the redirect
  // response so the browser receives the session and CDNs do not cache it.
  cookiesToSet.forEach(({ name, value, options }) =>
    response.cookies.set({ name, value, ...options })
  )
  Object.entries(headersToSet).forEach(([key, value]) =>
    response.headers.set(key, value)
  )

  return response
}
