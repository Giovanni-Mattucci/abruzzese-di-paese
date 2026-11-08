# 0012. Build-time feature flags, and shipping i18n without them

- Status: Accepted
- Date: 2026-11-07

## Context

New features should be releasable gradually and reversible quickly. The project has no server,
so flags must work in a static build.

## Decision

Use build-time `VITE_FLAG_*` variables, with runtime overrides through the query string
(`?flag_NAME=1`) and `localStorage` (`flag:NAME`) for testing. Rollback is a one-line change to
the deploy workflow and a redeploy.

The Italian interface and English search were built behind `VITE_FLAG_LOCALE_IT` and
`VITE_FLAG_ENGLISH_PIVOT`, then shipped and the flags removed. Reason, as decided by the
maintainer: both features were complete and covered by unit and end-to-end tests before the site
had any production users, so a staged rollout had nothing to stage. Rollback for these two
features is a code change rather than a flag: revert commit 874e043, or hide the language toggle
and drop `en` from the search directions, then redeploy. `VITE_FLAG_DESIGN_V2` remains
for the planned design refresh (ADR 0004).

## Alternatives considered

- **A hosted flag service**: adds cost and a runtime dependency to a static site.
- **No flags**: simpler, but loses controlled rollout and instant rollback for risky changes.

## Consequences

- Flags are cheap to add and remove; stale flags should be deleted once a feature is fully live.
- Future features should default to a flag; if one ships without, the reason belongs in its pull
  request and, where significant, in a new ADR.
