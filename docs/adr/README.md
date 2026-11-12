# Architecture decision records

This folder records the significant decisions behind Abruzzese di paese: what was decided, why,
which alternatives were weighed, and what follows from the choice. Each record is short and
immutable once accepted; a later decision that changes course gets a new record that marks the
old one as superseded.

| ADR                                              | Title                                                        | Status   |
| ------------------------------------------------ | ------------------------------------------------------------ | -------- |
| [0001](0001-record-architecture-decisions.md)    | Record architecture decisions                                | Accepted |
| [0002](0002-react-over-angular.md)               | React 19 with Vite instead of Angular 20+                    | Accepted |
| [0003](0003-pnpm-monorepo.md)                    | pnpm monorepo with the design system as a workspace package  | Accepted |
| [0004](0004-tailwind-shadcn-design-seam.md)      | Tailwind CSS v4 and shadcn/ui behind a design-system seam    | Accepted |
| [0005](0005-in-browser-search.md)                | In-browser search with MiniSearch instead of Algolia         | Accepted |
| [0006](0006-github-pages-hosting.md)             | Static hosting on GitHub Pages                               | Accepted |
| [0007](0007-one-json-file-per-entry.md)          | One JSON file per dictionary entry                           | Accepted |
| [0008](0008-one-time-scraper-branch.md)          | One-time TypeScript scraper preserved on a branch            | Accepted |
| [0009](0009-licensing.md)                        | MIT for code, CC BY-SA 4.0 for data                          | Accepted |
| [0010](0010-internationalisation.md)             | i18next for an English and Italian interface                 | Accepted |
| [0011](0011-machine-translated-english.md)       | Machine-translated English glosses with a translation status | Accepted |
| [0012](0012-feature-flags.md)                    | Build-time feature flags, and shipping i18n without them     | Accepted |
| [0013](0013-prerendering-and-machine-readers.md) | Prerender every page; serve structured data for machines     | Accepted |
| [0014](0014-testing-strategy.md)                 | Testing strategy                                             | Accepted |
| [0015](0015-component-styles-in-classes.md)      | Component styles in Tailwind classes, themes in tokens       | Accepted |
| [0016](0016-cookieless-analytics.md)             | Cookieless analytics with Cloudflare Web Analytics           | Accepted |

To add a record, copy [template.md](template.md) to the next number and open a pull request.
