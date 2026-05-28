'use client'

import { useState } from 'react'
import { createBrowserClient } from '@/lib/supabase/client'

type FormState = 'idle' | 'loading' | 'success' | 'invalid-email' | 'error'

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [formState, setFormState] = useState<FormState>('idle')

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()

    const trimmed = email.trim()

    if (!EMAIL_RE.test(trimmed)) {
      setFormState('invalid-email')
      return
    }

    setFormState('loading')

    const supabase = createBrowserClient()
    const { error } = await supabase.auth.signInWithOtp({
      email: trimmed,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    })

    // Never reveal whether the email is registered. Only surface a generic
    // error for genuine delivery failures (network, rate-limit, etc.).
    if (error) {
      setFormState('error')
      return
    }

    setEmail(trimmed)
    setFormState('success')
  }

  function handleEmailChange(e: React.ChangeEvent<HTMLInputElement>) {
    setEmail(e.target.value)
    if (formState === 'invalid-email' || formState === 'error') {
      setFormState('idle')
    }
  }

  if (formState === 'success') {
    return (
      <main className="flex min-h-screen items-center justify-center px-4">
        <div className="w-full max-w-sm space-y-2 text-center">
          <h1 className="text-2xl font-semibold tracking-tight">Check your email</h1>
          <p className="text-sm text-muted-foreground">
            We sent a login link to <span className="font-medium text-foreground">{email}</span>.
            The link expires in 60 minutes.
          </p>
        </div>
      </main>
    )
  }

  const hasFieldError = formState === 'invalid-email'
  const hasFormError = formState === 'error'

  return (
    <main className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <h1 className="text-2xl font-semibold tracking-tight">Sign in</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Enter your email to receive a magic link.
        </p>

        <form onSubmit={handleSubmit} noValidate className="mt-6 space-y-4">
          <div className="space-y-1.5">
            <label
              htmlFor="email"
              className="text-sm font-medium leading-none"
            >
              Email address
            </label>
            <input
              id="email"
              type="email"
              required
              autoComplete="email"
              autoFocus
              placeholder="you@example.com"
              value={email}
              onChange={handleEmailChange}
              disabled={formState === 'loading'}
              aria-invalid={hasFieldError ? true : undefined}
              aria-describedby={hasFieldError ? 'email-error' : undefined}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 aria-[invalid=true]:border-destructive aria-[invalid=true]:focus-visible:ring-destructive"
            />
            {hasFieldError && (
              <p id="email-error" role="alert" className="text-sm text-destructive">
                Enter a valid email address.
              </p>
            )}
          </div>

          {hasFormError && (
            <p role="alert" className="text-sm text-destructive">
              Something went wrong. Please try again.
            </p>
          )}

          <button
            type="submit"
            disabled={formState === 'loading'}
            className="inline-flex h-10 w-full items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50"
          >
            {formState === 'loading' ? 'Sending…' : 'Send magic link'}
          </button>
        </form>
      </div>
    </main>
  )
}
