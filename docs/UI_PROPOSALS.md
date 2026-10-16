# UI adaptation proposals (Task 6.5)

Status: proposals only. Nothing here is implemented.

Constraints that apply to every proposal: offline only, no login, Arabic UI (English only for menus and buttons), children in Yemen, low-end Android, keep the current visual style (gradient backgrounds, big rounded cards, emoji, star badge, language switch). Touch targets stay at 48 px or more (`touchTarget` in `theme/tokens.ts`).

## Implemented accessibility baseline (2026-10-17)

Every pressable card, row and button has `accessibilityRole="button"`, a meaningful label (Arabic or English for interface text, Arabic for lesson content) and a hit area of at least 48 px. All text reaches 4.5:1: fills that carry white text are darkened with `readableFill` in `theme/tokens.ts` (hue kept, amber becomes a deeper amber), large coloured content text uses the same helper on near white, and small 13 px badges keep the translucent pill plate. Back button headers mirror in Arabic. The WCAG large text 3:1 allowance was not relied upon anywhere.

## Summary

| # | Proposal | Effort | Value | Depends on |
|---|----------|--------|-------|------------|
| 1 | Dark mode via tokens | M | Medium | none |
| 2 | Adaptive Android icon | S | Medium | owner asset |
| 3 | Icon set and SVG shapes instead of emoji | L | High | none |
| 4 | Big text toggle | M | Medium | settings store |
| 5 | Progress ring | S | Medium | none |
| 6 | Sound on/off toggle | S | High | settings store |
| 7 | Parent area with reset | M | High | settings store |
| 8 | Bundled mp3 fallback | L | High | recorded audio |
| 9 | RTL audit in English mode | S | Medium | none |
| 10 | First launch onboarding | M | Medium | 6 |
| 11 | Arabic Part 2 return | S | Medium | content |
| 12 | Daily review reminder | M | Low | 7 |
| 13 | Mastery badges per letter | M | Medium | none |

A small `settings` store (AsyncStorage, one JSON key, a context like `ProgressContext`) is shared by proposals 1, 4, 6, 10 and 12. Build it once.

## 1. Dark mode via tokens

**Rationale.** Children often use phones at night. Dark mode saves battery on OLED screens and reduces glare. Today `colors` in `theme/tokens.ts` is one static light set and screens read it directly.

**Design.** Two palettes, `lightColors` and `darkColors`, plus dark gradients (subject colour at about 12 percent over a deep navy, not black). Cards stay big and rounded. Stars and subject colours keep their hue. A setting in the parent area: Auto (follows system), Light, Dark. A `useTheme()` hook returns `colors` and `gradients` for the active scheme through `useColorScheme`.

**Files touched.** `artifacts/learn-app/theme/tokens.ts` (split sets); new `artifacts/learn-app/theme/ThemeContext.tsx`; `app/_layout.tsx`; every screen and component that imports `colors` or `gradients` (move to the hook); `app.json` (`userInterfaceStyle` set to `automatic`).

**Effort.** M. The change is wide but mechanical.

**Risks.** Hard-coded hex values in components will stay light. Contrast of Arabic text on dark gradients must be checked at 4.5:1. `success`, `danger` and `star` softs need dark variants. Add a grep test that bans raw hex outside `theme/`.

## 2. Adaptive Android icon

**Rationale.** Without an adaptive icon, Android 8 and newer crop or letterbox `icon.png` into a launcher shape. A padded foreground fixes it.

**Design.** The owner supplies a 1024 x 1024 px PNG foreground with the logo inside the central 66 percent safe zone (about 676 px), transparent background. The background is a flat colour matching the home gradient (`#FFDC70`). Optionally a monochrome layer for themed icons on Android 13 and newer.

**Files touched.** `artifacts/learn-app/app.json` (`android.adaptiveIcon.foregroundImage`, `backgroundColor`, `monochromeImage`); new `artifacts/learn-app/assets/images/adaptive-icon.png` (owner asset).

**Effort.** S.

**Risks.** The asset is not available yet. Do not generate a stand-in. Needs a new native build, not an OTA update.

## 3. Icon set and SVG shapes instead of emoji

**Rationale.** Emoji render differently per Android vendor and version. Some old devices show blank boxes. `docs/CONTENT_REVIEW.md` already records the shape problems: the text glyph for rectangle looks wrong and the shape emoji are inconsistent (the square-in-square emoji especially).

**Design.** Two layers.
- Shapes: draw circle, square, rectangle, triangle, star and others as inline `react-native-svg` components (`<ShapeIcon name="rectangle" />`). This replaces the rectangle glyph and the square-in-square emoji. Colours come from `subjects`.
- Other pictures (animals, fruit, UI chrome): a licensed or open icon set with a clear licence (for example OpenMoji CC BY-SA or Twemoji CC BY, checked by the owner) bundled as SVG or PNG. Lesson content refers to an icon key such as `icon: "apple"`, not a character. Keep emoji as a fallback when a key is missing.

The look stays playful and colourful, so the current style is kept.

**Files touched.** New `artifacts/learn-app/components/icons/ShapeIcon.tsx` and `Icon.tsx`; new `artifacts/learn-app/assets/icons/`; `artifacts/learn-app/content/types.ts` (optional `icon` key); content files under `artifacts/learn-app/content/`; `components/activities/*` where emoji are drawn; `package.json` (remove `@expo/vector-icons` and `expo-font`, see risks); header and card icons in `components/` (`BackButton.tsx`, `UnitCard.tsx`, `BookCard.tsx`).

**Effort.** L.

**Risks.** `react-native-svg` is already a dependency, so shapes cost nothing extra. Dropping `@expo/vector-icons` and `expo-font` is only safe once no import remains, and only if `expo-router` and other packages do not need `expo-font` as a peer. Check `PROGRESS.md` decision log entries on both, then run `npx expo-doctor` before removal. Licence attribution needs an About line. Bundle size grows with PNG sets, so prefer SVG and limit to icons actually used. Migration of content keys needs the content tests updated.

## 4. Big text toggle

**Rationale.** Young children and parents with poor eyesight benefit from larger Arabic text. Android system font scale is not reliably set on these devices.

**Design.** Parent area switch: Normal, Large, Extra large. A token `fontScale` of 1, 1.25, 1.5 multiplies letter and word sizes in lessons, not menus. Cards grow in height and wrap to one column if needed. Persisted in settings.

**Files touched.** `theme/tokens.ts` (`typeScale`); new `artifacts/learn-app/theme/useTypeScale.ts`; new settings context; lesson and activity components under `components/activities/`; `app/index.tsx`; `app/book/[bookId].tsx`.

**Effort.** M.

**Risks.** Layout overflow in option grids at 1.5. Test on a 320 dp wide screen. Respect `allowFontScaling` so system and app scales do not stack.

## 5. Progress ring

**Rationale.** A ring reads faster than "n / m" for a child who cannot yet read numbers well, and it fits the star theme.

**Design.** A circular arc in the subject colour, with the star count or a check in the middle. Full ring turns gold. Used on unit cards and the book screen. The text stays as small secondary label for parents.

**Files touched.** New `artifacts/learn-app/components/ProgressRing.tsx` (`react-native-svg`, `Circle` with `strokeDasharray`); `app/book/[bookId].tsx`; unit screen `app/unit/[unitId].tsx`.

**Effort.** S.

**Risks.** Animated arcs cost frames on low-end phones. Draw static, animate once on mount with a short timing. Arabic-Indic digits via `lib/arabicNumbers.ts` for the label.

## 6. Sound on/off toggle

**Rationale.** Classrooms and homes are noisy or quiet by need. A child or parent should be able to mute speech and haptic feedback.

**Design.** A speaker icon button in the top corner of lessons and in the parent area. Muted state shows a crossed speaker. Muted means silent everywhere, with a clear icon. Haptics have their own sub-switch in the parent area.

**Files touched.** `artifacts/learn-app/lib/speech.ts` (`speak()` returns early when muted); `artifacts/learn-app/lib/haptics.ts` (same for `tap`, `success`, `error`, `warning`); new settings context; lesson header component.

**Effort.** S.

**Risks.** `lib/` functions are not React, so they need a module-level preference cache hydrated at startup. A muted child may think the app is broken, so the icon must be visible. Another agent is editing `lib` now; schedule after that work lands.

## 7. Parent area with reset

**Rationale.** `resetProgress` exists in `context/ProgressContext.tsx` but has no UI. Parents also want to see how the child is doing.

**Design.** A small gear icon on the home screen opens a gate. The gate is a hold-to-confirm button (hold 3 seconds) or one arithmetic question such as 7 + 6 (answer by number pad, Arabic-Indic digits accepted). Inside: per unit progress (ring plus stars), streak from `activity.days`, items due today (from `items[].dueAt`), switches for sound, big text, dark mode, reminder, and a Reset progress button with a second confirmation. Menu labels may be English, content stays Arabic.

**Files touched.** New `artifacts/learn-app/app/parent.tsx`; new `components/ParentGate.tsx`; `app/index.tsx` (gear entry); `context/ProgressContext.tsx` (read only, plus maybe a `getStreak` helper in `lib/progressState.ts`); `content/ui-translations.ts`.

**Effort.** M.

**Risks.** Children may learn the arithmetic answer, so randomise the numbers. Reset is destructive and offline, so there is no undo: require two steps and show what will be lost. Hidden gear must still be 48 px.

## 8. Bundled mp3 fallback when no Arabic TTS voice

**Rationale.** `hooks/useVoiceHint.ts` and `components/VoiceHintBanner.tsx` detect a missing voice, but the child still hears nothing. Many low-end Yemeni devices ship without Arabic TTS data.

**Design.** Record clean audio: 28 letter names, letter sounds, and short word clips used in Arabic Part 1 lessons. When `hasArabicVoice()` is false, or a clip exists for the text, `speak(text)` plays the clip. Otherwise it falls back to TTS, then to the existing banner. The banner shows only when neither path works.

Routing in `speak()`:
1. Look up `audioMap[text]` (a generated index from text to bundled asset).
2. If found and (no Arabic voice or `preferRecorded`), play with `expo-audio` (or `expo-av`, choose one the Expo SDK in use supports without a new native module).
3. Else if TTS voice exists, `Speech.speak`.
4. Else do nothing and let the banner explain.

Size budget: mono, 22 kHz, 32 kbps mp3, about 4 KB per second. Letters: 28 x 2 clips x 1 s is about 225 KB. Words: about 40 words per unit x 1.5 s is about 240 KB per unit. Target 500 KB per unit, 5 MB total for Part 1. Load lazily per unit through static `require` maps.

**Files touched.** `artifacts/learn-app/lib/speech.ts`; new `artifacts/learn-app/lib/audioMap.ts`; new `artifacts/learn-app/assets/audio/`; `package.json` (audio module); a content test that every spoken text has a clip when a clip is expected.

**Effort.** L (recording and editing is most of the work).

**Risks.** Needs a native speaker recording session and licences. Text normalisation (diacritics, spacing) must match the map key. Audio focus conflicts with TTS, so call `stopSpeaking()` first. Adds an APK size increase.

## 9. RTL layout audit in English mode

**Rationale.** The language switch changes labels to English, but the learning content is still Arabic. Mixed direction layouts easily break.

**Design.** Audit rule: the app shell follows the chosen language (English menus can be LTR), but anything showing Arabic content stays RTL.
- Flips with UI language: tab order, back arrow direction, header title alignment, list bullets, progress bars fill direction.
- Stays RTL always: letter strips and the alphabet grid, word text, tracing pad guide, choice rows inside activities, sequence and counting order that follows reading order, Arabic digits.
- Never flips: numbers line for maths if content defines it left to right, play and speaker icons, star icons.

Use explicit `writingDirection: "rtl"` and `direction` on content containers instead of relying on global `I18nManager`, which needs an app restart.

**Files touched.** `context/LanguageContext.tsx` (read only first); `app/index.tsx`; `app/book/[bookId].tsx`; `components/activities/*`; a checklist added to `docs/` after the audit.

**Effort.** S for the audit, M if many fixes.

**Risks.** `I18nManager.forceRTL` changes need a reload. Test with English mode on a real device. Bidi mixing of Latin names inside Arabic sentences.

## 10. First launch onboarding

**Rationale.** A child opening the app first needs to know what to tap and that sound is on.

**Design.** Three screens at most, big picture, one Arabic sentence read aloud on tap: 1) welcome with the mascot or star, 2) tap a card to start, 3) tap the speaker to hear. A Skip button (English label, 48 px) on every screen. Shown once, flag stored in settings. Reuses the home gradient and rounded card style. If no Arabic voice, screen 3 shows the voice hint banner.

**Files touched.** New `artifacts/learn-app/app/onboarding.tsx`; `app/_layout.tsx` (redirect when flag unset); settings context; `content/ui-translations.ts`.

**Effort.** M.

**Risks.** Redirect flicker on first render, so wait for settings to hydrate. Do not block returning users. Keep text short for non-readers.

## 11. Arabic Part 2 return

**Rationale.** Part 2 is planned but has no content. The catalog already has an `available` flag (`content/types.ts`) and the translations include "قريباً".

**Design.** Show the Part 2 card dimmed with a "قريباً" badge and no tap action, or a gentle toast. When content ships, set `available: true`, add the unit files, and the card becomes normal with no code change. The progress ring (proposal 5) starts at zero.

**Files touched.** `artifacts/learn-app/content/catalog.ts`; `app/book/[bookId].tsx` (badge rendering, already planned); new content files under `content/`; catalog test.

**Effort.** S.

**Risks.** Children tap dead cards and feel stuck, so give feedback. Do not mark available before every lesson passes the content tests.

## 12. Optional daily reminder

**Rationale.** Spaced review (Leitner boxes) only works if the child returns. A local reminder can help.

**Design.** Off by default. A parent area switch "Daily reminder" with a time picker. Permission is requested only when the parent turns it on, never at first launch, with an Arabic sentence explaining why. The notification text is short and friendly, sent only if items are due. Fully local, no server, no push token.

**Files touched.** New `artifacts/learn-app/lib/reminders.ts`; parent screen; `package.json` (`expo-notifications`); `app.json` (plugin, Android channel); `context/ProgressContext.tsx` (read `items[].dueAt`).

**Effort.** M.

**Risks.** Android 13 and newer need the runtime permission. Aggressive battery managers on low-end phones kill scheduled work, so delivery is not guaranteed. A child's device may be shared, so keep the content neutral. Adds a native module and APK size.

## 13. Mastery badges per letter

**Rationale.** Boxes 1 to 5 in `progress.items` already track memory strength. Showing a badge at box 5 rewards real mastery, not just completion.

**Design.** In the unit screen (`app/unit/[unitId].tsx`), a grid of letter tiles. A tile shows a bronze, silver or gold ring by box (1 to 2, 3 to 4, 5) and a small star at box 5. Locked or unseen letters are grey. Tapping a tile plays the letter. Optional parent view lists the same grid with counts.

**Files touched.** New `artifacts/learn-app/components/MasteryGrid.tsx`; unit screen `app/unit/[unitId].tsx`; `lib/reviewItems.ts` (read to map item ids to letters); `context/ProgressContext.tsx` (read only); `content/ui-translations.ts`.

**Effort.** M.

**Risks.** Item ids must map reliably to letters and forms. Colour alone is not enough for colour-blind children, so also use shape (ring count). Avoid shaming low boxes: show progress, not failure.

## Tracing roadmap

Owner decision: heuristic validation now, graded matching later.

### Current heuristic

The tracing activity validates a drawing with simple checks (`components/activities/trace/validate.ts`, called from `components/activities/TraceActivity.tsx`; the numbers below match the code):
- stroke count is at least the target `strokeCount` (default one),
- total path length is at least 50 percent of the shorter pad side,
- bounding box covers at least 20 percent of pad width or 15 percent of pad height,
- centroid lies within 35 percent of the pad centre.

It cannot tell a good letter from a scribble, so tracing is a pass or fail effort check.

### Future graded shape matching

1. Author one guide path per target as an SVG path string (isolated form). Needed: 28 letter guides plus the 5 pre-writing shapes (for example line, circle, zigzag, curve, cross).
2. Resample the guide and the drawn stroke(s) to 64 points by equal arc length. Normalise both to the pad size (translate to the bounding box, scale by the pad side).
3. Score by mean nearest-point distance (both directions) and by stroke direction order (compare start point and travel direction along the path).
4. Map the score to 1 to 3 stars and feed the existing pipeline (`starsForScore` in `lib/scoring.ts`, which takes `{ correct, total }`).

Data flow: `TraceActivity` already receives `guide` per target, so the content API does not change. The `guide` string would become, or be accompanied by, an SVG path (for example `guide` plus `guidePath`). Old content keeps working through the heuristic when no path is given.

```ts
function scoreTrace(drawn: Pt[][], guide: Pt[], pad: number): 0 | 1 | 2 | 3 {
  const d = resample(concat(drawn), 64);
  const g = resample(guide, 64);
  const tol = pad * TOL; // finger size, see below
  // shape: symmetric mean nearest-point distance, 0 is perfect
  const dist = (meanNearest(d, g) + meanNearest(g, d)) / 2 / tol;
  const shape = clamp01(1 - dist);
  // order: direction agreement of start and travel
  const order = dirAgreement(d, g); // 0..1, tolerates reversed only if allowed
  const s = 0.7 * shape + 0.3 * order;
  if (s < 0.35) return 0; // retry
  return s > 0.8 ? 3 : s > 0.6 ? 2 : 1;
}
// then: starsForScore({ correct: Math.round(s * 10), total: 10 })
```

Weights and thresholds are starting values. Tune them with real traces from children.

### Tolerance, left-handed children and finger size

- Finger contact is 8 to 12 mm wide and imprecise. Set tolerance to about 10 to 12 percent of the pad side, not a pixel value.
- Do not penalise hand tremor: smooth the drawn stroke before resampling.
- Left-handed children cover the guide with the hand and often start strokes from the other side or draw the whole letter slightly shifted. Align by centroid and scale before scoring, and give the guide a visible start dot and arrows so the hand does not hide them.
- Direction order should be a bonus (up to 30 percent of the score), never a hard fail, so a correct shape drawn in the wrong direction still earns at least 1 star.
- Never show a 0 as failure. Offer "try again" with the guide fading in.

### Data needed

- 28 isolated letter guide paths plus 5 pre-writing shapes, hand authored and reviewed by an Arabic teacher.
- A test set of recorded traces (good, sloppy, wrong letter) to tune thresholds.
- A small viewer script to render guide paths for review.

## Suggested order

1. Settings store (shared by several items below).
2. 6 Sound toggle (after the current `lib` work lands).
3. 7 Parent area with reset and progress overview.
4. 3 SVG shapes first, then the icon set.
5. 5 Progress ring.
6. 9 RTL audit in English mode.
7. 2 Adaptive icon (as soon as the owner supplies the asset).
8. 4 Big text and 1 Dark mode.
9. 10 Onboarding.
10. 13 Mastery badges.
11. 8 Bundled mp3 fallback (starts with recording, can run in parallel from step 1).
12. 11 Arabic Part 2 return when content exists.
13. 12 Daily reminder.
14. Tracing: author guide paths, then the graded matcher.
