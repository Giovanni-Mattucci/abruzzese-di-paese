# 0002. React 19 with Vite instead of Angular 20+

- Status: Accepted
- Date: 2026-11-07

## Context

The site is a small, static, read-mostly dictionary: search, browse, entry pages and two content
pages, deployed to GitHub Pages at no cost.

## Decision

Use React 19 with Vite and TypeScript. Bring in focused libraries for what Angular would include:
react-router for routing, i18next with react-i18next for translation, Vitest and React Testing
Library for unit tests, and Playwright for end-to-end tests.

## Alternatives considered

|                    | React 19 + Vite                     | Angular 20+                                |
| ------------------ | ----------------------------------- | ------------------------------------------ |
| Static-site weight | Smaller bundle, simple Pages deploy | Heavier scaffold for a small site          |
| Built-ins          | Choose router, i18n, testing        | Router, DI, signals, SSR and i18n included |
| Contributor pool   | Largest in open source              | Smaller for hobby projects                 |
| Prerendering       | Custom script needed                | `@angular/ssr` prerender out of the box    |

Angular would have provided prerendering without a custom script.
Decided to go with a more common framework with a wider contributor pool.

## Consequences

- The data, search and scraper packages are framework-free, so a future framework change would
  touch only `apps/web` and `packages/ui`.
- Prerendering needed a custom script (ADR 0013), which Angular would have provided.
- Library choices are explicit and documented here rather than dictated by a framework.
