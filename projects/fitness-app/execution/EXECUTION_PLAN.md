# Execution Plan

## Project Name

Fitness Coach Management Platform

---

## Source Documents

- `projects/fitness-app/spec/PRD.md`
- `projects/fitness-app/spec/ARCHITECTURE.md`
- `projects/fitness-app/spec/SCHEMA.md`

---

## Scope Summary

A web-based SaaS platform for independent fitness coaches to manage clients, assign
workout plans (as snapshots), track client progress, collect payments via a stored
default link, and communicate via flat comments. Clients can view workouts, complete
exercises, submit check-ins, and upload progress photos. Email notifications are
event-triggered or manually sent by coaches — no background jobs.

**Stack:** Next.js (App Router) + TypeScript + Tailwind CSS + shadcn/ui, Supabase
(Postgres, Auth, Storage), Resend (email), Vercel (hosting).

**Schema tables: 14**
`organizations`, `users`, `coach_profiles`, `client_profiles`, `exercises`,
`workout_templates`, `workout_template_exercises`, `assigned_workouts`,
`assigned_workout_exercises`, `check_ins`, `progress_photos`, `comments`,
`notification_settings`, `client_payment_links`

**Roles:** coach, client, admin

---

## Explicitly Out of Scope

The following are confirmed out of scope for v1. They MUST NOT appear as tasks,
UI elements, workflows, or Server Actions anywhere in this plan.

| Item | Reason |
|---|---|
| Per-client payment override UI | `client_payment_links` is schema-only / future-proofing — no UI or workflow |
| Payment status tracking | PRD non-goal; spec guardrail |
| Stripe API integration | PRD non-goal |
| Cron jobs or scheduled/background jobs | Spec guardrail — manual emails only |
| "No check-in in X days" automated logic | Requires background job — not allowed |
| Notification retry system | Spec guardrail |
| Notification center UI | Spec guardrail |
| Global exercise library UI | `is_global` is schema-only; coach-scoped library only |
| Workout scheduling engine | PRD non-goal |
| Recurring plans | PRD non-goal |
| Native mobile apps | PRD non-goal |
| Charts / analytics dashboards | PRD non-goal |
| Coach teams / multi-user orgs | PRD non-goal; `org_id` is schema-only |
| Push notifications | PRD non-goal |
| Messaging system beyond flat comments | PRD non-goal |
| `org_id` UI or workflows | Future-proofing field — schema only |
| `tempo` UI | Future-proofing field — schema only |
| `trial_started_at`, `trial_ends_at`, `subscription_status` UI | Future-proofing fields — schema only |

---

## Build Strategy

- Work slice-by-slice; no slice may begin until its dependency slice passes QA and review
- Foundation is split into four dedicated slices (scaffold → schema → auth → RLS) — never combined
- Each slice is small enough to implement, test, review, and fix independently
- Server Actions handle all writes, validation, permissions, and email side effects
- RLS enforces data access at the database level for all 14 tables
- Assigned workouts are snapshots: template data is copied in full at assignment time
- Emails are event-triggered or coach-triggered manual sends only — no cron, no background jobs

---

## Slices

---

### Slice 1 — Project Scaffold

**Goal:** Initialize the Next.js application with the required tooling, folder structure, and environment configuration. No business logic.

**Tasks:**
- Create Next.js App Router project with TypeScript, Tailwind CSS, and shadcn/ui
- Set up directory structure: `app/coach/`, `app/client/`, `app/admin/`, `app/auth/`, `components/`, `lib/`, `server/`
- Configure Supabase browser and server clients in `lib/supabase/`
- Add environment variable placeholders (Supabase URL, anon key, service role key, Resend API key) in `.env.example`
- Deploy blank app to Vercel to confirm CI/CD pipeline works

**Dependencies:** None

**Acceptance Criteria:**
- App builds and runs locally without errors
- Folder structure matches architecture spec
- Supabase client initializes successfully with valid env vars
- Blank app deploys to Vercel without errors

**Risks:**
- Pin shadcn/ui version explicitly to avoid incompatibility with Next.js App Router

---

### Slice 2 — Database Schema

**Goal:** Apply all 14 table migrations in Supabase with correct columns, types, foreign keys, and indexes. No RLS yet.

**Tasks:**
- Write and apply migrations for all 14 tables in dependency order:
  1. `organizations`
  2. `users`
  3. `coach_profiles`
  4. `client_profiles`
  5. `exercises`
  6. `workout_templates`
  7. `workout_template_exercises`
  8. `assigned_workouts`
  9. `assigned_workout_exercises`
  10. `check_ins`
  11. `progress_photos`
  12. `comments`
  13. `notification_settings`
  14. `client_payment_links`
- Use UUIDs for all primary keys
- Use `text` type for flexible workout fields (sets, reps, weight, rest, rpe, notes, tempo)
- Add indexes on `coach_id`, `client_id`, `org_id` across all relevant tables

**Dependencies:** Slice 1

**Acceptance Criteria:**
- All 14 tables exist with correct columns and types matching SCHEMA.md
- Foreign key constraints valid; migrations run cleanly in dependency order
- All specified indexes are confirmed in Supabase dashboard
- No RLS policies active yet (deferred to Slice 4)

**Risks:**
- Foreign key ordering in migrations must be respected (e.g., `organizations` before `users`)
- `client_payment_links` table must be created exactly as specified but will not produce any UI or Server Action

---

### Slice 3 — Auth and Role Routing

**Goal:** Implement magic link login, optional password setup, role-based routing, and route protection.

**Tasks:**
- Configure Supabase Auth with magic link provider enabled
- Build `/auth/login` page — email input form that sends a magic link
- Build `/auth/callback` route — handles magic link token exchange
- Server Action: optional password setup after first magic link login
- Server Action: assign role to user on first login (coach on self-signup; client via invite — role = client)
- Add route protection middleware: unauthenticated users redirect to `/auth/login`; role-based redirect on login:
  - Coach → `/coach/dashboard`
  - Client → `/client/dashboard`
  - Admin → `/admin/dashboard`
- Add empty layout shells for `/coach`, `/client`, `/admin` areas (no features yet)

**Dependencies:** Slice 2

**Acceptance Criteria:**
- Coach can sign up via magic link and land on `/coach/dashboard`
- Client arrives via invite and lands on `/client/dashboard` after accepting
- Admin can access `/admin/dashboard`
- Coach cannot access client or admin routes; client cannot access coach or admin routes
- Unauthenticated users are redirected to `/auth/login`
- Role assignment is server-authoritative; no client-set role writes

**Risks:**
- Supabase Auth callback URL must be configured per environment (local, Vercel preview, production)
- Invite-based client role assignment must not conflict with coach self-signup flow

---

### Slice 4 — RLS Policies and Permission Tests

**Goal:** Enforce row-level security on all 14 tables. Verify no cross-user data leakage.

**Tasks:**
- Write and enable RLS policies for all 14 tables:
  - Coach: read/write own rows (scoped by `coach_id` or `created_by`)
  - Client: read/write own rows (scoped by `client_id`)
  - Admin: read-only on all tables; no write policies
  - No unauthenticated access to any table
- Write permission verification tests:
  - Coach A cannot read Coach B's clients, templates, or assigned workouts
  - Client X cannot read Client Y's check-ins or photos
  - Admin can read all rows but all writes are rejected
  - Unauthenticated requests return empty result or error
  - `comments` and `progress_photos`: both the owning coach and the associated client can read; outsiders cannot

**Dependencies:** Slice 3

**Acceptance Criteria:**
- RLS enabled on all 14 tables
- All cross-user access tests fail as expected
- Admin write attempts rejected at DB level
- Comment and photo RLS verified for coach+client shared access
- All tests pass before any feature slice begins

**Risks:**
- `comments` RLS must allow both coach and client in the same relationship to read and write; must block all others
- Missing RLS on any table is a security vulnerability — all 14 must be covered

---

### Slice 5 — Coach Profile

**Goal:** Coach can set up and edit their profile, including their default payment link URL.

**Tasks:**
- Build profile setup flow shown to coach after first login if profile is incomplete
- Build `/coach/settings/profile` — profile edit page
- Fields: `display_name`, `business_name`, `default_payment_link_url`
- Server Action: create/update `coach_profiles` with server-side input validation

**Dependencies:** Slice 4

**Acceptance Criteria:**
- Coach can create and update their profile
- `default_payment_link_url` is stored correctly in `coach_profiles`
- Profile is scoped to the authenticated coach (RLS enforced)
- Incomplete profile prompts setup before accessing other coach features

**Risks:**
- None significant

**Guardrail note:** `trial_started_at`, `trial_ends_at`, and `subscription_status` columns exist in `coach_profiles` but have no UI, no default values set by this slice beyond NULL, and no logic.

---

### Slice 6 — Client Management and Invite

**Goal:** Coach can create clients, send invite emails, and view client list and profiles. Clients accept invites and grant consent at onboarding.

**Tasks:**
- Build `/coach/clients` — client list page showing all clients belonging to the coach
- Build `/coach/clients/new` — create client form (display_name, email)
- Server Action: create `users` record (role = client) + `client_profiles` record, then send invite email via Resend
- Build invite acceptance flow at `/auth/accept-invite?token=...`:
  - Validate token (time-limited, single-use)
  - Client completes account setup (magic link or password)
  - Collect consent: `consented_health_data`, `consented_progress_photos` (both required before proceeding)
  - Record consent on `client_profiles`
- Build `/coach/clients/[id]` — client profile view (read-only display of name, email, consent status)
- Email: invite email with accept link (fires on client creation)

**Dependencies:** Slice 5

**Acceptance Criteria:**
- Coach creates a client → invite email sent → client appears in coach's client list
- Client follows invite link, completes setup, and grants consent
- Consent values are saved server-side on `client_profiles`
- Coach sees client list and individual profile; cannot see other coaches' clients (RLS enforced)
- Invite token is invalidated after first use

**Risks:**
- Invite token must be time-limited and single-use; store expiry and used-at in DB
- Consent must be recorded server-side before client can access any platform features

---

### Slice 7 — Exercise Library

**Goal:** Coach can create and list exercises for use in workout templates.

**Tasks:**
- Build `/coach/exercises` — exercise list page (scoped to the coach)
- Build exercise creation/edit form (name, description; `video_url` stored but no playback UI)
- Server Action: create exercise (sets `created_by` to authenticated coach's user_id)
- Server Action: list exercises by `created_by`

**Dependencies:** Slice 4

**Acceptance Criteria:**
- Coach can create and view their own exercises
- Exercises are scoped to the creating coach; other coaches cannot access them (RLS enforced)
- `video_url` field is stored; no video player or preview UI is built

**Risks:**
- None significant

**Guardrail note:** `is_global` field exists in schema; it must default to false and has no UI. No global exercise library UI is built.

---

### Slice 8 — Workout Templates

**Goal:** Coach can create workout templates, add exercises, and configure all required exercise fields.

**Tasks:**
- Build `/coach/templates` — template list page
- Build `/coach/templates/new` and `/coach/templates/[id]` — template create/edit pages
- Build add-exercise flow within a template:
  - Fields exposed in UI: sets, reps, weight, rest, RPE, notes, position
  - No tempo UI (field is future-proofing; stored in DB but not shown)
- Allow reordering exercises (position field on `workout_template_exercises`)
- Server Actions: create template, update template, add exercise, update exercise, remove exercise, reorder exercises

**Dependencies:** Slice 7

**Acceptance Criteria:**
- Coach can create templates and add exercises with all PRD-required fields (sets, reps, weight, rest, RPE, notes)
- `tempo` field is NOT exposed anywhere in UI
- Templates are scoped to the coach (RLS enforced)
- Exercise ordering persists correctly

**Risks:**
- Exercises referenced in templates must exist (validate `exercise_id` exists and belongs to the coach)

---

### Slice 9 — Workout Assignment

**Goal:** Coach assigns a workout template to a client as an immutable snapshot with a date and label. Client receives an email.

**Tasks:**
- Build assignment form accessible from `/coach/clients/[id]`: select template, set `assigned_date`, set `label`
- Server Action: create `assigned_workouts` record, then copy all template exercises into `assigned_workout_exercises` as a full denormalized snapshot (copy exercise_name, exercise_description, video_url, position, sets, reps, weight, rest, rpe, tempo, notes — no FK to template exercises)
- Build `/coach/clients/[id]/workouts` — list of assigned workouts per client with date and label
- Email: workout-assigned notification to client via Resend (gated on `notification_settings.plan_assigned_emails`)

**Dependencies:** Slices 6, 8

**Acceptance Criteria:**
- Assigned workout is a complete snapshot at assignment time
- Editing or deleting the source template does not modify any existing assigned workout
- `source_template_id` stored for reference only; no sync logic exists
- Coach sees all assigned workouts per client
- Client receives workout-assigned email if notification setting is enabled
- Snapshot copy is atomic; no partial copies persisted on failure

**Risks:**
- Snapshot copy must be performed in a single Server Action transaction
- `tempo` is copied as data into the snapshot column but never displayed in UI

---

### Slice 10 — Client Workout Experience

**Goal:** Client can view their assigned workouts, mark exercises complete, and add notes at the exercise and workout level.

**Tasks:**
- Build `/client/workouts` — list of assigned workouts for the logged-in client
- Build `/client/workouts/[id]` — workout detail with exercise list
- Allow client to mark each exercise complete (sets `completed_at` on `assigned_workout_exercises`)
- Allow client to add notes per exercise (updates `notes` on `assigned_workout_exercises`)
- Allow client to add notes to the overall workout (updates `notes` on `assigned_workouts`)
- Server Actions: mark exercise complete/incomplete, update exercise notes, update workout notes
- Coach can see client completion state on `/coach/clients/[id]/workouts/[id]`

**Dependencies:** Slice 9

**Acceptance Criteria:**
- Client sees only their own assigned workouts (RLS enforced)
- Client can toggle exercise completion and add notes; changes persist
- Coach can view client's completion state

**Risks:**
- `notes` on `assigned_workout_exercises` is a single column; client notes overwrite any coach-authored notes copied from the template at assignment time. This is acceptable for MVP.

---

### Slice 11 — Check-ins and Photo Upload

**Goal:** Client can submit check-ins with weight, mood, adherence, and comments. Client can upload progress photos if photo consent was given.

**Tasks:**
- Configure Supabase Storage private bucket for progress photos
- Build `/client/check-ins/new` — check-in submission form (weight, mood 1–5, adherence 0–100, comments)
- Build photo upload component (gated server-side on `consented_progress_photos = true`)
- Server Action: create `check_ins` record; if photos included, upload to private bucket and create `progress_photos` records with `storage_path`
- Server Action: generate signed URLs for photos when fetching check-ins
- Build `/client/check-ins` — client's own check-in history
- Build `/coach/clients/[id]/check-ins` — coach view of client check-ins with photos

**Dependencies:** Slice 6

**Acceptance Criteria:**
- Client can submit a complete check-in with all required fields
- Photo upload is blocked if `consented_progress_photos = false` (checked server-side)
- Photos stored in private Supabase Storage bucket; accessible only via signed URLs
- Coach can view all check-ins and photos for their clients (signed URLs generated server-side)
- Client cannot view another client's check-ins (RLS enforced)

**Risks:**
- Signed URL TTL should be set to 1 hour; regenerate on each page load
- Photo consent check must be enforced in the Server Action, not only in UI

---

### Slice 12 — Progress Timeline

**Goal:** Coach can view a client's check-ins and progress photos as a chronological timeline. No charts.

**Tasks:**
- Build `/coach/clients/[id]/progress` — timeline view
- Display check-ins in reverse chronological order: date, weight, mood, adherence, comments
- Display associated progress photos (inline via signed URLs) per check-in entry
- No charts, graphs, or analytics UI

**Dependencies:** Slice 11

**Acceptance Criteria:**
- Coach sees all check-ins for a client in a timeline
- Photos render correctly via signed URLs
- No chart or analytics component is present anywhere on this page
- Coach cannot access another coach's client progress (RLS enforced)

**Risks:**
- Batch signed URL generation for multiple photos per check-in should be done in a single Server Action call

---

### Slice 13 — Comments

**Goal:** Coach and client can post flat comments on exercises, workouts, and check-ins. A new comment triggers an email notification to the other party.

**Tasks:**
- Build reusable `CommentThread` component (flat list + add comment form)
- Wire `CommentThread` into:
  - Exercise detail in client workout view (context_type = `exercise`)
  - Workout detail page (context_type = `workout`)
  - Check-in detail view (context_type = `checkin`)
- Server Action: create `comments` record with `context_type`, `context_id`, `author_id`, `coach_id`, `client_id`, `body`
- Server Action: list comments by context_type + context_id
- Email: on new comment, notify the other party via Resend (coach → send to client; client → send to coach), gated on `notification_settings.comment_emails`
- No threading; flat list only

**Dependencies:** Slices 10, 11

**Acceptance Criteria:**
- Coach and client can both add and view comments on all three context types
- Comments are correctly attributed to their author
- Email fires to the other party on new comment (if notification setting enabled)
- No reply/thread UI exists
- RLS ensures comments are visible only to the coach and client in that relationship; outsiders cannot read or write

**Risks:**
- `comments` RLS must allow both coach and client in the same relationship to read/write; must block all others
- Email recipient logic: derive from `author_id` — if author is the coach, send to client; if author is the client, send to coach

---

### Slice 14 — Payments UI

**Goal:** Coach can view and update their default payment link. Client sees the coach's default payment link. Coach can manually send a payment reminder email to a client.

**Tasks:**
- Confirm `default_payment_link_url` field is present and editable in `/coach/settings/profile` (built in Slice 5)
- Build "Send Payment Reminder" button on `/coach/clients/[id]`
- Server Action: send manual payment reminder email to a specific client via Resend (gated on `notification_settings.payment_reminder_emails`)
- Display coach's `default_payment_link_url` as a plain link on the client dashboard (`/client/dashboard`)

**Dependencies:** Slices 5, 6

**Acceptance Criteria:**
- Coach can view and update `default_payment_link_url` in profile settings
- Client sees the coach's default payment link on their dashboard as a plain link/button
- Coach can trigger a manual one-off payment reminder email for any client
- No per-client payment override UI exists anywhere in the application
- `client_payment_links` table exists in the database but is not referenced by any Server Action, UI, or workflow

**Risks:**
- None significant

**Guardrail note:** `client_payment_links` is a schema-only future-proofing table. It must not be touched by any Server Action, query, or UI component in v1.

---

### Slice 15 — Notification Settings and Event Email Wiring

**Goal:** Coach can configure global notification settings. All event-triggered and manual emails respect these settings.

**Tasks:**
- Build `/coach/settings/notifications` — toggle panel for all five notification settings:
  - `invite_emails`
  - `plan_assigned_emails`
  - `checkin_reminder_emails`
  - `comment_emails`
  - `payment_reminder_emails`
- Server Action: create/update `notification_settings` for the coach (defaults all to true on first coach creation)
- Server Action: fetch notification settings by coach
- Build "Send Check-in Reminder" button on `/coach/clients/[id]` — triggers manual email to client via Resend
- Server Action: send manual check-in reminder email (gated on `notification_settings.checkin_reminder_emails`)
- Audit and update all prior email-sending Server Actions to gate on the relevant notification setting flag:
  - Invite email (Slice 6) → gate on `invite_emails`
  - Workout-assigned email (Slice 9) → gate on `plan_assigned_emails`
  - Comment email (Slice 13) → gate on `comment_emails`
  - Payment reminder email (Slice 14) → gate on `payment_reminder_emails`

**Dependencies:** Slices 6, 9, 13, 14

**Acceptance Criteria:**
- Coach can toggle each notification type on/off; changes persist
- Disabling a notification type prevents that email from being sent
- Check-in reminder email is manual only: coach clicks a button, email is sent immediately
- Payment reminder email is manual only: coach clicks a button, email is sent immediately
- All previously built event emails respect their corresponding notification settings flag
- No cron jobs, scheduled jobs, background tasks, or "X days without check-in" logic exists anywhere

**Risks:**
- Notification settings must default to all-enabled on first coach creation; test that flag check does not throw when settings row does not yet exist

---

### Slice 16 — Consent and Compliance

**Goal:** Display client consent status. Provide data export (JSON/CSV) and account deletion.

**Tasks:**
- Build `/client/settings/data` page with:
  - Read-only display of `consented_health_data` and `consented_progress_photos` status
  - "Export My Data" button (downloads JSON)
  - "Export as CSV" button (downloads CSV)
  - "Delete My Account" button (with confirmation dialog)
- Server Action: generate data export — query all client data across `check_ins`, `progress_photos`, `assigned_workouts`, `assigned_workout_exercises`, `comments` for the authenticated client; return as JSON; derive CSV from same query
- Server Action: account deletion — hard delete of `client_profiles`, `check_ins`, `progress_photos` (including Supabase Storage objects), `comments` authored by client, and `users` record for the authenticated client

**Dependencies:** Slice 11

**Acceptance Criteria:**
- Client can download a complete JSON export of their own data
- Client can download a CSV export of their own data
- Client can delete their account; all associated database rows and storage objects are removed
- Consent status is displayed read-only; it was captured at onboarding (Slice 6) and is not re-editable here
- Export does not include any other user's data

**Risks:**
- Deletion must enumerate all 14 tables and remove or cascade; missing a table creates a compliance risk
- Supabase Storage objects for progress photos must be deleted via storage API, not only the `progress_photos` DB record

---

### Slice 17 — Admin Panel

**Goal:** Admin users can view all users and profiles. Read-only. No editing or impersonation.

**Tasks:**
- Build `/admin/users` — paginated list of all users (email, role, created_at)
- Build `/admin/users/[id]` — view coach profile or client profile depending on role (read-only display)
- No edit, delete, or impersonation actions
- Confirm Slice 4 admin RLS policies apply; verify no write paths exist for admin role

**Dependencies:** Slices 4, 5, 6

**Acceptance Criteria:**
- Admin can view all users regardless of coach relationship
- Admin can view both coach and client profiles in read-only mode
- No write actions are available; all admin Server Actions are SELECT-only
- Coach and client users cannot reach `/admin` routes (middleware enforced)

**Risks:**
- Admin routes must be protected at both middleware level and Server Action level; a single protection point is insufficient

---

## Global Risks

| Risk | Mitigation |
|---|---|
| RLS misconfiguration exposing cross-user data | Run full permission test suite after Slice 4; spot-check again after each subsequent feature slice |
| Snapshot copy fails mid-transaction | Use atomic Server Action for workout assignment; validate no partial copies persist on error |
| Signed URL expiry too long or too short | Set 1-hour TTL; regenerate on each page load; do not cache in client state |
| Invite token not invalidated after use | Store `used_at` timestamp in DB; reject tokens that are expired or already used |
| Future-proofing fields surfaced in UI by mistake | QA must verify no UI exposes `org_id`, `tempo`, `is_global`, trial, or subscription fields |
| `client_payment_links` referenced in code | QA must verify no Server Action or component references this table |
| Email deliverability failure | Verify Resend domain, SPF, and DKIM records before Slice 6; test all email types in staging |
| Deletion missing storage objects | Account deletion Server Action must call Supabase Storage delete for each photo path; tested explicitly |
| Notification settings row missing for new coach | Default all flags to true on coach creation; Server Actions must handle missing settings row without throwing |

---

## Recommended Build Order

```
Slice 1  → Project Scaffold
Slice 2  → Database Schema
Slice 3  → Auth and Role Routing
Slice 4  → RLS Policies and Permission Tests
Slice 5  → Coach Profile
Slice 6  → Client Management and Invite
Slice 7  → Exercise Library
Slice 8  → Workout Templates
Slice 9  → Workout Assignment
Slice 10 → Client Workout Experience
Slice 11 → Check-ins and Photo Upload
Slice 12 → Progress Timeline
Slice 13 → Comments
Slice 14 → Payments UI
Slice 15 → Notification Settings and Event Email Wiring
Slice 16 → Consent and Compliance
Slice 17 → Admin Panel
```

Slices 7 and 8 have no dependency on Slices 5 and 6 and can be built in parallel if two
agents are available. All other slices must follow the order above.

---

## QA Strategy

- QA runs after every slice before the next slice begins; no exceptions
- Each slice is verified against its own acceptance criteria
- RLS cross-user access tests run after Slice 4 and are spot-checked after each data slice
- Snapshot immutability: after Slice 9, modify source template, confirm assigned workout is unchanged
- All five email types tested end-to-end in Slice 15: trigger event, verify email received; toggle setting off, verify email suppressed
- Account deletion tested in Slice 16: verify all rows and storage objects removed across all 14 tables
- Admin write-block tested in Slice 17: confirm all admin POST/PATCH attempts are rejected
- QA must verify at every slice that no out-of-scope UI exists (cron logic, per-client payment override, global exercise library, tempo fields, org/trial/subscription UI)
- QA reports bugs only; does not fix

---

## Release Criteria

- All 17 slices pass QA and code review
- RLS verified and tested on all 14 tables
- Auth flows (magic link, role routing, invite acceptance) tested end-to-end
- Snapshot model verified: template edits do not mutate existing assigned workouts
- Consent gates enforced server-side for health data and photo uploads
- Data export returns complete client data in both JSON and CSV formats
- Account deletion removes all data from all 14 tables and all storage objects
- All five email notification types fire correctly and respect notification settings flags
- Check-in reminder and payment reminder emails are manual (coach-triggered) only — no scheduled logic present
- Coach default payment link visible to client; `client_payment_links` table has no UI or workflow references
- Admin panel is read-only; no write paths exist for admin role
- No out-of-scope features present in the codebase
- Application deployed and stable on Vercel + Supabase production environment
