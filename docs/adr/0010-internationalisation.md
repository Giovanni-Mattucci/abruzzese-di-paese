# 0010. i18next for an English and Italian interface

- Status: Accepted
- Date: 2026-11-07

## Context

The interface launches in English with Italian as a second language. Dictionary content is
multilingual data in its own right and is not translated through the UI layer.

## Decision

Use i18next with react-i18next. Resources live in `apps/web/src/i18n/locales/<locale>/common.json`;
English is the source of truth and the keys are typed. A unit test enforces identical keys and
placeholders in both files, and an ESLint rule forbids literal strings in JSX. A two-button toggle
in the header switches language on every page, the choice persists, and first-time visitors whose
browser prefers Italian start in Italian.

## Alternatives considered

- **Lingui**: compact, but its macro compile step adds build complexity.
- **Hand-rolled dictionaries**: no plural rules or interpolation conventions.
- **Locale in the URL (`/it/...`)**: better for search engines in Italian, but doubles prerendered
  pages; deferred.

## Consequences

- The model is close to ngx-translate, familiar to an Angular developer.
- Pages are prerendered in English; Italian visitors get a fresh client render (ADR 0013).
