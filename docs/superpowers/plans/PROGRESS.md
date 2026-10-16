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
plan and the task table below after each task. Run Task 6.4's EAS build (account cj8181) but leave device testing to me.
Task 6.6 (flatten) is mine, skip it. Never stop on a blocker: if a task truly needs my input, mark it "waiting for owner"
in the table with the exact question, then continue with every other task that does not depend on it. Only stop when
all remaining unchecked tasks are waiting for owner input or done.
```

## Blocker policy (owner instruction 2026-10-16)

A blocked task never halts the run. The dependency order between tasks is:

- 1.2 → 1.3 (same files)
- 2.1, 2.2, 2.3 are independent of each other; 2.4 needs all three
- 3.1, 3.2, 3.4 are independent; 3.3 needs nothing from 3.x
- 4.1 → 4.2 → 4.3 → 4.4 (strict chain); 4.x needs 3.1, 3.3, 3.4 done
- 5.1, 5.2 need 4.1 only and are independent of each other; 5.3 → 5.4 → 5.5 needs 4.4; 5.6 needs 5.1 to 5.5
- 6.1, 6.2, 6.3 need 4.4 and 5.5; 6.5 needs nothing; 6.4 needs 6.3

When a task is blocked: mark it "waiting for owner: <question>" in the table, log it in the decision log, skip tasks that
depend on it, and take the next unchecked task whose dependencies are met. Prefer a documented assumption over waiting
whenever the plan or APP_OVERVIEW.md gives enough to decide.

To make it self-resuming after a usage limit reset, run inside the session (local only, keep the terminal open):

```
/loop 2h Resume the Iqra rebuild: read docs/superpowers/plans/PROGRESS.md and docs/superpowers/plans/2026-10-16-iqra-rebuild.md, and continue subagent-driven execution from the first unchecked task. If a task is already in progress in this session, do nothing. If all tasks through 6.5 are checked, stop the loop.
```

## Task status

| Task | Status | Commit | Notes |
|---|---|---|---|
| 0.1 Branch and baseline | done | 13355fb | typecheck + 4 tests pass, baseline e2e copied |
| 1.1 Delete packages and catalog | done | ce41975 | spec review passed, 359 packages removed |
| 1.2 Prune dependencies and platform config | done | 32b42d4 | spec review passed, 64 packages removed, web bundle 2.82 MB → 2.06 MB, expo-doctor 18/18 |
| 1.3 Scrub remnants | done | c593a56 | spec review passed |
| 2.1 ESLint and Prettier | done | cf008b9, b4b013c | 0 errors, 8 no-require-imports warnings in app/(tabs) (rewritten in Phase 4); temporary overrides: (tabs) href ban until 4.4, e2e import resolution until 2.3; Prettier would reformat 36 files, deferred |
| 2.2 Jest with jest-expo | done | da82449, 62d2de7 | hoisted node_modules (delete node_modules and reinstall once), `expo-.*` added to transform allow list, 1 jest + 4 data tests |
| 2.3 Playwright harness | done | 229d8cb | baseline suite converted to @playwright/test, serial shared page, 14 pass + axe skipped until axe-core added |
| 2.4 CI | done | f5cd869 | verified inline by controller (single yaml) |
| 3.1 Speech, haptics, voice detection | done | 813b592, c339eb0, 56284e1 | spec + code review passed; banner is an absolute overlay; web waits once for voiceschanged |
| 3.2 Theme tokens | done | 75dc06e | spec review passed; legacy `variant` prop kept until 4.4 |
| 3.3 Scoring and progress v2 | done | ded07c5, 4b5e9e7, 9d0e855 | spec + code review passed; reducer + single persistence effect; read errors never overwrite stored stars; corrupt blobs backed up |
| 3.4 Typed routes helper | done | 0896104 | includes `review()` |
| 4.1 Content model | done | a4fc4fd, a80116e, 83e44fc | spec review passed; code quality folded into the 4.3 review |
| 4.2 Move Arabic content | done | ad71e4a | 40 legacy lessons byte identical, u1-5 → trace, u2-6 … u8-6 added; legacy constants kept until 4.4 |
| 4.3 Activity components | done | e68ffd3, 7dffdcd, ba0e57b, cb39f98, af1b371, 019d5a8 | spec + code review passed (two fix rounds); 131+ jest tests |
| 4.4 Screens | done | 1c9b8ca, 96ab340, f126146, 96b9d43 | spec + code review passed (one fix round); icon fonts dropped, web bundle 1.53 MB; 182 jest tests |
| 5.1 Science content | done | 6890685, 830a447 | 3 units, 9 lessons, placeholder; spec + Arabic review passed |
| 5.2 Math content | done | c9cb8e0, 80dce34, 830a447 | 3 units, 11 lessons from textbook Part 1 (numbers 0 to 10, add/sub within 10, plane shapes); `numberToArabicWord` follows after 4.3 lands `lib/arabicNumbers.ts` |
| 5.3 Review items and Leitner scheduler | done | a215936, 7accc6c | spec + code review passed; promote only when due, wrong always resets; due by local day; clock skew guard |
| 5.4 Review session screen | done | a0cce03, db3a3e4 | spec + code review passed; answers recorded at tap time; session mounts after hydration; `hydrated`/`loadSettled` exposed |
| 5.5 Home guidance | done | 05149de, 947e0eb | review passed; Arabic dual/plural labels via lib/labels.ts |
| 5.6 Docs refresh | done | 51fe5ab, f26925e | README 72 lines, APP_OVERVIEW rewritten, UI_PROPOSALS paths fixed |
| 6.1 Accessibility | done | f77b8e8, 84c3bc8 | review passed; roles/labels/48 px everywhere, 4.5:1 via `readableFill` darkened fills (white text kept), RTL headers, instruction strings translatable, a11y jest test |
| 6.2 Performance pass | in progress | | APK/meminfo numbers need a device, record web bundle only |
| 6.3 E2E suite on new routes | done | ce8c14d, c3861f5 | 18 passed, 1 skipped (no unavailable book), 82 s wall; axe icon font heuristic skips Arabic text, test uses its own node filter; unit page contrast mostly "incomplete" in axe (gradients), checked by hand in 6.1 |
| 6.4 Android device check | ready for build | | EAS login verified 2026-10-16 (primary account `cj8181`; a second account `cj818181` also exists, use `cj8181` for `eas init` unless the owner says otherwise). Device testing still needs the owner's phone |
| 6.5 UI proposals doc | done (path check in 5.6) | 0fb8b9c | 13 proposals + tracing roadmap; file paths referencing app/(tabs) must be updated in 5.6 after 4.4 |
| 6.6 Flatten to root | owner | | optional, separate PR, owner decides |

## Owner inputs still open (none block Tasks 1.2 to 6.5)

- An Android phone to verify TTS, haptics, tracing, persistence (Task 6.4).
- Science textbook material to align the Science placeholder content (after 5.1; tracked in `docs/CONTENT_REVIEW.md`).
- Math textbooks received 2026-10-16 (Grade 1, Sanaa, Part 1 ed. 2026 and Part 2 ed. 2022), Arabic PDFs, about 11 MB and 8 MB:
  - `/Users/start/Downloads/OneDrive_1_10-16-2026/كتاب_الرياضيات_الجزء_الأول_الطبعة_2026_الصف_الأول_صنعاء_اليمن.pdf`
  - `/Users/start/Downloads/OneDrive_1_10-16-2026/كتاب_الرياضيات_الجزء_الثاني_الطبعة_2022_الصف_الأول_صنعاء_اليمن.pdf`
  Task 5.2 uses them as the base for a small exemplary math set only. Outline extracted 2026-10-16 (scanned PDFs, read visually): scratchpad `math-books/outline.md`, to be copied into `docs/content/MATH_TEXTBOOK_OUTLINE.md` in Task 5.2. Part 1 has 5 units (sorting/patterns, numbers 0 to 10, addition within 10, subtraction within 10, shapes/fractions); Part 2 has units 6 to 10 (to 20, add/sub within 20, to 100, add/sub within 100, measurement). Books use Eastern Arabic digits, زائد / ناقص / يساوي.
- A native Arabic speaker to review all authored content.
- A 1024 px padded foreground PNG if an adaptive icon is wanted (UI proposals).

## Backlog (small, non blocking)

- Polish from the 4.4 re-review: guard `speak` onDone so it fires once; title fallback based on text length instead of fixed 1500 ms; stop speech in the "next lesson" handler before `router.replace` if Android cuts the next title; `withAlpha` dev assertion for non 6 digit hex; stale vector-icons comment in BackButton.tsx.

- Activities: wrap instruction strings ("سؤال N من M", "ابحث عن الحرف", matching/story/naming hints) in UiText with a pattern rule, after 4.4 (ui-translations.ts ownership).
- Activities: shared `useChoiceRound` to dedupe LetterPick/WordRead/ListenPick (optional).

- ProgressContext: if both storage reads fail, the session runs in memory only. Follow up: retry hydration when an unhydrated provider receives a completion, or on AppState `active`.
- ProgressContext: LOADED marks the state dirty even when the blob was already v2, so every launch rewrites the blob once. Harmless.
- Replace `@expo/vector-icons` with inline SVG to drop `expo-font` (UI proposals).

## Decision log

- 2026-10-16: Work on main instead of a feature branch (owner).
- 2026-10-16: Code quality review skipped for Task 1.1 because the diff is deletions and JSON edits already verified line by line by the spec review.
- 2026-10-16: Execution paused by owner after Task 1.1 to preserve usage limit. Resume with the prompt above.
- 2026-10-16 (evening): Owner restarted the run. Session loop active every 10 minutes (cron job e35b9185, session only). Commits stay local, nothing is pushed without explicit owner approval.
- 2026-10-16: Model policy (owner: "use the appropriate models to stay efficient"). Implementers: sonnet for config, deletion and data tasks (1.2, 1.3, 2.x, 3.2, 3.4, 5.1, 5.2, 5.6, 6.5); opus for multi file code tasks (3.1, 3.3, 4.x, 5.3 to 5.5, 6.1 to 6.4). Spec reviewers: sonnet. Code quality reviewers: opus. Config only tasks get spec review only.
- 2026-10-16: u1-5 trace guides use ـــ | / ◯ 〰 (the existing five shapes: horizontal, vertical, diagonal, circle, zigzag); the plan's "arc" did not exist in the content, so no new shape was invented.
- 2026-10-16: `allowImportingTsExtensions` enabled so Node type stripping can run data tests directly on the TS content; content modules import each other with `.ts` extensions and must stay free of react-native imports. `SUBJECT_COLORS` lives in `content/types.ts`, `theme/tokens.ts` re-exports it.
- 2026-10-16: Leitner rule (code review): a correct answer promotes only when the item is due; a wrong answer always resets to box 1. Due dates are local midnight, compared by day key, so an item seen in the evening is due the next morning. Items with dueAt more than 14 days ahead count as due (clock skew).
- 2026-10-16: Lesson open sequence: the title is spoken first and the activity mounts after the title finishes (or after 1.5 s), so the activity's own prompt is not cut off.
- 2026-10-16: Math content scope (owner: exemplary, not a full year): 3 units / 11 lessons mapped to textbook Part 1 units 2, 3+4 and 5. Science stays placeholder until the owner provides the textbook. Shape emoji: 🔲 for square (Emoji 1), ▬ text glyph for rectangle, to be replaced by inline SVG shapes (UI proposals).
- 2026-10-16: Math numbers display in Eastern Arabic digits (textbooks use them); `lib/arabicNumbers.ts`.
- 2026-10-16: Implementers no longer run in parallel after a shared git index swept Task 3.2 deletions into a Task 3.1 commit (history rewritten locally before anything was pushed: c339eb0, 75dc06e, 0896104). Rule: all agents commit with `git commit --only <paths>`; at most one implementer writes at a time unless file sets are disjoint and both use `--only`.
- 2026-10-16: Task 4.2 keeps the six legacy `constants/*` files (with a LEGACY comment) until Task 4.4 deletes `app/(tabs)`, so typecheck stays green between tasks.
- 2026-10-16: Code quality review skipped for 3.2 (token values verified one by one) and 3.4 (nine lines).
- 2026-10-16: Code quality review skipped for 2.1 to 2.4 (config, mechanical autofix and harness conversion, each verified line by line by the spec review). Full code quality reviews start with 3.1.
- 2026-10-16: Task 2.1 lint fix in useLessonAttempt initially dropped `lessonKey` from the focus effect deps (behaviour regression). Fixed in b4b013c with useCallback keyed on lessonKey. Repo-wide Prettier format deferred to avoid a noise diff; run `pnpm --filter @workspace/learn-app run format` once after Phase 4.
- 2026-10-16: Task 1.2 kept `expo-font` as a dependency because `@expo/vector-icons` (used by BackButton, ErrorFallback, UiChevron and screens) requires it as a peer; the `expo-font` plugin and custom fonts are gone. Replacing vector icons with inline SVG is noted for the UI proposals (Task 6.5).
- 2026-10-16: Task 5.2 scope fixed to Part 1 Units 2, 3 and 5 (numbers 0 to 10, addition within 10, plane shapes), optionally one Part 2 unit. Exemplary only.
- 2026-10-16: Owner provided the Yemen Grade 1 Math textbooks (see "Owner inputs"). Task 5.2 derives a small exemplary set of lessons from them (two to three units, not a full year). Content stays illustrative; the textbooks are the base.
