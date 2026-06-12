# AGENTS.md

## Project Goal

Build a maintainable MVP for a Legal AI Assistant that helps lawyers manage cases by importing scattered materials (chat logs, screenshots, PDFs, voice notes) and automatically generating case timelines, task lists, and deadline reminders.

## Development Principles

- Read relevant docs before coding.
- Do not implement features outside the requested scope.
- Prefer simple, maintainable solutions.
- Avoid unnecessary dependencies.
- Keep UI, business logic, data access, and AI logic separated.
- Use TypeScript.
- Keep components small and composable.
- Update documentation when behavior changes.

## Product Rules

- Follow docs/PRD.md and docs/MVP_SCOPE.md.
- Do not expand MVP scope unless explicitly requested.
- Respect docs/DECISIONS.md.
- Every feature must have clear acceptance criteria.
- All AI results must require human confirmation before entering case records.
- Never auto-read user's private data (messages, contacts, etc.).

## UI Rules

- Follow docs/UI_STYLE_GUIDE.md.
- Follow docs/DESIGN_SYSTEM.md.
- Mobile-first (Tailwind responsive).
- Every major page must handle:
  - loading state
  - empty state
  - error state
  - success state
- AI-generated content must be visually distinguishable (purple tags).

## Coding Rules

- Inspect existing files before modifying.
- Reuse existing components and utilities.
- Do not rewrite unrelated code.
- Do not introduce new architecture unless necessary.
- After changes, run lint, type check, and tests if available.
- Use Next.js App Router conventions.

## Review Rules

After each task, provide:

1. Summary of changes
2. Files changed
3. How to test
4. Known limitations
5. Whether docs need updates
