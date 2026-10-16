# Iqra Rebuild – Execution Progress

Plan: `docs/superpowers/plans/2026-10-16-iqra-rebuild.md`
Branch: `main` (owner decision 2026-10-16: commit directly to main, one commit per task, no feature branches, no pushes unless asked)
Method: subagent-driven development. Fresh implementer per task, then spec review, then code quality review. Config-only tasks (pure deletions or JSON edits) get the spec review only.

## How to resume in a fresh session

Paste this prompt:

```
Resume the Iqra rebuild. Read docs/superpowers/plans/PROGRESS.md, then docs/superpowers/plans/2026-10-16-iqra-rebuild.md.
Use superpowers:subagent-driven-development. Continue from the first unchecked task. Work on main, one commit per task
with the Co-Authored-By line, never push. pnpm is not installed globally: use `npx pnpm@10.34.6`. Do not ask me questions;
decide using the plan's constraints and log every decision in PROGRESS.md under "Decision log". Update the checkboxes in the
plan and the task table below after each task. Stop after Task 6.5; Task 6.4 (EAS build) and 6.6 (flatten) need me.
```

To make it self-resuming after a usage limit reset, run inside the session (local only, keep the terminal open):

```
/loop 2h Resume the Iqra rebuild: read docs/superpowers/plans/PROGRESS.md and docs/superpowers/plans/2026-10-16-iqra-rebuild.md, and continue subagent-driven execution from the first unchecked task. If a task is already in progress in this session, do nothing. If all tasks through 6.5 are checked, stop the loop.
```

## Task status

| Task | Status | Commit | Notes |
|---|---|---|---|
| 0.1 Branch and baseline | done | 13355fb | typecheck + 4 tests pass, baseline e2e copied |
| 1.1 Delete packages and catalog | done | ce41975 | spec review passed, 359 packages removed |
| 1.2 Prune dependencies and platform config | next | | |
| 1.3 Scrub remnants | | | |
| 2.1 ESLint and Prettier | | | |
| 2.2 Jest with jest-expo | | | |
| 2.3 Playwright harness | | | |
| 2.4 CI | | | |
| 3.1 Speech, haptics, voice detection | | | |
| 3.2 Theme tokens | | | |
| 3.3 Scoring and progress v2 | | | |
| 3.4 Typed routes helper | | | |
| 4.1 Content model | | | |
| 4.2 Move Arabic content | | | |
| 4.3 Activity components | | | 3 commits |
| 4.4 Screens | | | |
| 5.1 Science content | | | placeholder, flagged |
| 5.2 Math content | | | placeholder, flagged |
| 5.3 Review items and Leitner scheduler | | | |
| 5.4 Review session screen | | | |
| 5.5 Home guidance | | | |
| 5.6 Docs refresh | | | |
| 6.1 Accessibility | | | |
| 6.2 Performance pass | | | APK/meminfo numbers need a device, record web bundle only |
| 6.3 E2E suite on new routes | | | |
| 6.4 Android device check | owner | | needs `eas login` with the owner's Expo account and a phone |
| 6.5 UI proposals doc | | | |
| 6.6 Flatten to root | owner | | optional, separate PR, owner decides |

## Owner inputs still open (none block Tasks 1.2 to 6.5)

- Expo account login for the EAS APK build (Task 6.4).
- An Android phone to verify TTS, haptics, tracing, persistence (Task 6.4).
- Yemen MoE Math and Science textbook material to align placeholder content (after 5.1 and 5.2; tracked in `docs/CONTENT_REVIEW.md`).
- A native Arabic speaker to review all authored content.
- A 1024 px padded foreground PNG if an adaptive icon is wanted (UI proposals).

## Decision log

- 2026-10-16: Work on main instead of a feature branch (owner).
- 2026-10-16: Code quality review skipped for Task 1.1 because the diff is deletions and JSON edits already verified line by line by the spec review.
- 2026-10-16: Execution paused by owner after Task 1.1 to preserve usage limit. Resume with the prompt above.
