# Abruzzese di paese

An open-source, searchable dictionary and archive of the Abruzzese dialect, with Italian and
English translations.

Dictionary content is reproduced with attribution from the Treppecore archive on
[abruzzo.fm](https://www.abruzzo.fm/archivio/treppecore/treppecore.html). See
[ATTRIBUTION.md](./ATTRIBUTION.md).

## Layout

| Path              | Package         | Purpose                                                                      |
| ----------------- | --------------- | ---------------------------------------------------------------------------- |
| `apps/web`        | `@adp/web`      | React 19 + Vite application                                                  |
| `packages/ui`     | `@mannaggia/ui` | Theme tokens and accessibility-first UI components (Tailwind v4 + shadcn/ui) |
| `packages/data`   | `@adp/data`     | Dictionary entries, JSON Schema, validation and build scripts                |
| `packages/search` | `@adp/search`   | In-browser search index (MiniSearch) and direction logic                     |

## Data Origin

The 3,737 entries were imported once, on 2026-11-07, from the Treppecore archive by a web scraper, whose tip is Every entry keeps the exact source line, its hash, URL and date under `source`. Entries tagged `needs-review` could not be parsed cleanly; `possible-duplicate` marks entries that share a headword.

## Getting started

Requires Node 24 and pnpm (enable with `corepack enable`).

```bash
pnpm install
pnpm dev          # build dictionary.json, then start the web app
pnpm test         # unit tests in every package
pnpm lint         # eslint, prettier
pnpm typecheck
pnpm build        # builds dictionary.json then the site
```

## Contributing a word

See [CONTRIBUTING.md](./CONTRIBUTING.md). Non-developers can use the
"Suggest a word" issue form; developers add a file under `packages/data/entries/<letter>/`.

## Feature flags

New features ship behind build-time flags (`VITE_FLAG_*`, see `apps/web/.env.example`) for a
controlled rollout and instant rollback. `VITE_FLAG_DESIGN_V2` is for a planned design refresh.
Override at runtime with `?flag_NAME=1` or `localStorage.setItem('flag:NAME', '1')`.

## Design system seam

`apps/web` imports only from `@mannaggia/ui`; all colours, fonts and radii live in
`packages/ui/src/theme.css`; base components are generated with `pnpm ui:add <name>` and can
be replaced from any shadcn registry. A future design system can therefore be slotted in
without touching the app. An ESLint rule enforces the import boundary; using tokens rather than
raw colours and fonts is a convention, not a checked rule.

## Static output, SEO and machine readers

`pnpm build` runs the client build, then `scripts/prerender.ts` renders every route to static
HTML (home, browse pages, all entry pages, grammar, about) with a title, description, canonical
link, Open Graph tags and Schema.org JSON-LD (`WebSite` and `DefinedTermSet` on the home page,
`DefinedTerm` on every entry). It also writes `sitemap.xml`, `robots.txt` and `llms.txt`.
The browser hydrates the prerendered English markup, or renders fresh when the visitor has
chosen Italian. AI agents and crawlers that do not run JavaScript get full content, and the
dataset is advertised at `/data/dictionary.json`. The main bundle is held under 150 KB gzip by
`scripts/check-bundle-size.mjs`.

Set `VITE_SITE_URL` and `VITE_REPO_URL` for a deployment; the workflows derive them from the
repository.

Submit the sitemap to search consoles directly, or deploy to a user site or
custom domain (set `VITE_BASE_PATH=/`) for both files to take effect. Entries awaiting review are
marked `noindex` and left out of the sitemap; GitHub Pages serves the generated `404.html` shell
for unknown paths.

## Decisions

The reasons behind the main choices, such as React over Angular, in-browser search over Algolia,
the data format and the licences, are recorded in [docs/adr](docs/adr/README.md).

## Licences

Code is MIT. Dictionary data is CC BY-SA 4.0. Forks are welcome under both.
