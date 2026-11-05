# Math foundation: design

Date: 2026-11-05. Status: approved in brainstorming, awaiting spec review by the owner.

## Goal

Rebuild Math Part 1 from the Yemen MoE textbook (الرياضيات، الصف الأول، الجزء الأول، صنعاء 2026), the way Arabic Units 2 to 7 were rebuilt. Source notes: `docs/content/textbooks/math-part1/` (overview and units 1 to 5).

The work is split into six steps, each with its own spec, plan and commit series:

| Step | Scope | Replaces |
|---|---|---|
| 1 | **Foundation** (this spec): picture model, four new activity types, math lesson kit, tests | nothing, ships no content |
| 2 | Book Unit 2: numbers 0 to 10 | old unit `m1` |
| 3 | Book Unit 3: addition within 10 | old unit `m2`, together with step 4 |
| 4 | Book Unit 4: subtraction within 10 | old unit `m2` |
| 5 | Book Unit 5: solids, plane shapes, half, quarter | old unit `m3` |
| 6 | Book Unit 1: classification, more and fewer, position, patterns | nothing, placed first in the book |

After every step `main` shows a complete Math Part 1 book (release v1.0 ships it).

## Decisions

1. Approach A: four generic activity types driven by round data, not one type per book exercise.
2. New lesson ids `math-u{bookUnit}-{n}`. Old math progress (`m1-1` to `m3-3`) is dropped: math is unreleased, and `progressState` ignores ids that no longer exist. Arabic legacy ids are untouched.
3. Voice output only (`expo-speech` through `lib/speech.ts`). No voice input.
4. Voice gives the task, the child does the maths by looking. The instruction is spoken once at lesson start and again only when it changes between rounds. A 🔊 `ListenButton` replays it at any time. Number sentences in the new types are not read aloud. Existing `counting` and `arithmetic` behaviour is unchanged.
5. New types are not added to spaced repetition in this step: `itemsForLesson` returns `[]` for them, like `naming` and `matching`. Review support is a later, separate step.

## Content model (`content/types.ts`)

```ts
export type ShapeId = "circle" | "square" | "triangle" | "rectangle";
export type MathPic =
  | { emoji: string; size?: "small" | "big"; crossed?: boolean }
  | {
      shape: ShapeId;
      color: string;
      size?: "small" | "big";
      crossed?: boolean;
      /** Shaded part of the shape, for half and quarter. */
      shaded?: "half" | "quarter";
    };

/** One side of a comparison: a group of pictures or a number. */
export type CompareSide = { pics: MathPic[] } | { number: number };

export type PictureChoiceRound = {
  prompt: string;
  /** Picture to compare against, shown above the choices ("same as this one"). */
  model?: MathPic;
  /** 2 to 4 choices; a choice may be a group of pictures. */
  choices: MathPic[][];
  correctIndex: number;
};
export type CompareRound = { prompt: string; left: CompareSide; right: CompareSide; mode: "words" | "symbols" };
export type SortItem = { pic: MathPic; box: 0 | 1 };
export type NumberFillRound = {
  prompt: string;
  /** Read right to left as printed; exactly one "?". */
  cells: (number | "+" | "-" | "=" | "?")[];
  layout: "row" | "vertical";
  options: number[];
  /** Optional picture story above the sentence. */
  pics?: MathPic[];
};
```

New `LessonBody` members:

```ts
| { type: "picture_choice"; rounds: PictureChoiceRound[] }
| { type: "compare"; rounds: CompareRound[] }
| { type: "sort"; prompt: string; boxes: [string, string]; items: SortItem[] }
| { type: "number_fill"; rounds: NumberFillRound[] }
```

`compare` answers are derived (left vs right count or value), never stored. In `words` mode the buttons are أَكْثَرُ / أَقَلُّ / يُسَاوِي, in `symbols` mode `>` `<` `=`. The answer of a `number_fill` round is derived from its cells.

## Components (`components/activities/math/`)

| File | Purpose |
|---|---|
| `MathPic.tsx` | Draws one picture: emoji text, or an SVG shape (react-native-svg) with fill colour, size, half or quarter shading and a cross line. Gives an accessibility label from shape, colour and size words (e.g. مُثَلَّثٌ أَحْمَرُ كَبِيرٌ). |
| `PictureChoiceActivity.tsx` | Optional model, then 2 to 4 tappable choice cards, each showing one picture or a group. |
| `CompareActivity.tsx` | Right side and left side laid out RTL, three answer buttons with icons. |
| `SortActivity.tsx` | Tap an item to select it, tap a box to place it. A wrong box shakes and keeps the item; the first try per item is what counts. Done when every item is placed. |
| `NumberFillActivity.tsx` | Number sentence in a row (RTL) or vertical layout, the `?` cell as an empty box, option buttons below. |
| `useInstruction.ts` | Speaks the prompt at start and when it changes, returns it for the `ListenButton`. |

`picture_choice`, `compare` and `number_fill` use `useQuiz` (first tap scoring, auto advance), `useShuffled` and `ChoiceCard`. `sort` reports one round result per item. All four are registered in `ACTIVITY_COMPONENTS`; its mapped type fails to compile if one is missing.

All numbers use `toArabicDigits`. Colour is never the only cue: a prompt that relies on colour names it, and every shape carries its spoken label.

## Lesson kit (`content/math/mathKit.ts`)

Like `content/arabic/lessonKit.ts`:

- `MATH_COLOR = SUBJECT_COLORS.math`
- `numberLessons(unitId, drafts)` assigns `math-u{n}-{k}` ids and `number`.
- `bookSection(code, title)` builds the section heading from the book lesson, e.g. `٢-١ · الأعداد ١، ٢، ٣`.
- Small builders for common rounds (e.g. `pics(emoji, count)`, `shape(id, color, size)`) so unit files stay readable.

## Validation (`scripts/content.test.mjs`)

New rules, failing CI instead of a child's device:

- math lesson ids match `math-u{n}-{k}`
- `picture_choice`: 2 to 4 choices, `correctIndex` in range, every choice non empty
- `compare`: both sides non empty; each group has at most 10 pictures and each number is 0 to 10
- `sort`: two boxes, at least two items, every item in box 0 or 1, both boxes used
- `number_fill`: exactly one `?`, the sentence is valid arithmetic, the derived answer is in `options`, options unique
- every new round has a non empty `prompt`

## Testing

- Jest component tests for each new activity: correct and wrong first tap, a second tap not counted, `onComplete` after the last round, `sort` finishing only when all items are placed.
- Jest unit tests for `MathPic` labels, `useInstruction` (speaks once, speaks again on change) and the `number_fill` answer helper.
- Data rules live as pure functions in `content/math/validate.ts`, unit tested in Jest with valid and broken fixtures, and applied to the catalog by `content.test.mjs` (no math content uses them until step 2).
- Playwright: no new path in this step (no shipped lessons use the types); each content step adds one path per type it uses.
- Gate: `pnpm typecheck`, `pnpm lint`, `pnpm test`, `pnpm test:data`, `pnpm test:e2e` all pass.

## Out of scope

- Book content (steps 2 to 6), Math Part 2.
- Review items for the new types.
- Voice input, recorded audio.
- Drag and drop (tap to sort is enough and works the same on web and Android).

## Docs to update

`README.md` (content table, learning design), `APP_OVERVIEW.md`, `docs/superpowers/plans/PROGRESS.md` (decision log).
