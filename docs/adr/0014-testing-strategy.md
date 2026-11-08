# 0014. Testing strategy

- Status: Accepted
- Date: 2026-11-07

## Context

The maintainer required unit tests and a minimal end-to-end suite, and the site must meet WCAG 2.1
AA. Contributors range from developers to people fixing one word.

## Decision

- **Unit and component tests**: Vitest with React Testing Library in every package, with coverage
  thresholds that CI enforces by running `pnpm test:coverage`. Every UI primitive has an axe-core accessibility test.
- **Data tests**: schema validation and cross-file rules run as tests and as `pnpm data:validate`
  in CI.
- **End-to-end**: Playwright against the production build, covering search in each direction,
  browsing, shared URLs, the language toggle, keyboard skip link, reading without JavaScript,
  hydration without console errors, and the machine-readable files, with axe scans on visited
  pages.
- **Visual snapshots**: three full-page screenshots compared on Linux in CI; baselines are created
  on first run and committed from the workflow artifact.
- **Budgets**: the main bundle must stay under 150 KB gzip.

## Alternatives considered

- **Jest**: slower and needs extra configuration with Vite.
- **Cypress**: capable, but Playwright's multi-browser support and accessibility integration fit
  better.

## Consequences

- A pull request cannot merge without lint, type checks, unit, data and end-to-end tests passing.
- Visual baselines must be refreshed deliberately after intended design changes.
