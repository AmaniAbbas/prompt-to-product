# QA Report — Slice 1: Project Scaffold

**QA Agent**
**Date:** 2026-05-07
**Tasks validated:** T-01-01 through T-01-04
**Criteria source:** T-01-05 Acceptance Criteria

---

## Verdict: BUG

---

## Acceptance Criteria — Status

| Criterion | Status | Evidence |
|---|---|---|
| `npm run build` passes locally | FAIL | TypeScript error in `@supabase/realtime-js@2.105.3` (see BUG-01) |
| Directory structure matches spec | PASS | All required directories present |
| `.env.example` contains all four required vars | PASS | All four vars confirmed |
| `.env.local` is not tracked by git | PASS | `.gitignore` has `.env.local` and `.env*.local` rules; file not in git index |
| Vercel deployment returns HTTP 200 | BLOCKED | T-01-04 status is TODO; no deployment URL exists (see BUG-02) |

---

## Evidence Checked

### T-01-01 — Next.js scaffold

- `app/coach/`, `app/client/`, `app/admin/`, `app/auth/` — all exist (empty, as expected)
- `components/`, `lib/`, `server/` — all exist
- `tailwind.config.ts`, `tsconfig.json`, `package.json` — all present
- `tsconfig.json` `"strict": true` — confirmed
- `tsconfig.json` `"skipLibCheck": true` — present but does not cover `.ts` source files in node_modules (only `.d.ts`)
- shadcn/ui installed as individual `@radix-ui` packages — all pinned
- `next` package uses `^14.2.35` — unpinned (caret); not a blocking criteria per T-01-01 spec, but noted
- `@supabase/supabase-js` uses `^2.105.3` — unpinned; lockfile resolves to `2.105.3`

### T-01-02 — Supabase clients

- `lib/supabase/client.ts` — exports `createBrowserClient()` factory, uses `NEXT_PUBLIC_SUPABASE_URL` + `NEXT_PUBLIC_SUPABASE_ANON_KEY`, throws on missing vars
- `lib/supabase/server.ts` — exports `createServerClient()` factory, uses `import 'server-only'`, uses `SUPABASE_SERVICE_ROLE_KEY`, throws on missing vars, `persistSession: false`
- Both are factory functions, not singletons — confirmed
- Task status is TODO in TASKS.md despite files being present — status not updated

### T-01-03 — Environment variables

- `.env.example` contains exactly: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `RESEND_API_KEY`
- All values are placeholder strings (no real credentials) — confirmed
- `.gitignore` includes `.env.local` and `.env*.local` — confirmed
- Task status is TODO in TASKS.md despite files being present — status not updated

### T-01-04 — Vercel deployment

- Task status is TODO — no deployment performed
- No Vercel URL available to test

---

## Bugs

---

### BUG-01

**ID:** BUG-01
**Severity:** Critical
**Area:** T-01-01 — Build
**Steps to reproduce:**
1. `cd projects/fitness-app`
2. `npm run build`

**Expected:** Build completes without errors

**Actual:**
```
Failed to compile.

./node_modules/@supabase/realtime-js/src/phoenix/presenceAdapter.ts:17:27
Type error: Parameter 'key' implicitly has an 'any' type.
```
Next.js build exits with code 1.

**Root cause:** `@supabase/realtime-js@2.105.3` ships TypeScript source files (`.ts`), not compiled JS. The source file `presenceAdapter.ts` has an implicit `any` parameter. `skipLibCheck: true` in `tsconfig.json` only skips `.d.ts` declaration files — it does not suppress type errors in `.ts` source files from node_modules when Next.js's type checker traverses them.

**Owner agent:** Backend Agent

---

### BUG-02

**ID:** BUG-02
**Severity:** High
**Area:** T-01-04 — Vercel Deployment
**Steps to reproduce:**
1. Check T-01-04 status in `projects/fitness-app/tasks/TASKS.md`
2. Attempt to access a Vercel deployment URL

**Expected:** A deployed Vercel URL returning HTTP 200, per T-01-05 acceptance criteria

**Actual:** T-01-04 status is TODO. No deployment has been made. T-01-05 criterion "Vercel deployment returns HTTP 200" cannot be verified.

**Owner agent:** Backend Agent

---

## Additional Observations (non-blocking)

- T-01-02 and T-01-03 task statuses remain TODO in TASKS.md despite their output files (`lib/supabase/client.ts`, `lib/supabase/server.ts`, `.env.example`) being present. Orchestrator should update these statuses.
- `@supabase/supabase-js` is declared as `^2.105.3` in `package.json` (unpinned). While the lockfile currently pins to `2.105.3`, future `npm install` calls could resolve to a newer version. Recommend pinning to exact version to prevent future drift.

---

## Blocking Status

**Slice 2 is BLOCKED** per T-01-05 notes: "Block Slice 2 until this task is DONE."

BUG-01 must be resolved and `npm run build` must pass before Slice 2 proceeds.
BUG-02 must be resolved (Vercel deployment confirmed) before Slice 2 proceeds.

## Third-Party Configuration QA

For external services such as Supabase, Vercel, Stripe, Resend, Firebase, or AWS:

- Verify the intended behavior, not just the dashboard toggle.
- If a setting is ambiguous, test it through the actual application flow before marking done.
- Dashboard configuration tasks may be marked CONFIGURED, but not fully DONE until an end-to-end test passes.
