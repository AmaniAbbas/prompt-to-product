'use client'

import { useState } from 'react'
import { setupCoachAccount } from '@/server/actions/auth'

export default function SetupForm() {
  const [error, setError] = useState<string | null>(null)
  const [pending, setPending] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    setPending(true)

    try {
      const result = await setupCoachAccount(new FormData(e.currentTarget))
      if (result?.error) setError(result.error)
    } catch {
      setError('Something went wrong. Please try again.')
    } finally {
      setPending(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="mt-6 space-y-4">
      <div className="space-y-1.5">
        <label htmlFor="display_name" className="text-sm font-medium leading-none">
          Your name <span aria-hidden="true">*</span>
        </label>
        <input
          id="display_name"
          name="display_name"
          type="text"
          required
          autoComplete="name"
          autoFocus
          placeholder="Jane Smith"
          maxLength={100}
          disabled={pending}
          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
        />
      </div>

      <div className="space-y-1.5">
        <label htmlFor="business_name" className="text-sm font-medium leading-none">
          Business name{' '}
          <span className="font-normal text-muted-foreground">(optional)</span>
        </label>
        <input
          id="business_name"
          name="business_name"
          type="text"
          autoComplete="organization"
          placeholder="Smith Fitness"
          maxLength={200}
          disabled={pending}
          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
        />
      </div>

      {error && (
        <p role="alert" className="text-sm text-destructive">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="inline-flex h-10 w-full items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50"
      >
        {pending ? 'Setting up…' : 'Create account'}
      </button>
    </form>
  )
}
