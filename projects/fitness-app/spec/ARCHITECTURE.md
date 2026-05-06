# Architecture Document

## Stack

Frontend:

* Next.js (App Router)
* React
* TypeScript
* Tailwind CSS
* shadcn/ui

Backend:

* Supabase (Postgres, Auth, Storage)
* Server Actions (Next.js)

Email:

* Resend

Hosting:

* Vercel

---

## Architecture Principles

* Spec-driven development
* No scope creep
* Server-authoritative logic
* RLS enforced data access
* Snapshot-based workout assignments
* Flat comment model
* Minimal infrastructure complexity

---

## App Structure

```txt
app/
  coach/
  client/
  admin/
  auth/

components/
lib/
server/
```

---

## Data Ownership Model

* Each coach owns their clients
* Each client belongs to one coach
* All data scoped by:

  * coach_id
  * client_id
  * org_id (future-proofing)

---

## Permissions Model

Enforced using Supabase RLS:

* Coach:

  * Access own clients
  * Access own data

* Client:

  * Access own workouts/check-ins

* Admin:

  * Read-only global access

---

## Key Decisions

### Workout System

* Templates are reusable
* Assigned workouts are snapshots
* No scheduling engine
* No recurring logic

---

### Comments System

* Flat structure
* Context-based
* No threading in v1

---

### Notifications

* Event-triggered emails only
* No notification center
* No retry system

---

### Payments

* Store payment links only
* No Stripe integration logic

---

## Backend Pattern

Use:

* Supabase client for reads
* Server Actions for writes

Server Actions handle:

* validation
* permissions
* side effects (emails)

---

## Storage

Supabase Storage for:

* progress photos

Use:

* private buckets
* signed URLs

---

## Security

* RLS on all tables
* No direct client writes for sensitive data
* Validate all inputs
* Protect routes
* Role-based access

---

## Deployment

* Vercel (frontend + server actions)
* Supabase (backend)
* Resend (email)

---

## Scalability Considerations

* org_id supports future teams
* snapshot model prevents data mutation issues
* modular architecture for mobile expansion
