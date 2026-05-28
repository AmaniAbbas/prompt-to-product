# Coding Standards

## General Engineering Rules

- Use TypeScript strictly.
- Avoid `any` unless explicitly justified.
- Prefer small, focused components and modules.
- Keep business logic out of UI components.
- Use clear, descriptive names for files, functions, and variables.
- Do not duplicate logic unnecessarily.
- Do not add features outside the approved spec.
- Prefer server-side validation for important writes.
- Use Zod or equivalent schema validation where appropriate.

## Build & Completion Rules

- Every completed task must pass:
  - npm install
  - npm run build
- TypeScript errors block task completion.
- Production builds must succeed locally before deployment.
- A task is not complete if the application does not build.
- Build failures may only be deferred if explicitly approved and tracked as a named bug.

## Dependency Management Rules

- Prefer caret ranges (`^`) for stable libraries unless exact pinning is required.
- Prefer known stable versions over newest versions.
- Avoid outdated package versions with known security issues.
- Never run `npm audit fix --force` automatically.
- Do not auto-upgrade major versions or security-sensitive packages without approval.
- If a dependency upgrade introduces build or type failures, revert to the last known working version.
- Every dependency change must be followed by:
  - npm install
  - npm run build

## Database & Schema Rules

- Database migrations must remain schema-faithful.
- Required schema fields must be generated as `NOT NULL`.
- Nullable fields must only be nullable when explicitly allowed by the schema.
- Never invent tables, columns, enums, indexes, constraints, or relationships.
- Before referencing schema fields in tasks or migrations, verify they exist in `SCHEMA.md`.
- Do not generalize ownership patterns (`coach_id`, `client_id`, `org_id`) across unrelated tables.
- If access is derived through a parent relationship, document the relationship path instead of inventing shortcut columns.
- If the schema is ambiguous, stop and request clarification instead of guessing.
- Future-proofing fields may exist in the schema but must not create UI, workflows, or logic unless explicitly required.
- SQL output must include a short schema fidelity checklist before approval.

## Task & Acceptance Criteria Rules

- Task acceptance criteria must not reference fields, tables, workflows, or behaviors absent from the spec.
- Acceptance criteria must be verifiable.
- Derived relationships must be described explicitly rather than inferred.
- Tasks must not assume undocumented framework, provider, or dashboard behavior.

## Form & Validation Rules

- Trim user input before submission.
- Validate required fields before API calls.
- Do not rely solely on browser-native validation.
- Forms must expose accessible error states.
- Invalid client-side input must prevent API execution.
- Authentication and account flows must avoid account enumeration risks.
- Handle loading, success, empty, and error states explicitly.

## External Service Configuration Rules

For third-party services (Supabase, Stripe, Vercel, AWS, Resend, etc.):

- Prefer outcome-oriented instructions over assumptions about dashboard toggles.
- Do not disable settings unless their behavior and impact are verified.
- If provider behavior may vary by version, describe the desired outcome instead of assuming exact UI labels or toggles.
- Configuration tasks are not complete until verified through actual application flow testing.

## Accessibility Rules

- Interactive forms must expose accessible labels and error states.
- Inputs with validation failures must use appropriate ARIA attributes.
- Error messages must be programmatically associated with their fields.
- Keyboard and screen-reader usability must not depend on visual styling alone.

## Runtime & Framework Integration Rules

- Framework-specific flows (Next.js SSR, Supabase SSR, auth callbacks, cookies, middleware, etc.) must follow official supported patterns.
- Do not invent custom auth/session handling when an official framework integration exists.
- Browser-only storage assumptions must not be used in server-side flows.
- Authentication flows must be verified end-to-end, not only at the UI level.
- Route handlers, middleware, and SSR code must be tested in production builds.
- Transitive dependency issues discovered during builds must be resolved before task completion.
- Dependency fixes must prefer official supported libraries over workaround patches.
- Avoid abstractions around framework integrations until at least two real usages exist.

## UI State, Validation & Accessibility Rules

- Distinguish validation errors from system/API failures.
- Client-side validation must run before API calls.
- Invalid form submissions must not trigger network requests.
- Trim user input before submission where appropriate.
- Forms must expose accessible labels and error states.
- Inputs with validation failures must expose appropriate ARIA attributes.
- Error messages must be associated with their fields via aria-describedby when applicable.
- Form error state must reset appropriately after user correction.
- Loading, success, validation-error, empty, and server-error states must be explicitly modeled.
- Accessibility semantics must not rely solely on browser-native validation.
- Authentication and account flows must avoid account enumeration risks.
- Success states should prevent accidental duplicate submissions where appropriate.