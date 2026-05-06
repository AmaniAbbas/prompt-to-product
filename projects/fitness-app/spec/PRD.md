# Product Requirements Document (PRD)

## Product Name

Fitness Coach Management Platform (Working Title)

---

## Objective

Build a web-based SaaS platform that allows independent fitness coaches to:

* Manage clients
* Create and assign workout plans
* Track client progress
* Collect payments
* Communicate with clients

All in one place, replacing spreadsheets, messaging apps, and manual workflows.

---

## Target Users

### Primary

* Independent personal trainers
* Online fitness coaches

### Secondary

* Clients of those coaches

---

## Problem Statement

Coaches currently use:

* Spreadsheets for tracking
* Messaging apps for communication
* Payment links manually
* Notes scattered across tools

Clients:

* Lack visibility into workouts
* Have no centralized progress tracking

---

## Goals (MVP)

A coach should be able to:

1. Sign up
2. Create a client
3. Send invite
4. Create a workout plan
5. Assign it to the client
6. Receive check-ins
7. View progress
8. Share payment link

A client should be able to:

1. Accept invite
2. View workouts
3. Complete workouts
4. Submit check-ins
5. Upload progress photos
6. Comment

---

## Non-Goals (Explicitly Out of Scope)

* Workout scheduling engine
* Recurring plans
* Native mobile apps
* Built-in payments (Stripe API)
* Messaging system (beyond comments)
* Charts/analytics dashboards
* Coach teams/multi-user orgs
* Push notifications

---

## Core Features

### 1. Authentication

* Magic link login
* Optional password setup
* Roles:

  * Coach
  * Client
  * Admin

---

### 2. Client Management

* Create client
* View list
* View profile
* Invite via email

---

### 3. Workout Templates

* Create template
* Add exercises
* Define:

  * sets
  * reps
  * weight
  * rest
  * RPE
  * notes

---

### 4. Workout Assignment

* Assign template to client
* Assign date
* Add label (e.g., “Day 1”)

**Important:**
Assigned workouts are snapshots and do not update if template changes.

---

### 5. Client Workout Experience

* View assigned workouts
* Mark exercises complete
* Add notes per:

  * exercise
  * workout

---

### 6. Check-ins

Client submits:

* Weight
* Mood (1–5)
* Adherence (0–100)
* Comments
* Progress photos

---

### 7. Progress Tracking

* Timeline view (no charts)
* Photos + check-ins visible to coach

---

### 8. Comments

* Flat comments system
* Context types:

  * exercise
  * workout
  * check-in

---

### 9. Payments

* Coach stores Stripe payment link
* Optional override per client
* No payment tracking

---

### 10. Notifications (Email only)

Triggered on:

* Invite
* Workout assigned
* New comment
* Check-in reminder
* Payment reminder

---

### 11. Consent & Compliance

* Health data consent
* Photo consent
* Data export (JSON/CSV)
* Account deletion

---

### 12. Admin (Internal)

* View users
* View profiles
* No editing or impersonation

---

## Success Criteria

* Coach can onboard 5–10 clients
* Clients can complete workouts + check-ins
* No spreadsheets required
* System stable, secure, and responsive

---

## Constraints

* Timeline: 8–10 weeks
* MVP only
* No over-engineering
* Must be production-ready
