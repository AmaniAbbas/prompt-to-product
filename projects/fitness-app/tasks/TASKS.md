# Tasks — Fitness Coach Management Platform

Generated from: `projects/fitness-app/execution/EXECUTION_PLAN.md`

**Status values:** TODO | IN_PROGRESS | QA | BUG | FIX | DONE

**Owner values:** Backend Agent | Frontend Agent | QA Agent

**Total tasks: 100**

---

## Slice 1 — Project Scaffold

---

### T-01-01

**Task ID:** T-01-01
**Title:** Initialize Next.js project with TypeScript, Tailwind CSS, and shadcn/ui
**Owner Agent:** Frontend Agent
**Status:** QA

#### Description
Bootstrap the Next.js 14 App Router project with TypeScript, Tailwind CSS, and a pinned version of shadcn/ui. Create the full directory structure required by the architecture spec.

#### Inputs
- Architecture spec: `projects/fitness-app/spec/ARCHITECTURE.md`

#### Outputs
- Next.js project root with `app/`, `components/`, `lib/`, `server/` directories
- `app/coach/`, `app/client/`, `app/admin/`, `app/auth/` route directories
- `tailwind.config.ts`, `tsconfig.json`, `package.json` with pinned dependencies

#### Acceptance Criteria
- `npm run build` completes without errors
- `npm run dev` starts without errors
- Directory structure matches architecture spec exactly
- shadcn/ui version is pinned in `package.json`
- TypeScript strict mode enabled

#### Out of Scope
- No business logic, no pages, no Supabase client yet

#### Dependencies
- None

#### Tests Required
- Build succeeds
- Dev server starts on localhost

#### Security Considerations
- None at this stage

#### Notes
- Pin shadcn/ui version explicitly; do not use `latest`

---

### T-01-02

**Task ID:** T-01-02
**Title:** Configure Supabase browser and server clients
**Owner Agent:** Backend Agent
**Status:** TODO

#### Description
Create Supabase client utilities in `lib/supabase/`: one for browser (anon key) and one for server (service role key via Server Actions and Route Handlers).

#### Inputs
- Architecture spec: `projects/fitness-app/spec/ARCHITECTURE.md`
- Supabase project URL and keys (from env vars)

#### Outputs
- `lib/supabase/client.ts` — browser client
- `lib/supabase/server.ts` — server client (uses service role key, called only from server-side code)

#### Acceptance Criteria
- Browser client initializes using `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- Server client initializes using `SUPABASE_SERVICE_ROLE_KEY` and is never imported from client components
- Both clients export a factory function, not a singleton

#### Out of Scope
- No auth logic, no queries

#### Dependencies
- T-01-01

#### Tests Required
- Browser client instantiates without error when env vars are present
- Server client file cannot be imported from a client component (lint rule or module boundary)

#### Security Considerations
- Service role key must never be exposed to the browser; only used in `server.ts` which is server-only

#### Notes
- None

---

### T-01-03

**Task ID:** T-01-03
**Title:** Add environment variable configuration and .env.example
**Owner Agent:** Backend Agent
**Status:** TODO

#### Description
Document all required environment variables in `.env.example`. Confirm all variables are referenced correctly in the Supabase client files. Add `.env.local` to `.gitignore`.

#### Inputs
- T-01-02 outputs

#### Outputs
- `.env.example` with placeholder values for all required vars:
  - `NEXT_PUBLIC_SUPABASE_URL`
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
  - `SUPABASE_SERVICE_ROLE_KEY`
  - `RESEND_API_KEY`
- `.env.local` in `.gitignore`

#### Acceptance Criteria
- `.env.example` contains all four required variables with placeholder values
- `.env.local` is gitignored
- App fails with a clear error if required env vars are missing at startup

#### Out of Scope
- No additional env vars beyond the four listed

#### Dependencies
- T-01-02

#### Tests Required
- Confirm `.env.local` does not appear in `git status`

#### Security Considerations
- No real credentials committed to the repository under any circumstances

#### Notes
- None

---

### T-01-04

**Task ID:** T-01-04
**Title:** Deploy blank app to Vercel and confirm CI/CD pipeline
**Owner Agent:** Backend Agent
**Status:** TODO

#### Description
Connect the repository to Vercel. Configure environment variables in the Vercel project dashboard. Deploy the blank scaffold and confirm the build passes in CI.

#### Inputs
- T-01-01, T-01-02, T-01-03 outputs
- Vercel project credentials

#### Outputs
- Live Vercel deployment URL for the blank app
- Vercel project configured with all environment variables

#### Acceptance Criteria
- Vercel build passes for the blank scaffold
- All four environment variables are set in Vercel dashboard
- Deployment URL is accessible and returns a 200

#### Out of Scope
- No feature work; blank app only

#### Dependencies
- T-01-01, T-01-02, T-01-03

#### Tests Required
- Deployment URL returns HTTP 200
- Vercel build log shows no errors

#### Security Considerations
- Ensure `SUPABASE_SERVICE_ROLE_KEY` is set as a server-only (non-public) env var in Vercel

#### Notes
- Configure callback URLs for Supabase Auth in Vercel env vars before Slice 3

---

### T-01-05

**Task ID:** T-01-05
**Title:** QA — Validate project scaffold
**Owner Agent:** QA Agent
**Status:** TODO

#### Description
Verify the scaffold is correct and complete before any database or auth work begins.

#### Inputs
- T-01-01 through T-01-04 outputs

#### Outputs
- QA pass or bug report

#### Acceptance Criteria
- `npm run build` passes locally
- Directory structure matches `app/coach/`, `app/client/`, `app/admin/`, `app/auth/`, `components/`, `lib/`, `server/`
- `.env.example` contains all four required vars
- `.env.local` is not tracked by git
- Vercel deployment returns HTTP 200

#### Out of Scope
- No feature testing at this stage

#### Dependencies
- T-01-01 through T-01-04

#### Tests Required
- Manual directory structure check against spec
- `git status` confirms no `.env.local`
- Vercel URL accessible

#### Security Considerations
- Confirm no credentials in `.env.example`

#### Notes
- Block Slice 2 until this task is DONE

---

## Slice 2 — Database Schema

---

### T-02-01

**Task ID:** T-02-01
**Title:** Migration: organizations, users, coach_profiles, client_profiles
**Owner Agent:** Backend Agent
**Status:** TODO

#### Description
Write and apply Supabase migrations for the four core identity tables in dependency order. No RLS yet.

#### Inputs
- `projects/fitness-app/spec/SCHEMA.md`

#### Outputs
- Migration files creating:
  - `organizations` (id uuid pk, name, created_at)
  - `users` (id uuid pk, org_id fk, role, email, created_at)
  - `coach_profiles` (id uuid, user_id fk, display_name, business_name, default_payment_link_url, trial_started_at, trial_ends_at, subscription_status, created_at)
  - `client_profiles` (id uuid, user_id fk, coach_id fk, display_name, email, consented_health_data boolean, consented_progress_photos boolean, created_at)

#### Acceptance Criteria
- All four tables exist in Supabase with correct columns, types, and foreign keys
- Migrations apply cleanly with no errors
- UUIDs used as primary keys on all tables

#### Out of Scope
- No RLS policies
- No UI for trial_started_at, trial_ends_at, subscription_status — columns exist only

#### Dependencies
- T-01-05 (Slice 1 QA passed)

#### Tests Required
- Confirm tables visible in Supabase dashboard
- Confirm FK from `users.org_id` to `organizations.id` is valid

#### Security Considerations
- None at migration stage; RLS applied in Slice 4

#### Notes
- `trial_started_at`, `trial_ends_at`, `subscription_status` are future-proofing columns — no logic or UI references them

---

### T-02-02

**Task ID:** T-02-02
**Title:** Migration: exercises, workout_templates, workout_template_exercises
**Owner Agent:** Backend Agent
**Status:** TODO

#### Description
Write and apply migrations for the exercise library and template tables.

#### Inputs
- `projects/fitness-app/spec/SCHEMA.md`

#### Outputs
- Migration files creating:
  - `exercises` (id uuid pk, org_id, created_by, name, description, video_url, is_global boolean, created_at)
  - `workout_templates` (id uuid pk, org_id, coach_id, name, description, created_at, updated_at)
  - `workout_template_exercises` (id uuid pk, template_id fk, exercise_id fk, position, sets, reps, weight, rest, rpe, tempo, notes — all text)

#### Acceptance Criteria
- All three tables created with correct columns and FK constraints
- Flexible workout fields (sets, reps, weight, rest, rpe, tempo, notes) use `text` type
- `is_global` defaults to false

#### Out of Scope
- No RLS; no UI

#### Dependencies
- T-02-01

#### Tests Required
- Tables visible in Supabase dashboard
- `is_global` default confirmed

#### Security Considerations
- None at migration stage

#### Notes
- `tempo` and `is_global` are schema-only future-proofing fields; no UI will reference them

---

### T-02-03

**Task ID:** T-02-03
**Title:** Migration: assigned_workouts, assigned_workout_exercises
**Owner Agent:** Backend Agent
**Status:** TODO

#### Description
Write and apply migrations for the workout assignment snapshot tables.

#### Inputs
- `projects/fitness-app/spec/SCHEMA.md`

#### Outputs
- Migration files creating:
  - `assigned_workouts` (id uuid pk, org_id, coach_id, client_id, source_template_id, label, assigned_date, title, notes, created_at)
  - `assigned_workout_exercises` (id uuid pk, assigned_workout_id fk, exercise_name, exercise_description, video_url, position, sets, reps, weight, rest, rpe, tempo, notes, completed_at — all text except completed_at which is timestamptz)

#### Acceptance Criteria
- Both tables created with correct columns and FK constraints
- All denormalized exercise fields use `text` type
- `completed_at` is nullable timestamptz
- `source_template_id` is a nullable reference (not a hard FK, since templates can be deleted)

#### Out of Scope
- No RLS; no UI

#### Dependencies
- T-02-02

#### Tests Required
- Tables visible in Supabase dashboard
- `completed_at` is nullable

#### Security Considerations
- None at migration stage

#### Notes
- `source_template_id` stores the original template ID for reference only; no sync logic ever uses it

---

### T-02-04

**Task ID:** T-02-04
**Title:** Migration: check_ins, progress_photos
**Owner Agent:** Backend Agent
**Status:** TODO

#### Description
Write and apply migrations for the check-in and progress photo tables.

#### Inputs
- `projects/fitness-app/spec/SCHEMA.md`

#### Outputs
- Migration files creating:
  - `check_ins` (id uuid pk, org_id, coach_id, client_id, weight, mood integer, adherence integer, comments, created_at)
  - `progress_photos` (id uuid pk, check_in_id fk, client_id, coach_id, storage_path, created_at)

#### Acceptance Criteria
- Both tables created with correct columns and FK constraints
- `mood` is an integer (1–5 enforced by application logic, not DB constraint, for MVP)
- `adherence` is an integer (0–100, same approach)
- `storage_path` is text

#### Out of Scope
- No RLS; no UI; no Supabase Storage bucket (configured in Slice 11)

#### Dependencies
- T-02-01

#### Tests Required
- Tables visible in Supabase dashboard

#### Security Considerations
- None at migration stage

#### Notes
- None

---

### T-02-05

**Task ID:** T-02-05
**Title:** Migration: comments, notification_settings, client_payment_links
**Owner Agent:** Backend Agent
**Status:** TODO

#### Description
Write and apply migrations for the communication, settings, and future-proofing tables.

#### Inputs
- `projects/fitness-app/spec/SCHEMA.md`

#### Outputs
- Migration files creating:
  - `comments` (id uuid pk, org_id, author_id, coach_id, client_id, context_type text, context_id uuid, body, created_at)
  - `notification_settings` (id uuid pk, coach_id fk, invite_emails boolean, plan_assigned_emails boolean, checkin_reminder_emails boolean, comment_emails boolean, payment_reminder_emails boolean)
  - `client_payment_links` (id uuid pk, coach_id fk, client_id fk, payment_link_url, created_at, updated_at)

#### Acceptance Criteria
- All three tables created with correct columns
- `notification_settings` boolean columns default to true
- `context_type` accepts values: `exercise`, `workout`, `checkin`
- `client_payment_links` exists in schema; no Server Action or UI will reference it

#### Out of Scope
- No RLS; no UI for any of these tables

#### Dependencies
- T-02-01

#### Tests Required
- Tables visible in Supabase dashboard
- Notification settings boolean defaults confirmed

#### Security Considerations
- None at migration stage

#### Notes
- `client_payment_links` is a future-proofing table — it must never be referenced in any Server Action, query, or UI component in v1

---

### T-02-06

**Task ID:** T-02-06
**Title:** Apply indexes on coach_id, client_id, org_id
**Owner Agent:** Backend Agent
**Status:** TODO

#### Description
Add indexes on `coach_id`, `client_id`, and `org_id` across all tables where those columns appear.

#### Inputs
- T-02-01 through T-02-05 outputs

#### Outputs
- Index migration applied to all relevant tables

#### Acceptance Criteria
- Indexes exist on `coach_id` in: `client_profiles`, `workout_templates`, `workout_template_exercises`, `assigned_workouts`, `check_ins`, `progress_photos`, `comments`, `notification_settings`, `client_payment_links`
- Indexes exist on `client_id` in: `client_profiles`, `assigned_workouts`, `check_ins`, `progress_photos`, `comments`, `client_payment_links`
- Indexes exist on `org_id` in: `users`, `exercises`, `workout_templates`, `assigned_workouts`, `check_ins`, `comments`
- All indexes confirmed in Supabase dashboard

#### Out of Scope
- No other index types (composite, partial) beyond what is specified

#### Dependencies
- T-02-01 through T-02-05

#### Tests Required
- Index existence confirmed in Supabase dashboard for each column listed

#### Security Considerations
- None

#### Notes
- None

---

### T-02-07

**Task ID:** T-02-07
**Title:** QA — Validate database schema
**Owner Agent:** QA Agent
**Status:** TODO

#### Description
Verify all 14 tables exist with correct columns, types, FKs, and indexes. Confirm no RLS is active yet.

#### Inputs
- T-02-01 through T-02-06 outputs
- `projects/fitness-app/spec/SCHEMA.md`

#### Outputs
- QA pass or bug report

#### Acceptance Criteria
- All 14 tables present: organizations, users, coach_profiles, client_profiles, exercises, workout_templates, workout_template_exercises, assigned_workouts, assigned_workout_exercises, check_ins, progress_photos, comments, notification_settings, client_payment_links
- Each table's columns match SCHEMA.md exactly
- Flexible workout fields are `text` type
- All specified indexes present
- No RLS policies active on any table

#### Out of Scope
- No feature testing

#### Dependencies
- T-02-01 through T-02-06

#### Tests Required
- Column-by-column comparison against SCHEMA.md in Supabase dashboard
- Confirm 0 RLS policies on all 14 tables

#### Security Considerations
- Confirm no sensitive default data is seeded

#### Notes
- Block Slice 3 until this task is DONE

---

## Slice 3 — Auth and Role Routing

---

### T-03-01

**Task ID:** T-03-01
**Title:** Configure Supabase Auth with magic link provider
**Owner Agent:** Backend Agent
**Status:** TODO

#### Description
Enable the magic link (email OTP) auth provider in the Supabase project. Configure the redirect URL for each environment (local, Vercel preview, production).

#### Inputs
- Supabase project dashboard
- Environment URLs for callback configuration

#### Outputs
- Magic link provider enabled in Supabase Auth settings
- Redirect URLs configured for all environments pointing to `/auth/callback`

#### Acceptance Criteria
- Magic link emails can be sent from Supabase Auth
- Redirect URL is set to `[base_url]/auth/callback` for local, preview, and production
- No other auth providers enabled (email/password is optional, added in T-03-05)

#### Out of Scope
- OAuth providers (Google, GitHub, etc.) — not in scope

#### Dependencies
- T-02-07 (Slice 2 QA passed)

#### Tests Required
- Send a test magic link from Supabase Auth dashboard and confirm email arrives

#### Security Considerations
- Callback URL must be whitelisted in Supabase to prevent open redirect

#### Notes
- None

---

### T-03-02

**Task ID:** T-03-02
**Title:** Build /auth/login page
**Owner Agent:** Frontend Agent
**Status:** TODO

#### Description
Build the login page where users enter their email to receive a magic link. No role selection — role is assigned server-side.

#### Inputs
- T-03-01 output

#### Outputs
- `app/auth/login/page.tsx` — email input form
- Form calls Supabase Auth `signInWithOtp` with the user's email
- Success state: "Check your email for a login link"

#### Acceptance Criteria
- Email input is present and required
- Submit triggers magic link email
- Success message displayed after submission
- Error state shown if email send fails
- No role selection UI on this page

#### Out of Scope
- No password login UI on this page (password setup is post-login, T-03-05)
- No OAuth buttons

#### Dependencies
- T-03-01

#### Tests Required
- Submit with valid email → success message
- Submit with invalid email → validation error

#### Security Considerations
- Do not expose whether an email is registered or not (same success message always)

#### Notes
- None

---

### T-03-03

**Task ID:** T-03-03
**Title:** Build /auth/callback route
**Owner Agent:** Backend Agent
**Status:** TODO

#### Description
Implement the magic link callback route that exchanges the token for a session, determines the user's role, and redirects to the correct area.

#### Inputs
- T-03-01, T-03-02 outputs

#### Outputs
- `app/auth/callback/route.ts` — handles token exchange via Supabase `exchangeCodeForSession`
- After session established: read `users.role` and redirect to `/coach/dashboard`, `/client/dashboard`, or `/admin/dashboard`
- If no role assigned yet (new user): redirect to role assignment logic (T-03-04)

#### Acceptance Criteria
- Valid magic link token → session created → role-based redirect
- Expired or invalid token → redirect to `/auth/login` with error param
- Role is read from `users` table, not from client-supplied data

#### Out of Scope
- No client-side token handling

#### Dependencies
- T-03-01

#### Tests Required
- Valid token → correct redirect based on role
- Expired token → redirect to login

#### Security Considerations
- Session cookie must be set as HttpOnly; handled by Supabase Auth client
- Role must be read server-side; never trust role from query param or client

#### Notes
- None

---

### T-03-04

**Task ID:** T-03-04
**Title:** Server Action: role assignment on first login
**Owner Agent:** Backend Agent
**Status:** TODO

#### Description
Implement server-side role assignment when a user logs in for the first time. Coaches self-sign up and receive the `coach` role. Clients arrive via invite and receive the `client` role (set at invite creation time in Slice 6).

#### Inputs
- T-03-03 output

#### Outputs
- `server/actions/auth.ts` — `assignRoleOnFirstLogin(userId, role)` Server Action
- Inserts a row in `users` with the given role if not already present

#### Acceptance Criteria
- Coach self-signup flow results in `users.role = 'coach'`
- Client invite flow results in `users.role = 'client'` (role set at invite creation, not at login)
- Admin role is never self-assigned; set manually in DB
- Action is idempotent: calling it twice for the same user does not change the role

#### Out of Scope
- No role editing UI

#### Dependencies
- T-03-03

#### Tests Required
- New coach user → role = coach in `users` table
- Existing user → role unchanged

#### Security Considerations
- Role assignment must happen server-side only; no client input accepted for role value

#### Notes
- Admin role is seeded manually and is never assigned via any UI flow

---

### T-03-05

**Task ID:** T-03-05
**Title:** Server Action: optional password setup
**Owner Agent:** Backend Agent
**Status:** TODO

#### Description
Allow users to optionally set a password after their first magic link login. Implemented as a Server Action that calls Supabase Auth `updateUser`.

#### Inputs
- Active user session

#### Outputs
- `server/actions/auth.ts` — `setupPassword(password)` Server Action
- Calls `supabase.auth.updateUser({ password })`

#### Acceptance Criteria
- Authenticated user can set a password via this action
- Password is not required; flow is entirely optional
- Minimum password length enforced (8 characters)
- Confirmation matches new password (validated in UI)

#### Out of Scope
- No password reset flow (magic link serves this purpose)
- No forced password requirement

#### Dependencies
- T-03-03

#### Tests Required
- Authenticated user sets password → subsequent login with email+password works
- Short password → rejected with validation error

#### Security Considerations
- Password is never logged or stored in application layer; handled entirely by Supabase Auth

#### Notes
- None

---

### T-03-06

**Task ID:** T-03-06
**Title:** Route protection middleware and role-based redirects
**Owner Agent:** Backend Agent
**Status:** TODO

#### Description
Implement Next.js middleware that enforces authentication on all protected routes and redirects users to their role-appropriate area.

#### Inputs
- T-03-03, T-03-04 outputs

#### Outputs
- `middleware.ts` at project root:
  - Unauthenticated requests to protected routes → redirect to `/auth/login`
  - Authenticated coach accessing `/client/*` or `/admin/*` → redirect to `/coach/dashboard`
  - Authenticated client accessing `/coach/*` or `/admin/*` → redirect to `/client/dashboard`
  - Authenticated admin accessing `/coach/*` or `/client/*` → redirect to `/admin/dashboard`
  - Public routes: `/auth/*` pass through without auth check

#### Acceptance Criteria
- Unauthenticated users cannot access any `/coach/*`, `/client/*`, or `/admin/*` routes
- Cross-role access is blocked at middleware level
- Public auth routes are accessible without a session

#### Out of Scope
- No API route protection (handled by RLS and Server Action guards)

#### Dependencies
- T-03-03, T-03-04

#### Tests Required
- Access `/coach/dashboard` without session → redirected to `/auth/login`
- Client session accessing `/coach/dashboard` → redirected to `/client/dashboard`

#### Security Considerations
- Middleware is a first-line defense only; all Server Actions must also verify role independently

#### Notes
- None

---

### T-03-07

**Task ID:** T-03-07
**Title:** Build empty layout shells for /coach, /client, /admin
**Owner Agent:** Frontend Agent
**Status:** TODO

#### Description
Create minimal layout components for each role area. These are placeholders only — they confirm routing works and provide a navigation shell for future feature pages.

#### Inputs
- T-03-06 output

#### Outputs
- `app/coach/layout.tsx` — coach layout with placeholder nav
- `app/client/layout.tsx` — client layout with placeholder nav
- `app/admin/layout.tsx` — admin layout with placeholder nav
- `app/coach/dashboard/page.tsx`, `app/client/dashboard/page.tsx`, `app/admin/dashboard/page.tsx` — empty placeholder pages

#### Acceptance Criteria
- All three dashboard pages render without error when authenticated with the correct role
- Layout clearly identifies the role area (heading or label)
- No business logic or data fetching

#### Out of Scope
- No navigation items yet (added per feature slice)
- No styling beyond basic layout

#### Dependencies
- T-03-06

#### Tests Required
- Each dashboard page renders for the correct role without error

#### Security Considerations
- None; auth already handled by middleware

#### Notes
- None

---

### T-03-08

**Task ID:** T-03-08
**Title:** QA — Auth flows and role routing
**Owner Agent:** QA Agent
**Status:** TODO

#### Description
Verify all auth flows and role protection work correctly end-to-end.

#### Inputs
- T-03-01 through T-03-07 outputs

#### Outputs
- QA pass or bug report

#### Acceptance Criteria
- Coach can sign up via magic link, land on `/coach/dashboard`
- Admin manually seeded in DB can log in and land on `/admin/dashboard`
- Unauthenticated access to `/coach/dashboard` → redirected to `/auth/login`
- Client session cannot access `/coach/*` routes
- Coach session cannot access `/client/*` or `/admin/*` routes
- Optional password setup works for an authenticated user
- Invalid magic link token → redirect to login

#### Out of Scope
- No feature page testing

#### Dependencies
- T-03-01 through T-03-07

#### Tests Required
- All cross-role access scenarios
- Magic link happy path
- Expired token path

#### Security Considerations
- Confirm role is not accepted from any client-supplied value

#### Notes
- Block Slice 4 until this task is DONE

---

## Slice 4 — RLS Policies and Permission Tests

---

### T-04-01

**Task ID:** T-04-01
**Title:** RLS policies: organizations, users, coach_profiles, client_profiles
**Owner Agent:** Backend Agent
**Status:** TODO

#### Description
Write and enable RLS policies for the four core identity tables.

#### Inputs
- `projects/fitness-app/spec/ARCHITECTURE.md` (Permissions Model section)
- T-03-08 (Slice 3 QA passed)

#### Outputs
- RLS enabled on: `organizations`, `users`, `coach_profiles`, `client_profiles`
- Policies:
  - `users`: users can read their own row; no unauthenticated access
  - `coach_profiles`: coach can read/write own row (user_id = auth.uid())
  - `client_profiles`: coach can read/write rows where coach_id matches; client can read own row; no cross-coach access

#### Acceptance Criteria
- RLS enabled on all four tables
- Coach A cannot read `client_profiles` rows belonging to Coach B
- Client can read only their own `client_profiles` row
- Unauthenticated requests return empty or error on all four tables

#### Out of Scope
- No admin policies in this task (covered in T-04-04)

#### Dependencies
- T-03-08

#### Tests Required
- Cross-coach access test for client_profiles
- Own-row access test for coach_profiles

#### Security Considerations
- coach_id in client_profiles must match the authenticated coach's user_id, not a coach_id passed in a request

#### Notes
- None

---

### T-04-02

**Task ID:** T-04-02
**Title:** RLS policies: exercises, workout_templates, workout_template_exercises
**Owner Agent:** Backend Agent
**Status:** TODO

#### Description
Write and enable RLS policies for exercise library and template tables.

#### Inputs
- Architecture spec permissions model
- T-04-01

#### Outputs
- RLS enabled on: `exercises`, `workout_templates`, `workout_template_exercises`
- Policies:
  - `exercises`: coach can read/write rows where `created_by = auth.uid()`
  - `workout_templates`: coach can read/write rows where `coach_id = auth.uid()`
  - `workout_template_exercises`: coach can read/write rows where the parent template's `coach_id = auth.uid()`

#### Acceptance Criteria
- Coach A cannot read exercises or templates created by Coach B
- All three tables have RLS enabled

#### Out of Scope
- Client access to exercises and templates (clients never access these directly)

#### Dependencies
- T-04-01

#### Tests Required
- Cross-coach access test for each of the three tables

#### Security Considerations
- None beyond standard RLS

#### Notes
- None

---

### T-04-03

**Task ID:** T-04-03
**Title:** RLS policies: assigned_workouts, assigned_workout_exercises, check_ins, progress_photos
**Owner Agent:** Backend Agent
**Status:** TODO

#### Description
Write and enable RLS policies for assignment and tracking tables, where both coach and client need scoped access.

#### Inputs
- Architecture spec permissions model
- T-04-01

#### Outputs
- RLS enabled on: `assigned_workouts`, `assigned_workout_exercises`, `check_ins`, `progress_photos`
- Policies:
  - `assigned_workouts`: coach can read/write rows where `coach_id = auth.uid()`; client can read rows where `client_id = auth.uid()`
  - `assigned_workout_exercises`: access derived from parent `assigned_workouts` row
  - `check_ins`: coach can read rows where `coach_id = auth.uid()`; client can read/write own rows where `client_id = auth.uid()`
  - `progress_photos`: coach can read rows where `coach_id = auth.uid()`; client can read/write rows where `client_id = auth.uid()`

#### Acceptance Criteria
- Client can read their own assigned workouts; cannot read another client's
- Coach can read all assigned workouts and check-ins for their own clients only
- Client A cannot read Client B's check-ins or photos
- All four tables have RLS enabled

#### Out of Scope
- No unauthenticated access

#### Dependencies
- T-04-01

#### Tests Required
- Cross-client access tests for check_ins and progress_photos
- Coach A cannot read Coach B's assigned_workouts

#### Security Considerations
- Progress photos are stored in private Supabase Storage; RLS here covers DB records only

#### Notes
- None

---

### T-04-04

**Task ID:** T-04-04
**Title:** RLS policies: comments, notification_settings, client_payment_links; admin read-only policies for all tables
**Owner Agent:** Backend Agent
**Status:** TODO

#### Description
Write and enable RLS for the remaining three tables, and add admin read-only policies to all 14 tables.

#### Inputs
- Architecture spec permissions model
- T-04-01 through T-04-03

#### Outputs
- RLS enabled on: `comments`, `notification_settings`, `client_payment_links`
- Policies:
  - `comments`: coach and client both read/write rows where `coach_id` and `client_id` match the relationship they share; outsiders cannot access
  - `notification_settings`: coach can read/write own row where `coach_id = auth.uid()`
  - `client_payment_links`: no policies that allow any app code to read or write (table is schema-only in v1; RLS blocks all access)
- Admin read-only policies added to all 14 tables: `SELECT` allowed where `auth.jwt() ->> 'role' = 'admin'`; no `INSERT`, `UPDATE`, `DELETE` for admin

#### Acceptance Criteria
- `comments` RLS allows coach and client in the same relationship to read/write; blocks all others
- `notification_settings` is scoped to the owning coach
- `client_payment_links` has no permissive policies (effectively inaccessible to all app code)
- Admin can SELECT from all 14 tables
- Admin cannot INSERT, UPDATE, or DELETE on any table

#### Out of Scope
- No write policies for admin

#### Dependencies
- T-04-01 through T-04-03

#### Tests Required
- Comment cross-relationship access test
- Admin SELECT succeeds; admin INSERT rejected

#### Security Considerations
- `client_payment_links` blocking all access is intentional; it is a future-proofing table

#### Notes
- Admin role is set in the JWT via Supabase's custom claims; confirm JWT claim is set correctly

---

### T-04-05

**Task ID:** T-04-05
**Title:** Enable RLS on all 14 tables
**Owner Agent:** Backend Agent
**Status:** TODO

#### Description
Run `ALTER TABLE ... ENABLE ROW LEVEL SECURITY` for all 14 tables. Confirm that all policies from T-04-01 through T-04-04 are active.

#### Inputs
- T-04-01 through T-04-04 outputs

#### Outputs
- All 14 tables have RLS enabled in Supabase

#### Acceptance Criteria
- Supabase dashboard shows RLS enabled on all 14 tables
- No table is missing from the list

#### Out of Scope
- No new policies in this task

#### Dependencies
- T-04-01 through T-04-04

#### Tests Required
- Supabase dashboard confirmation for each of the 14 tables

#### Security Considerations
- Enabling RLS without policies causes all access to be denied by default — verify policies are in place before enabling

#### Notes
- None

---

### T-04-06

**Task ID:** T-04-06
**Title:** Write permission verification test suite
**Owner Agent:** Backend Agent
**Status:** TODO

#### Description
Write a suite of integration tests that verify RLS policies are correct by simulating different role sessions.

#### Inputs
- T-04-05 output

#### Outputs
- Test file `projects/fitness-app/tests/rls.test.ts` (or SQL test scripts) covering:
  - Coach A cannot SELECT from `client_profiles` rows owned by Coach B
  - Client X cannot SELECT from `check_ins` rows owned by Client Y
  - Admin can SELECT from all tables
  - Admin INSERT on `coach_profiles` is rejected
  - Unauthenticated SELECT on any table returns empty or error
  - `client_payment_links` SELECT returns empty for all roles

#### Acceptance Criteria
- All test cases defined and runnable
- All tests pass against current DB state

#### Out of Scope
- No application-level tests; DB-level RLS tests only

#### Dependencies
- T-04-05

#### Tests Required
- All scenarios listed in outputs

#### Security Considerations
- Test suite uses the Supabase service role to simulate sessions; do not use service role in application code

#### Notes
- None

---

### T-04-07

**Task ID:** T-04-07
**Title:** QA — RLS policies and permission tests
**Owner Agent:** QA Agent
**Status:** TODO

#### Description
Run the full permission test suite and manually verify key cross-role access scenarios.

#### Inputs
- T-04-06 output

#### Outputs
- QA pass or bug report

#### Acceptance Criteria
- All tests in `rls.test.ts` pass
- Manual spot-check: Coach A session cannot read Coach B's `client_profiles`
- Manual spot-check: Admin session can SELECT all tables; INSERT rejected
- Manual spot-check: `client_payment_links` returns empty for coach and client sessions
- RLS enabled confirmed on all 14 tables

#### Out of Scope
- No feature testing

#### Dependencies
- T-04-01 through T-04-06

#### Tests Required
- Full test suite run
- Manual cross-role spot-checks

#### Security Considerations
- Confirm no table is missing RLS before feature slices proceed

#### Notes
- Block all feature slices (5+) until this task is DONE

---

## Slice 5 — Coach Profile

---

### T-05-01

**Task ID:** T-05-01
**Title:** Server Action: create and update coach profile
**Owner Agent:** Backend Agent
**Status:** TODO

#### Description
Implement the Server Action to upsert a coach's profile record in `coach_profiles`.

#### Inputs
- T-04-07 (Slice 4 QA passed)

#### Outputs
- `server/actions/coachProfile.ts`:
  - `upsertCoachProfile({ displayName, businessName, defaultPaymentLinkUrl })` — upserts `coach_profiles` row for the authenticated coach
  - `getCoachProfile()` — fetches the authenticated coach's profile

#### Acceptance Criteria
- Creates new profile if none exists; updates if exists
- `user_id` is set from the authenticated session (not from request body)
- `default_payment_link_url` is validated as a URL format server-side
- `trial_started_at`, `trial_ends_at`, `subscription_status` are never set, updated, or returned by this action

#### Out of Scope
- No trial or subscription logic
- No per-client payment override

#### Dependencies
- T-04-07

#### Tests Required
- Upsert creates a new row on first call
- Upsert updates existing row on second call
- Invalid URL format rejected

#### Security Considerations
- `user_id` must come from the authenticated session only; never from the request

#### Notes
- None

---

### T-05-02

**Task ID:** T-05-02
**Title:** Build /coach/settings/profile page
**Owner Agent:** Frontend Agent
**Status:** TODO

#### Description
Build the coach profile edit page with fields for display name, business name, and default payment link URL.

#### Inputs
- T-05-01 output

#### Outputs
- `app/coach/settings/profile/page.tsx` — profile edit form
- Fields: display_name, business_name, default_payment_link_url
- Pre-populates from `getCoachProfile()`
- Calls `upsertCoachProfile()` on submit

#### Acceptance Criteria
- Form renders with current values pre-populated
- Save button triggers upsert; success confirmation shown
- URL field shows validation error for non-URL input
- No fields for trial_started_at, trial_ends_at, or subscription_status

#### Out of Scope
- No trial/subscription UI
- No per-client payment override UI

#### Dependencies
- T-05-01

#### Tests Required
- Form submits successfully with valid data
- Invalid URL shows client-side validation error

#### Security Considerations
- None; auth enforced by middleware and Server Action

#### Notes
- None

---

### T-05-03

**Task ID:** T-05-03
**Title:** Build coach profile setup flow for first login
**Owner Agent:** Frontend Agent
**Status:** TODO

#### Description
Show a profile setup prompt to a newly authenticated coach who has no `coach_profiles` row yet. Block access to other coach features until setup is complete.

#### Inputs
- T-05-01, T-05-02 outputs

#### Outputs
- `app/coach/dashboard/page.tsx` — checks if coach profile exists; if not, redirects to `/coach/settings/profile` with a "complete your profile" prompt

#### Acceptance Criteria
- New coach after first login → redirected to profile setup
- Existing coach with a profile → reaches dashboard normally
- Profile completeness check uses `getCoachProfile()` server-side

#### Out of Scope
- No multi-step onboarding wizard

#### Dependencies
- T-05-01, T-05-02

#### Tests Required
- New coach (no profile row) → redirected to setup
- Existing coach → dashboard loads normally

#### Security Considerations
- None

#### Notes
- None

---

### T-05-04

**Task ID:** T-05-04
**Title:** QA — Coach profile
**Owner Agent:** QA Agent
**Status:** TODO

#### Description
Verify coach profile creation, editing, and first-login setup flow.

#### Inputs
- T-05-01 through T-05-03 outputs

#### Outputs
- QA pass or bug report

#### Acceptance Criteria
- New coach is redirected to profile setup after first login
- Coach can save display_name, business_name, default_payment_link_url
- Invalid URL is rejected with an error
- No trial, subscription, or payment override fields are visible

#### Out of Scope
- No client or admin testing

#### Dependencies
- T-05-01 through T-05-03

#### Tests Required
- Full create and update flow
- URL validation

#### Security Considerations
- Confirm trial/subscription fields are absent from any rendered output

#### Notes
- Block Slice 6 until this task is DONE

---

## Slice 6 — Client Management and Invite

---

### T-06-01

**Task ID:** T-06-01
**Title:** Server Action: create client and send invite email
**Owner Agent:** Backend Agent
**Status:** TODO

#### Description
Implement the Server Action that creates a client record and sends an invite email via Resend. Client receives `role = client` in the `users` table and a corresponding `client_profiles` row linked to the creating coach.

#### Inputs
- T-05-04 (Slice 5 QA passed)
- Resend API key configured

#### Outputs
- `server/actions/clients.ts`:
  - `createClient({ displayName, email })` — creates `users` (role=client) + `client_profiles` (coach_id = authenticated coach), generates a time-limited single-use invite token, sends invite email via Resend
- Invite email template: plain text with accept link `/auth/accept-invite?token=[token]`
- Invite token stored in DB with `expires_at` and `used_at` columns (add to `client_profiles` or a separate `invite_tokens` table)

#### Acceptance Criteria
- Creates `users` (role=client) and `client_profiles` rows
- Invite email sent via Resend with a valid accept link
- Token is time-limited (24 hours) and single-use
- `coach_id` on `client_profiles` is set from the authenticated session

#### Out of Scope
- No bulk invite
- No resend invite in this slice

#### Dependencies
- T-05-04

#### Tests Required
- Create client → rows exist in users and client_profiles
- Invite email received with correct accept link
- Token expires after 24 hours

#### Security Considerations
- Token must be cryptographically random (use `crypto.randomUUID()` or equivalent)
- `coach_id` must come from session, not request body

#### Notes
- If storing invite tokens in a separate table, add it in a migration in this task

---

### T-06-02

**Task ID:** T-06-02
**Title:** Build /coach/clients (client list page)
**Owner Agent:** Frontend Agent
**Status:** TODO

#### Description
Build the paginated client list page for the coach, showing all clients belonging to the authenticated coach.

#### Inputs
- T-06-01 output

#### Outputs
- `app/coach/clients/page.tsx` — client list
- Displays: display_name, email, created_at for each client
- Link to each client's profile page `/coach/clients/[id]`
- "Add Client" button linking to `/coach/clients/new`

#### Acceptance Criteria
- Lists only clients belonging to the authenticated coach (RLS enforced)
- "Add Client" button is present
- Each client row links to the client profile view

#### Out of Scope
- No search or filter

#### Dependencies
- T-06-01

#### Tests Required
- Coach with 3 clients sees 3 rows
- Coach B cannot see Coach A's clients

#### Security Considerations
- RLS handles data scoping; no additional filtering needed in application code

#### Notes
- None

---

### T-06-03

**Task ID:** T-06-03
**Title:** Build /coach/clients/new (create client form)
**Owner Agent:** Frontend Agent
**Status:** TODO

#### Description
Build the form for a coach to create a new client.

#### Inputs
- T-06-01 output

#### Outputs
- `app/coach/clients/new/page.tsx` — create client form
- Fields: display_name, email
- Calls `createClient()` Server Action on submit
- On success: redirects to `/coach/clients` or the new client's profile

#### Acceptance Criteria
- Form fields: display_name (required), email (required, validated as email format)
- On success: client created, invite sent, redirect to client list
- On error (e.g., email already exists): error message shown

#### Out of Scope
- No consent collection here (consent collected at invite acceptance, T-06-05)

#### Dependencies
- T-06-01

#### Tests Required
- Submit with valid data → client created, redirected
- Submit with invalid email format → validation error

#### Security Considerations
- None

#### Notes
- None

---

### T-06-04

**Task ID:** T-06-04
**Title:** Build /coach/clients/[id] (client profile view)
**Owner Agent:** Frontend Agent
**Status:** TODO

#### Description
Build the read-only client profile view page for coaches, showing client details and consent status.

#### Inputs
- T-06-01 output

#### Outputs
- `app/coach/clients/[id]/page.tsx` — client profile
- Displays: display_name, email, created_at, consented_health_data, consented_progress_photos
- Navigation links to: workouts, check-ins, progress (placeholders until those slices are built)

#### Acceptance Criteria
- Displays correct client data
- Shows consent status (yes/no) for health data and photo consent
- Coach cannot access another coach's client profile (RLS enforced; 404 if unauthorized)

#### Out of Scope
- No edit capability for coach on client profile

#### Dependencies
- T-06-01

#### Tests Required
- Coach A accessing Coach B's client → 404 or redirect

#### Security Considerations
- Server-side data fetch; do not expose other coaches' data

#### Notes
- None

---

### T-06-05

**Task ID:** T-06-05
**Title:** Build /auth/accept-invite page and consent flow
**Owner Agent:** Frontend Agent
**Status:** TODO

#### Description
Build the invite acceptance page where a client validates their token, completes account setup, and grants consent.

#### Inputs
- T-06-01 output (invite token mechanism)
- T-03-02, T-03-05 outputs (magic link and password setup)

#### Outputs
- `app/auth/accept-invite/page.tsx`:
  - Step 1: Token validation (calls Server Action T-06-06)
  - Step 2: Account setup (magic link or password)
  - Step 3: Consent form — two checkboxes: "I consent to my health data being stored" and "I consent to progress photos being stored"
  - Submit calls T-06-06 to record consent

#### Acceptance Criteria
- Expired or used token → error message; cannot proceed
- Both consent checkboxes must be checked before proceeding
- After consent: client is logged in and redirected to `/client/dashboard`

#### Out of Scope
- No optional consent (both are required to proceed)

#### Dependencies
- T-06-01, T-03-02

#### Tests Required
- Valid token → consent flow displayed
- Used token → error
- Expired token → error
- Partial consent (only one checkbox) → cannot proceed

#### Security Considerations
- Token validation is server-side; client cannot bypass by manipulating URL params

#### Notes
- None

---

### T-06-06

**Task ID:** T-06-06
**Title:** Server Action: validate invite token and record consent
**Owner Agent:** Backend Agent
**Status:** TODO

#### Description
Implement the server-side logic for invite token validation and consent recording.

#### Inputs
- T-06-01 output (invite token storage)

#### Outputs
- `server/actions/clients.ts` additions:
  - `validateInviteToken(token)` — verifies token exists, is not expired, is not used; returns client_id or error
  - `recordConsent({ clientId, consentedHealthData, consentedProgressPhotos })` — updates `client_profiles` with both consent booleans; marks token as used

#### Acceptance Criteria
- Expired tokens rejected
- Used tokens rejected
- Both consent values must be `true` to proceed; partial consent returns an error
- Consent recorded server-side; cannot be set from UI alone
- Token marked as used immediately after successful consent

#### Out of Scope
- No email confirmation of consent

#### Dependencies
- T-06-01

#### Tests Required
- Expired token → error returned
- Used token → error returned
- Valid token with both consents → profile updated; token marked used

#### Security Considerations
- Consent values must be boolean `true`, not truthy strings; validate server-side

#### Notes
- None

---

### T-06-07

**Task ID:** T-06-07
**Title:** QA — Client management and invite flow
**Owner Agent:** QA Agent
**Status:** TODO

#### Description
Verify the full client creation, invite, acceptance, and consent flow end-to-end.

#### Inputs
- T-06-01 through T-06-06 outputs

#### Outputs
- QA pass or bug report

#### Acceptance Criteria
- Coach creates client → invite email arrives with valid link
- Client follows link → consent form shown → both consents submitted → client lands on `/client/dashboard`
- Expired token → cannot accept invite
- Used token → cannot accept invite a second time
- Coach sees new client in `/coach/clients` after creation
- Coach A cannot see Coach B's clients

#### Out of Scope
- No workout or check-in testing

#### Dependencies
- T-06-01 through T-06-06

#### Tests Required
- Full happy path end-to-end
- Expired and used token paths
- Cross-coach client access test

#### Security Considerations
- Confirm consent values are stored in DB (not just set in UI state)

#### Notes
- Block Slice 7 and Slice 9 until this task is DONE

---

## Slice 7 — Exercise Library

---

### T-07-01

**Task ID:** T-07-01
**Title:** Server Actions: create exercise and list exercises by coach
**Owner Agent:** Backend Agent
**Status:** TODO

#### Description
Implement Server Actions for creating and listing exercises scoped to the authenticated coach.

#### Inputs
- T-04-07 (Slice 4 QA passed)

#### Outputs
- `server/actions/exercises.ts`:
  - `createExercise({ name, description, videoUrl? })` — inserts into `exercises` with `created_by = auth.uid()`; `is_global` defaults to false; `org_id` stored but not required from request
  - `listExercises()` — returns exercises where `created_by = auth.uid()`
  - `updateExercise(id, { name, description, videoUrl? })` — updates own exercise

#### Acceptance Criteria
- `created_by` is always set from the authenticated session
- `is_global` is never set to true by this action
- `video_url` stored if provided; not validated as a video URL specifically (plain URL validation)
- Coach cannot list or modify another coach's exercises (RLS enforces)

#### Out of Scope
- No global exercise library
- No video player
- No `is_global` or `org_id` in the request interface

#### Dependencies
- T-04-07

#### Tests Required
- Create exercise → row in DB with correct `created_by`
- List → only own exercises returned
- Update → own exercise updated

#### Security Considerations
- `created_by` must never come from the request body

#### Notes
- `is_global` defaults to false and is never changed by any action in v1

---

### T-07-02

**Task ID:** T-07-02
**Title:** Build /coach/exercises (exercise list page)
**Owner Agent:** Frontend Agent
**Status:** TODO

#### Description
Build the coach's exercise library list page.

#### Inputs
- T-07-01 output

#### Outputs
- `app/coach/exercises/page.tsx` — exercise list
- Displays: name, description for each exercise
- "New Exercise" button linking to creation form
- Edit link per exercise

#### Acceptance Criteria
- Lists only exercises owned by the authenticated coach
- "New Exercise" button present
- Edit link present per exercise

#### Out of Scope
- No video playback or preview
- No global library toggle

#### Dependencies
- T-07-01

#### Tests Required
- Coach with 2 exercises sees 2 rows

#### Security Considerations
- None beyond RLS

#### Notes
- None

---

### T-07-03

**Task ID:** T-07-03
**Title:** Build exercise creation and edit form
**Owner Agent:** Frontend Agent
**Status:** TODO

#### Description
Build the form for creating and editing exercises.

#### Inputs
- T-07-01, T-07-02 outputs

#### Outputs
- `app/coach/exercises/new/page.tsx` — create form
- `app/coach/exercises/[id]/edit/page.tsx` — edit form
- Fields: name (required), description (optional), video_url (optional, stored as text)
- No video player UI; `video_url` is a plain text input

#### Acceptance Criteria
- Name is required; submit blocked if empty
- `video_url` is optional; stored as-is
- Create → redirect to `/coach/exercises` on success
- Edit → pre-populates with existing values; redirect on success
- No `is_global` field visible anywhere

#### Out of Scope
- No video playback component

#### Dependencies
- T-07-01

#### Tests Required
- Create with name only → succeeds
- Create without name → validation error

#### Security Considerations
- None

#### Notes
- None

---

### T-07-04

**Task ID:** T-07-04
**Title:** QA — Exercise library
**Owner Agent:** QA Agent
**Status:** TODO

#### Description
Verify exercise creation, listing, and editing.

#### Inputs
- T-07-01 through T-07-03 outputs

#### Outputs
- QA pass or bug report

#### Acceptance Criteria
- Coach can create an exercise with name and optional description
- Exercise appears in the list immediately after creation
- Coach can edit an exercise; changes persist
- No `is_global`, `org_id`, or video player UI is present
- Coach A cannot see Coach B's exercises

#### Out of Scope
- No template or workout testing

#### Dependencies
- T-07-01 through T-07-03

#### Tests Required
- Create, list, edit happy path
- Cross-coach access test

#### Security Considerations
- Confirm `is_global` is not settable from any UI

#### Notes
- Block Slice 8 until this task is DONE

---

## Slice 8 — Workout Templates

---

### T-08-01

**Task ID:** T-08-01
**Title:** Server Actions: create, update, delete workout template
**Owner Agent:** Backend Agent
**Status:** TODO

#### Description
Implement Server Actions for managing workout templates.

#### Inputs
- T-07-04 (Slice 7 QA passed)

#### Outputs
- `server/actions/templates.ts`:
  - `createTemplate({ name, description? })` — inserts `workout_templates`; `coach_id = auth.uid()`
  - `updateTemplate(id, { name, description? })` — updates own template
  - `deleteTemplate(id)` — deletes own template; cascades to `workout_template_exercises`
  - `getTemplate(id)` — fetches template with all exercises ordered by position
  - `listTemplates()` — lists templates for authenticated coach

#### Acceptance Criteria
- `coach_id` set from session; never from request
- Coach cannot modify another coach's template (RLS enforces)
- Delete cascades to `workout_template_exercises`

#### Out of Scope
- No template duplication or sharing

#### Dependencies
- T-07-04

#### Tests Required
- Create, list, update, delete happy paths
- Cross-coach access test

#### Security Considerations
- `coach_id` from session only

#### Notes
- None

---

### T-08-02

**Task ID:** T-08-02
**Title:** Server Actions: add, update, remove, reorder exercises in template
**Owner Agent:** Backend Agent
**Status:** TODO

#### Description
Implement Server Actions for managing exercises within a workout template.

#### Inputs
- T-08-01

#### Outputs
- `server/actions/templates.ts` additions:
  - `addExerciseToTemplate(templateId, { exerciseId, sets, reps, weight, rest, rpe, notes, position })` — inserts `workout_template_exercises`; validates `exerciseId` belongs to the coach
  - `updateTemplateExercise(id, { sets, reps, weight, rest, rpe, notes })` — updates fields on a `workout_template_exercises` row
  - `removeExerciseFromTemplate(id)` — deletes `workout_template_exercises` row
  - `reorderTemplateExercises(templateId, orderedIds[])` — updates `position` values for the given template

#### Acceptance Criteria
- `exerciseId` must belong to the authenticated coach
- `tempo` is never accepted in the request interface
- All fields (sets, reps, weight, rest, rpe, notes) are `text`; no numeric enforcement beyond what PRD requires
- Reorder updates position values atomically

#### Out of Scope
- No `tempo` in the request interface

#### Dependencies
- T-08-01

#### Tests Required
- Add exercise with all fields → row in DB
- Add exercise from another coach's library → rejected
- Reorder → position values updated correctly

#### Security Considerations
- Validate `exerciseId` ownership before inserting

#### Notes
- `tempo` column exists in DB; it is never set by any Server Action in v1

---

### T-08-03

**Task ID:** T-08-03
**Title:** Build /coach/templates (template list page)
**Owner Agent:** Frontend Agent
**Status:** TODO

#### Description
Build the template list page for the coach.

#### Inputs
- T-08-01 output

#### Outputs
- `app/coach/templates/page.tsx` — template list
- Displays: name, description, created_at, exercise count
- "New Template" button
- Edit link per template

#### Acceptance Criteria
- Lists only templates belonging to the authenticated coach
- "New Template" button present
- Edit link per template present

#### Out of Scope
- No template duplication

#### Dependencies
- T-08-01

#### Tests Required
- List renders correctly for a coach with 2 templates

#### Security Considerations
- None beyond RLS

#### Notes
- None

---

### T-08-04

**Task ID:** T-08-04
**Title:** Build /coach/templates/new and /coach/templates/[id] (template create/edit with exercise management)
**Owner Agent:** Frontend Agent
**Status:** TODO

#### Description
Build the template creation and edit pages, including the exercise management interface within a template.

#### Inputs
- T-08-01, T-08-02, T-08-03 outputs

#### Outputs
- `app/coach/templates/new/page.tsx` — create template form
- `app/coach/templates/[id]/page.tsx` — edit template with exercise list
- Exercise management within template:
  - Select from coach's exercise library (calls `listExercises()`)
  - Fields per exercise: sets, reps, weight, rest, rpe, notes
  - No tempo field
  - Drag-to-reorder or up/down controls for position

#### Acceptance Criteria
- Template name (required) and description (optional) editable
- Exercises selectable from the coach's own library
- All six PRD exercise fields (sets, reps, weight, rest, rpe, notes) present
- `tempo` field is NOT present anywhere in the UI
- Exercise order is persisted via reorder action

#### Out of Scope
- No inline exercise creation from this page (coach uses `/coach/exercises` for that)
- No tempo UI

#### Dependencies
- T-08-01, T-08-02

#### Tests Required
- Create template → add two exercises → save → both exercises present in DB in correct order
- `tempo` field confirmed absent from rendered output

#### Security Considerations
- None

#### Notes
- None

---

### T-08-05

**Task ID:** T-08-05
**Title:** QA — Workout templates
**Owner Agent:** QA Agent
**Status:** TODO

#### Description
Verify full template creation, exercise management, and ordering.

#### Inputs
- T-08-01 through T-08-04 outputs

#### Outputs
- QA pass or bug report

#### Acceptance Criteria
- Coach can create a template with name and description
- Coach can add exercises with all six fields
- Exercise order persists after reordering
- `tempo` field is absent from all UI
- Coach A cannot see or edit Coach B's templates
- Editing template does not affect any previously assigned workouts (snapshot test will be in Slice 9)

#### Out of Scope
- No assignment testing here

#### Dependencies
- T-08-01 through T-08-04

#### Tests Required
- Full CRUD on templates
- Cross-coach access test
- Confirm `tempo` not in rendered HTML

#### Security Considerations
- None

#### Notes
- Block Slice 9 until this task is DONE

---

## Slice 9 — Workout Assignment

---

### T-09-01

**Task ID:** T-09-01
**Title:** Server Action: create assigned workout as full snapshot
**Owner Agent:** Backend Agent
**Status:** TODO

#### Description
Implement the atomic Server Action that creates an `assigned_workouts` record and copies all template exercises into `assigned_workout_exercises` as a full denormalized snapshot.

#### Inputs
- T-08-05 (Slice 8 QA passed), T-06-07 (Slice 6 QA passed)

#### Outputs
- `server/actions/assignments.ts`:
  - `assignWorkout({ clientId, templateId, assignedDate, label })`:
    1. Validates client belongs to coach; validates template belongs to coach
    2. Inserts `assigned_workouts` row
    3. Copies all `workout_template_exercises` rows into `assigned_workout_exercises` as denormalized text fields (exercise_name, exercise_description, video_url, position, sets, reps, weight, rest, rpe, tempo, notes)
    4. Entire operation is atomic (fails completely or succeeds completely)
  - `listAssignedWorkouts(clientId)` — lists assigned workouts for a client (coach-scoped)
  - `getAssignedWorkout(id)` — fetches assigned workout with all exercises

#### Acceptance Criteria
- Assigned workout is a complete snapshot; deleting or editing the template does not affect it
- `source_template_id` stored for reference only; no sync logic
- Operation is atomic; partial copies are never persisted
- `coach_id` and ownership verified before assignment
- `tempo` field is copied as data; no UI ever displays it

#### Out of Scope
- No sync logic between template and assigned workout
- No scheduling logic

#### Dependencies
- T-08-05, T-06-07

#### Tests Required
- Assign workout → create template, assign, then edit template name → assigned workout exercise names unchanged
- Partial copy simulation: mock a failure mid-copy → verify no rows created

#### Security Considerations
- Verify both `clientId` and `templateId` belong to the authenticated coach before creating

#### Notes
- This is the most critical action in the system; atomicity must be tested explicitly

---

### T-09-02

**Task ID:** T-09-02
**Title:** Build workout assignment form on /coach/clients/[id]
**Owner Agent:** Frontend Agent
**Status:** TODO

#### Description
Build the "Assign Workout" form accessible from the client profile page.

#### Inputs
- T-09-01 output

#### Outputs
- `app/coach/clients/[id]/assign/page.tsx` or modal component:
  - Template selector (dropdown from coach's templates)
  - `assigned_date` date picker
  - `label` text input (e.g., "Day 1 — Upper Body")
  - Submit calls `assignWorkout()`

#### Acceptance Criteria
- Template selector shows only templates belonging to the coach
- `assigned_date` and `label` are required
- On success: redirect to assigned workouts list for this client

#### Out of Scope
- No scheduling or recurring assignment

#### Dependencies
- T-09-01

#### Tests Required
- Select template + set date + set label → assignment created

#### Security Considerations
- None; Server Action handles ownership validation

#### Notes
- None

---

### T-09-03

**Task ID:** T-09-03
**Title:** Build /coach/clients/[id]/workouts (assigned workouts list)
**Owner Agent:** Frontend Agent
**Status:** TODO

#### Description
Build the list of assigned workouts for a client, visible to the coach.

#### Inputs
- T-09-01 output

#### Outputs
- `app/coach/clients/[id]/workouts/page.tsx`:
  - Lists assigned workouts with: label, assigned_date, title, created_at
  - Link to detail view per workout

#### Acceptance Criteria
- Coach sees all assigned workouts for their client
- Each row links to the workout detail
- No workouts from other coaches' clients are shown (RLS)

#### Out of Scope
- No delete or edit assigned workout in this slice

#### Dependencies
- T-09-01

#### Tests Required
- Coach with 2 assigned workouts for a client sees 2 rows

#### Security Considerations
- None beyond RLS

#### Notes
- None

---

### T-09-04

**Task ID:** T-09-04
**Title:** Wire workout-assigned email notification trigger
**Owner Agent:** Backend Agent
**Status:** TODO

#### Description
Add workout-assigned email trigger to the `assignWorkout` Server Action. Email sent via Resend to the client.

#### Inputs
- T-09-01 output
- Resend configured

#### Outputs
- `assignWorkout` Server Action updated to send an email to the client after successful assignment
- Email content: notification that a new workout has been assigned, with date and label
- Gated on `notification_settings.plan_assigned_emails` (defaults to true if no settings row exists)

#### Acceptance Criteria
- Client receives email after workout is assigned
- Email is not sent if `plan_assigned_emails = false`
- Email failure does not roll back the assignment

#### Out of Scope
- No retry logic for failed emails

#### Dependencies
- T-09-01

#### Tests Required
- Assign workout → email received
- Toggle `plan_assigned_emails = false` → email not sent

#### Security Considerations
- Email is sent after the transaction commits; failure is logged but does not affect DB state

#### Notes
- Notification settings row may not exist for new coaches; default to sending the email in that case

---

### T-09-05

**Task ID:** T-09-05
**Title:** QA — Workout assignment and snapshot integrity
**Owner Agent:** QA Agent
**Status:** TODO

#### Description
Verify workout assignment, snapshot correctness, and email notification.

#### Inputs
- T-09-01 through T-09-04 outputs

#### Outputs
- QA pass or bug report

#### Acceptance Criteria
- Coach assigns a workout to a client → assigned workout visible in coach list
- Snapshot test: edit template exercise name after assignment → assigned workout exercise name unchanged
- Snapshot test: delete template after assignment → assigned workout still exists and is intact
- Client receives workout-assigned email after assignment
- `tempo` field is stored in snapshot but never displayed in any UI

#### Out of Scope
- No client-side workout viewing (Slice 10)

#### Dependencies
- T-09-01 through T-09-04

#### Tests Required
- Snapshot immutability test (template edit → assignment unchanged)
- Snapshot integrity after template delete
- Email receipt confirmation

#### Security Considerations
- Confirm `source_template_id` is not used for any sync logic

#### Notes
- Block Slice 10 until this task is DONE

---

## Slice 10 — Client Workout Experience

---

### T-10-01

**Task ID:** T-10-01
**Title:** Server Actions: mark exercise complete/incomplete, update exercise notes, update workout notes
**Owner Agent:** Backend Agent
**Status:** TODO

#### Description
Implement Server Actions for client interactions with their assigned workouts.

#### Inputs
- T-09-05 (Slice 9 QA passed)

#### Outputs
- `server/actions/clientWorkouts.ts`:
  - `markExerciseComplete(assignedWorkoutExerciseId)` — sets `completed_at = now()` on `assigned_workout_exercises`
  - `markExerciseIncomplete(assignedWorkoutExerciseId)` — sets `completed_at = null`
  - `updateExerciseNotes(assignedWorkoutExerciseId, notes)` — updates `notes` on `assigned_workout_exercises`
  - `updateWorkoutNotes(assignedWorkoutId, notes)` — updates `notes` on `assigned_workouts`

#### Acceptance Criteria
- Client can only modify exercises in their own assigned workouts (RLS + server validation)
- `completed_at` is a timestamptz; set to server time, never client-provided time
- Notes update overwrites existing value

#### Out of Scope
- No completion analytics or tracking

#### Dependencies
- T-09-05

#### Tests Required
- Mark complete → `completed_at` is set
- Mark incomplete → `completed_at` is null
- Update notes → new value persists
- Client cannot modify another client's workout

#### Security Considerations
- All ownership checks via RLS; Server Action should also verify `client_id` matches session

#### Notes
- Notes on `assigned_workout_exercises` are a single field; client writes overwrite any coach notes copied from the template

---

### T-10-02

**Task ID:** T-10-02
**Title:** Build /client/workouts (assigned workout list for client)
**Owner Agent:** Frontend Agent
**Status:** TODO

#### Description
Build the workout list page for the logged-in client.

#### Inputs
- T-10-01 output

#### Outputs
- `app/client/workouts/page.tsx`:
  - Lists assigned workouts with: label, assigned_date, title
  - Link to workout detail per row

#### Acceptance Criteria
- Client sees only their own assigned workouts
- Each row links to the workout detail page

#### Out of Scope
- No filter by date or status

#### Dependencies
- T-10-01

#### Tests Required
- Client with 2 assigned workouts sees 2 rows
- Client A cannot see Client B's workouts

#### Security Considerations
- None beyond RLS

#### Notes
- None

---

### T-10-03

**Task ID:** T-10-03
**Title:** Build /client/workouts/[id] (workout detail with completion and notes)
**Owner Agent:** Frontend Agent
**Status:** TODO

#### Description
Build the workout detail page for the client, with exercise completion toggles and note fields.

#### Inputs
- T-10-01, T-10-02 outputs

#### Outputs
- `app/client/workouts/[id]/page.tsx`:
  - Shows workout label, date, title, notes
  - Lists exercises in order with: name, description, sets, reps, weight, rest, rpe, notes
  - Completion toggle per exercise (checkbox or button)
  - Notes field per exercise (inline edit)
  - Workout-level notes field
  - No tempo field displayed

#### Acceptance Criteria
- All exercise fields except `tempo` displayed
- Completion toggle calls `markExerciseComplete`/`markExerciseIncomplete`
- Notes fields call `updateExerciseNotes` / `updateWorkoutNotes`
- State persists after page reload

#### Out of Scope
- No `tempo` display
- No comments here (Slice 13)

#### Dependencies
- T-10-01

#### Tests Required
- Toggle exercise complete → page reload → still shows complete
- Edit notes → page reload → new notes persisted

#### Security Considerations
- None

#### Notes
- None

---

### T-10-04

**Task ID:** T-10-04
**Title:** Build /coach/clients/[id]/workouts/[id] (coach view of workout completion)
**Owner Agent:** Frontend Agent
**Status:** TODO

#### Description
Build the read-only coach view of a client's assigned workout, showing completion state and notes.

#### Inputs
- T-09-01, T-10-01 outputs

#### Outputs
- `app/coach/clients/[id]/workouts/[id]/page.tsx`:
  - Shows workout label, assigned_date, title
  - Lists exercises with: name, sets, reps, weight, rest, rpe, notes, completed_at (shown as "Completed" or "Not completed")
  - No edit controls for the coach on this page

#### Acceptance Criteria
- Coach can see completion state per exercise
- Coach cannot modify client's completion or notes from this view
- No `tempo` displayed

#### Out of Scope
- No edit capability for coach on this page

#### Dependencies
- T-10-01

#### Tests Required
- Coach views client workout; exercise marked complete shows as completed

#### Security Considerations
- RLS ensures coach can only see assigned workouts for their own clients

#### Notes
- None

---

### T-10-05

**Task ID:** T-10-05
**Title:** QA — Client workout experience
**Owner Agent:** QA Agent
**Status:** TODO

#### Description
Verify client workout viewing, exercise completion, and notes.

#### Inputs
- T-10-01 through T-10-04 outputs

#### Outputs
- QA pass or bug report

#### Acceptance Criteria
- Client sees only their own assigned workouts
- Client can mark exercises complete; state persists after reload
- Client can add notes to exercises and to the workout; persists after reload
- Coach can see client's completion state
- `tempo` field absent from all UI
- Client A cannot access Client B's workouts

#### Out of Scope
- No comments testing (Slice 13)

#### Dependencies
- T-10-01 through T-10-04

#### Tests Required
- Full happy path: assign workout → client views → marks complete → coach views completion
- Cross-client access test
- `tempo` absent from rendered output

#### Security Considerations
- None

#### Notes
- Block Slice 11 until this task is DONE

---

## Slice 11 — Check-ins and Photo Upload

---

### T-11-01

**Task ID:** T-11-01
**Title:** Configure Supabase Storage private bucket for progress photos
**Owner Agent:** Backend Agent
**Status:** TODO

#### Description
Create and configure a private Supabase Storage bucket for progress photos. Set bucket policy to private (no public access).

#### Inputs
- T-10-05 (Slice 10 QA passed)
- Supabase project dashboard

#### Outputs
- Supabase Storage bucket named `progress-photos` with private access (no public URL)
- Storage RLS policy: client can upload to `progress-photos/[client_id]/*`; coach can read from `progress-photos/[client_id]/*` for their own clients

#### Acceptance Criteria
- Bucket is private; public URL returns 403
- Signed URLs are required for all access
- Client can upload photos to their own prefix
- Coach can generate signed URLs for their clients' photos
- No public access to any path

#### Out of Scope
- No image resizing or processing

#### Dependencies
- T-10-05

#### Tests Required
- Public URL for a photo returns 403
- Signed URL returns the image
- Client A cannot generate signed URL for Client B's photos

#### Security Considerations
- Bucket must be private; this is a hard requirement for health-related data

#### Notes
- Signed URL TTL set to 1 hour

---

### T-11-02

**Task ID:** T-11-02
**Title:** Server Action: create check-in and upload progress photos
**Owner Agent:** Backend Agent
**Status:** TODO

#### Description
Implement the Server Action for submitting a check-in with optional progress photos.

#### Inputs
- T-11-01 output

#### Outputs
- `server/actions/checkins.ts`:
  - `submitCheckIn({ weight, mood, adherence, comments, photos? })`:
    1. Validates mood is 1–5; adherence is 0–100
    2. Inserts `check_ins` row
    3. If photos provided: checks `consented_progress_photos = true` server-side; uploads each photo to `progress-photos/[client_id]/[uuid].[ext]`; inserts `progress_photos` rows with `storage_path`
    4. Photo upload failure does not roll back the check-in record

#### Acceptance Criteria
- `client_id` and `coach_id` set from session and client profile (never from request)
- Photo upload blocked if `consented_progress_photos = false` (server-side check)
- Mood validated as integer 1–5
- Adherence validated as integer 0–100
- `check_in_id` FK set on `progress_photos`

#### Out of Scope
- No photo resizing
- No check-in editing

#### Dependencies
- T-11-01

#### Tests Required
- Submit check-in without photos → `check_ins` row created
- Submit with photos + consent = true → photos uploaded; `progress_photos` rows created
- Submit with photos + consent = false → photos rejected; check-in still created

#### Security Considerations
- `consented_progress_photos` check is server-side; cannot be bypassed via UI manipulation

#### Notes
- None

---

### T-11-03

**Task ID:** T-11-03
**Title:** Server Action: list check-ins with signed photo URLs
**Owner Agent:** Backend Agent
**Status:** TODO

#### Description
Implement Server Actions for fetching check-ins with associated photos, including signed URLs.

#### Inputs
- T-11-02 output

#### Outputs
- `server/actions/checkins.ts` additions:
  - `listCheckIns(clientId)` — fetches all `check_ins` for a client with associated `progress_photos` storage paths; generates signed URLs (1-hour TTL) for each photo
  - `getCheckIn(id)` — fetches a single check-in with its photos and signed URLs

#### Acceptance Criteria
- Coach can list check-ins for own clients only (RLS)
- Client can list only their own check-ins (RLS)
- Signed URLs generated server-side; never stored in DB
- Signed URLs have 1-hour TTL

#### Out of Scope
- No photo caching

#### Dependencies
- T-11-02

#### Tests Required
- Fetch check-ins → signed URLs are present and accessible
- Signed URLs expire after 1 hour

#### Security Considerations
- Signed URLs generated on each request; do not cache signed URLs

#### Notes
- None

---

### T-11-04

**Task ID:** T-11-04
**Title:** Build /client/check-ins/new (check-in form with photo upload)
**Owner Agent:** Frontend Agent
**Status:** TODO

#### Description
Build the check-in submission form for clients.

#### Inputs
- T-11-02 output

#### Outputs
- `app/client/check-ins/new/page.tsx`:
  - Fields: weight (number input), mood (1–5 selector), adherence (0–100 slider or number input), comments (textarea)
  - Photo upload component: shown only if `consented_progress_photos = true`; accepts image files
  - Submit calls `submitCheckIn()`

#### Acceptance Criteria
- All four required fields present: weight, mood, adherence, comments
- Photo upload section hidden if client has not consented to photos
- Submit blocked if mood out of 1–5 range or adherence out of 0–100 range (client-side validation; server also validates)
- Success: redirect to `/client/check-ins`

#### Out of Scope
- No check-in editing

#### Dependencies
- T-11-02

#### Tests Required
- Submit with all fields → check-in created
- Submit with photo + consent → photo uploaded
- Submit with photo without consent → photo upload field not shown

#### Security Considerations
- Photo consent check is also enforced server-side; UI gating is UX only

#### Notes
- None

---

### T-11-05

**Task ID:** T-11-05
**Title:** Build /client/check-ins (client check-in history)
**Owner Agent:** Frontend Agent
**Status:** TODO

#### Description
Build the check-in history list for the logged-in client.

#### Inputs
- T-11-03 output

#### Outputs
- `app/client/check-ins/page.tsx`:
  - Lists check-ins in reverse chronological order: date, weight, mood, adherence, comments preview
  - Link to check-in detail per row

#### Acceptance Criteria
- Client sees only their own check-ins
- Ordered by newest first

#### Out of Scope
- No check-in editing or deletion

#### Dependencies
- T-11-03

#### Tests Required
- Client with 3 check-ins sees 3 rows in correct order

#### Security Considerations
- None beyond RLS

#### Notes
- None

---

### T-11-06

**Task ID:** T-11-06
**Title:** Build /coach/clients/[id]/check-ins (coach view of client check-ins with photos)
**Owner Agent:** Frontend Agent
**Status:** TODO

#### Description
Build the coach's view of a client's check-in history with photos.

#### Inputs
- T-11-03 output

#### Outputs
- `app/coach/clients/[id]/check-ins/page.tsx`:
  - Lists check-ins in reverse chronological order: date, weight, mood, adherence, comments
  - Inline photo thumbnails per check-in (via signed URLs)
  - Link to check-in detail per row

#### Acceptance Criteria
- Coach sees check-ins and photos for their own clients only (RLS)
- Photos render via signed URLs
- Coach cannot modify check-ins from this view

#### Out of Scope
- No check-in editing by coach

#### Dependencies
- T-11-03

#### Tests Required
- Coach sees client's check-in with photo thumbnail
- Coach A cannot access Coach B's client check-ins

#### Security Considerations
- Signed URLs generated server-side; do not pass storage paths to client components

#### Notes
- None

---

### T-11-07

**Task ID:** T-11-07
**Title:** QA — Check-ins and photo upload
**Owner Agent:** QA Agent
**Status:** TODO

#### Description
Verify check-in submission, photo upload with consent gating, and coach view.

#### Inputs
- T-11-01 through T-11-06 outputs

#### Outputs
- QA pass or bug report

#### Acceptance Criteria
- Client can submit a check-in with all required fields
- Client with photo consent can upload a photo; it appears in coach view via signed URL
- Client without photo consent does not see photo upload UI; server also rejects photo
- Public URL for photo bucket returns 403
- Coach sees client check-ins and photos for own clients only
- Client A cannot see Client B's check-ins

#### Out of Scope
- No timeline view testing (Slice 12)

#### Dependencies
- T-11-01 through T-11-06

#### Tests Required
- Happy path: submit check-in + photo → visible in coach view
- No-consent path: photo upload blocked
- Public bucket access test (403)
- Cross-coach and cross-client access tests

#### Security Considerations
- Confirm photos are not accessible via public URL

#### Notes
- Block Slice 12 until this task is DONE

---

## Slice 12 — Progress Timeline

---

### T-12-01

**Task ID:** T-12-01
**Title:** Server Action: fetch client check-ins and photos in reverse chronological order
**Owner Agent:** Backend Agent
**Status:** TODO

#### Description
Implement the Server Action for the coach's timeline view, fetching all check-ins with their photos.

#### Inputs
- T-11-07 (Slice 11 QA passed)

#### Outputs
- `server/actions/progress.ts`:
  - `getClientProgress(clientId)` — fetches all `check_ins` for the client with associated `progress_photos`; generates signed URLs for all photos in a single call; orders by `created_at DESC`

#### Acceptance Criteria
- Returns check-ins in reverse chronological order
- Signed URLs for all photos included in the response
- Only accessible by the coach who owns the client (RLS)

#### Out of Scope
- No aggregation, no statistics, no charting data

#### Dependencies
- T-11-07

#### Tests Required
- Returns correct order
- Coach A cannot call with Coach B's client_id

#### Security Considerations
- Verify `clientId` belongs to the authenticated coach before fetching

#### Notes
- None

---

### T-12-02

**Task ID:** T-12-02
**Title:** Build /coach/clients/[id]/progress (timeline view)
**Owner Agent:** Frontend Agent
**Status:** TODO

#### Description
Build the coach's progress timeline page for a client.

#### Inputs
- T-12-01 output

#### Outputs
- `app/coach/clients/[id]/progress/page.tsx`:
  - Timeline of check-in entries, newest first
  - Per check-in entry: date, weight, mood, adherence, comments
  - Inline photos for each check-in (rendered via signed URLs)
  - No charts, graphs, or analytics components

#### Acceptance Criteria
- All check-in data fields displayed per entry
- Photos render inline via signed URLs
- No chart, graph, or analytics component present
- "No check-ins yet" empty state for clients with no data

#### Out of Scope
- No charts of any kind
- No data aggregation display

#### Dependencies
- T-12-01

#### Tests Required
- Timeline renders with 3 check-ins in correct order
- Photo renders via signed URL
- Confirm no chart library is imported

#### Security Considerations
- None beyond RLS

#### Notes
- None

---

### T-12-03

**Task ID:** T-12-03
**Title:** QA — Progress timeline
**Owner Agent:** QA Agent
**Status:** TODO

#### Description
Verify the progress timeline view.

#### Inputs
- T-12-01, T-12-02 outputs

#### Outputs
- QA pass or bug report

#### Acceptance Criteria
- Coach sees all check-ins for a client in reverse chronological order
- Photos render correctly via signed URLs
- No chart or analytics component present on the page
- Coach A cannot access Coach B's client progress

#### Out of Scope
- No comments testing

#### Dependencies
- T-12-01, T-12-02

#### Tests Required
- Timeline order test
- Photo rendering test
- No-chart confirmation
- Cross-coach access test

#### Security Considerations
- None

#### Notes
- Block Slice 13 until this task is DONE

---

## Slice 13 — Comments

---

### T-13-01

**Task ID:** T-13-01
**Title:** Server Actions: create comment and list comments by context
**Owner Agent:** Backend Agent
**Status:** TODO

#### Description
Implement Server Actions for the flat comment system.

#### Inputs
- T-12-03 (Slice 12 QA passed)

#### Outputs
- `server/actions/comments.ts`:
  - `addComment({ contextType, contextId, body })` — validates `contextType` is one of `exercise | workout | checkin`; sets `author_id = auth.uid()`; derives `coach_id` and `client_id` from the context
  - `listComments({ contextType, contextId })` — returns flat list of comments ordered by `created_at ASC`

#### Acceptance Criteria
- `author_id` set from session only
- `context_type` must be one of `exercise`, `workout`, `checkin`; other values rejected
- Both coach and client can add comments (RLS allows)
- Comments are scoped to the coach+client relationship; outsiders cannot read or write

#### Out of Scope
- No threading, no replies, no reactions
- No comment editing or deletion

#### Dependencies
- T-12-03

#### Tests Required
- Coach adds comment → `author_id` is coach's user_id
- Client adds comment → `author_id` is client's user_id
- Outsider cannot list comments for a coach+client relationship they are not part of
- Invalid `context_type` rejected

#### Security Considerations
- Derive `coach_id` and `client_id` from the context row (e.g., from `assigned_workouts` or `check_ins`), not from the request body

#### Notes
- None

---

### T-13-02

**Task ID:** T-13-02
**Title:** Wire comment email notification trigger
**Owner Agent:** Backend Agent
**Status:** TODO

#### Description
Add email notification to the `addComment` Server Action. Notifies the other party when a comment is posted.

#### Inputs
- T-13-01 output

#### Outputs
- `addComment` updated to send email via Resend after successful comment insert
- Recipient logic: if `author_id = coach_id` → email client; if `author_id = client_id` → email coach
- Gated on `notification_settings.comment_emails`
- Email content: notification that a new comment has been posted on [context type]

#### Acceptance Criteria
- Comment by coach → client receives email (if setting enabled)
- Comment by client → coach receives email (if setting enabled)
- Email failure does not roll back the comment
- Email not sent if `comment_emails = false`

#### Out of Scope
- No retry logic

#### Dependencies
- T-13-01

#### Tests Required
- Coach posts comment → client receives email
- `comment_emails = false` → no email sent
- Email failure → comment still saved

#### Security Considerations
- Recipient is derived server-side from the comment record; never from request

#### Notes
- None

---

### T-13-03

**Task ID:** T-13-03
**Title:** Build reusable CommentThread component
**Owner Agent:** Frontend Agent
**Status:** TODO

#### Description
Build a reusable CommentThread component that displays a flat list of comments and an add-comment form.

#### Inputs
- T-13-01, T-13-02 outputs

#### Outputs
- `components/CommentThread.tsx`:
  - Props: `contextType`, `contextId`
  - Displays flat list of comments: author name, body, created_at
  - Add comment form: textarea + submit button
  - Calls `addComment()` on submit; refreshes list

#### Acceptance Criteria
- Renders flat list of comments in chronological order
- Add comment form submits and new comment appears in list
- No reply/thread UI
- Author name displayed (not user ID)

#### Out of Scope
- No reply, react, or edit controls

#### Dependencies
- T-13-01

#### Tests Required
- Component renders with comments list
- New comment submitted → appears in list

#### Security Considerations
- None

#### Notes
- None

---

### T-13-04

**Task ID:** T-13-04
**Title:** Wire CommentThread into exercise, workout, and check-in context pages
**Owner Agent:** Frontend Agent
**Status:** TODO

#### Description
Embed the CommentThread component into the three context pages.

#### Inputs
- T-13-03 output

#### Outputs
- `app/client/workouts/[id]/page.tsx` — add `<CommentThread contextType="workout" contextId={workout.id} />` at the bottom
- `app/client/workouts/[id]/page.tsx` — per-exercise: add `<CommentThread contextType="exercise" contextId={exercise.id} />` per exercise row
- `app/client/check-ins/[id]/page.tsx` (or coach check-in detail) — add `<CommentThread contextType="checkin" contextId={checkin.id} />`

#### Acceptance Criteria
- Comments section present on workout detail page
- Comments section present per exercise in workout detail
- Comments section present on check-in detail page
- Both coach and client can see and add comments when viewing the same context

#### Out of Scope
- No threading or replies

#### Dependencies
- T-13-03

#### Tests Required
- Coach adds comment on workout → visible to client
- Client adds comment on exercise → visible to coach

#### Security Considerations
- None

#### Notes
- Check-in detail page may need to be created in this task if not already built in Slice 11

---

### T-13-05

**Task ID:** T-13-05
**Title:** QA — Comments
**Owner Agent:** QA Agent
**Status:** TODO

#### Description
Verify the flat comment system across all three context types.

#### Inputs
- T-13-01 through T-13-04 outputs

#### Outputs
- QA pass or bug report

#### Acceptance Criteria
- Coach can post a comment on a workout, exercise, and check-in
- Client can post a comment on a workout, exercise, and check-in
- Each comment attributed to correct author
- Comment by coach → client receives email notification (if enabled)
- Comment by client → coach receives email notification (if enabled)
- No threading/reply UI exists anywhere
- Outsider cannot view comments for another coach+client relationship

#### Out of Scope
- No notification settings UI (Slice 15)

#### Dependencies
- T-13-01 through T-13-04

#### Tests Required
- All three context types
- Email notification paths
- Cross-relationship access test

#### Security Considerations
- Confirm `author_id` is not spoofable from the client

#### Notes
- Block Slice 14 until this task is DONE

---

## Slice 14 — Payments UI

---

### T-14-01

**Task ID:** T-14-01
**Title:** Server Action: send manual payment reminder email
**Owner Agent:** Backend Agent
**Status:** TODO

#### Description
Implement the Server Action to send a one-off payment reminder email from a coach to a specific client.

#### Inputs
- T-13-05 (Slice 13 QA passed)

#### Outputs
- `server/actions/payments.ts`:
  - `sendPaymentReminder(clientId)` — validates client belongs to coach; fetches `default_payment_link_url` from `coach_profiles`; sends email to client via Resend with the payment link; gated on `notification_settings.payment_reminder_emails`

#### Acceptance Criteria
- `clientId` must belong to the authenticated coach
- Email includes coach's `default_payment_link_url`
- Gated on `payment_reminder_emails` notification setting
- Does NOT reference `client_payment_links` table

#### Out of Scope
- No per-client payment override
- No `client_payment_links` table access

#### Dependencies
- T-13-05

#### Tests Required
- Send reminder → email received with correct payment link
- `payment_reminder_emails = false` → email not sent
- Coach B cannot send reminder for Coach A's client

#### Security Considerations
- `clientId` ownership verified server-side

#### Notes
- `client_payment_links` must not be referenced anywhere in this action

---

### T-14-02

**Task ID:** T-14-02
**Title:** Add "Send Payment Reminder" button to /coach/clients/[id]
**Owner Agent:** Frontend Agent
**Status:** TODO

#### Description
Add a "Send Payment Reminder" button to the client profile page that triggers the manual reminder email.

#### Inputs
- T-14-01 output

#### Outputs
- `/coach/clients/[id]/page.tsx` updated:
  - "Send Payment Reminder" button
  - Calls `sendPaymentReminder(clientId)` on click
  - Loading state while sending; success/error feedback shown

#### Acceptance Criteria
- Button present on coach's client profile page
- Click sends email; success confirmation displayed
- Button is disabled or shows loading state during submission

#### Out of Scope
- No per-client payment override UI
- No payment status display

#### Dependencies
- T-14-01

#### Tests Required
- Click button → success message shown
- Email received by client

#### Security Considerations
- None; Server Action handles ownership

#### Notes
- None

---

### T-14-03

**Task ID:** T-14-03
**Title:** Display coach default payment link on /client/dashboard
**Owner Agent:** Frontend Agent
**Status:** TODO

#### Description
Show the coach's default payment link to the client on their dashboard.

#### Inputs
- Coach's `default_payment_link_url` from `coach_profiles`

#### Outputs
- `app/client/dashboard/page.tsx` updated:
  - If coach has a `default_payment_link_url`: display as a plainly labelled link/button (e.g., "Pay your coach")
  - If no URL set: section is hidden or shows "No payment link provided"

#### Acceptance Criteria
- Client sees the coach's default payment link as a clickable link
- Link opens in a new tab
- No per-client payment override displayed (only the coach's default)
- Section hidden gracefully if no URL is set

#### Out of Scope
- No per-client override link
- No payment status
- No `client_payment_links` table access

#### Dependencies
- T-05-01 (coach profile)

#### Tests Required
- Coach has payment link → client sees it
- Coach has no payment link → section hidden or shows placeholder

#### Security Considerations
- None

#### Notes
- `client_payment_links` must not be queried anywhere in this or any other component

---

### T-14-04

**Task ID:** T-14-04
**Title:** QA — Payments UI
**Owner Agent:** QA Agent
**Status:** TODO

#### Description
Verify default payment link display and manual payment reminder email.

#### Inputs
- T-14-01 through T-14-03 outputs

#### Outputs
- QA pass or bug report

#### Acceptance Criteria
- Client sees coach's default payment link on their dashboard
- Coach can send payment reminder; client receives email with the correct link
- No per-client payment override UI exists anywhere in the application
- No reference to `client_payment_links` table in any rendered page or network request
- Reminder not sent if `payment_reminder_emails = false`

#### Out of Scope
- No payment tracking or Stripe

#### Dependencies
- T-14-01 through T-14-03

#### Tests Required
- Payment link display
- Manual reminder send
- `client_payment_links` reference audit (grep codebase)

#### Security Considerations
- Confirm no code path touches `client_payment_links`

#### Notes
- Block Slice 15 until this task is DONE

---

## Slice 15 — Notification Settings and Event Email Wiring

---

### T-15-01

**Task ID:** T-15-01
**Title:** Server Actions: upsert and fetch notification settings
**Owner Agent:** Backend Agent
**Status:** TODO

#### Description
Implement Server Actions to manage a coach's notification settings.

#### Inputs
- T-14-04 (Slice 14 QA passed)

#### Outputs
- `server/actions/notificationSettings.ts`:
  - `getNotificationSettings()` — fetches `notification_settings` for authenticated coach; returns defaults (all true) if no row exists
  - `upsertNotificationSettings({ inviteEmails, planAssignedEmails, checkinReminderEmails, commentEmails, paymentReminderEmails })` — upserts `notification_settings` row for the coach

#### Acceptance Criteria
- If no settings row exists, `getNotificationSettings()` returns all-true defaults (does not throw)
- Upsert creates or updates the single row for the coach
- `coach_id` set from session only

#### Out of Scope
- No per-client notification settings

#### Dependencies
- T-14-04

#### Tests Required
- New coach with no settings row → get returns all true
- Upsert then get → updated values returned

#### Security Considerations
- `coach_id` from session only

#### Notes
- None

---

### T-15-02

**Task ID:** T-15-02
**Title:** Server Action: send manual check-in reminder email
**Owner Agent:** Backend Agent
**Status:** TODO

#### Description
Implement the Server Action for sending a manual check-in reminder email from coach to client.

#### Inputs
- T-15-01 output

#### Outputs
- `server/actions/reminders.ts`:
  - `sendCheckinReminder(clientId)` — validates client belongs to coach; sends reminder email to client via Resend; gated on `notification_settings.checkin_reminder_emails`

#### Acceptance Criteria
- `clientId` must belong to the authenticated coach
- Email sent immediately on action call (no scheduling or delay)
- Gated on `checkin_reminder_emails` setting
- No "days since last check-in" logic; purely manual

#### Out of Scope
- No automated or scheduled reminder logic
- No cron or background job

#### Dependencies
- T-15-01

#### Tests Required
- Send reminder → email received
- `checkin_reminder_emails = false` → email not sent
- Cross-coach ownership check

#### Security Considerations
- Ownership verified server-side

#### Notes
- This is a manual coach action only; no automation of any kind

---

### T-15-03

**Task ID:** T-15-03
**Title:** Audit and update all email-sending Server Actions to gate on notification settings
**Owner Agent:** Backend Agent
**Status:** TODO

#### Description
Update all previously built email-sending Server Actions to check the relevant notification settings flag before sending.

#### Inputs
- T-15-01 output
- All previously built email actions: `createClient` (invite), `assignWorkout` (workout assigned), `addComment` (comment), `sendPaymentReminder` (payment reminder)

#### Outputs
- `createClient` updated: gates invite email on `notification_settings.invite_emails`
- `assignWorkout` updated: gates workout-assigned email on `notification_settings.plan_assigned_emails`
- `addComment` updated: gates comment email on `notification_settings.comment_emails`
- `sendPaymentReminder` updated: gates payment reminder email on `notification_settings.payment_reminder_emails`
- All actions: if no settings row exists, treat as all-enabled (use `getNotificationSettings()` defaults)

#### Acceptance Criteria
- Each of the four actions checks its corresponding flag before sending
- If flag is false, email is not sent; action succeeds normally without email
- If no settings row, defaults to sending (consistent with all-true default)

#### Out of Scope
- No cron, retry, or scheduled logic

#### Dependencies
- T-15-01

#### Tests Required
- Toggle each flag to false → corresponding email not sent
- No settings row → emails sent (default behavior)

#### Security Considerations
- None

#### Notes
- None

---

### T-15-04

**Task ID:** T-15-04
**Title:** Build /coach/settings/notifications (notification settings toggle panel)
**Owner Agent:** Frontend Agent
**Status:** TODO

#### Description
Build the notification settings configuration page for coaches.

#### Inputs
- T-15-01 output

#### Outputs
- `app/coach/settings/notifications/page.tsx`:
  - Five toggle switches, one per setting:
    - Invite emails (`invite_emails`)
    - Workout assigned emails (`plan_assigned_emails`)
    - Check-in reminder emails (`checkin_reminder_emails`)
    - Comment emails (`comment_emails`)
    - Payment reminder emails (`payment_reminder_emails`)
  - Calls `upsertNotificationSettings()` on each toggle change
  - Pre-populates from `getNotificationSettings()`

#### Acceptance Criteria
- All five toggles present with correct labels
- Current settings pre-loaded
- Toggle change persists immediately (or on save)
- No notification center UI (inbox, read/unread, etc.)

#### Out of Scope
- No notification history or inbox
- No per-client notification settings

#### Dependencies
- T-15-01

#### Tests Required
- Toggle off → setting saved as false in DB
- Toggle on → setting saved as true in DB

#### Security Considerations
- None

#### Notes
- None

---

### T-15-05

**Task ID:** T-15-05
**Title:** Add "Send Check-in Reminder" button to /coach/clients/[id]
**Owner Agent:** Frontend Agent
**Status:** TODO

#### Description
Add a "Send Check-in Reminder" button to the coach's client profile page.

#### Inputs
- T-15-02 output

#### Outputs
- `/coach/clients/[id]/page.tsx` updated:
  - "Send Check-in Reminder" button
  - Calls `sendCheckinReminder(clientId)` on click
  - Loading and success/error states

#### Acceptance Criteria
- Button present on client profile page alongside "Send Payment Reminder"
- Click sends email; success feedback shown
- No automated trigger; this is a manual action only

#### Out of Scope
- No "days since last check-in" display
- No automated scheduling

#### Dependencies
- T-15-02

#### Tests Required
- Click button → email received

#### Security Considerations
- None; Server Action handles ownership

#### Notes
- None

---

### T-15-06

**Task ID:** T-15-06
**Title:** QA — Notification settings and all email gating
**Owner Agent:** QA Agent
**Status:** TODO

#### Description
Verify notification settings persist and that all email-sending actions respect the settings flags.

#### Inputs
- T-15-01 through T-15-05 outputs

#### Outputs
- QA pass or bug report

#### Acceptance Criteria
- Coach can toggle each of the five notification settings; changes persist
- Invite email not sent when `invite_emails = false`
- Workout-assigned email not sent when `plan_assigned_emails = false`
- Comment email not sent when `comment_emails = false`
- Payment reminder not sent when `payment_reminder_emails = false`
- Check-in reminder not sent when `checkin_reminder_emails = false`
- Check-in reminder is manually triggered only; no automated logic exists in codebase
- New coach with no settings row: all emails default to sending
- No cron jobs, background jobs, or scheduled tasks anywhere in codebase

#### Out of Scope
- No notification center UI testing (none exists)

#### Dependencies
- T-15-01 through T-15-05

#### Tests Required
- Full matrix: each flag toggled off → corresponding email suppressed
- Manual reminder buttons verified
- Codebase audit: grep for `cron`, `setTimeout` in email context, `pg_cron`, scheduled send

#### Security Considerations
- None

#### Notes
- Block Slice 16 until this task is DONE

---

## Slice 16 — Consent and Compliance

---

### T-16-01

**Task ID:** T-16-01
**Title:** Server Action: generate data export (JSON and CSV)
**Owner Agent:** Backend Agent
**Status:** TODO

#### Description
Implement the Server Action for a client to export all their data.

#### Inputs
- T-15-06 (Slice 15 QA passed)

#### Outputs
- `server/actions/compliance.ts`:
  - `exportClientData()` — queries all data for the authenticated client from: `client_profiles`, `check_ins`, `progress_photos` (storage paths only), `assigned_workouts`, `assigned_workout_exercises`, `comments` authored by the client; returns as a JSON object
  - JSON is converted to CSV for the CSV export option (separate response format, same query)

#### Acceptance Criteria
- Returns only the authenticated client's own data
- Includes all tables listed above
- Does not include any other user's data
- CSV derivable from the same JSON structure

#### Out of Scope
- No coach data export
- No admin export tool

#### Dependencies
- T-15-06

#### Tests Required
- Export returns rows only for the authenticated client
- Another client's data does not appear in the export

#### Security Considerations
- `client_id` derived from session; never from request parameter

#### Notes
- None

---

### T-16-02

**Task ID:** T-16-02
**Title:** Server Action: account deletion
**Owner Agent:** Backend Agent
**Status:** TODO

#### Description
Implement the Server Action for a client to permanently delete their account and all associated data.

#### Inputs
- T-16-01 output

#### Outputs
- `server/actions/compliance.ts` addition:
  - `deleteMyAccount()`:
    1. Fetches all `progress_photos.storage_path` for the client
    2. Deletes all storage objects from Supabase Storage
    3. Deletes rows from: `progress_photos`, `check_ins`, `comments` (where `author_id = client_id`), `assigned_workout_exercises` (for own assignments), `assigned_workouts`, `client_profiles`, `users`
    4. Signs the user out after deletion

#### Acceptance Criteria
- All DB rows for the client removed from all relevant tables
- All Supabase Storage objects for the client removed
- Client is signed out after deletion
- Action is irreversible; no soft delete
- `users` row deletion triggers Supabase Auth user deletion (or marks as deleted)

#### Out of Scope
- No admin-triggered deletion from this action

#### Dependencies
- T-16-01

#### Tests Required
- Delete account → verify 0 rows remain in all listed tables for that client_id
- Verify storage objects removed
- Attempt login after deletion → fails

#### Security Considerations
- `client_id` from session only; cannot delete another user's account
- Enumerate all 14 tables to ensure no orphaned data

#### Notes
- Storage deletion must happen before DB row deletion to avoid orphaned storage paths

---

### T-16-03

**Task ID:** T-16-03
**Title:** Build /client/settings/data (export and deletion page)
**Owner Agent:** Frontend Agent
**Status:** TODO

#### Description
Build the client-facing data settings page with export and account deletion functionality.

#### Inputs
- T-16-01, T-16-02 outputs

#### Outputs
- `app/client/settings/data/page.tsx`:
  - Read-only consent status display: "Health data consent: Yes/No", "Photo consent: Yes/No"
  - "Export My Data (JSON)" button — calls `exportClientData()` and triggers browser download
  - "Export My Data (CSV)" button — same, CSV format
  - "Delete My Account" button — opens confirmation dialog; on confirm calls `deleteMyAccount()`

#### Acceptance Criteria
- Consent status displayed as read-only (not editable here)
- JSON export triggers a file download
- CSV export triggers a file download
- Delete button requires explicit confirmation before proceeding
- After deletion: user is signed out and redirected to `/auth/login`

#### Out of Scope
- No consent re-collection on this page

#### Dependencies
- T-16-01, T-16-02

#### Tests Required
- Export JSON → file downloads with correct data
- Export CSV → file downloads with correct format
- Delete → confirmation required → deletion confirmed → user signed out

#### Security Considerations
- Confirmation dialog prevents accidental deletion; action is irreversible

#### Notes
- None

---

### T-16-04

**Task ID:** T-16-04
**Title:** QA — Consent display, data export, and account deletion
**Owner Agent:** QA Agent
**Status:** TODO

#### Description
Verify data export and account deletion work correctly and completely.

#### Inputs
- T-16-01 through T-16-03 outputs

#### Outputs
- QA pass or bug report

#### Acceptance Criteria
- Consent status shown correctly on the settings page (matches values in DB)
- JSON export contains all client data from all required tables
- CSV export is a valid CSV file with the same data
- Account deletion removes all rows from all tables for the client (verified by checking DB after deletion)
- Supabase Storage objects deleted (verified by attempting to access storage path after deletion)
- User is signed out after deletion; cannot log back in

#### Out of Scope
- No admin deletion testing

#### Dependencies
- T-16-01 through T-16-03

#### Tests Required
- Post-deletion DB audit across all listed tables
- Post-deletion storage access attempt
- Export data accuracy check

#### Security Considerations
- Confirm another client's data is not included in export

#### Notes
- Block Slice 17 until this task is DONE

---

## Slice 17 — Admin Panel

---

### T-17-01

**Task ID:** T-17-01
**Title:** Server Actions: list all users and fetch user profile (admin read-only)
**Owner Agent:** Backend Agent
**Status:** TODO

#### Description
Implement admin-scoped read-only Server Actions for the admin panel.

#### Inputs
- T-16-04 (Slice 16 QA passed)

#### Outputs
- `server/actions/admin.ts`:
  - `listAllUsers()` — returns all rows from `users` with `email`, `role`, `created_at`; requires admin role
  - `getUserProfile(userId)` — fetches `coach_profiles` or `client_profiles` based on the user's role; requires admin role

#### Acceptance Criteria
- Both actions verify the caller has `role = admin` before executing
- No INSERT, UPDATE, or DELETE operations exist in this file
- Returns data for all users regardless of coach relationship

#### Out of Scope
- No admin write actions

#### Dependencies
- T-16-04

#### Tests Required
- Admin session → full user list returned
- Non-admin session → rejected (403 or empty)
- INSERT attempt via admin action → no such action exists (code review)

#### Security Considerations
- Admin role check must be at the Server Action level, not only at the route level

#### Notes
- None

---

### T-17-02

**Task ID:** T-17-02
**Title:** Build /admin/users (user list page)
**Owner Agent:** Frontend Agent
**Status:** TODO

#### Description
Build the admin user list page.

#### Inputs
- T-17-01 output

#### Outputs
- `app/admin/users/page.tsx`:
  - Paginated list of all users: email, role, created_at
  - Link to user profile per row

#### Acceptance Criteria
- Lists all users regardless of coach relationship
- Pagination if user count is large
- Each row links to `/admin/users/[id]`
- No edit, delete, or impersonation controls

#### Out of Scope
- No edit or delete controls anywhere on this page

#### Dependencies
- T-17-01

#### Tests Required
- Admin sees all users
- No write controls present

#### Security Considerations
- Page protected by middleware (admin role only)

#### Notes
- None

---

### T-17-03

**Task ID:** T-17-03
**Title:** Build /admin/users/[id] (user profile view)
**Owner Agent:** Frontend Agent
**Status:** TODO

#### Description
Build the admin read-only user profile view page.

#### Inputs
- T-17-01, T-17-02 outputs

#### Outputs
- `app/admin/users/[id]/page.tsx`:
  - If role = coach: displays coach profile (display_name, business_name, created_at); no payment link displayed
  - If role = client: displays client profile (display_name, email, coach name, consent status, created_at)
  - No edit, delete, or impersonation controls

#### Acceptance Criteria
- Correct profile data displayed based on user role
- No edit controls anywhere on the page
- No impersonation button
- Admin can view any user's profile

#### Out of Scope
- No editing capability

#### Dependencies
- T-17-01

#### Tests Required
- Admin views coach profile → correct data displayed
- Admin views client profile → correct data displayed
- No form or button that submits data

#### Security Considerations
- Do not display `default_payment_link_url` or sensitive fields to admin unnecessarily

#### Notes
- None

---

### T-17-04

**Task ID:** T-17-04
**Title:** QA — Admin panel
**Owner Agent:** QA Agent
**Status:** TODO

#### Description
Verify the admin panel is read-only and correctly scoped.

#### Inputs
- T-17-01 through T-17-03 outputs

#### Outputs
- QA pass or bug report

#### Acceptance Criteria
- Admin can view all users and profiles
- No write actions available on any admin page
- Coach and client sessions cannot access `/admin/*` routes (middleware blocks)
- Admin Server Actions reject non-admin callers
- No impersonation functionality exists

#### Out of Scope
- No feature testing beyond admin panel

#### Dependencies
- T-17-01 through T-17-03

#### Tests Required
- Admin views coach and client profiles
- Non-admin session attempts to access `/admin/*` → redirected
- Non-admin calls admin Server Action → rejected
- Codebase audit: no admin INSERT/UPDATE/DELETE

#### Security Considerations
- Admin protection verified at both middleware and Server Action levels

#### Notes
- This is the final task. All slices complete when T-17-04 is DONE.

---

## Task Summary

| Slice | Task Range | Count | Blocking |
|---|---|---|---|
| 1 — Project Scaffold | T-01-01 to T-01-05 | 5 | T-01-05 blocks Slice 2 |
| 2 — Database Schema | T-02-01 to T-02-07 | 7 | T-02-07 blocks Slice 3 |
| 3 — Auth and Role Routing | T-03-01 to T-03-08 | 8 | T-03-08 blocks Slice 4 |
| 4 — RLS Policies | T-04-01 to T-04-07 | 7 | T-04-07 blocks Slices 5, 6, 7 |
| 5 — Coach Profile | T-05-01 to T-05-04 | 4 | T-05-04 blocks Slice 6 |
| 6 — Client Management | T-06-01 to T-06-07 | 7 | T-06-07 blocks Slices 7, 9 |
| 7 — Exercise Library | T-07-01 to T-07-04 | 4 | T-07-04 blocks Slice 8 |
| 8 — Workout Templates | T-08-01 to T-08-05 | 5 | T-08-05 blocks Slice 9 |
| 9 — Workout Assignment | T-09-01 to T-09-05 | 5 | T-09-05 blocks Slice 10 |
| 10 — Client Workout Experience | T-10-01 to T-10-05 | 5 | T-10-05 blocks Slice 11 |
| 11 — Check-ins and Photos | T-11-01 to T-11-07 | 7 | T-11-07 blocks Slice 12 |
| 12 — Progress Timeline | T-12-01 to T-12-03 | 3 | T-12-03 blocks Slice 13 |
| 13 — Comments | T-13-01 to T-13-05 | 5 | T-13-05 blocks Slice 14 |
| 14 — Payments UI | T-14-01 to T-14-04 | 4 | T-14-04 blocks Slice 15 |
| 15 — Notification Settings | T-15-01 to T-15-06 | 6 | T-15-06 blocks Slice 16 |
| 16 — Consent and Compliance | T-16-01 to T-16-04 | 4 | T-16-04 blocks Slice 17 |
| 17 — Admin Panel | T-17-01 to T-17-04 | 4 | — |
| **Total** | | **100** | |
