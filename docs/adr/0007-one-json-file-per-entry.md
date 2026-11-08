# 0007. One JSON file per dictionary entry

- Status: Accepted
- Date: 2026-11-07

## Context

The data is the heart of the project and must be easy for non-developers to correct through the
GitHub web editor, produce clean pull-request diffs, and be validated automatically.

## Decision

Store each entry as `packages/data/entries/<letter>/<id>.json`, validated against a JSON Schema
with Ajv in CI. The id is a stable slug assigned once and never regenerated. A build step emits a
single `dictionary.json` for the browser, dropping provenance-only fields.

## Alternatives considered

- **One large dictionary.json**: about 1 MB, impractical in the web editor and a constant source
  of merge conflicts.
- **Per-letter JSON files**: still large (letter S has about 650 entries), with position-based
  conflicts.
- **YAML per entry**: friendlier syntax, but the data is full of `es.: x: y` colons that break
  unquoted YAML.
- **Markdown with front matter**: senses and examples are structured data, not prose.

## Consequences

- Each entry page links straight to its file for editing, and pull requests touch one file.
- Schema and cross-file rules (unique ids, file name equals id, directory equals letter) run in
  CI.
- The repository holds about 3,700 small files, well under GitHub's per-directory display limit.
