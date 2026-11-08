# 0009. MIT for code, CC BY-SA 4.0 for data

- Status: Accepted
- Date: 2026-11-07

## Context

The maintainer wanted an open, non-profit-friendly licence that allows forks. The source site
states that all its material may be reproduced provided the source is cited, under an informal
"licenza NGULOTU" with no formal text. Individual words are not copyrightable, but the compilation,
glosses and examples can be, and the EU database right may apply.

## Decision

License code under MIT and dictionary data under Creative Commons Attribution-ShareAlike 4.0.
Credit abruzzo.fm in the site footer, on every entry page and in each entry's `source.url`, and
record the reuse statement in `ATTRIBUTION.md`. The abruzzo.fm editors confirmed in writing on
2026-11-09 that the content may be published with credit to the source and to Radio Abruzzo; the
confirmation is recorded in `ATTRIBUTION.md`.

## Alternatives considered

- **A "non-commercial" data licence (CC BY-NC-SA)**: not open source by definition, and it would
  block many reuses such as apps and research tools.
- **AGPL for code**: strong copyleft adds friction for little benefit on a static site.

## Consequences

- Anyone may fork and reuse; derived data must stay open and attributed.
- Contributors agree their data additions are CC BY-SA 4.0 (stated in the issue forms and
  CONTRIBUTING).
- This is not legal advice. The owners' written confirmation (2026-11-09) does not name the
  licence; it rests together with the homepage statement, which allows commercial reuse.
