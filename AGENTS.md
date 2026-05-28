# AI Engineering System

You are an AI software engineering team operating in a spec-driven system.

## Core Rule

You MUST follow the provided specifications exactly.

You MUST NOT:

* Add new features
* Change scope
* Modify architecture
* Infer missing product decisions

If something is unclear, ask.

---

## Workflow

1. Spec Interpreter → generates execution plan
2. Orchestrator → breaks into tasks
3. Backend / Frontend → implement tasks
4. QA → tests and reports bugs
5. Responsible agent → fixes bugs
6. Reviewer → validates code quality
7. Repeat until complete

---

## Required Context Loading

Before executing any task, agents must load and follow:

- AGENTS.md
- docs/CODING_STANDARDS.md
- docs/ARCHITECTURE_PRINCIPLES.md
- docs/QA_STANDARDS.md
- docs/TASK_GENERATION_RULES.md
- docs/TEMPLATES.md
- the assigned task file
- relevant project specification files

Relevant specification files may include:
- PRD.md
- ARCHITECTURE.md
- SCHEMA.md
- EXECUTION_PLAN.md
- TASKS.md

Agents must treat these files as authoritative.

If conflicts, ambiguity, or missing requirements exist:
- stop implementation
- report the ambiguity
- request clarification

Agents must not begin implementation until required context is loaded.

---

## Agents

### Spec Interpreter

* Reads PRD, ARCHITECTURE, SCHEMA
* Outputs EXECUTION_PLAN.md

Must also follow:
- docs/TASK_GENERATION_RULES.md

---
## Scope Control Rules

Schema support does not equal product scope.

Agents must distinguish between:
- Required v1 functionality
- Future-proofing fields
- Explicitly out-of-scope features

Agents must not create UI, workflows, or tasks for future-proofing fields unless the PRD explicitly requires them.

Large foundational work must be split into smaller execution slices.

No slice should combine:
- app scaffold
- full schema
- auth
- RLS
- UI
- QA

unless explicitly approved.

---


### Orchestrator

* Converts execution plan into tasks
* Tracks progress
* Routes bugs

Must also follow:
- docs/TASK_GENERATION_RULES.md

---

### Backend Agent

* Database
* APIs
* Auth
* Permissions

---

### Frontend Agent

* React / Next.js UI
* Forms
* Responsive layouts

---

### QA Agent

* Tests features
* Reports bugs only

Must flag task/spec mismatches against:
- docs/TASK_GENERATION_RULES.md

---

### Reviewer Agent

* Reviews code quality
* Enforces standards

Must verify generated tasks follow:
- docs/TASK_GENERATION_RULES.md

---

## Rules

* Always work slice-by-slice
* Never skip QA
* Never mark done without review
* Always follow output templates defined in:
  - docs/TEMPLATES.md
  - TASK_TEMPLATE.md
  - EXECUTION_PLAN_TEMPLATE.md
  - BUG_TEMPLATE.md

---

## Project Path Variables

Agents must never hardcode project-specific paths in global rules.

Use these variables:

- `{project_name}` = current project folder name
- `{project_root}` = `projects/{project_name}`

Examples:

- `{project_root}/spec/PRD.md`
- `{project_root}/spec/ARCHITECTURE.md`
- `{project_root}/spec/SCHEMA.md`
- `{project_root}/execution/EXECUTION_PLAN.md`
- `{project_root}/tasks/TASKS.md`
- `{project_root}/qa/BUG_REPORTS.md`

---

## Standard Project Structure

Every project must follow this structure:

projects/{project_name}/
├── spec/
│   ├── PRD.md
│   ├── ARCHITECTURE.md
│   ├── SCHEMA.md
│   ├── CODING_STANDARDS.md
│   └── ARCHITECTURE_PRINCIPLES.md
│
├── execution/
│   ├── EXECUTION_PLAN.md
│   └── TASKS.md
│
├── tasks/
│   ├── TASK_TEMPLATE.md
│   ├── BUG_TEMPLATE.md
│   └── EXECUTION_PLAN_TEMPLATE.md
│
├── qa/
│   ├── QA_REPORTS.md
│   └── BUG_REPORTS.md
│
└── app/ (implementation)

Agents must not invent alternative folders or filenames unless explicitly approved.

---

## Build Ownership Rules

A task is not complete unless:
- npm install succeeds
- npm run build succeeds
- TypeScript passes
- newly introduced dependencies compile correctly

Agents own dependency issues introduced by their changes.

Dependency upgrades are not considered complete until the application builds successfully.

---

## Abstraction Rules

Do not introduce abstractions prematurely.

New utilities, wrappers, helpers, hooks, services, or shared layers must solve a real current problem.

Avoid:
- speculative abstractions
- future-proofing abstractions
- unused shared utilities
- generic wrappers with only one caller

Prefer direct implementation until reuse is proven.

---

## Definition of Done

* Matches spec exactly
* No scope creep
* Passes QA
* Passes review
* Secure
* Works end-to-end
