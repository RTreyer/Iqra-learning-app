# Iqra (أَقْرَأُ وَأَتَعَلَّمُ)

Offline first learning app for children in Yemen, grade 1 to 6 primary school. A child learns alone, without a teacher, login or internet. The curriculum base is the official Yemen Ministry of Education textbooks. Today the app covers Grade 1.

## Requirements

Node.js 24 or newer and pnpm 10 (`corepack enable pnpm` or `npx pnpm@10.34.6`).

## Commands

Run from the repo root.

| Command | Purpose |
|---|---|
| `pnpm install` | Install dependencies |
| `pnpm typecheck` | TypeScript check |
| `pnpm lint` | ESLint |
| `pnpm test` | Jest unit and component tests |
| `pnpm test:data` | Content integrity and UI translation tests (Node test runner) |
| `pnpm test:e2e` | Web export, then Playwright |
| `pnpm build:web` | Static web export to `artifacts/learn-app/dist/` |
| `pnpm --filter @workspace/learn-app run web` | Dev server in the browser |
| `pnpm --filter @workspace/learn-app run dev` | Expo dev server, scan the QR code with Expo Go |

Windows: after `pnpm install`, double click `Start-Browser.cmd` (browser) or `Start-Handy.cmd` (QR code for Expo Go).

## Targets

- Android APK through EAS: `eas build -p android --profile preview` in `artifacts/learn-app`.
- Web: static export, deployed on Netlify (`netlify.toml`).

## Storage

Progress stays on the device. No server, no accounts. AsyncStorage key `@kidlearn_progress_v1` holds a schema v2 blob (`lessons`, `items`, `activity.days`, `totalStars`). The key keeps its legacy name so old progress survives. A corrupt blob is copied to a `@kidlearn_progress_corrupt_` backup key before anything is overwritten. The UI language is stored under `iqra_ui_language`.

## Content

| Book | Units | Lessons | Status |
|---|---|---|---|
| Arabic Part 1 | 8 | 47 | Complete. Unit 1 has 5 pre reading lessons, units 2 to 8 have 6 lessons each. Native speaker review pending |
| Math Part 1 | 3 | 11 | Exemplary, derived from the textbook outline (numbers 0 to 10, add and subtract within 10, plane shapes). Not the full year |
| Science Part 1 | 3 | 9 | Placeholder, no textbook source yet. Shown as "قريباً" on home, not part of the release |
| Arabic Part 2, Math Part 2 | 0 | 0 | Shown as "قريباً". Planned for release v1.1 |

Home lists grades 1 to 6 (`grades` in `content/catalog.ts`). Grade 1 shows its books; grades 2 to 6 have no books yet and show as "قريباً". Release v1.0 ships Arabic Part 1 and Math Part 1. Review status per unit: [docs/CONTENT_REVIEW.md](docs/CONTENT_REVIEW.md).

## Learning design

| Principle | How the app applies it | Where in code |
|---|---|---|
| Score based stars | 3 stars at 100 percent, 2 at 60 percent or more, otherwise 1. Replays keep the best result. Review awards no stars | `lib/scoring.ts`, `lib/progressState.ts` |
| First tap scoring | Only the first tap on a question counts. The round locks after it and the correct answer is shown | `components/activities/shared/useQuiz.ts` |
| Seeded shuffle | Answer order varies per attempt but is stable inside a render, so content data stays untouched | `components/activities/shared/shuffle.ts`, `useShuffled.ts` |
| Spaced repetition | Leitner boxes 1 to 5 with intervals of 1, 2, 4, 7 and 14 days. A correct answer promotes only when the item is due. A wrong answer resets to box 1. Due is by local day | `lib/srs.ts`, `lib/progressState.ts` |
| Retrieval practice | Review is always active recall (pick, read, solve) | `lib/reviewItems.ts`, `app/review.tsx` |
| Interleaving | A review session mixes item kinds (letter, word, count, calc, question) | `pickDue` in `lib/srs.ts` |
| Error driven repetition | Wrong items repeat at the end of the same session | `app/review.tsx` |
| Short sessions | Lessons have 3 to 6 rounds, review is capped at 10 items | `pickDue` limit in `lib/srs.ts`, content files |
| Guided path, no locks | A continue card points to the next lesson below 3 stars. All content stays open | `lib/nextLesson.ts`, `components/ContinueCard.tsx` |
| Streak | Consecutive local days with a lesson or review, shown as a small badge | `lib/streak.ts`, `components/StreakBadge.tsx` |
| Voice support | A banner appears when no Arabic TTS voice is installed | `hooks/useVoiceHint.ts`, `components/VoiceHintBanner.tsx` |

## Owner rule

Do not change Arabic lesson content (stories, vocabulary, quiz text, answer data, layouts, navigation) unless the owner explicitly asks. English stays limited to menus and buttons.

## Docs

- [APP_OVERVIEW.md](APP_OVERVIEW.md): current state, layout, routes, behaviours, gaps, roadmap
- [docs/UI_PROPOSALS.md](docs/UI_PROPOSALS.md): 13 UI proposals and the tracing roadmap
- [docs/CONTENT_REVIEW.md](docs/CONTENT_REVIEW.md): content review status
- [docs/content/MATH_TEXTBOOK_OUTLINE.md](docs/content/MATH_TEXTBOOK_OUTLINE.md): math textbook outline
- [docs/superpowers/plans/](docs/superpowers/plans/): rebuild plan and progress log
