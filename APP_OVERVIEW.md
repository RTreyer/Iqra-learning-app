# Iqra (أَقْرَأُ وَأَتَعَلَّمُ) – App Overview

Status snapshot as of 2026-10-16. Use this file as context when writing prompts to improve or extend the app.

## 1. Purpose

Offline-first learning app for children in Yemen, primary school grades 1 to 6. Target context is conflict zones with no reliable school access and no internet. The child must be able to use the app alone, without a teacher, without a login, without an account.

- Curriculum: official Yemen Ministry of Education primary subjects (Arabic, Math, Islamic Education, Science, Social Studies, English from grade 4).
- Teaching style: short playful activities, emoji based visuals, Arabic text to speech, haptic feedback, star rewards, instant quiz feedback.
- Interface: Arabic by default. English is available for menus and buttons only. Learning content always stays Arabic.

## 2. What exists today

| Area | State |
|---|---|
| Grade 1 Arabic Part 1 | 8 units, 45 lessons (Unit 1: 5 pre-reading lessons, Units 2 to 8: 5 lessons each on letter phonics) |
| Grade 1 Arabic Part 2 | Marked available, but 0 lessons (empty screen) |
| Grade 1 Math Part 1 | Marked available, but 0 lessons (empty screen) |
| All other Grade 1 books | Marked "coming soon" |
| Grades 2 to 6 | Placeholder "coming soon" screens |

Unit structure for Units 2 to 8 (one unit = 3 letters + a theme story):
1. `story` – tap each sentence to hear it
2. `naming` – tap each vocabulary word to hear it
3. `letter_pick` – 5 rounds, find the target letter among 3
4. `word_read` – 5 rounds, hear a word and pick it among 3
5. `listen_pick` – 3 comprehension questions about the story

Unit 1 (pre-reading) has its own activity types: `naming`, `listen_pick`, `behavior`, `matching`, `drawing`.

## 3. Tech stack

- Monorepo: pnpm workspaces, Node 24 (works on 26), TypeScript 5.9.
- App: Expo SDK 54, expo-router 6, React Native 0.81, React 19, React Compiler and New Architecture enabled.
- Storage: AsyncStorage only. Key `@kidlearn_progress_v1` for progress, `iqra_ui_language` for language.
- Audio: expo-speech with Arabic locale. Haptics: expo-haptics.
- Targets: Android (Expo Go for dev, EAS APK for release), static web (Netlify, SPA redirect).
- Fonts: Inter via expo-google-fonts. Icons: inline SVG via react-native-svg (icon fonts avoided for web reliability).

## 4. Repository layout

```
artifacts/learn-app/              the Expo app (the only package that matters)
  app/_layout.tsx                 providers, splash, 480px web frame
  app/(tabs)/index.tsx            home: grade grid, star badge, language switch
  app/(tabs)/grade/[grade].tsx    book list per grade
  app/(tabs)/book/[grade]/[bookId].tsx   module list per book (units, reading, math...)
  app/(tabs)/unit1/               Unit 1 index + lesson screen (own implementation, 941 lines)
  app/(tabs)/unit/[unitId]/       generic index + lesson screen for Units 2 to 8
  app/(tabs)/unit2/               LEGACY duplicate of Unit 2, not linked from UI, dead code
  app/(tabs)/reading|writing|math/  screens for the empty Part 2 / Math modules
  constants/grades.ts             grade and book catalog (availability, modules)
  constants/unit1Lessons.ts       Unit 1 data
  constants/allUnitsLessons.ts    Units 2 to 8 data (single source of truth for them)
  constants/unit2Lessons.ts       LEGACY Unit 2 data, same IDs as allUnitsLessons, dead code
  constants/lessons.ts            reading/writing/math types, arrays are EMPTY
  constants/lessons-part2.ts      Part 2 reading, array is EMPTY
  constants/ui-translations.ts    Arabic to English table for UI strings
  context/ProgressContext.tsx     stars and completion, AsyncStorage, legacy migration
  context/LanguageContext.tsx     ar/en switch with persistence
  hooks/useLessonAttempt.ts       fresh attempt on every lesson open (repeat practice)
  components/                     BackButton, UiText (auto-translating Text), ScreenBackground, ErrorBoundary...
  scripts/test-ui-translations.mjs   the only automated test
artifacts/api-server/             Express 5 + Drizzle + Postgres + Replit OIDC. NOT USED by the app.
artifacts/mockup-sandbox/         Vite playground. NOT USED. Fails typecheck.
lib/db, lib/api-spec, lib/api-zod, lib/api-client-react   backend schema and generated clients. NOT USED.
netlify.toml                      web deploy config
Start-Browser.cmd / Start-Handy.cmd   Windows double-click launchers (German)
.agents/memory/                   notes from the AI agent that originally built the app
```

## 5. Routes

```
/                              home
/grade/[grade]                 books of a grade
/book/[grade]/[bookId]         modules of a book
/unit1                         Unit 1 lesson list
/unit1/[id]                    Unit 1 lesson (ids u1-1 .. u1-5)
/unit/[unitId]                 Units 2 to 8 lesson list
/unit/[unitId]/[lessonId]      lesson (ids u2-1 .. u8-5)
/reading, /writing, /math      empty module screens
/unit2, /unit2/[id]            legacy, unreachable from UI
```

## 6. Key behaviours (verified by end-to-end tests)

- Completing any lesson awards 3 stars via `completeLesson(lesson.id, 3)`.
- Stars are max-kept per lesson. Repeating never adds stars. Total is the sum.
- Opening a completed lesson always starts a fresh attempt. Completion screen offers "Repeat lesson", "Next activity" and "Back to list".
- Language switch persists and affects only strings wrapped in `UiText` or passed through `translateUi`. Plain `Text` stays Arabic.
- No network requests at runtime on web. Zero console errors across all flows.
- Desktop browser shows a centered 480 px phone frame.

## 7. Commands

```bash
pnpm install
pnpm --filter @workspace/learn-app run typecheck      # passes
pnpm --filter @workspace/learn-app run test:language  # 4 tests, pass
pnpm --filter @workspace/learn-app run web            # dev in browser
pnpm --filter @workspace/learn-app run dev            # Expo Go QR
pnpm --filter @workspace/learn-app run build          # static web export to dist/
pnpm build / pnpm typecheck (root)                    # FAILS because of mockup-sandbox
```

## 8. Known defects, ranked

1. **Stars ignore performance.** 0 of 5 correct answers gives the same 3 stars as 5 of 5. Score is tracked in each activity but never passed to `completeLesson`.
2. **Comprehension answers are always option 0.** In every unit's lesson 5, `correctIndex` is 0 for all questions. Guessable.
3. **Empty modules marked available.** `arabic-1-part2` and `math-1-part1` are `available: true` with 0 lessons and open blank screens with no message.
4. **Lesson ID collision.** Legacy `unit2Lessons.ts` and `allUnitsLessons.ts` both use u2-1 to u2-5 with different content. Progress bleeds between them.
5. **Root build broken.** `mockup-sandbox` has 2 React type errors and is included in the root typecheck.
6. **Partial translation.** "N remaining", "complete", and the completion message stay Arabic in English mode.
7. **Color contrast.** Progress badges on home and book screens measure 2.35:1 to 3.6:1, below WCAG AA 4.5:1.
8. **Code duplication.** Unit 1 and legacy Unit 2 screens are near copies (900+ lines each) while Units 2 to 8 use a shared engine.
9. **README overstates content.** Claims 28 + 20 reading, 28 writing, 3 math lessons. Those arrays are empty.
10. **Dead backend.** Express server, Postgres schema, OIDC auth, OpenAPI codegen ship in the repo but are disconnected. Roughly 40 percent of the codebase.

## 9. Constraints and conventions to respect

- Do not change existing lesson content, stories, vocabulary, quiz questions, layouts or navigation unless explicitly instructed (owner rule in README).
- English applies to menus and buttons only. Never translate learning content or Arabic speech.
- Completed content must stay replayable without limit. Keep best stars, never multiply rewards.
- 100 percent offline. No login, no accounts, no cloud. Avoid adding network dependencies.
- Run `pnpm --filter @workspace/learn-app run typecheck` after every change.
- Keep the Metro `blockList` entries in `metro.config.js`.
- Use inline SVG rather than icon fonts for anything that must render on web.

## 10. Improvement areas (candidate roadmap)

Pedagogy and content
- Tie stars to quiz score (for example 3 stars at 100 percent, 2 at 60 percent, 1 for completion).
- Randomise answer positions or fix `correctIndex` distribution in comprehension lessons.
- Fill Grade 1 Arabic Part 2, Math Part 1, and Islamic Education, or mark them unavailable until filled.
- Add a "lesson coming soon" empty state to module screens.
- Expand to Grades 2 to 6 using the existing `UnitData` schema.

Code quality
- Delete legacy `unit2/` screens and `unit2Lessons.ts`, or migrate Unit 1 onto the generic engine.
- Remove or isolate `api-server`, `lib/*` and `mockup-sandbox` so the root build passes.
- Move activity components out of screen files into `components/activities/`.
- Add `type: "module"` to learn-app package.json to silence the test loader warning.

Quality assurance
- Add the Playwright end-to-end suite and the content integrity script to the repo and CI.
- Add unit tests for `ProgressContext` and `useLessonAttempt`.
- Fix contrast on progress badges. Add `accessibilityLabel` to emoji only buttons.

Product
- Parent or teacher view: per unit progress, reset progress button (the function exists in `ProgressContext` but has no UI).
- Audio fallback when the device has no Arabic TTS voice.
- Native APK verification: TTS, haptics, and the expo-updates startup check against the offline promise.

## 11. How to use this file for prompting

A good improvement prompt should name:
1. The target (section 10 item or a defect from section 8).
2. The files involved (section 4).
3. The constraints that must hold (section 9).
4. The verification to run (section 7, plus the end-to-end flows in section 6).

Example: "Tie stars to quiz performance in `app/(tabs)/unit/[unitId]/[lessonId].tsx` and `app/(tabs)/unit1/[id].tsx` without altering any lesson data. Pass the activity score into `completeLesson`. Keep best stars on repeat. Run the learn-app typecheck and the language tests. Confirm 0 of 5 correct no longer yields 3 stars."
