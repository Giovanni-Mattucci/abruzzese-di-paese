# 0005. In-browser search with MiniSearch instead of Algolia

- Status: Accepted
- Date: 2026-11-07

## Context

The dictionary has about 3,700 entries; the full data file is roughly 145 KB gzipped. Search must
support direction selection (Abruzzese to Italian, Italian to Abruzzese, English, all fields) and
fold diacritics, apostrophes and schwa-like spellings. Running cost must be zero.

## Decision

Build a MiniSearch index in the browser from `data/dictionary.json` on first load, in
`packages/search`, with per-field boosts, prefix and fuzzy matching, and a shared folding function
used for both indexing and queries.

## Alternatives considered

- **Algolia DocSearch**: free only for approved documentation sites and crawler-based, not suited
  to structured records. The general free plan caps records and requests, needs an API key and an
  index sync step in CI, and moves ranking rules into a dashboard outside version control.
- **Fuse.js**: scans every record per keystroke and has no prefix mode.
- **FlexSearch**: fastest, but its typings and documentation were less stable.

## Consequences

- No accounts, quotas, keys or network round trips per keystroke; queries stay private.
- Forks get working search with no setup.
- Folding and direction logic are unit tested in the repository.
- Revisit if the data grows by orders of magnitude.
