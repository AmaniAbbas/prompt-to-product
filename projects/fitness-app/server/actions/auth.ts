'use server'

import { redirect } from 'next/navigation'
import { createServerClient } from '@/lib/supabase/server'
import { createSessionClient } from '@/lib/supabase/session'

export type SetupCoachResult = { error: string } | null

// Creates all four rows required for a new coach account in FK order:
//   organizations → users → coach_profiles → notification_settings
//
// Idempotent: if the users row already exists, redirects to the coach
// dashboard without writing anything.
//
// Client role assignment is not self-serve in v1. Client users rows are
// created at invite time (Slice 6).
export async function setupCoachAccount(
  formData: FormData,
): Promise<SetupCoachResult> {
  const displayName = (formData.get('display_name') as string | null)?.trim() ?? ''
  const businessName = (formData.get('business_name') as string | null)?.trim() ?? ''

  if (!displayName) return { error: 'Your name is required.' }
  if (displayName.length > 100) return { error: 'Your name must be 100 characters or fewer.' }
  if (businessName.length > 200) return { error: 'Business name must be 200 characters or fewer.' }

  // Verify the caller has a valid authenticated session.
  const sessionClient = createSessionClient()
  const {
    data: { user },
    error: sessionError,
  } = await sessionClient.auth.getUser()

  if (sessionError || !user?.email) redirect('/auth/login')

  const supabase = createServerClient()

  // Idempotency: if this user already has a users row, they are fully set up.
  const { data: existing } = await supabase
    .from('users')
    .select('role')
    .eq('id', user.id)
    .maybeSingle()

  if (existing) redirect('/coach/dashboard')

  // 1. Create organization.
  //    organizations.name is NOT NULL; fall back to display_name if no business name.
  const { data: org, error: orgError } = await supabase
    .from('organizations')
    .insert({ name: businessName || displayName })
    .select('id')
    .single()

  if (orgError || !org) return { error: 'Account setup failed. Please try again.' }

  // 2. Create users row.
  const { error: userError } = await supabase
    .from('users')
    .insert({ id: user.id, org_id: org.id, role: 'coach', email: user.email })

  if (userError) return { error: 'Account setup failed. Please try again.' }

  // 3. Create coach_profiles row.
  const { error: profileError } = await supabase.from('coach_profiles').insert({
    user_id: user.id,
    display_name: displayName,
    business_name: businessName || null,
  })

  if (profileError) return { error: 'Account setup failed. Please try again.' }

  // 4. Create notification_settings row.
  //    All boolean columns default to true — no values need to be specified.
  const { error: notifError } = await supabase
    .from('notification_settings')
    .insert({ coach_id: user.id })

  if (notifError) return { error: 'Account setup failed. Please try again.' }

  redirect('/coach/dashboard')
}
