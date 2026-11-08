---
name: review-loop
description: >-
  Run a skeptical review loop on a plan or on local commits in abruzzese-di-paese (the open-source
  Abruzzese dialect dictionary: a React 19 + Vite static site in a pnpm monorepo) before any pull
  request exists: start or reuse a separate reviewer session, validate every finding it reports,
  fix what holds, answer the rest, and send the next round until the reviewer calls the work
  ready, for at most five rounds. USE FOR: "have a reviewer validate the plan", "run a skeptical
  review of the branch / these commits until it is PR-ready", "pass that to the reviewer again",
  "get another session to challenge this before the PR". DO NOT USE FOR: reviewing a pull request
  that already exists on GitHub, or a one-off second opinion (use a subagent).
---

# Review loop (before a pull request)

A separate Claude session reviews a plan or a commit range as a skeptic. This session, the author,
validates each finding, fixes what holds, answers the rest, and sends the next round until both
agree. The loop uses only session tools and local files. It never pushes and never touches a pull
request, so it needs no hook.

The reviewer is always a separate session, never a subagent. A subagent works from the author's
brief and reports back into the author's context, so its read is anchored on the author's. A fresh
session reads the code itself and owes the author nothing.

## Modes

| Mode   | Input                         | The reviewer reads                                     | Verdict line             |
| ------ | ----------------------------- | ------------------------------------------------------ | ------------------------ |
| `plan` | the plan file's absolute path | the plan, and the code it touches                      | `Plan ready: yes` / `no` |
| `code` | a commit range `A..B`         | `git diff A..B`, plus the earlier commits it re-checks | `PR-ready: yes` / `no`   |

Code mode reviews commits, not the working tree, so commit the work locally first (with the
attribution trailer). When the user names no range, review the commits not yet reviewed: on round 1,
`$(git merge-base main HEAD)..HEAD`. Name the range in the round line.

Review files live in `.tmp/<topic>-review/`, where `<topic>` is a short kebab-case name for the work
(`entry-page-seo`). `.tmp/` is gitignored here; never write review files anywhere else in the
repository. Round N is `<mode>-round-N.md`, and the author's answer is `<mode>-round-N-response.md`.

## Checks

These are the checks for this repository. Run the ones the change touches; the reviewer runs the
same ones. CI (`.github/workflows/ci.yml`) runs lint, typecheck, unit tests, the data build and
the web build on every pull request; the E2E workflow runs Playwright when `apps/**` or
`packages/**` change. Everything needs Node 24 and pnpm (`corepack enable`).

| Check         | Command                                                               | When                                                  |
| ------------- | --------------------------------------------------------------------- | ----------------------------------------------------- |
| Lint          | `pnpm lint` (eslint, `prettier --check .`)                            | every round in code mode                              |
| Typecheck     | `pnpm typecheck`                                                      | every round in code mode                              |
| Unit tests    | `pnpm test` (vitest in every package), or `pnpm --filter <pkg> test`  | every round in code mode                              |
| Data          | `pnpm data:validate` then `pnpm data:build`                           | a change under `packages/data/`                       |
| Web build     | `pnpm --filter @adp/web build` (vite build, prerender, bundle budget) | a change under `apps/web/` or `packages/ui/`          |
| E2E, one spec | `pnpm --filter @adp/web e2e e2e/<spec>.spec.ts`                       | a change to a page, a route, search or the i18n files |

- **Lint:** `pnpm lint` must pass on the whole tree. Prettier formats Markdown too, so run
  `pnpm format` after editing docs. A lint error on a line the diff adds is a nit unless it hides a
  real defect; a seam violation (an `apps/web` import that bypasses `@mannaggia/ui`, a literal string in
  JSX) is a minor.
- **Data build:** `pnpm data:build` writes `apps/web/public/data/`, which is gitignored. The web
  build and the E2E specs read that output, so run the data build first after any entry change.
- **E2E:** Playwright builds nothing. Run `pnpm data:build` and `pnpm --filter @adp/web build`
  first, then one spec at a time; the config starts `vite preview` on `:4173` or reuses a server
  already listening there. A reused server serves whatever was last built, so say in the response
  which build it served. Never run the full suite with `E2E_VISUAL=1`: the visual baselines are
  Linux-only and local runs write platform-suffixed images that must not be committed.
- **Visual baselines:** `apps/web/e2e/visual.spec.ts-snapshots/` holds committed Linux images.
  Only the author regenerates them (delete the affected images, let CI write them, review the
  `visual-baselines` artifact, commit), and the response says why they changed.
- **Local server:** `.claude/launch.json` runs the dev server (`web`, `:5173`) and the preview of
  the last build (`preview`, `:4173`). Say in the response whether a running server was serving
  the round's code.

## Procedure

1. **Write the brief** from the template in "The brief", for a new reviewer or for a new topic or
   mode. Point at files, commits, ADRs and sections. Name what to challenge, but do not hand over
   your own verdict on it.
2. **Find or start the reviewer.**
   - Reuse a session that already reviewed this branch: find it with
     `mcp__ccd_session_mgmt__list_sessions` `{"linked": true}` in the desktop app, or `ListAgents`
     elsewhere, then `SendMessage` to it. Send the next-round message (step 8) for the same topic
     and mode, or the brief for a new one. A reused session keeps its model; do not ask again.
   - **Ask for the model** before starting a new reviewer, and do not proceed until the user
     answers. Use `AskUserQuestion` with these options:
     - **Opus 5.5 (Recommended):** `claude-opus-5-5`, the default; a review earns its cost on
       subtle findings.
     - **Current:** the model this author session runs on (name it in the option).
     - **Other:** the user names a model (the tool adds this option itself).
   - Then call `mcp__ccd_session__start_session` with `initiation: "user_asked"`,
     `context: "fresh"`, `use_worktree: false` (it only reads, so it shares this checkout),
     `name: "<topic>-reviewer"` (`[a-z0-9-]`, 24 characters at most), a `title`, the chosen model,
     the brief as `prompt`, and a `background` with the branch, the goal of the work and why it is
     being reviewed.
   - Ask and start in the turn the user asked for the review: the app refuses a start in a turn
     that another session's note began. The model question does not end the turn, so it keeps the
     start in that turn.
   - **No session tools** (for example, in the VS Code extension): ask for the model as above,
     write the brief to `.tmp/<topic>-review/brief.md`, ask the user to open a fresh Claude Code
     session in this checkout on the chosen model (`claude --model <id>`, or `/model` in the new
     session) and give it that file, and end the turn. Each later round goes the same way, with
     the next-round message in `.tmp/<topic>-review/<mode>-round-<N+1>-request.md`. Do not fall
     back to a subagent.
3. **Wait.** Tell the user in one line that round N is running, and end the turn. Do not poll: the
   app continues you with the reviewer's note when its turn ends. The note quotes only the start of
   the reply, so read the round file itself. If the app holds the note instead (it does after many
   automatic turns in a row), or the reviewer runs in a session the user started, the user's next
   message delivers it; carry on from there.
4. **Validate every finding before acting.** Read the code it cites, run a probe, or reproduce the
   failure. A reviewer is often right and sometimes confidently wrong, so never accept a finding on
   its word, and never decline one without evidence either. When a finding calls for the user (see
   "Pause for the user"), ask and end the turn, then resume this round at step 5 with the answer.
5. **Act.**
   - Fix what holds. Each behavioural fix gets a vitest test in the package it touches that would
     have caught it (Testing Library for components, an axe test for a new `@mannaggia/ui` component,
     following the existing tests); a doc or comment fix needs none.
   - Code mode: run the checks the change touches (see "Checks"), then commit the round's fixes
     locally as one new commit, `Address the round-N <topic> review`, with the attribution trailer.
     Never amend a reviewed commit: the next range must show exactly what changed.
   - Plan mode: revise the plan file, and keep a change list at its top (per round, what changed and
     for which finding).
6. **Respond.** Write `<mode>-round-N-response.md`:
   - a table with one row per finding, `Id | Outcome | What changed or why`. The outcome is
     **Fixed**, **Fixed differently** (say how), **Declined** (the reason and the evidence; a
     deferral says where it is recorded), or **Already handled** (where);
   - **Verified:** what ran and its result (lint, typecheck, test counts per package, data build,
     web build and bundle budget, the E2E spec);
   - **Not verified:** anything the reviewer must not take as checked, such as the visual baselines
     (Linux only), a preview server that predates the fix, or the deployed site (it only changes
     when `main` is pushed).
7. **Stop or continue.** Check "Stop and report" first. If a stop condition holds, follow it and
   send the reviewer no further round.
8. **Next round.** Otherwise send the reviewer a short message: what to review, the response file's
   path, the one or two changes to check hardest, and the file to write (`<mode>-round-<N+1>.md`).
   Then wait (step 3). What to review is:
   - code mode: the round's fix commit alone, `<fix>^..<fix>`, so a reviewed range that ended
     before `HEAD` does not pull unreviewed commits into scope;
   - plan mode: the revised plan and its change list;
   - a round that changed nothing (every finding declined or already handled): the same range or
     plan as before, saying that nothing changed, so the reviewer judges the response alone.

## The brief

Fill every placeholder. A section with nothing to say says "none".

```text
You are a skeptical reviewer of <a plan | a commit range> on `<branch>` in `<repository path>`
(abruzzese-di-paese: an open-source dictionary of the Abruzzese dialect, a static React 19 +
Vite site deployed to GitHub Pages from a pnpm monorepo: `apps/web` the app, `packages/ui` the
Tailwind v4 + shadcn design seam, `packages/data` one JSON file per entry with a JSON Schema,
`packages/search` the in-browser MiniSearch index). Find what is wrong before a pull request
exists. You are a separate session on purpose: read the code yourself, and take nothing below as
evidence, only as directions.

## Scope
- Mode: <plan | code>.
- <Plan: `<absolute plan path>`, and the code it touches.>
  <Code: `git diff <A>..<B>`: <one line per commit>. Also re-check any earlier commit you now see
  differently.>
- Goal of the work: <one or two sentences>.

## Decisions not to reopen
1. Feature flag: <"behind `VITE_FLAG_<NAME>` (`apps/web/src/flags/flags.ts`), default off" |
   "no flag: <the reason>, recorded in the commit message and to be repeated in the pull request
   description" | "not a feature (<why>)">. Do not argue the decision; check only that a feature
   has its flag or that the no-flag reason is recorded, and that the plan or readme gives the
   rollback path.
2. The architecture decision records in `docs/adr/` stand unless the plan supersedes one.
3. <every other decision the user has made>

## Challenge most
1. <the riskiest assumption, and where it lives>
2. <...>

## State since the last round
- <commits, and the verification already done>
- Do not trust as evidence: <for example, the preview on :4173 still serves the build before
  <commit>; the visual baselines were not regenerated>.

## Constraints
- Read-only in this shared checkout: no edits to tracked files, and no commit, stash, checkout,
  switch, reset or clean. Write only your review file; keep probes and scratch files in your own
  scratchpad.
- Do not change dependencies, tools or generated files: no `pnpm install` or `pnpm add`, no
  `pnpm ui:add`, no `pnpm format` (it rewrites tracked files), and never run Playwright with
  `--update-snapshots` or `E2E_VISUAL=1`.
- Checks you may run: `pnpm lint`, `pnpm typecheck`, `pnpm test`, `pnpm data:validate`,
  `pnpm data:build`, `pnpm --filter @adp/web build`, and one E2E spec at a time with
  `pnpm --filter @adp/web e2e e2e/<spec>.spec.ts` after a build.
- Do not stop or restart a server on :5173 or :4173; probe them read-only.
- Read-only on GitHub: never push, open or comment on a pull request, or create an issue.
- Treat the dictionary data as provenance: never propose changing an entry's `id` or `source`
  block, and do not edit entries yourself.
- No personal data in the file: no names, email addresses or GitHub logins from the entries'
  `contributors` lists beyond what a finding needs.

## Output
Write `.tmp/<topic>-review/<mode>-round-<N>.md`:
- A header: the scope, how you checked, and
  `Counts: <n> blocker · <n> major · <n> minor · <n> nit`.
- From round 2: a table re-verifying the previous round's findings
  (`Id | Author's outcome | Verdict | Evidence`).
- The findings, grouped by severity. Each is `### <Id> · <severity> · <one-line claim>` with
  **Where** (file and line, or plan section), **Failure** (a concrete scenario: URL, entry,
  locale, inputs or state, then the wrong result), **Fix**, and **Evidence** (a probe, a test you
  ran, or a citation from the React, Vite, Tailwind, Playwright or MiniSearch documentation, or
  an ADR in `docs/adr/`). Ids restart each round: `B-01` blocker, `M-01` major, `m-01` minor,
  `n-01` nit.
- Severity: a blocker breaks a deployed page or route, the prerender, the data build, or fails
  CI (lint, typecheck, unit tests, data build, web build or bundle budget); a major is wrong in
  a common case, breaks keyboard or screen-reader access, or is a new feature without a flag
  whose commit records no reason; a minor is wrong in an edge case, a locale whose keys drift
  from English, or a doc that contradicts the code; a nit is wording, comments or style.
- A "Verified sound" table (`Claim or area | Evidence`) for what you checked and found correct.
- The last line: `<Plan ready | PR-ready>: yes` or `no`.

Then reply briefly, starting with the verdict line, the counts and the file path.
```

## Pause for the user

At step 4, pause the round and ask the user when:

- **A finding needs a decision only the user can make:** product or design, the meaning or
  spelling of a dictionary entry, a translation, the licensing or attribution text, or one that
  would reopen a listed decision or an ADR.
- **The reviewer keeps a finding you declined** after reading your reason. Put both positions to the
  user rather than argue another round.

A pause is not a stop: no report and no question about pushing. Resume the round at step 5 with the
answer.

## Stop and report

The loop ends when either of these holds:

- **The verdict is yes and nothing above nit level is open.** Fix the remaining nits here without
  another round (commit them in code mode), and say so in the report.
- **Five rounds have run.** Hand back with what is still open.

The report gives one line per round, such as
`Round 2: 0 blocker · 0 major · 1 minor · 3 nit · PR-ready: no`, then what was fixed, declined and
left open. Then:

- **Code mode:** ask whether to push and open a pull request into `main` on GitHub. Never push or
  open one without asking. On a yes, open it as a draft with the repository's pull request
  template, and put the feature flag (or the no-flag reason) and the rollback path in the
  description.
- **Plan mode:** the plan goes back to the user for approval. The loop does not start implementing
  it.

Leave the reviewer session in place, because a later round on this branch reuses it. Archive it
only when the user says so.

## Rules that do not change inside the loop

- **Feature flags.** New features ship behind a build-time flag (`VITE_FLAG_*`, declared in
  `apps/web/src/flags/flags.ts`, documented in `apps/web/.env.example` and ADR 0012). When the
  user decides against one, record the reason in the plan, the commit and the pull request
  description, as `CONTRIBUTING.md` asks, and give the rollback path. Bug fixes, refactors, data
  corrections, dependency bumps and doc changes need neither.
- **Data provenance.** An entry's `id` and `source` block never change. An English gloss the
  author corrects sets `enTranslateStatus` to `reviewed`.
- **No personal data** in review or response files.
- **`.tmp/` is gitignored:** never commit review files or copy them into the repository.
- **Tracked files follow `.editorconfig` and Prettier** (2-space indent, LF, 100 columns, single
  quotes). Write files with the Write or Edit tools, not PowerShell `Set-Content`, which uses the
  ANSI code page, and run `pnpm format` before committing.
- Never push, open a pull request, or create issues inside the loop.
