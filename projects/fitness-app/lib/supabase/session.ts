import 'server-only'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

// SSR client that reads the authenticated session from request cookies.
// Use this in Server Components and Server Actions to verify the caller's
// identity. For privileged DB writes, use createServerClient from server.ts.
export function createSessionClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!url) throw new Error('Missing env var: NEXT_PUBLIC_SUPABASE_URL')
  if (!key) throw new Error('Missing env var: NEXT_PUBLIC_SUPABASE_ANON_KEY')

  const cookieStore = cookies()

  return createServerClient(url, key, {
    cookies: {
      getAll() {
        return cookieStore.getAll()
      },
      setAll() {
        // Read-only callers (Server Components / Server Actions that do not
        // need to refresh tokens) leave cookie writes to the middleware or
        // the /auth/callback route handler.
      },
    },
  })
}
