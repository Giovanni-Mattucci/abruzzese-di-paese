# Contributing

Thank you for helping preserve the Abruzzese dialect. There are two ways to contribute.

## 1. Suggest or correct a word (no coding)

Open an issue with the **Suggest a word** or **Fix an entry** form. A maintainer turns it
into an entry file and credits you in the entry's `contributors` list.

## 2. Edit the data directly

Each word is one JSON file: `packages/data/entries/<letter>/<id>.json`. The schema is in
`packages/data/schema/entry.schema.json`. From an entry page on the site, use
"Edit this entry on GitHub" to open the file in the web editor.

Rules:

- Never change an existing `id` or `source` block; they are provenance.
- Put Italian meanings in `senses[].it` (one sense per meaning), English in `senses[].en`.
- When you add or correct an English translation, set `enTranslateStatus` to `"reviewed"`.
- Examples go in `examples[]` as `{ "abr": ..., "it": ..., "en": ... }`.
- Add your GitHub login to `contributors`.
- Run `pnpm data:format` and `pnpm data:validate` before opening the pull request;
  CI runs the same checks.

By contributing data you agree to release it under CC BY-SA 4.0.

## Translating

### English meanings of dictionary entries

Every Italian gloss received an English translation in a one-time machine pass on 2026-11-07
(generated with Claude; the full output is in `packages/data/translations/en-auto.json`).
Those glosses carry `"enTranslateStatus": "machine"` and the site shows them with an
"Unverified translation" badge. To review one:

1. Open the entry file and read `senses[].en` next to `senses[].it`.
2. Correct the English if needed, keeping it a short dictionary gloss.
3. Change `"enTranslateStatus"` to `"reviewed"` and add your login to `contributors`.

New entries may leave `en` out entirely; "No English yet" is a normal state.
To regenerate translations for entries that still lack English, run
`pnpm --filter @adp/data translations:export <dir>`, translate the batch files, and apply them
with `pnpm --filter @adp/data translations:apply <dir>`.

### The user interface

UI strings live in `apps/web/src/i18n/locales/<locale>/common.json`. English is the source of
truth; Italian must contain exactly the same keys and the same `{{placeholders}}`, which a unit
test enforces. Never put a literal string in JSX; add a key instead (ESLint will remind you).
Visitors switch language with the toggle in the header; the choice is remembered.

## Code changes

- `pnpm lint`, `pnpm typecheck` and `pnpm test` must pass.
- A pre-commit hook (Husky + lint-staged, installed by `pnpm install`) runs ESLint and
  Prettier on staged files, and `pnpm data:validate` when entries change. Fix what it
  reports rather than skipping it with `--no-verify`.
- New features go behind a feature flag (`apps/web/src/flags/flags.ts`). If you decide not
  to use one, say why in the pull request description.
- UI work: import only from `@mannaggia/ui`; use semantic token classes (`bg-background`,
  `text-primary`, `font-heading`), never raw colours or fonts. In `packages/ui/src`, each
  component has its own kebab-case folder (`letter-nav/letter-nav.tsx`): shadcn base
  components go in `base/`, added only with `pnpm ui:add <name>`, and hand-written components
  go in `components/`. Put project behaviour in a component that wraps a base one rather than
  editing the base file; `ui:add` refuses to re-add an existing base component unless you pass
  `--force`, and then you restore your edits from `git diff`. Every component needs a unit
  test and an axe accessibility test.
- Keep pull requests small and focused.

## Visual snapshots

The E2E workflow runs three full-page screenshot comparisons on Linux. Baselines live in
`apps/web/e2e/visual.spec.ts-snapshots/` and are committed. When a baseline is missing, the
workflow writes it and uploads it as the `visual-baselines` artifact instead of failing:
download that artifact from the run and commit the `-linux` images. After an intended visual
change (for example the design-system refresh), delete the affected images, let CI regenerate
them, review the artifact, and commit. Locally you can run them with
`E2E_VISUAL=1 pnpm --filter @adp/web e2e`, which produces separate platform-suffixed images
that should not be committed.

## Development

```bash
corepack enable
pnpm install
pnpm dev   # builds apps/web/public/data from the entries first
```
