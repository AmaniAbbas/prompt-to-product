# Templates

This document defines standardized output structures for agents across the engineering system.

Its purpose is to:
- reduce ambiguity
- improve consistency
- prevent missing verification
- reduce hallucinated implementation details
- standardize QA and review quality

This file defines operational/reporting templates only.

The following canonical templates are maintained separately and must not be duplicated here:
- TASK_TEMPLATE.md
- EXECUTION_PLAN_TEMPLATE.md
- BUG_TEMPLATE.md

Agents must use those dedicated templates directly.

---

# Canonical Template Ownership

| Template File | Primary Owner |
|---|---|
| TASK_TEMPLATE.md | Orchestrator |
| EXECUTION_PLAN_TEMPLATE.md | Spec Interpreter |
| BUG_TEMPLATE.md | QA Agent |
| TEMPLATES.md | Shared operational/report formats |

---

# Backend Implementation Report Template

Used by:
- Backend Agent

```md
# Backend Agent Output

## Files Changed

| File | Change |
|------|--------|

## Database Changes

Tables, columns, indexes, constraints, triggers, policies, etc.

## API Changes

Routes, handlers, server actions, validation, auth behavior.

## Auth & Permissions

Role validation, ownership checks, auth flow behavior, RLS impact.

## Design Decisions

Important implementation decisions and rationale.

## Risks

Known limitations, deferred work, or assumptions.

## Build Status

- npm install
- npm run build
- TypeScript status

## Acceptance Criteria Check

| Criterion | Status |
|-----------|--------|

---

# Frontend Implementation Report Template

Used by:
- Frontend Agent

# Frontend Agent Output

## Files Changed

| File | Change |
|------|--------|

## UI Behavior

Pages, components, routing, forms, loading states, redirects.

## Validation

Client-side validation and error handling behavior.

## Accessibility

ARIA attributes, keyboard support, screen-reader behavior.

## State Management

Loading, success, validation-error, empty, and server-error states.

## Design Decisions

Important implementation reasoning.

## Risks

Known limitations, deferred work, or assumptions.

## Build Status

- npm install
- npm run build
- TypeScript status

## Acceptance Criteria Check

| Criterion | Status |
|-----------|--------|

---

# Migration Report Template

Used by:
- Backend Agent
- Reviewer
- QA Agent

# Migration Report

## Migration File

## Tables Created

| Table | Purpose |
|-------|---------|

## Columns Added

| Table | Column | Type | Nullable | Default |
|------|--------|------|----------|---------|

## Foreign Keys

| Table | Foreign Key | References |
|------|---------------|------------|

## Indexes

| Table | Index | Purpose |
|------|-------|---------|

## Constraints

CHECK, UNIQUE, CASCADE behavior, etc.

## Design Decisions

Important schema decisions and rationale.

## Risks

Known limitations or deferred improvements.

## Schema Fidelity Checklist

| Schema Requirement | Migration Result | Status |
|-------------------|------------------|--------|

---

# QA Report Template

Used by:
- QA Agent

# QA Report

## Task

## Environment

Local, preview, production, etc.

## Tested

What was tested.

## Passed

What passed successfully.

## Failed

What failed.

## Bugs Found

| Bug ID | Severity | Area |
|--------|----------|------|

## Reproduction Steps

Step-by-step reproduction instructions.

## Expected Result

## Actual Result

## Build Verification

- npm install
- npm run build
- TypeScript
- migrations

## Accessibility Verification

Keyboard support, ARIA, validation behavior.

## Security Verification

Auth, permissions, ownership, account enumeration, etc.

## Final Verdict

PASS / FAIL / BLOCKED

---

# Reviewer Report Template

Used by:
- Reviewer Agent

# Reviewer Report

## Task Reviewed

## Code Quality

Readability, maintainability, duplication, naming.

## Architecture Compliance

Compliance with architecture principles.

## Standards Compliance

Coding standards, QA standards, task generation rules.

## Security Review

Validation, permissions, auth, sensitive data handling.

## Scope Compliance

Verification that no scope creep exists.

## Dependency Review

New packages, upgrades, unsupported libraries, risks.

## Performance Concerns

Only if relevant to current scope.

## Risks

Known implementation concerns.

## Required Changes

Blocking issues before approval.

## Final Verdict

APPROVED / CHANGES REQUIRED

--- 

# Architecture Decision Template

Used by:
- Backend Agent
- Frontend Agent
- Reviewer Agent

# Architecture Decision

## Context

What problem exists.

## Constraints

Technical or product constraints.

## Options Considered

1.
2.
3.

## Decision

Chosen solution.

## Rationale

Why this approach was selected.

## Tradeoffs

What is intentionally sacrificed.

## Future Impact

How this may evolve later.

---

# Configuration Task Report Template

Used by:
- Backend Agent
- Infrastructure tasks
- DevOps tasks

# Configuration Task

## Service

Supabase, Stripe, AWS, Vercel, Resend, etc.

## Objective

## Required Settings

| Setting | Expected Value | Purpose |
|---------|----------------|---------|

## Verification Steps

How to confirm the configuration works.

## Risks

Known limitations or rollout concerns.

## Rollback Plan

If applicable.

---

# Build Failure Report Template

Used by:
- Any implementation agent
- QA Agent

# Build Failure Report

## Environment

Local / CI / Preview / Production

## Command

npm run build / TypeScript / migration command / etc.

## Failure Summary

Short description of the failure.

## Error Output

Relevant error excerpt.

## Root Cause

Dependency, framework integration, schema issue, typing issue, etc.

## Impact

Blocked tasks or affected systems.

## Resolution

Fix applied or recommended fix.

## Status

OPEN / RESOLVED / DEFERRED

---

# Dependency Change Report Template

Used by:
- Backend Agent
- Frontend Agent
- Reviewer Agent

# Dependency Change Report

## Package

## Previous Version

## New Version

## Reason For Change

Bug fix, official integration, security patch, etc.

## Risks

Breaking changes, RC status, ecosystem instability, etc.

## Verification

- npm install
- npm run build
- TypeScript
- runtime verification

## Rollback Plan

Previous known working version.

---

# Override Rule

Project-specific templates override this document.

Priority order:

Project Templates > TEMPLATES.md

If conflicts exist:
- stop implementation
- report the conflict
- request clarification