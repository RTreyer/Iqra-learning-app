# Iqra Rebuild and Cleanup Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Turn the Iqra prototype into a single, clean, tested Android + web Expo app for Grade 1 with Arabic, Math and Science, real on-screen letter tracing, performance based stars, and no dead code.

**Architecture:** Delete the unused backend, codegen libs and sandbox so the workspace contains one Expo app. Replace six divergent lesson screens with one content model (Book → Unit → Lesson) and one lesson screen that renders activity components by type. Extract speech, haptics, theme tokens, scoring and the existing tracing canvas into shared modules. Add Jest unit tests, Playwright end-to-end tests and CI.

**Tech Stack:** Expo SDK 54, expo-router 6, React Native 0.81, React 19.1, TypeScript 5.9, pnpm 10, react-native-svg, react-native-gesture-handler, expo-speech, expo-haptics, AsyncStorage, jest-expo 54, @testing-library/react-native 13, Playwright, GitHub Actions, EAS (Android APK), Netlify (web).

---

## Context

Read `APP_OVERVIEW.md` first. What drives this plan:

- The Expo app in `artifacts/learn-app` imports nothing from `artifacts/api-server`, `lib/*`, `artifacts/mockup-sandbox` or `scripts`. Those packages are dead weight (about 40 percent of the repo), carry Replit OIDC auth, and `mockup-sandbox` breaks the root typecheck.
- Six lesson screens each duplicate `speakArabic`, haptic patterns and about 450 StyleSheet keys. `unit2/` is an unreachable copy of the generic `unit/` screen with colliding lesson IDs. 25 route literals carry the `/(tabs)/` prefix and 16 `as any` casts because typed routes are never generated during `expo export`.
- A real touch tracing canvas with stroke validation exists in `app/(tabs)/writing/[id].tsx` but its content array is empty. Unit 1's "drawing" activity is a fake "I traced it" button.
- Stars ignore quiz results. Correct answers sit at index 0 in 50 places. Two "available" books open blank screens.
- Owner decisions (2026-10-16): Android APK + web; delete backend entirely; add starter Math and Science content; tie stars to score; only Grade 1 with Arabic, Math and Science remains; keep the visual style, document UI proposals without implementing them.

Owner constraint still in force: Arabic lesson content for Units 1 to 8 (stories, vocabulary, quiz text, answer data) is not edited. Answer order is varied at render time instead. English stays limited to menus and buttons.

Learning science requirements (owner, 2026-10-16): the app must apply evidence based learning principles. Chosen for a six year old working alone and offline:

| Principle | How it shows up in the app |
|---|---|
| Spaced repetition | Every quiz item (letter, word, number fact, comprehension question) is tracked in a Leitner box schedule. A daily "مُرَاجَعَة" (review) card on the home screen surfaces due items. |
| Retrieval practice | Review is always active recall (pick, read, solve), never re-reading a story. |
| Interleaving | A review session mixes items across units and subjects instead of one letter at a time. |
| Error driven repetition | A wrong first tap sends the item back to box 1 and repeats it at the end of the same session. |
| Short sessions | Lessons stay at 3 to 6 rounds; review is capped at 10 items. |
| Immediate, specific feedback | Already present (correct answer highlighted, spoken). Kept. |
| Guided path, no hard locks | Home shows "تَابِعْ" (continue) pointing at the next lesson not yet earning 3 stars. All content stays open (owner rule). |
| Streak and daily goal | Light motivation: consecutive days with at least one lesson or review, shown as a small flame badge. Date based, offline. |

Decisions taken from the architecture risk review (full notes at the end of this file): the app stays in `artifacts/learn-app` (Netlify, EAS, Start scripts and Metro all point there); `(tabs)` group is dropped; `experiments.typedRoutes` is disabled in favour of a typed `routes.ts` helper; lesson route is `/lesson/[lessonId]` because lesson IDs are globally unique; tracing uses react-native-gesture-handler Pan, not PanResponder; Inter fonts are removed.

---

## Target file structure

```
/                                        pnpm workspace with one package
  package.json                           typecheck, lint, test, test:data, test:e2e, build:web → filter learn-app
  pnpm-workspace.yaml                    packages: [artifacts/learn-app]
  .npmrc, .gitignore, netlify.toml, README.md, APP_OVERVIEW.md, Start-Browser.cmd, Start-Handy.cmd
  .github/workflows/ci.yml
  docs/UI_PROPOSALS.md                   proposals only
  docs/superpowers/plans/                this plan
artifacts/learn-app/
  package.json, app.json, eas.json, babel.config.js, metro.config.js, tsconfig.json
  eslint.config.js, .prettierrc, jest.config.js, jest.setup.ts, playwright.config.ts
  app/
    _layout.tsx                          single Stack, providers, splash, web frame
    index.tsx                            home: Arabic, Math, Science book cards
    book/[bookId].tsx                    unit list of a book
    unit/[unitId].tsx                    lesson list of a unit
    lesson/[lessonId].tsx                the one lesson screen
    review.tsx                           spaced repetition session
    +not-found.tsx
  components/
    BackButton.tsx, UiText.tsx, UiChevron.tsx, LanguageSwitch.tsx, ScreenBackground.tsx,
    ErrorBoundary.tsx, ErrorFallback.tsx
    ProgressPill.tsx                     "n / m" badge with AA contrast
    LessonCompleteCard.tsx               shared completion screen with earned stars
    ContinueCard.tsx, ReviewCard.tsx, StreakBadge.tsx   home guidance widgets
    activities/
      StoryActivity.tsx, NamingActivity.tsx, LetterPickActivity.tsx, WordReadActivity.tsx,
      ListenPickActivity.tsx, BehaviorActivity.tsx, MatchingActivity.tsx, TraceActivity.tsx,
      CountingActivity.tsx, ArithmeticActivity.tsx, index.ts
      shared/ChoiceCard.tsx, shared/ProgressDots.tsx, shared/DoneButton.tsx, shared/useShuffled.ts
      trace/validate.ts                  pure stroke validation
  content/
    types.ts, catalog.ts, index.ts, ui-translations.ts
    arabic/unit1.ts … unit8.ts           moved verbatim + lesson 6 trace
    math/unit1.ts, unit2.ts              starter content
    science/unit1.ts … unit3.ts          starter content
  context/ProgressContext.tsx, context/LanguageContext.tsx
  hooks/useLessonAttempt.ts
  lib/speech.ts, lib/haptics.ts, lib/scoring.ts, lib/routes.ts, lib/arabicNumbers.ts
  lib/srs.ts                             Leitner scheduler (pure), lib/reviewItems.ts (lesson → items), lib/streak.ts
  theme/tokens.ts
  __tests__/                             jest
  scripts/*.test.mjs                     node --test data tests
  e2e/                                   playwright specs + static SPA server
```

---

## Phase 0: Safety net

### Task 0.1: Branch and baseline

- [x] `git status` clean. `git checkout -b rebuild/single-app`.
- [x] `pnpm install && pnpm --filter @workspace/learn-app run typecheck && pnpm --filter @workspace/learn-app run test:language`. Both pass.
- [x] Create `artifacts/learn-app/e2e/app.spec.mjs` with the 15 baseline tests from the previous session (navigation chain, letter_pick completion, star persistence, repeat without doubling, language switch, 404, desktop frame, axe scan) and `artifacts/learn-app/e2e/serve.mjs` (static server for `dist` with SPA fallback on port 8787). They document current behaviour and are rewritten in Task 6.3.
- [x] Commit: `chore: add baseline e2e suite before rebuild`

---

## Phase 1: Remove dead code and Replit remnants

### Task 1.1: Delete unused packages and the catalog

**Files:** delete `artifacts/api-server/`, `artifacts/mockup-sandbox/`, `lib/`, `scripts/`, `.agents/`, root `tsconfig.json`, root `tsconfig.base.json`; modify `pnpm-workspace.yaml`, root `package.json`, `artifacts/learn-app/package.json`, `.gitignore`

- [x] `git rm -r artifacts/api-server artifacts/mockup-sandbox lib scripts .agents tsconfig.json tsconfig.base.json`
- [x] `pnpm-workspace.yaml` becomes exactly:
```yaml
packages:
  - artifacts/learn-app
```
No catalog, no overrides, no `minimumReleaseAge*`, no `onlyBuiltDependencies`.
- [x] `artifacts/learn-app/package.json`: replace `"react": "catalog:"` with `"19.1.0"`, `"react-dom": "catalog:"` with `"19.1.0"`. `zod` is removed in Task 1.2.
- [x] Root `package.json` scripts:
```json
"typecheck": "pnpm --filter @workspace/learn-app run typecheck",
"lint": "pnpm --filter @workspace/learn-app run lint",
"test": "pnpm --filter @workspace/learn-app run test",
"test:data": "pnpm --filter @workspace/learn-app run test:data",
"test:e2e": "pnpm --filter @workspace/learn-app run test:e2e",
"build:web": "pnpm --filter @workspace/learn-app run build"
```
Remove `build`, `typecheck:libs`, the `prettier` and `typescript` root devDependencies (they move into learn-app). Keep `packageManager` and the pnpm `preinstall` guard. Keep `.npmrc` unchanged.
- [x] `.gitignore`: delete the `# Replit` block (`.cache/`, `.local/`), `.config/`, `.upm/`, `.pythonlibs/`, `attached_assets/`, `*.tar.gz`, `.cursor/...`, `.github/instructions/nx...`. Keep everything else.
- [x] `pnpm install` then `pnpm typecheck`. Pass.
- [x] Commit: `chore: remove unused backend, codegen libs, sandbox, agent files and workspace catalog`

### Task 1.2: Prune dependencies and platform config

**Files:** `artifacts/learn-app/package.json`, `app.json`, `eas.json`, `metro.config.js`, `app/_layout.tsx`; delete `components/KeyboardAwareScrollViewCompat.tsx`

- [x] Remove packages: `expo-blur`, `expo-glass-effect`, `expo-image`, `expo-symbols`, `expo-system-ui`, `expo-updates`, `react-native-reanimated`, `react-native-worklets`, `react-native-keyboard-controller`, `zod`, `zod-validation-error`, `@ungap/structured-clone`, `@stardazed/streams-text-encoding`, `@expo/ngrok`, `babel-plugin-react-compiler`, `@babel/core`, `@expo/cli`, `@expo-google-fonts/inter`, `expo-font`. Delete `components/KeyboardAwareScrollViewCompat.tsx` in the same commit.
- [x] Split correctly. `dependencies`: `expo`, `expo-router`, `expo-speech`, `expo-haptics`, `expo-linear-gradient`, `expo-splash-screen`, `expo-constants`, `expo-linking`, `expo-status-bar`, `@expo/vector-icons`, `@react-native-async-storage/async-storage`, `react`, `react-dom`, `react-native`, `react-native-web`, `react-native-svg`, `react-native-gesture-handler`, `react-native-safe-area-context`, `react-native-screens`. `devDependencies`: `typescript`, `@types/react`, `@types/react-dom`, `babel-preset-expo`, `prettier`.
- [x] `app/_layout.tsx`: remove `useFonts`, the Inter imports and the `fontsLoaded` gate. Call `SplashScreen.hideAsync()` in a mount effect. Arabic text already uses system fonts.
- [x] `app.json`: delete `ios`, `updates`, `runtimeVersion`, the `expo-updates` and `expo-font` plugin entries, and `experiments.typedRoutes` (set `experiments: { reactCompiler: true }`). Add `"android": { "package": "com.iqra.yemenlearn", "versionCode": 1 }`. Adaptive icon is deferred to `docs/UI_PROPOSALS.md` because it needs a padded 1024 px foreground PNG that does not exist.
- [x] `eas.json`: remove `channel` from `preview` and `production`, remove the top level `update` block, set `"appVersionSource": "remote"`.
- [x] `metro.config.js`: `getDefaultConfig(projectRoot)` plus the `blockList` only (keep `@napi-rs`, `expo-structured-headers`, `.local/skills` patterns per owner rule). Remove `watchFolders` and `nodeModulesPaths`.
- [x] `pnpm install && pnpm typecheck && pnpm build:web`. Record bundle size against the 2.82 MB baseline. `npx expo-doctor` from `artifacts/learn-app` reports no dependency placement issues.
- [x] Commit: `chore: prune dependencies, remove iOS, expo-updates and unused fonts`

### Task 1.3: Scrub remaining remnants

**Files:** `README.md`, `artifacts/learn-app/context/ProgressContext.tsx`

- [x] README: title "Iqra (أَقْرَأُ وَأَتَعَلَّمُ)", drop KidLearn, drop the API stack line, commands become root scripts, content table replaced in Task 5.3.
- [x] `ProgressContext.tsx`: keep `STORAGE_KEY = "@kidlearn_progress_v1"` with a comment (renaming wipes existing progress). Delete `LEGACY_ACCOUNT_KEY_PREFIX`, `LEGACY_PENDING_KEY_PREFIX` and `migrateAccountProgress`; `loadLocalProgress` returns `defaultState` when the key is absent.
- [x] `grep -ri "replit\|kidlearn\|REPL_ID" --exclude-dir=node_modules --exclude=pnpm-lock.yaml .` returns only the storage key line and its comment.
- [x] Commit: `chore: remove Replit and KidLearn remnants`

---

## Phase 2: Tooling and test foundation

### Task 2.1: ESLint and Prettier

**Files:** create `artifacts/learn-app/eslint.config.js`, `.prettierrc`; modify `package.json`

- [x] Dev deps: `eslint ^9`, `eslint-config-expo ~10.0.0`.
- [x] `eslint.config.js`:
```js
const expoConfig = require("eslint-config-expo/flat");
module.exports = [
  ...expoConfig,
  { ignores: ["dist/*", "node_modules/*", ".expo/*", "playwright-report/*"] },
  { rules: { "no-restricted-syntax": ["error", { selector: "Literal[value=/^\\/\\(tabs\\)/]", message: "Use lib/routes.ts helpers" }] } },
];
```
- [x] `.prettierrc`: `{ "printWidth": 100, "trailingComma": "all" }`. Scripts: `"lint": "eslint ."`, `"format": "prettier --write ."`.
- [x] `pnpm lint` passes (fix findings, no blanket disables).
- [x] Commit: `chore: add eslint and prettier`

### Task 2.2: Jest with jest-expo

**Files:** create `jest.config.js`, `jest.setup.ts`, `__tests__/smoke.test.tsx`; modify `package.json`, root `.npmrc`

- [x] Dev deps with exact SDK 54 versions: `jest ~29.7.0`, `jest-expo ~54.0.18`, `react-test-renderer 19.1.0`, `@testing-library/react-native ^13`, `@types/jest`.
- [x] Root `.npmrc`: add `node-linker=hoisted` (jest-expo expects hoisted React Native internals under pnpm). Re-run `pnpm install`, then `pnpm typecheck && pnpm build:web` to confirm Metro is unaffected.
- [x] `jest.config.js`:
```js
module.exports = {
  preset: "jest-expo",
  setupFilesAfterEnv: ["./jest.setup.ts"],
  testPathIgnorePatterns: ["/node_modules/", "/e2e/", "/dist/"],
  transformIgnorePatterns: [
    "node_modules/(?!((jest-)?react-native|@react-native(-community)?|expo(nent)?|@expo(nent)?/.*|react-navigation|@react-navigation/.*|expo-router|react-native-svg|react-native-gesture-handler)/)",
  ],
};
```
- [x] `jest.setup.ts`: mock `expo-speech` (`speak`, `stop` as `jest.fn`), `expo-haptics` (all functions resolve), `@react-native-async-storage/async-storage` with `@react-native-async-storage/async-storage/jest/async-storage-mock`, `expo-router` (`router: { push, replace, back }` spies, `useLocalSearchParams: () => params`, `useFocusEffect: (cb) => React.useEffect(cb, [])`), and `react-native-gesture-handler/jestSetup`.
- [x] `__tests__/smoke.test.tsx`: render `<LanguageProvider><UiText>مرحبا</UiText></LanguageProvider>`, expect text present.
- [x] Rename `scripts/test-ui-translations.mjs` → `scripts/ui-translations.test.mjs`. Scripts: `"test": "jest"`, `"test:data": "node --test scripts/*.test.mjs"`. Remove `test:language`.
- [x] `pnpm test` → 1 passing. `pnpm test:data` → 4 passing.
- [x] Commit: `test: add jest-expo and testing library`

### Task 2.3: Playwright harness

**Files:** create `playwright.config.ts`; modify `package.json`

- [x] Dev dep `@playwright/test`. Config: `testDir: "e2e"`, `webServer: { command: "node e2e/serve.mjs dist 8787", port: 8787, reuseExistingServer: true }`, chromium project, viewport 420x860, `use.locale: "ar"`.
- [x] In `e2e/app.spec.mjs` add an `addInitScript` that stubs `window.speechSynthesis.speak` to record calls (headless Chromium has no voices).
- [x] Script: `"test:e2e": "expo export --platform web && playwright test"`.
- [x] Commit: `test: add playwright harness`

### Task 2.4: CI

**Files:** create `.github/workflows/ci.yml`

- [x] On push and pull_request: checkout; `pnpm/action-setup@v4` (reads `packageManager`); `actions/setup-node@v4` node 24 with pnpm cache; `pnpm install --frozen-lockfile`; `pnpm typecheck`; `pnpm lint`; `pnpm test`; `pnpm test:data`; `pnpm --filter @workspace/learn-app exec playwright install --with-deps chromium`; `pnpm test:e2e`; upload `artifacts/learn-app/playwright-report` on failure.
- [x] Commit: `ci: typecheck, lint, unit, data and e2e`

---

## Phase 3: Shared modules

### Task 3.1: Speech and haptics

**Files:** create `lib/speech.ts`, `lib/haptics.ts`, `__tests__/speech.test.ts`

- [x] Test first: `speak("ب")` calls `Speech.stop` then `Speech.speak("ب", { language: "ar", rate: 0.8 })`; when `Speech.speak` throws, `speak` does not.
- [x] `lib/speech.ts`:
```ts
import * as Speech from "expo-speech";
export const ARABIC_RATE = 0.8;
export function speak(text: string, rate: number = ARABIC_RATE): void {
  try { Speech.stop(); Speech.speak(text, { language: "ar", rate }); } catch {}
}
export function stopSpeaking(): void { try { Speech.stop(); } catch {} }
```
- [x] `lib/haptics.ts`:
```ts
import * as Haptics from "expo-haptics";
const safe = (p: Promise<void>) => { p.catch(() => {}); };
export const tap = () => safe(Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light));
export const success = () => safe(Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success));
export const error = () => safe(Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error));
export const warning = () => safe(Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning));
```
Convention: `tap` on any press, `success` on correct, `error` on wrong, `warning` on invalid trace.
- [x] Arabic voice detection (owner decision: TTS now, detect and warn). `lib/speech.ts` adds `export async function hasArabicVoice(): Promise<boolean>` using `Speech.getAvailableVoicesAsync()` and matching `voice.language` against `/^ar/i` (web: `speechSynthesis.getVoices()`, true when unavailable to avoid false warnings). `app/_layout.tsx` calls it once after mount; when false and `@iqra_voice_hint_shown` is not set in AsyncStorage, show a dismissible banner in Arabic and English: "لَا يُوجَدُ صَوْتٌ عَرَبِيٌّ عَلَى هٰذَا الْجِهَاز. اطلُب مِن شَخْصٍ بَالِغٍ تَثْبِيت صَوْت عَرَبِيّ مِن إِعْدَادَات تَحْوِيل النَّصّ إِلَى كَلَام." / "No Arabic voice is installed. Ask an adult to install an Arabic voice in the device's text to speech settings." Dismiss sets the flag. Tests: voices with `ar-SA` → true; only `en-US` → false; banner shown once.
- [x] Commit: `feat: shared speech and haptics helpers, Arabic voice detection`

### Task 3.2: Theme tokens

**Files:** create `theme/tokens.ts`; delete `constants/colors.ts`, `hooks/useColors.ts`; modify `app/+not-found.tsx`, `components/ErrorFallback.tsx`, `components/ScreenBackground.tsx`

- [x] `theme/tokens.ts`: `colors` (text `#1E293B`, muted `#64748B`, border `#E2E8F0`, surface `#F8FAFC`, success `#059669`, successSoft `#D1FAE5`, danger `#EF4444`, dangerSoft `#FEE2E2`, star `#F59E0B`, cream `#FFFBF0`), `subjects` (arabic `#2563EB`, math `#7C3AED`, science `#059669`), `radius` (sm 12, md 20, lg 28), `spacing` (xs 4, sm 8, md 16, lg 24, xl 32), `shadow.card = Platform.select({ android: { elevation: 3 }, web: { boxShadow: "0 4px 12px rgba(0,0,0,0.12)" }, default: {} })`, `touchTarget: 48`.
- [x] `ScreenBackground.tsx`: gradient variants keyed by `Subject | "home"`, colors from tokens.
- [x] Replace `useColors` usages with token imports. No dark mode (listed in UI proposals).
- [x] Commit: `refactor: central theme tokens`

### Task 3.3: Scoring and progress helper

**Files:** create `lib/scoring.ts`, `__tests__/scoring.test.ts`, `__tests__/progress.test.tsx`; modify `context/ProgressContext.tsx`

- [x] Tests (`starsForScore({ correct, total })`): `{5,5}→3`, `{3,5}→2`, `{2,5}→1`, `{0,5}→1`, `{2,3}→2`, `{1,3}→1`, `{0,0}→3`.
- [x] `lib/scoring.ts`:
```ts
export type Score = { correct: number; total: number };
export function starsForScore({ correct, total }: Score): 1 | 2 | 3 {
  if (total === 0) return 3;
  const ratio = correct / total;
  if (ratio >= 1) return 3;
  if (ratio >= 0.6) return 2;
  return 1;
}
```
- [x] `ProgressContext.tsx`: keep `completeLesson(lessonId, stars)` with max semantics. Add `getUnitProgress(lessonIds: string[]): { done: number; total: number; stars: number }`. Tests with the AsyncStorage mock: 2 then 3 → 3; 3 then 1 → 3; complete before storage finishes loading is kept after load; reload restores state.
- [x] Storage schema v2 (same key `@kidlearn_progress_v1`, add `version: 2`). Shape:
```ts
type ProgressState = {
  version: 2;
  lessons: Record<string, { completed: boolean; stars: number; completedAt: string }>;
  items: Record<string, { box: 1 | 2 | 3 | 4 | 5; dueAt: string; lastSeenAt: string; lapses: number }>;
  activity: { days: string[] };          // ISO dates (YYYY-MM-DD) with at least one lesson or review, max 60 kept
  totalStars: number;
};
```
`loadLocalProgress` upgrades v1 (`{ lessons, totalStars }`) by adding `version: 2`, `items: {}`, `activity: { days: [] }`, `completedAt = now` for existing lessons. Test: v1 blob loads and is rewritten as v2 with stars intact.
- [x] Commit: `feat: score based stars and unit progress helper`

### Task 3.4: Typed routes helper

**Files:** create `lib/routes.ts`

- [x] ```ts
import type { Href } from "expo-router";
export const routes = {
  home: (): Href => "/",
  book: (bookId: string): Href => ({ pathname: "/book/[bookId]", params: { bookId } }),
  unit: (unitId: string): Href => ({ pathname: "/unit/[unitId]", params: { unitId } }),
  lesson: (lessonId: string): Href => ({ pathname: "/lesson/[lessonId]", params: { lessonId } }),
};
```
No raw href strings anywhere else (lint rule from Task 2.1 enforces the `(tabs)` ban; review enforces the rest).
- [x] Commit: `feat: typed route helpers`

---

## Phase 4: Content model and lesson engine

### Task 4.1: Content types, catalog, integrity tests

**Files:** create `content/types.ts`, `content/catalog.ts`, `content/index.ts`, `scripts/content.test.mjs`

- [ ] `content/types.ts`:
```ts
export type Subject = "arabic" | "math" | "science";
export type Choice = { emoji: string; word: string };
export type LessonBase = { id: string; number: number; title: string; subtitle: string; emoji: string; color: string };
export type LessonBody =
  | { type: "story"; storyTitle: string; lines: Array<{ text: string; emoji: string }> }
  | { type: "naming"; items: Choice[] }
  | { type: "letter_pick"; rounds: Array<{ targetLetter: string; letters: string[]; correctIndex: number }> }
  | { type: "word_read"; rounds: Array<{ word: string; choices: string[]; correctIndex: number }> }
  | { type: "listen_pick"; questions: Array<{ word: string; choices: Choice[]; correctIndex: number }> }
  | { type: "behavior"; behaviors: Array<{ emoji: string; description: string; isCorrect: boolean }> }
  | { type: "matching"; pairs: Array<{ left: Choice; right: Choice }> }
  | { type: "trace"; targets: Array<{ guide: string; label: string; tts: string; strokeCount?: number }> }
  | { type: "counting"; rounds: Array<{ emoji: string; count: number; options: number[] }> }
  | { type: "arithmetic"; rounds: Array<{ a: number; b: number; op: "+" | "-"; options: number[] }> };
export type Lesson = LessonBase & LessonBody;
export type Unit = { id: string; number: number; title: string; theme: string; emoji: string; color: string; badgeLabel: string; lessons: Lesson[] };
export type Book = { id: string; subject: Subject; title: string; subtitle: string; emoji: string; color: string; available: boolean; units: Unit[] };
```
Unit IDs are globally unique: Arabic `"a1" … "a8"`, Math `"m1"`, `"m2"`, Science `"s1" … "s3"`. Lesson IDs are globally unique (`u1-1 … u8-6`, `m1-1 …`, `s1-1 …`).
- [ ] `content/index.ts`: `books`, `getBook(id)`, `getUnit(id)` (searches all books), `getLesson(id)` returning `{ book, unit, lesson, next: Lesson | null }`, `unitLessonIds(unit)`.
- [ ] `scripts/content.test.mjs` (node --test, imports the TS via Node type stripping like the translation test): unique lesson IDs, unique unit IDs, `correctIndex` in range, `letters[correctIndex] === targetLetter`, `choices[correctIndex] === word`, arithmetic result in `options` and non negative, counting `count` in `options`, every `available` book has lessons, every stored legacy ID `u1-1 … u8-5` still exists.
- [ ] Commit: `feat: unified content model`

### Task 4.2: Move Arabic content

**Files:** create `content/arabic/unit1.ts … unit8.ts`; delete `constants/unit1Lessons.ts`, `constants/unit2Lessons.ts`, `constants/allUnitsLessons.ts`, `constants/lessons.ts`, `constants/lessons-part2.ts`, `constants/grades.ts`; move `constants/ui-translations.ts` → `content/ui-translations.ts`

- [ ] Copy each unit object verbatim into its own file typed as `Unit`. Lesson IDs `u1-1 … u8-5`, numbering, all strings and `correctIndex` values unchanged. Unit ids become `a1 … a8`.
- [ ] Unit 1 lesson `u1-5` changes `type: "drawing"` → `type: "trace"`; `targets` map the existing five shapes: `guide` = `"ـــ"`, `"|"`, `"◯"`, `"◠"`, `"〰"` for line, standing line, circle, arc, wave (match the existing `label`s), `label` and `tts` from the existing `label`/`instruction`. The only Unit 1 content edit, required for real tracing.
- [ ] Add lesson 6 to units 2 to 8: `{ id: "u{n}-6", number: 6, type: "trace", title: "أَكْتُبُ الْحُرُوف", subtitle: "تتبّع الحرف بأصبعك", emoji: "✍️", color: "#7C3AED", targets: unit.letters.map(l => ({ guide: l, label: l, tts: l })) }`.
- [ ] `content/ui-translations.ts`: add "أَكْتُبُ الْحُرُوف" → "I write the letters", "تتبّع الحرف بأصبعك" → "Trace the letter with your finger", "جملة متبقية" → "sentences left", "كلمة متبقية" → "words left", "مكتمل" → "complete", "لقد أتممت هذا النشاط بنجاح" → "You finished this activity", "الرياضيات" → "Math", "العلوم" → "Science".
- [ ] `pnpm test:data` passes (52 Arabic lessons). Commit: `feat: move Arabic content, add tracing lessons`

### Task 4.3: Activity components

**Files:** create `components/activities/**`, `__tests__/activities/*.test.tsx`

Shared props:
```ts
export type ActivityProps<T extends LessonBody["type"]> = {
  lesson: Extract<Lesson, { type: T }>;
  color: string;
  attemptKey: string;                 // from useLessonAttempt, changes on every restart
  onComplete: (score: Score) => void; // non quiz activities send { correct: 0, total: 0 }
  onRoundResult?: (itemId: string, correct: boolean) => void; // quiz activities only, fired on the first tap of each round
};
```
`itemId` comes from `lib/reviewItems.ts` (Task 5.3): `letter:ب`, `word:بَيْت`, `count:7`, `calc:3+2`, `q:u2-5:0`. Quiz activities read it from the round via `itemIdFor(lesson, roundIndex)`.

- [ ] `shared/useShuffled.ts`: seeded Fisher Yates (`mulberry32(hash(attemptKey + roundIndex))`) returning `{ items, correctIndex }` so correct answers move per attempt without touching content. Unit test: deterministic for the same seed, correct item tracked.
- [ ] `shared/ProgressDots.tsx`, `shared/ChoiceCard.tsx` (`accessibilityRole="button"`, `accessibilityLabel={word}`, `minHeight: touchTarget`, states idle/correct/wrong), `shared/DoneButton.tsx`.
- [ ] Port from `app/(tabs)/unit/[unitId]/[lessonId].tsx`: `StoryActivity`, `NamingActivity`, `LetterPickActivity`, `WordReadActivity`, `ListenPickActivity`. Port from `app/(tabs)/unit1/[id].tsx`: `BehaviorActivity`, `MatchingActivity`. Port from `app/(tabs)/math/[id].tsx`: `CountingActivity`, `ArithmeticActivity`. Rules for every quiz activity: a round counts as correct only when the first tap is correct; lock the round after the first tap; use `useShuffled` for options; `Animated.Value` arrays sized by the max option count across rounds; `speak`/`haptics` from `lib`.
- [ ] `trace/validate.ts`: move `parsePoints` and `validateTracing` from `writing/[id].tsx` unchanged (stroke count, path length ≥ 50 percent of shorter pad side, bounding box ≥ 20 percent width or 15 percent height, centroid within 35 percent of centre). Node tests: 5 px stroke fails, off centre stroke fails, diagonal across the pad passes.
- [ ] `TraceActivity.tsx`: `GestureDetector` with `Gesture.Pan().minDistance(0).shouldCancelWhenOutside(false).runOnJS(true)` using `e.x`/`e.y`; current stroke in a ref, committed to state at most once per `requestAnimationFrame`; strokes rendered with `react-native-svg` `Path` stroke width 10; guide glyph at 0.15 opacity behind; Clear and Done buttons; error banner with shake, `warning()` haptic and spoken retry on invalid trace; web only style `{ touchAction: "none", userSelect: "none" }`; iterates `targets`, completes after the last valid one with `{ correct: 0, total: 0 }`. The lesson screen renders it with `scrollEnabled={false}` on the surrounding ScrollView (Task 4.4).
- [ ] `index.ts`: `ACTIVITY_COMPONENTS` map typed per activity type with an exhaustive `never` check.
- [ ] One testing-library test per component: renders, interaction, `onComplete` payload (example: LetterPick with first taps wrong, wrong, right, right, right → `{ correct: 3, total: 5 }`).
- [ ] Commits: `feat: quiz activity components`, `feat: trace activity on gesture handler`, `feat: math activity components`

### Task 4.4: Screens

**Files:** create `app/index.tsx`, `app/book/[bookId].tsx`, `app/unit/[unitId].tsx`, `app/lesson/[lessonId].tsx`, `components/ProgressPill.tsx`, `components/LessonCompleteCard.tsx`; modify `app/_layout.tsx`, `hooks/useLessonAttempt.ts`; delete `app/(tabs)/**`

- [ ] `app/_layout.tsx`: one `<Stack screenOptions={{ headerShown: false, animation: "slide_from_right" }} />`. Keep `SafeAreaProvider`, `LanguageProvider`, `ErrorBoundary`, `ProgressProvider`, `GestureHandlerRootView`, `WebFrame`.
- [ ] `app/index.tsx`: same visual language as today (gradient, star badge, language switch, large colored cards). Cards are `books` from the catalog, navigating with `routes.book(id)`. Unavailable books show the "قريباً" badge and do not navigate.
- [ ] `app/book/[bookId].tsx`: unit cards with `ProgressPill` from `getUnitProgress`. Styles ported from `book/[grade]/[bookId].tsx`, static imports only.
- [ ] `app/unit/[unitId].tsx`: lesson rows (number, title, subtitle, emoji, chevron, tick + stars when done). Ported from `unit/[unitId]/index.tsx`.
- [ ] `app/lesson/[lessonId].tsx`:
```tsx
const found = getLesson(lessonId);               // null → "الدرس غير موجود" card with back link
const { completed, stars, completeAttempt, restartAttempt, activityKey } = useLessonAttempt(lessonId);
const Activity = ACTIVITY_COMPONENTS[found.lesson.type];
const onComplete = (score: Score) => { const s = starsForScore(score); completeLesson(found.lesson.id, s); success(); speak("أحسنت! لقد أتممت الدرس"); completeAttempt(s); };
<ScrollView key={activityKey} scrollEnabled={found.lesson.type !== "trace"}>
  {completed ? <LessonCompleteCard stars={stars} onRepeat={restartAttempt} next={found.next} /> : <Activity lesson={found.lesson} color={found.unit.color} attemptKey={activityKey} onComplete={onComplete} onRoundResult={recordRoundResult} />}
</ScrollView>
```
`recordRoundResult` comes from `useProgress()` (Task 5.3) and feeds the spaced repetition schedule from normal lessons.
`useLessonAttempt` gains `stars` for the current attempt. Title spoken on mount.
- [ ] `LessonCompleteCard.tsx`: earned stars (1 to 3 ⭐), "إعادة الدرس", "النشاط التالي: {title} ←" or "🎉 أتممت الوحدة!" when `next` is null, "العودة إلى القائمة".
- [ ] `ProgressPill.tsx`: `#1E293B` text on `rgba(255,255,255,0.88)`.
- [ ] `git rm -r "artifacts/learn-app/app/(tabs)"`. `pnpm typecheck && pnpm lint && pnpm test && pnpm test:data` pass.
- [ ] Commit: `feat: single lesson engine and flat navigation`

---

## Phase 5: Content

### Task 5.1: Science starter content

**Files:** create `content/science/unit1.ts`, `unit2.ts`, `unit3.ts`

- [ ] Unit `s1` "جِسْمِي" (my body), `s2` "الْحَيَوَانَات" (animals), `s3` "النَّبَاتَات وَالْمَاء" (plants and water). Each: `story` (4 lines with emoji), `naming` (6 items), `listen_pick` (3 questions). IDs `s1-1 … s3-3`. Fully vowelled Grade 1 Arabic.
- [ ] Owner decision: this is placeholder content. Every Math and Science content file starts with a header comment `// STATUS: placeholder, align with Yemen MoE textbook before release. See docs/CONTENT_REVIEW.md`. Create `docs/CONTENT_REVIEW.md` listing each placeholder unit, its intended textbook chapter, and an empty "reviewed by / date" column.
- [ ] `pnpm test:data` passes. Commit: `content: science part 1 starter units`

### Task 5.2: Math starter content

**Files:** create `content/math/unit1.ts`, `unit2.ts`, `lib/arabicNumbers.ts`, `__tests__/arabicNumbers.test.ts`

- [ ] `m1` "الأَعْدَاد مِنْ 1 إِلَى 10": 4 `counting` lessons (1 to 3, 4 to 6, 7 to 10, mixed), 5 rounds each, 3 options per round. `m2` "الْجَمْع وَالطَّرْح": 2 `arithmetic` addition lessons (sums ≤ 5, ≤ 10) and 2 subtraction lessons (within 5, within 10), 5 rounds each. IDs `m1-1 … m2-4`.
- [ ] `lib/arabicNumbers.ts`: `numberToArabicWord(0..20)` for TTS (`صفر، واحد … عشرون`), tested.
- [ ] Commit: `content: math part 1 starter units`

### Task 5.3: Review items and Leitner scheduler

**Files:** create `lib/reviewItems.ts`, `lib/srs.ts`, `__tests__/reviewItems.test.ts`, `__tests__/srs.test.ts`

- [ ] `lib/reviewItems.ts`:
```ts
export type ReviewItem =
  | { id: string; kind: "letter"; targetLetter: string; letters: string[]; correctIndex: number }
  | { id: string; kind: "word"; word: string; choices: string[]; correctIndex: number }
  | { id: string; kind: "count"; emoji: string; count: number; options: number[] }
  | { id: string; kind: "calc"; a: number; b: number; op: "+" | "-"; options: number[] }
  | { id: string; kind: "question"; word: string; choices: Choice[]; correctIndex: number };
export function itemsForLesson(lesson: Lesson): ReviewItem[];      // [] for story, naming, behavior, matching, trace
export function itemIdFor(lesson: Lesson, roundIndex: number): string;
export function allItems(): Map<string, ReviewItem>;                // built once from the catalog
```
IDs: `letter:{targetLetter}`, `word:{word}`, `count:{count}`, `calc:{a}{op}{b}`, `q:{lessonId}:{index}`. Letters and words repeat across units and collapse into one item, which is the point. Test: Unit 2 lessons yield 5 letter items (3 distinct letters), 5 word items, 3 questions.
- [ ] `lib/srs.ts` (pure, injectable clock):
```ts
export const BOX_INTERVAL_DAYS = { 1: 1, 2: 2, 3: 4, 4: 7, 5: 14 } as const;
export type ItemState = { box: 1 | 2 | 3 | 4 | 5; dueAt: string; lastSeenAt: string; lapses: number };
export function introduce(now: Date): ItemState;                        // box 1, due tomorrow
export function review(state: ItemState, correct: boolean, now: Date): ItemState; // correct → box+1 (max 5), wrong → box 1 and lapses+1
export function isDue(state: ItemState, now: Date): boolean;
export function pickDue(items: Record<string, ItemState>, now: Date, limit = 10): string[]; // oldest due first, then lowest box, interleaved by kind prefix so no two consecutive ids share a kind when avoidable
```
Tests: introduce sets dueAt to now + 1 day; three correct reviews reach box 4 with dueAt 7 days out; one wrong resets to box 1 and increments lapses; `pickDue` returns at most 10, due only, interleaved (`letter`, `word`, `letter`, `calc` …) and deterministic for a fixed input.
- [ ] `ProgressContext.tsx`: `recordRoundResult(itemId, correct)` applies `introduce` for unknown items in a lesson (first time seen, regardless of correctness, so new material enters the schedule) and `review` for known ones; `recordReview(itemId, correct)` applies `review`; both call `markActiveToday()` which adds today's ISO date to `activity.days`. `completeLesson` also calls `markActiveToday()`. Tests cover each.
- [ ] Commit: `feat: review items and Leitner scheduler`

### Task 5.4: Review session screen

**Files:** create `app/review.tsx`, `components/activities/ReviewRound.tsx`, `__tests__/review.test.tsx`; modify `lib/routes.ts` (`review: (): Href => "/review"`), `content/ui-translations.ts`

- [ ] `ReviewRound.tsx` renders one `ReviewItem` using the shared pieces (`ChoiceCard`, listen button, `useShuffled`) with the same first tap scoring and feedback as the lesson activities. Props: `item`, `attemptKey`, `onAnswer(correct: boolean)`.
- [ ] `app/review.tsx`: on mount `pickDue(progress.items, new Date())` → queue. Shows `ProgressDots`, current `ReviewRound`, interleaved order from `pickDue`. On answer: `recordReview(itemId, correct)`, `success()`/`error()`, speak; wrong items are appended once to the end of the queue for same session repetition (not re-recorded a second time). When the queue is empty: completion card "أَحْسَنْت! مُرَاجَعَة الْيَوْم مُكْتَمِلَة" with correct/total and a back link. No stars for review (stars belong to lessons; avoids farming). If nothing is due on open, show "لا شَيْءَ لِلْمُرَاجَعَةِ الْيَوْم" with a back link.
- [ ] Translations: "مُرَاجَعَة" → "Review", "مُرَاجَعَة الْيَوْم" → "Today's review", "تَابِعْ" → "Continue", "لا شَيْءَ لِلْمُرَاجَعَةِ الْيَوْم" → "Nothing to review today", "{n} عناصر" → "{n} items", "يَوْم مُتَتَالٍ" → "day streak".
- [ ] Test: with 3 due items mocked in context, answering wrong, right, right, then right on the repeated item calls `recordReview` 3 times and shows the completion card with 2/3.
- [ ] Commit: `feat: spaced repetition review session`

### Task 5.5: Home guidance: continue, review due, streak

**Files:** create `components/ContinueCard.tsx`, `components/ReviewCard.tsx`, `components/StreakBadge.tsx`, `lib/streak.ts`, `lib/nextLesson.ts`, tests; modify `app/index.tsx`

- [ ] `lib/nextLesson.ts`: `nextLesson(progress): { book, unit, lesson } | null` = first lesson in catalog order (Arabic units 1 to 8, then Math, then Science) whose stars < 3, skipping unavailable books. Test: fresh state → `u1-1`; all Arabic at 3 stars → `m1-1`.
- [ ] `lib/streak.ts`: `currentStreak(days: string[], today: Date): number` counting consecutive ISO dates ending today or yesterday (yesterday keeps the streak alive until the day is over). Tests: `[]` → 0; today only → 1; yesterday and today → 2; gap → resets.
- [ ] `app/index.tsx` above the book cards, same visual language (rounded card, subject color, emoji): `ContinueCard` ("تَابِعْ: {unit.title} · {lesson.title}", routes to `routes.lesson(id)`); `ReviewCard` only when `pickDue(...).length > 0` ("مُرَاجَعَة الْيَوْم · {n} عناصر", routes to `routes.review()`); `StreakBadge` beside the star badge when streak ≥ 2 ("🔥 {n}"). Hidden on first launch when nothing is started except `ContinueCard` pointing at `u1-1`.
- [ ] Commit: `feat: continue, review and streak guidance on home`

### Task 5.6: Docs refresh

- [ ] README content table: Arabic Part 1 (8 units, 52 lessons), Math Part 1 (2 units, 8 lessons), Science Part 1 (3 units, 9 lessons). Add a "Learning design" section listing the principles table from the Context above. `APP_OVERVIEW.md` sections 2, 4, 5, 6, 8 updated.
- [ ] Commit: `docs: refresh README and overview`

---

## Phase 6: Verification and polish

### Task 6.1: Accessibility

- [ ] Every pressable card: `accessibilityRole="button"`, `accessibilityLabel`, min 48x48. Run the axe step of the e2e suite on home, book, unit, lesson: 0 contrast violations.
- [ ] Commit: `fix: accessibility roles and contrast`

### Task 6.2: Performance pass

- [ ] Confirm no `require()` in render paths, no `shadow*` props outside `theme/tokens.ts`, `elevation` only on cards. Decorative background emoji limited to 4 per screen.
- [ ] Measure and record: web bundle size (baseline 2.82 MB), APK size, and `adb shell dumpsys meminfo com.iqra.yemenlearn` after opening a trace lesson.
- [ ] Commit: `perf: platform shadows, lighter backgrounds`

### Task 6.3: End to end suite on new routes

**Files:** `e2e/app.spec.mjs`

- [ ] Rewrite the baseline tests for `/`, `/book/[bookId]`, `/unit/[unitId]`, `/lesson/[lessonId]`. Add: 0 of 5 first taps correct → 1 star, 5 of 5 → 3 stars, repeat keeps best; shuffled options still complete (select by text, not position); trace lesson: a 5 px mouse drag shows the error banner, a diagonal drag across the pad completes; math counting and science naming lessons complete; unavailable book card does not navigate; English mode shows "Math" and "Science" while lesson text stays Arabic.
- [ ] Learning loop tests using Playwright's `page.clock`: fresh start shows the Continue card pointing at Unit 1 lesson 1 and no Review card; complete `u2-3` with two wrong first taps → still no Review card today; `clock.setFixedTime` to tomorrow and reload → Review card shows 5 items (3 letters, the 2 missed ones are box 1); open review, answer all correctly, completion card shows 5/5; reload → Review card gone; streak badge shows 🔥 2 after activity on two consecutive days.
- [ ] `pnpm test:e2e` green. Commit: `test: e2e for new navigation, scoring, tracing, math and science`

### Task 6.4: Android device check

Distribution is assumed to be EAS cloud build with APK sideload (the existing `eas.json` profiles). If the owner picks Play Store or local builds instead, this task changes: Play Store needs `buildType: "app-bundle"`, a production keystore managed by EAS, and a store listing; local build needs Android Studio and `npx expo run:android --variant release`.

- [ ] `npx expo-doctor` clean. `eas build -p android --profile preview` (or `npx expo run:android` on an emulator if EAS login is unavailable). On device: Arabic TTS speaks, haptics fire, finger tracing works inside the lesson without the page scrolling, progress survives force stop and relaunch, app opens with airplane mode on.
- [ ] Record results in the PR description.

### Task 6.5: UI proposals (document only)

**Files:** create `docs/UI_PROPOSALS.md`

- [ ] For each proposal give rationale and files touched: dark mode via tokens; adaptive icon with padded foreground; licensed icon set replacing emoji for cross vendor consistency; "big text" toggle; progress ring instead of "n / m"; sound on/off toggle; parent area with reset progress (function exists, no UI); bundled mp3 fallback when no Arabic TTS voice is installed; RTL layout audit in English mode; first launch onboarding; Arabic Part 2 return when content exists; optional local daily reminder notification for review (expo-notifications, works offline, needs permission UX); mastery badges per letter once an item reaches box 5.
- [ ] Tracing roadmap section (owner decision: heuristic now, graded later): describe shape matching for a future version. Hand authored guide paths per letter (SVG path, isolated form), resample both drawn and guide paths to 64 points, score by mean nearest point distance normalised to pad size and by stroke direction order, map the score to 1 to 3 stars so tracing lessons feed the same `starsForScore` pipeline. Note the data needed (28 guide paths plus 5 shapes) and that `TraceActivity` already receives `guide` per target so the API will not change.
- [ ] Commit: `docs: UI adaptation proposals`

### Task 6.6: Optional, separate PR: flatten to repo root

- [ ] Only after everything above is merged and green: move `artifacts/learn-app/*` to `/`, drop `pnpm-workspace.yaml`, update `netlify.toml` (`command = "pnpm run build:web"`, `publish = "dist"`), both `Start-*.cmd` (`cd /d "%~dp0"`), and the CI paths. Separate PR so a breakage is isolated.

---

## Verification checklist

```bash
pnpm install --frozen-lockfile
pnpm typecheck      # 0 errors
pnpm lint           # 0 errors
pnpm test           # jest: smoke, speech, scoring, progress v2 migration, shuffle, trace validation, activities, arabicNumbers, reviewItems, srs, streak, nextLesson, review screen
pnpm test:data      # node --test: translations, content integrity
pnpm build:web      # dist/ produced, size recorded
pnpm test:e2e       # playwright: green, 0 console errors, 0 axe contrast violations
grep -ri "replit\|kidlearn\|REPL_ID" --exclude-dir=node_modules --exclude=pnpm-lock.yaml .   # storage key only
cd artifacts/learn-app && npx expo-doctor
```
Manual on Android: TTS, haptics, finger tracing, persistence across restart, offline launch.

---

## Risk review notes (from the architecture review, verified against node_modules)

- Keep the app in `artifacts/learn-app`; Netlify, EAS, Start scripts and Metro point there. Flatten later in its own PR (Task 6.6).
- `catalog:` is used for react, react-dom, zod. Pin react and react-dom to 19.1.0 before deleting the catalog or `pnpm install` breaks. Delete the whole `overrides` block; it only served the removed packages. Keep `.npmrc`.
- reanimated and worklets must be removed together with keyboard-controller and its compat component in one commit, or typecheck fails. babel-preset-expo only enables the worklets plugin when the module exists, so Metro is safe.
- `babel-plugin-react-compiler`, `@babel/core`, `@expo/cli` are transitive via `expo` / `babel-preset-expo`; explicit pins create duplicate copies.
- Everything in the bundle or autolinked natively belongs in `dependencies`; `expo-doctor` and `expo install --fix` assume this.
- Typed routes are generated by `expo start`, never by `expo export`, which is why the `as any` casts exist. Disable the experiment and use `lib/routes.ts` `Href` objects.
- Three segment dynamic routes work, but one segment is enough because lesson IDs are globally unique. Keep `useLessonAttempt` keyed by lesson ID and `key={activityKey}` so `router.replace` to a sibling lesson does not leak state.
- Do not edit `correctIndex` data (50 entries sit at 0). Shuffle at render time with a seed from the attempt key.
- PanResponder inside a ScrollView loses strokes on Android because the native scroll view claims vertical moves. Use gesture-handler Pan with `runOnJS(true)` (no worklets needed), `touchAction: none` on web, finalize strokes on gesture end, throttle state updates to one per frame.
- Score only the first tap per round or every child reaches 100 percent.
- jest-expo 54 needs jest 29.7 and `react-test-renderer 19.1.0` exactly; under pnpm add `node-linker=hoisted` or widen `transformIgnorePatterns` to `.pnpm` paths.
- Removing expo-updates requires removing `channel` keys and the `update` block from eas.json, or eas-cli complains.
- Do not remove: react-native-gesture-handler, react-native-screens, react-native-safe-area-context, expo-constants, expo-linking, react-native-web, expo-splash-screen, expo-haptics, expo-linear-gradient, expo-speech, async-storage, react-native-svg, @expo/vector-icons.
- Do not add FlatList for 5 to 13 item lists.
