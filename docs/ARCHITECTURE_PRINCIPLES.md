# Architecture Principles

## Purpose

This document defines how systems should be designed across all projects.

It applies to every app unless a project-specific architecture document explicitly overrides it.

---

## Core Philosophy

- Prefer simple, explicit architecture over clever abstractions.
- Build production-grade foundations without overengineering.
- Optimize for fast iteration, maintainability, and clear ownership.
- Avoid premature scaling patterns.
- Architecture should serve the product scope, not impress engineers.

---

## MVP Architecture Rules

- Start with the simplest architecture that can safely support the approved scope.
- Prefer a modular monolith before distributed systems.
- Do not introduce microservices unless explicitly required.
- Do not introduce event buses, queues, CQRS, or complex domain layers unless the spec requires them.
- Avoid framework-heavy patterns unless the project complexity justifies them.
- Every abstraction must solve a real current problem.

---

## Vertical Slice Development

- Build end-to-end vertical slices.
- Avoid building large horizontal layers in isolation.
- A slice should include the minimum backend, frontend, validation, permissions, and QA needed to prove one user capability.
- Do not move to the next slice until the current slice passes QA and review.

---

## Data & Schema Principles

- Treat the schema as the source of truth for backend structure.
- Do not invent columns, tables, relationships, or ownership fields.
- Prefer explicit relationships over hidden inferred relationships.
- Use future-proofing fields carefully; they must not create UI or workflows unless explicitly required.
- Preserve historical records when mutation would damage user trust or auditability.
- Favor data models that make permissions easy to reason about.

---

## Auth & Permissions

- Auth and permissions must be designed early.
- Role-based access must be enforced server-side.
- Database-level access control should be used where available.
- Do not rely only on frontend route guards.
- Every sensitive write must validate ownership.
- Admin access must be explicit and minimal.

---

## Frontend Architecture

- Prefer clear page-level composition over deeply abstracted component systems.
- Extract components only when reuse or clarity justifies it.
- Keep business logic out of presentational components.
- Keep forms explicit and easy to test.
- Responsive behavior is required by default for web apps.
- Accessibility is part of architecture, not polish.

---

## Backend Architecture

- Server-side code owns validation, permissions, and side effects.
- Avoid placing sensitive business logic only in the browser.
- Keep server actions, API routes, and data-access helpers small and focused.
- Prefer explicit function names over generic service objects.
- External integrations should be isolated behind small wrapper modules.
- Do not bypass security layers for convenience.

---

## Framework Integration Principles

- Prefer official framework-supported integrations over custom infrastructure.
- Authentication, SSR, cookies, middleware, and session handling must follow officially supported patterns where available.
- Avoid custom wrappers around framework integrations until multiple real usages justify abstraction.
- Browser-only assumptions must not be used in server-side flows.
- End-to-end flows must be validated in production builds, not only local development.

---

## Integration Principles

- Integrate third-party services incrementally.
- Prefer the smallest integration that satisfies the approved scope.
- Do not build full billing, notification, messaging, or analytics systems unless required.
- Manual workflows are acceptable in MVPs when they reduce complexity.
- External service configuration must be verified through real application flows.

---

## Testing & QA Architecture

- QA is part of the architecture, not an afterthought.
- Critical flows must have explicit acceptance criteria.
- Permission boundaries must be tested early and repeatedly.
- Bugs must be routed to the responsible agent or owner.
- A feature is not complete until it passes build, QA, and review.

---

## Avoid Overengineering

Do not add these unless explicitly required:

- Microservices
- CQRS
- Event sourcing
- Event buses
- Message queues
- Generic repository layers
- Complex plugin systems
- Workflow engines
- Multi-tenant team logic
- Advanced caching
- Background job systems
- Analytics platforms
- Design systems beyond current product needs

---

## Decision Rules

When choosing between two approaches:

1. Prefer the one that is easier to understand.
2. Prefer the one that is easier to test.
3. Prefer the one that preserves product scope.
4. Prefer the one that reduces hidden coupling.
5. Prefer the one that can evolve later without a rewrite.

---

## Agent Behavior Rules

Agents must:

- Follow the project architecture document first.
- Use this file when the project architecture is silent.
- Ask for clarification when architecture is ambiguous.
- Avoid adding architectural patterns not requested by the spec.
- Explain any architectural tradeoff before implementing it.
- Never introduce infrastructure or abstractions just because they are common in larger systems.

---

## Override Rule

Project-specific architecture always wins over this document.

If there is a conflict:

```txt
Project ARCHITECTURE.md > ARCHITECTURE_PRINCIPLES.md > CODING_STANDARDS.md
```
The agent must flag the conflict before proceeding.