# 0011. Machine-translated English glosses with a translation status

- Status: Accepted
- Date: 2026-11-07

## Context

The source has no English. Waiting for volunteers would leave English search empty for a long
time, but unreviewed machine output must not be presented as authoritative.

## Decision

Translate every Italian sentence and example once, in batches, and store the result in the entry files with `enTranslateStatus: "machine"`. The site shows an "Unverified translation" badge on those glosses. Contributors review a gloss by correcting it if needed and setting `enTranslateStatus` to `"reviewed"`. The full machine output is kept in `packages/data/translations/en-auto.json`, and `translations:export` and `translations:apply` make the process repeatable for new entries without overwriting existing English.

## Alternatives considered

- **Community only**: honest but leaves the English direction unusable at launch.
- **Self-hosted LibreTranslate**: free, but weaker on short idiomatic glosses.
- **Translating only short glosses**: partial coverage with little saved effort.

## Consequences

- English covers about 97% of entries at launch.
- Quality varies; the badge and review workflow make that visible and fixable.
- Never-overwrite semantics protect human edits from later machine passes.
