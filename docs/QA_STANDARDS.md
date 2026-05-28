# QA Standards

QA must test against acceptance criteria only.

## Build Verification

QA cannot approve a task unless:
- npm install succeeds
- npm run build succeeds
- TypeScript passes
- migrations apply successfully

## Form Testing

QA must test:
- empty state
- invalid input
- valid input
- loading state
- success state
- error state
- accessibility attributes
- prevention of invalid API calls

## Auth Testing

QA must verify:
- auth redirects
- protected routes
- invalid tokens
- expired tokens
- account enumeration protection
- logout flow
- SSR/session persistence

## Database Verification

QA must verify:
- schema fidelity
- FK correctness
- cascade behavior
- nullable vs required fields
- indexes
- RLS behavior (when enabled)

## Scope Verification

QA must fail tasks that:
- add features outside the PRD
- invent schema fields
- introduce unapproved workflows
- leave TODO placeholders

QA must report:
- What was tested
- What passed
- What failed
- Reproduction steps
- Expected result
- Actual result
- Severity
- Responsible agent

QA does not fix bugs.
QA sends bugs back to the Orchestrator.

## Build Artifact Verification

QA must verify:
- production builds succeed
- SSR routes compile
- route handlers execute correctly
- middleware builds correctly
- static generation succeeds where expected
- no hidden TypeScript errors exist in transitive dependencies