# 0004. Tailwind CSS v4 and shadcn/ui behind a design-system seam

- Status: Accepted; component styling superseded by [0015](0015-component-styles-in-classes.md)
- Date: 2026-11-07

## Context

The maintainer wanted Tailwind and an accessible component foundation, and plans a design refresh
after launch using a separate shadcn-based design system. That refresh should not require
rewriting the app.

## Decision

Use Tailwind CSS v4 with shadcn/ui components generated into `packages/ui`, and enforce a seam so
the look can be replaced without touching `apps/web`:

1. **Single import boundary**: the app imports only from `@mannaggia/ui`; ESLint bans Radix, lucide,
   class-variance-authority and deep imports in `apps/web`.
2. **Semantic tokens only**: colours, fonts and radius live in `packages/ui/src/theme.css`. This is
   a convention: a CI script that rejected raw colour and font values was removed on 2026-11-07
   by the maintainer, because on a personal project it only policed the maintainer.
3. **Theme scoping**: a `[data-theme="v2"]` token block, switched by `VITE_FLAG_DESIGN_V2`.
4. **Registry replacement**: `pnpm ui:add <name|url>` installs components from any shadcn
   registry, and `packages/ui/registry.json` lists this project's components.

## Alternatives considered

- **React Aria Components with Tailwind**: excellent accessibility, but a smaller ecosystem and
  less contributor familiarity; chosen against at the maintainer's preference.
- **CSS Modules with custom components**: the original plan; dropped when Tailwind was requested.
- **Tailwind without the seam**: faster initially, but a design refresh would mean editing every
  page.

## Consequences

- A design refresh is a token-block change plus component installs, verified by the unchanged
  unit, accessibility and visual tests.
- Radix is a runtime dependency of `@mannaggia/ui`.
- The import boundary holds while its ESLint rule stays enforced. The token rule is unchecked, so
  a raw colour or font slipped into a component survives a theme swap until someone spots it.
