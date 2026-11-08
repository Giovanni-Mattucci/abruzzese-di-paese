# 0001. Record architecture decisions

- Status: Accepted
- Date: 2026-11-07

## Context

The project is open source and maintained by volunteers who join at different times. Choices made
during the initial build, such as the framework, the data format and the licence, are not obvious
from the code alone, and contributors will reasonably ask why things are the way they are.

## Decision

Record each significant decision as a numbered Markdown file in `docs/adr/`, using the short
format in `template.md`: context, decision, alternatives considered, consequences. Records are
not edited after acceptance except to mark them superseded.

## Alternatives considered

- **Wiki pages**: separate from the code and its history, and easy to let drift.
- **Comments and commit messages only**: scattered, and hard to find when a question comes up.

## Consequences

Contributors can understand and challenge past choices with full context. Revisiting a decision
means writing a new record, which keeps the history honest.
