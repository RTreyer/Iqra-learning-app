# Iqra (أَقْرَأُ وَأَتَعَلَّمُ) App Overview

Status snapshot as of 2026-10-17 (rebuild). Use this file as context when writing prompts to improve or extend the app.

## 1. Purpose

Offline-first learning app for children in Yemen, primary school grades 1 to 6. Target context is conflict zones with no reliable school access and no internet. The child must be able to use the app alone, without a teacher, without a login, without an account.

- Curriculum: official Yemen Ministry of Education primary subjects (Arabic, Math, Islamic Education, Science, Social Studies, English from grade 4).
- Teaching style: short playful activities, emoji based visuals, Arabic text to speech, haptic feedback, star rewards, instant quiz feedback.
- Interface: Arabic by default. English is available for menus and buttons only. Learning content always stays Arabic.

## 2. What exists today

The rebuild left one package with one content model (Book, Unit, Lesson) and one lesson screen.

| Book | Units | Lessons | State |
|---|---|---|---|
| Arabic Part 1 (`arabic-1`) | 8 | 155 | Unit 2 rebuilt from the textbook: 31 lessons (story, syllables, words, letter forms per letter, plus 3 exercises), grouped by letter, Yemeni SVG art in `components/art/Art.tsx`. Unit 3 rebuilt: 22 lessons (story, vowel listening, syllable train, sight words, letter forms, word writing per letter, plus 4 exercises). Unit 4 rebuilt: 25 lessons, the same run plus matching split words to words, built with `content/arabic/lessonKit.ts`. Unit 5 rebuilt the same way: 32 lessons (four letters ن ر د ت). Unit 6 rebuilt: 28 lessons (new letters ق ص ف), adds "complete the word" (a syllable train with given wagons) and a wide story picture per story, redrawn as SVG from the book page (`components/art/scenes`). Units 1, 7 and 8: earlier version |
| Math Part 1 (`math-1`) | 3 | 11 | Exemplary, from textbook Part 1 units 2 to 5 (numbers 0 to 10, add and subtract within 10, plane shapes). Not the full year |
| Science Part 1 (`science-1`) | 3 | 9 | Placeholder, no textbook source yet. `available: false`, shown as "قريباً" |
| Arabic Part 2 (`arabic-2`), Math Part 2 (`math-2`) | none | none | `available: false`, shown as "قريباً". Planned for v1.1 |
| Grades 2 to 6 | none | none | Listed on home as "قريباً" (`grades` in `content/catalog.ts`) |

Review status per unit: `docs/CONTENT_REVIEW.md`.

`build_word` (the syllable train, `components/activities/BuildWordActivity.tsx`): the child hears a word and loads its syllables into the wagons in reading order, among decoys with the same letter and another vowel. A round counts when no wrong tile was tapped; it is not a review item.

Lesson structure of the earlier Arabic units 7 and 8 (3 letters and a theme story per unit):
1. `story`: tap each sentence to hear it
2. `naming`: tap each vocabulary word to hear it
3. `letter_pick`: find the target letter among 3
4. `word_read`: hear a word and pick it among 3
5. `listen_pick`: comprehension questions about the story
6. `trace`: draw the letters on screen

Unit 1 uses `naming`, `listen_pick`, `behavior`, `matching` and `trace`. Math uses `counting`, `arithmetic`, `naming`, `matching` and `listen_pick`. Science placeholder uses `story`, `naming` and `listen_pick`.

## 3. Tech stack

- Monorepo: pnpm workspaces with one package, Node 24, TypeScript 5.9.
- App: Expo SDK 54, expo-router 6, React Native 0.81, React 19, New Architecture. Typed routes are off, a `lib/routes.ts` helper builds paths.
- Storage: AsyncStorage only. Key `@kidlearn_progress_v1` (schema v2) for progress, `iqra_ui_language` for language.
- Audio: expo-speech with Arabic locale. Haptics: expo-haptics.
- Graphics and input: react-native-svg and react-native-gesture-handler (Pan) for letter tracing. No icon fonts, no `expo-font`, no custom fonts. Icons are inline SVG or emoji.
- Tests: jest-expo with Testing Library for unit and component tests, Node test runner for content and translation data, Playwright for web end to end.
- CI: GitHub Actions (`.github/workflows/ci.yml`) runs typecheck, lint, test, test:data and test:e2e.
- Targets: Android (Expo Go for dev, EAS APK for release), static web (Netlify, SPA redirect).

## 4. Repository layout

```
package.json, pnpm-workspace.yaml   root scripts delegate to the app
netlify.toml                        web deploy, publishes artifacts/learn-app/dist
.github/workflows/ci.yml            CI
Start-Browser.cmd / Start-Handy.cmd Windows double click launchers
docs/                               UI_PROPOSALS.md, CONTENT_REVIEW.md, content/, superpowers/plans/
artifacts/learn-app/                the Expo app
  app/                  routes: _layout, index, book/[bookId], unit/[unitId], lesson/[lessonId], review, +not-found
  components/           shared UI: cards, badges, BackButton, UiText (auto translating Text), ErrorBoundary, ActivityHost
  components/activities/  one component per activity type, ReviewRound, shared/ (useQuiz, shuffle, ChoiceCard...), math/, trace/ (validate.ts, path.ts)
  content/              types.ts, catalog.ts, index.ts, ui-translations.ts, arabic/ (8 units), math/ (3), science/ (3)
  context/              ProgressContext (progress, hydration, persistence), LanguageContext
  hooks/                useLessonAttempt, useVoiceHint, useScreenPadding
  lib/                  scoring, srs, progressState, reviewItems, nextLesson, streak, dates, routes, params, labels, arabicNumbers, speech, haptics
  theme/tokens.ts       colours, spacing, touch target
  scripts/              content.test.mjs, ui-translations.test.mjs (test:data)
  e2e/                  Playwright specs and static server
  __tests__/            Jest tests (37 suites, 220 tests)
```

## 5. Routes

```
/                       home: continue card, review card, streak, star badge, grades 1 to 6 (grade 1 books, others "قريباً"), language switch
/book/[bookId]          units of a book
/unit/[unitId]          lessons of a unit
/lesson/[lessonId]      lesson (ids u1-1 .. u8-6, m1-1 .. m3-3, s1-1 .. s3-3), globally unique
/review                 today's review session
+not-found              fallback screen
```

## 6. Key behaviours

- Stars come from the score: 3 at 100 percent, 2 at 60 percent or more, otherwise 1 (`starsForScore`).
- Only the first tap of a round counts. The round locks after it.
- Answer positions are shuffled with a seeded shuffle at render time. Content data is not edited.
- Replaying a lesson starts a fresh attempt. Best stars are kept, stars are never added twice. Total is the sum of best results.
- Review session: items due today (Leitner boxes 1 to 5, intervals 1, 2, 4, 7, 14 days, local day). Up to 10 items, interleaved by kind, wrong items repeat once at the end, only the first answer is recorded. Correct promotes only when due, wrong resets to box 1. Review awards no stars.
- Home guidance: a continue card for the next lesson below 3 stars, a review card with the due count, a streak badge from 2 days.
- Voice hint banner appears when the device has no Arabic TTS voice.
- Tracing: gesture handler Pan draws strokes on an SVG pad. A heuristic checks stroke count, path length (50 percent of the shorter pad side), bounding box (20 percent of width or 15 percent of height) and centroid (within 35 percent of centre). It is an effort check, not shape matching.
- Opening a lesson speaks the title first, then the activity mounts.
- Language switch persists and affects only strings wrapped in `UiText` or passed through `translateUi`.
- Progress is stored with a corrupt blob backup. Storage read errors never overwrite saved stars.
- No network requests at runtime. Desktop browser shows a centered 480 px phone frame.

## 7. Commands

```bash
pnpm install
pnpm typecheck        # root scripts delegate to @workspace/learn-app
pnpm lint
pnpm test             # Jest: 37 suites, 220 tests
pnpm test:data        # 21 tests (content integrity, UI translations)
pnpm test:e2e         # web export, then Playwright
pnpm build:web        # static export to artifacts/learn-app/dist/ (1.53 MB after Task 4.4)
pnpm --filter @workspace/learn-app run web    # dev in browser
pnpm --filter @workspace/learn-app run dev    # Expo Go QR
eas build -p android --profile preview        # APK, run in artifacts/learn-app
```

If pnpm is not installed globally, prefix with `npx pnpm@10.34.6`.

## 8. Known gaps

The ten defects of the earlier prototype are fixed or removed (stars ignored score, fixed correct answer position, empty available books, lesson ID collision, broken root build, dead backend, code duplication, README overstating content, partial translation of lesson chrome, README drift). Current gaps:

1. Device verification pending: TTS, haptics, tracing and persistence are not yet checked on a real Android phone (Task 6.4).
2. Science content is a placeholder until the owner provides the textbook.
3. Native Arabic speaker review of all authored content is pending.
4. Playwright covers navigation, scoring, tracing, math, science, English mode, axe contrast and the spaced repetition loop (18 tests); device verification of the APK is pending.
5. Accessibility pass pending (Task 6.1): back link colour on gradients, header rows mirrored in Arabic, activity instruction strings in `UiText`.
6. Backlog from `docs/superpowers/plans/PROGRESS.md`: speech `onDone` guard, title fallback by text length, stop speech before `router.replace`, `withAlpha` dev assertion, a shared `useChoiceRound`, retry hydration when both storage reads fail, one rewrite of a v2 blob per launch.
7. Arabic dual and plural wording for review and streak counts was fixed in the last commits. Keep using the shared label helper (`lib/labels.ts`).
8. Shape emoji for square and rectangle render poorly on some Android fonts. Replace with inline SVG (UI proposal 3).
9. Math covers part of Part 1 only. Part 2 (units 6 to 10) is not started.

## 9. Constraints and conventions to respect

- Do not change existing lesson content, stories, vocabulary, quiz questions, layouts or navigation unless explicitly instructed (owner rule in README).
- English applies to menus and buttons only. Never translate learning content or Arabic speech.
- Completed content must stay replayable without limit. Keep best stars, never multiply rewards.
- 100 percent offline. No login, no accounts, no cloud. Avoid adding network dependencies.
- Run `pnpm typecheck` and `pnpm test` after every change.
- Keep the Metro `blockList` entries in `metro.config.js`.
- Use inline SVG rather than icon fonts for anything that must render on web.

## 10. Improvement areas (candidate roadmap)

Near term (from the rebuild plan)
- Task 6.1 accessibility, 6.2 performance pass, 6.3 end to end suite on the new routes, 6.4 Android device check.
- Backlog items listed in section 8.

Product (13 proposals in `docs/UI_PROPOSALS.md`)
- High value: icon set and SVG shapes instead of emoji, sound on/off toggle, parent area with reset (the `resetProgress` function exists without UI), bundled mp3 fallback for devices without Arabic TTS.
- Medium: dark mode via tokens, adaptive Android icon (needs owner asset), big text toggle, progress ring, RTL audit in English mode, first launch onboarding, Arabic Part 2 return, mastery badges per letter.
- Low: daily review reminder.
- A shared small `settings` store serves proposals 1, 4, 6, 10 and 12.
- Tracing: heuristic now, graded shape matching against guide paths later.

Content
- Fill Arabic Part 2, the rest of Math (Part 1 and Part 2), Science from the real textbook, then Islamic Education and Social Studies.
- Expand to Grades 2 to 6 using the existing `Book` and `Unit` model in `content/types.ts`.

## 11. How to use this file for prompting

A good improvement prompt should name:
1. The target (a section 10 item or a gap from section 8).
2. The files involved (section 4).
3. The constraints that must hold (section 9).
4. The verification to run (section 7, plus the behaviours in section 6).

Example: "Add a sound on/off toggle (UI proposal 6). Touch `lib/speech.ts`, `lib/haptics.ts` and the lesson header, plus a new settings context. Do not alter any lesson data. Keep the 48 px touch target. Run typecheck, lint, test and test:data. Confirm `speak()` is silent when muted."
