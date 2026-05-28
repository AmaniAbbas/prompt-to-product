import { redirect } from 'next/navigation'
import { createSessionClient } from '@/lib/supabase/session'
import { createServerClient } from '@/lib/supabase/server'
import SetupForm from './SetupForm'

export const dynamic = 'force-dynamic'

const ROLE_REDIRECTS: Record<string, string> = {
  coach: '/coach/dashboard',
  client: '/client/dashboard',
  admin: '/admin/dashboard',
}

export default async function SetupPage() {
  const sessionClient = createSessionClient()
  const {
    data: { user },
  } = await sessionClient.auth.getUser()

  if (!user) redirect('/auth/login')

  // If the user already has a users row they are fully set up — redirect them.
  const supabase = createServerClient()
  const { data: existing } = await supabase
    .from('users')
    .select('role')
    .eq('id', user.id)
    .maybeSingle()

  if (existing?.role) {
    redirect(ROLE_REDIRECTS[existing.role] ?? '/auth/login')
  }

  return (
    <main className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <h1 className="text-2xl font-semibold tracking-tight">Set up your account</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Tell us a bit about yourself to get started.
        </p>
        <SetupForm />
      </div>
    </main>
  )
}
