# 0008. One-time TypeScript scraper preserved on a branch

- Status: Accepted
- Date: 2026-11-07

## Context

The initial data comes from 23 static pages of the Treppecore archive (windows-1252, FrontPage
2009 markup). The import runs once, perhaps twice; afterwards the data lives in the repository.

## Decision

Write the scraper in TypeScript (cheerio, iconv-lite) so it shares the entry type, slugging and
validation with `packages/data`. It ran on branch `scrape/initial-import`, with the downloaded
pages committed as fixtures and its parser unit tested. Only the generated entries were
squash-merged to `main`; the scraper was removed from `main`. The branch is kept for reference
and its tip is also tagged `scraper-import-1`.

## Alternatives considered

- **Python with requests and BeautifulSoup**: equally capable, but a second toolchain, linter and
  test runner for code that runs once.
- **Keeping the scraper on main**: adds maintenance and CI time for a tool that is no longer used.

## Consequences

- The source site was fetched once, politely; reruns work offline from fixtures.
- Every entry keeps `source.raw`, `rawHash`, `url` and `scrapedAt`, so provenance survives
  without the scraper.
- About 2% of entries could not be parsed cleanly and are tagged `needs-review` with the raw line
  preserved.
