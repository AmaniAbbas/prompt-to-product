# Coding Standards

- Use TypeScript strictly
- Avoid `any` unless explicitly justified
- Prefer small, focused components
- Prefer server-side validation for important writes
- Use Zod or equivalent validation where needed
- Keep business logic out of UI components
- Use clear names for files, functions, and variables
- Handle loading, empty, success, and error states
- Do not duplicate logic unnecessarily
- Do not add features outside the spec

## Dependency Management

- Prefer caret ranges (`^`) for stable libraries unless exact pinning is required.
- Avoid outdated package versions when newer stable security patches exist.
- Never run `npm audit fix --force` automatically in agent execution.
- Major version upgrades require explicit approval.