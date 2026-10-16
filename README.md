# Iqra (أَقْرَأُ وَأَتَعَلَّمُ)

Offline-first learning app for children grades 1–6 in Yemen.
Goal: enable children to independently learn all primary-school subjects — without a teacher — in a playful and effective way, based on the official Yemen MoE curriculum.

## App goal

- **Target users:** Children in Yemen, grades 1–6 primary school
- **Context:** Conflict zones with limited or no school access, no internet required
- **Subjects:** All MoE primary subjects — Arabic, Math, Islamic Education, Science, Social Studies (and English from Grade 4+)
- **Self-directed:** Children must be able to use the app completely without a teacher
- **Offline-first:** 100% offline, no login, no cloud, no accounts
- **Playful & effective:** Child-friendly design, emoji, TTS (Arabic speech), haptic feedback, star rewards, immediate quiz feedback

## Current content coverage

| Grade | Arabic | Math | Islamic Ed. | Science | Social Studies |
|-------|--------|------|-------------|---------|----------------|
| 1     | ✅ Part 1 (28 lessons) + Part 2 (20 lessons) | ⚠️ 3 lessons only | ❌ | ❌ | ❌ |
| 2–6   | ❌ | ❌ | ❌ | ❌ | ❌ |

## Run & Operate

Requires Node.js 24 or newer and pnpm 10 (`npx pnpm@10.34.6` or `corepack enable pnpm`).

**Windows quick start:** after `pnpm install`, double-click `Start-Browser.cmd` (opens the app in the browser) or `Start-Handy.cmd` (shows a QR code for Expo Go).

- `pnpm install` — install dependencies
- `pnpm typecheck` — typecheck the workspace
- `pnpm build:web` — build the static web export into `artifacts/learn-app/dist/`
- `pnpm --filter @workspace/learn-app run dev` — start Expo; scan the QR code with Expo Go on an Android phone
- `pnpm --filter @workspace/learn-app run web` — run the app in the browser
- `pnpm --filter @workspace/learn-app run test:language` — UI translation tests

## Targets

- Android: installable APK via Expo EAS (`eas build -p android --profile preview` in `artifacts/learn-app`)
- Web: static export in `dist/`

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- Mobile: Expo SDK (expo-router, expo-speech, expo-haptics, AsyncStorage)

## Where things live

- `artifacts/learn-app/` — the Expo mobile app
- `artifacts/learn-app/constants/grades.ts` — grade & book catalog
- `artifacts/learn-app/constants/lessons.ts` — Grade 1 Arabic Part 1 lesson data (reading, writing, math)
- `artifacts/learn-app/constants/lessons-part2.ts` — Grade 1 Arabic Part 2 lesson data
- `artifacts/learn-app/app/(tabs)/` — all screens (navigation: Home → Grade → Book → Module → Lesson)
- `artifacts/learn-app/components/` — shared UI components (BackButton, ScreenBackground, etc.)

## Architecture decisions

- **No server, no login:** progress is stored on the device only (AsyncStorage key `@kidlearn_progress_v1`). The key keeps its legacy name for compatibility, so existing progress is preserved.

- **Route structure:** `/(tabs)/grade/[grade]` → `/(tabs)/book/[grade]/[bookId]` → subject module index → lesson screen
- **Lesson IDs:** `r1–r28` (Part 1 reading), `p2r1–p2r20` (Part 2 reading), `w1–w28` (writing), `m1–m3` (math)
- **bookId query param:** reading screens filter lessons by `?bookId=` to separate Part 1 / Part 2
- **TTS:** `expo-speech` with Arabic locale — essential for early readers who can't yet read independently
- **Icon fonts avoided in BackButton:** inline SVG used instead of `@expo/vector-icons` to prevent web font-loading failures

## User preferences

- **Do not change any existing content unless explicitly instructed.** This includes lesson data, stories, vocabulary, quiz questions, screen layouts, and navigation — all changes require an explicit command from the user.

## Gotchas

- `expo-speech` version mismatch warning is non-critical — speech still works
- `shadow*` and `pointerEvents` deprecation warnings are cosmetic — no functional impact
- Always run `pnpm typecheck` after any code change
- BackButton uses inline SVG (react-native-svg), not Feather icons — avoids web icon font failures
