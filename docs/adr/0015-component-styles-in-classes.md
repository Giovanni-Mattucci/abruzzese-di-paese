# 0015. Component styles in Tailwind classes, themes in tokens

- Status: Accepted
- Date: 2026-11-09

## Context

ADR 0004 styled the "Lexicon" look from an unlayered block in `packages/ui/src/theme.css` that
targeted `data-slot` attributes. Those rules beat every Tailwind utility, so a component's classes
no longer described how it looked: the current letter in `LetterNav` declared `bg-primary` and
rendered with no background, and a reader had to check two files to know what an element showed.
The block existed so a whole design, shapes included, could be swapped behind a flag. The
maintainer is still refining the Lexicon theme, and switching quickly between two complete
designs is not important at this stage.

## Decision

- **Classes define components.** Each component in `packages/ui/src/components` and each app
  element carries its full Lexicon look in its Tailwind classes. `theme.css` holds only tokens
  and `@layer base` element defaults (body, headings, focus ring), which any class overrides.
- **Themes are tokens**, following the shadcn theming approach: colours, fonts and radius as CSS
  variables in `theme.css`.
- **shadcn base components stay as shadcn ships them.** Where the Lexicon look differs from a
  base component in more than tokens, a project component applies classes over it: `Button` in
  `src/components/button` wraps the base Button, and `DefinitionCard` styles its Badges. Re-adding
  a base component with `pnpm ui:add <name> --force` therefore keeps the Lexicon look.
- **Flagged design work stays possible.** The `[data-theme='v2']` token block and
  `VITE_FLAG_DESIGN_V2` remain, and a `v2:` Tailwind variant lets a component carry flagged styles
  in its classes (`rounded-none v2:rounded-lg`).

This supersedes the component-styling part of ADR 0004; its import boundary, token convention and
registry tooling stand.

## Alternatives considered

- **Keep the `data-slot` overrides**: one file restyles everything, but classes that never apply
  make components misleading, and every override has to undo the classes beneath it.
- **Edit the base components directly**: the shadcn "you own the code" route, but
  `ui:add --force` would replace the edits.

## Consequences

- A component's classes are the whole truth about its look, and Tailwind IntelliSense and class
  sorting apply to all of it.
- A redesign that changes shapes, not only tokens, means editing component classes, or adding
  `v2:` classes behind the flag, instead of one CSS file.
- Pages render pixel-identically before and after the move (full-page screenshots on Windows, plus
  computed styles for hover, focus and a 375 px viewport).
