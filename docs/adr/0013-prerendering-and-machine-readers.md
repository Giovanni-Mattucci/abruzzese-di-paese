# 0013. Prerender every page; serve structured data for machines

- Status: Accepted
- Date: 2026-11-07

## Context

A client-only single-page app shows search engines and AI agents an empty page unless they run
JavaScript. The archive's purpose is discoverability, and its data should be easy for machines to
read and cite.

## Decision

After `vite build`, `apps/web/build/prerender.ts` renders all routes (about 3,760 pages) to
static HTML with a server build of the same React tree. Each page gets a title, description,
canonical link, Open Graph tags and Schema.org JSON-LD: `WebSite` and `DefinedTermSet` on the home
page, `DefinedTerm` on every entry. The script also writes `sitemap.xml`, `robots.txt`,
`llms.txt` and an empty `404.html` shell. Entries awaiting review are marked `noindex` and left
out of the sitemap. The browser hydrates English, query-free pages and renders fresh otherwise.

## Alternatives considered

- **A static-site framework (Next.js export, Astro)**: capable, but a migration away from the
  chosen stack for one feature.
- **A third-party prerender service**: cost and an external dependency.
- **Client rendering only**: simplest, but invisible to crawlers and agents that skip JavaScript.

## Consequences

- Pages are readable without JavaScript, verified by an end-to-end test.
- The build takes a few extra seconds and the output is about 38 MB.
- JSON-LD is serialised through `jsonForScript()`, which escapes `<` so dictionary text can never
  close the script element. A review found the first version of that escape was a no-op; it was
  fixed and the test now fails against the broken form.
