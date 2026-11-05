# Math foundation: design

Date: 2026-11-05. Status: approved by the owner, implemented on branch `feat/math-foundation`.

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
export type MathColor = "red" | "blue" | "green" | "yellow" | "orange" | "pink";
export type ShapeId = "circle" | "square" | "triangle" | "rectangle";
export type MathPic =
  | { emoji: string; size?: "small" | "big"; crossed?: boolean }
  | {
      shape: ShapeId;
      color: MathColor;
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
/** `first` sits on the right and is read first; the answer says how it relates to `second`. */
export type CompareRound = { prompt: string; first: CompareSide; second: CompareSide; mode: "words" | "symbols" };
export type SortBox = { label: string; pic?: MathPic };
export type SortItem = { pic: MathPic; box: 0 | 1 };
export type NumberFillRound = {
  prompt: string;
  /** Reading order, right to left on screen; exactly one "?". sequence: numbers with a constant step. */
  cells: (number | "+" | "-" | "=" | "?")[];
  layout: "row" | "vertical" | "sequence";
  options: number[];
  /** Optional picture story above the sentence. */
  pics?: MathPic[];
};
```

New `LessonBody` members:

```ts
| { type: "picture_choice"; rounds: PictureChoiceRound[] }
| { type: "compare"; rounds: CompareRound[] }
| { type: "sort"; prompt: string; boxes: [SortBox, SortBox]; items: SortItem[] }
| { type: "number_fill"; rounds: NumberFillRound[] }
```

`compare` answers are derived (how `first` relates to `second`), never stored. In `words` mode the buttons are أَكْثَرُ / أَقَلُّ / يُسَاوِي (أَكْبَرُ / أَصْغَرُ when both sides are numbers); in `symbols` mode the signs are drawn as SVG (`CompareSymbol.tsx`), never text, so bidi cannot mirror them. The answer of a `number_fill` round is derived from its cells.

## Components (`components/activities/math/`)

| File | Purpose |
|---|---|
| `MathPic.tsx` | Draws one picture: emoji text, or an SVG shape (react-native-svg) with fill colour, size, half or quarter shading and a cross line. Gives an accessibility label from shape, colour and size words (e.g. مُثَلَّثٌ أَحْمَرُ كَبِيرٌ). |
| `PictureChoiceActivity.tsx` | Optional model, then 2 to 4 tappable choice cards, each showing one picture or a group. |
| `CompareActivity.tsx` | `first` on the right, `second` on the left, three answer buttons in a fixed order. |
| `SortActivity.tsx` | Tap an item to select it, tap a box to place it. A wrong box shakes, flashes red and keeps the item; the first try per item is what counts. Done when every item is placed. |
| `NumberFillActivity.tsx` | Number sentence in a row (RTL), a right aligned vertical sum or a counting sequence, the `?` cell as an empty box, option buttons below. |
| `useInstruction.ts` | Speaks the prompt at start and when it changes. Callers pass the same prompt to the `ListenButton`. |

`picture_choice`, `compare` and `number_fill` use `useQuiz` (first tap scoring, auto advance), `useShuffled` and `ChoiceCard`. `sort` scores the first placement of each item and calls `onComplete` once; it reports no round results, since the new types have no review items yet. All four are registered in `ACTIVITY_COMPONENTS`; its mapped type fails to compile if one is missing.

All numbers use `toArabicDigits`. Colour is never the only cue: a prompt that relies on colour names it, and every shape carries its spoken label (`content/math/picLabel.ts`, gendered Arabic). Pictures inside a button are `decorative`, so screen readers read the button label once.

## Lesson kit (`content/math/mathKit.ts`)

Like `content/arabic/lessonKit.ts`:

- `MATH_COLOR = SUBJECT_COLORS.math`
- `numberMathLessons(unit, drafts)` assigns `math-u{n}-{k}` ids and `number`.
- `bookSection(unit, lesson, title)` builds the section heading from the book lesson, e.g. `٢-١ · الأعداد ١، ٢، ٣`.
- Small builders for common rounds (e.g. `pics(emoji, count)`, `shape(id, color, size)`) so unit files stay readable.

## Validation (`scripts/content.test.mjs`)

New rules, failing CI instead of a child's device:

- math lesson ids match `math-u{n}-{k}`
- every picture: no quarter shading on a triangle (`checkPic`)
- `picture_choice`: 2 to 4 choices (`MAX_CHOICES`), `correctIndex` in range, every choice non empty
- `compare`: both sides non empty; each group has at most 10 pictures and each number is 0 to 10
- `sort`: at least two items, both boxes used, box labels non empty
- `number_fill`: exactly one `?`; row and vertical are `a op b = c`, sequence cells are numbers with a constant step; the derived answer is 0 or more and in `options`; 2 to 4 unique options; all numbers whole and 0 or more
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
