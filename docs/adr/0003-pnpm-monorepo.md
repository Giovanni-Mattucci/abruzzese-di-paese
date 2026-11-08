# 0003. pnpm monorepo with the design system as a workspace package

- Status: Accepted
- Date: 2026-11-07

## Context

The initial plan put the design system in its own repository, consumed by the app through a
`github:owner/repo#main` dependency. The project also needs shared code between the data
pipeline, the search index and the web app.

## Decision

Use a single pnpm workspace: `apps/web`, `packages/ui` (design system), `packages/data`
(entries, schema, build), and `packages/search` (index and direction logic). Packages depend on
each other with `workspace:*`.

## Alternatives considered

- **Separate design-system repository via a git dependency**: no versioning, so every install can
  pull different code; the package must commit or build its output on install, which pnpm handles
  inconsistently; one feature needs two pull requests and two CI setups. It offers nothing until a
  second consumer exists.
- **Separate repositories published to npm**: adds release overhead with no current benefit.

## Consequences

- One pull request can change a component and its usage together, with one CI run.
- Contributors clone one repository.
- The design system can still be extracted later: it already has a public surface
  (`packages/ui/src/index.ts`) and a shadcn registry manifest (ADR 0004).
