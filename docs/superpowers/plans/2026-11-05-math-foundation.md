# Math Foundation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add the picture model and four generic math activity types (`picture_choice`, `compare`, `number_fill`, `sort`) plus a math lesson kit and data validation, without shipping any new lessons.

**Architecture:** Vertical slices. Shared pieces first (picture model, `MathPic`, `useInstruction`), then one slice per activity type that adds its `LessonBody` member, pure answer and validation helpers in `content/math/`, its component, its registry entry and tests, so `pnpm typecheck` is green after every task. Spec: `docs/superpowers/specs/2026-11-05-math-foundation-design.md`.

**Tech Stack:** Expo 54 / React Native 0.81 / React 19, TypeScript, react-native-svg 15, Jest with @testing-library/react-native, Node test runner for data tests.

---

## Conventions every task follows

- Work dir: `artifacts/learn-app`. Commands from the repo root with `npx -y pnpm@10.34.6` (pnpm is not on PATH); written below as `pnpm`.
- Modules under `content/` import each other with `.ts` extensions and never import react-native (Node runs them directly in `scripts/*.test.mjs`).
- Content is Arabic only, so math rows use `flexDirection: "row-reverse"` (the app is LTR and mirrors with `row-reverse`, see `app/unit/[unitId].tsx`). The first item of a row sits on the right.
- Numbers shown with `toArabicDigits` from `@/lib/arabicNumbers`.
- Commit with `git commit --only <paths>` (PROGRESS.md rule) and the session attribution lines:
  ```
  Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
  Claude-Session: https://claude.ai/code/session_0184Q2WUVmm5DvpKa9ep3nnn
  ```
- Gate per task: `pnpm typecheck`, `pnpm lint`, the task's jest files, `pnpm test:data`.

## Spec refinements made while planning

1. `MathPic.color` is a named palette (`MathColor`), not hex, so the spoken label can name the colour.
2. `compare` sides are `first` and `second` (first sits on the right, read first). The answer says how `first` relates to `second`. `<` `>` are drawn as SVG chevrons, never text, so bidi mirroring on Android cannot flip them.
3. `number_fill` gets a third layout `sequence` (ordering, book lesson 2-7): cells are numbers with a constant step and one `?`.
4. `sort` boxes are `{ label, pic? }` so a child who cannot read sees a picture on each box.

## File map

| File | Responsibility |
|---|---|
| `content/types.ts` (modify) | `MathColor`, `ShapeId`, `MathPic`, round types, four `LessonBody` members |
| `content/math/picLabel.ts` | Colour hex and Arabic words, spoken label of a picture or group |
| `content/math/answers.ts` | Derived answers: `compareAnswer`, `numberFillAnswer` |
| `content/math/validate.ts` | Pure validators per type returning a list of problems |
| `content/math/mathKit.ts` | `MATH_COLOR`, `numberMathLessons`, `bookSection`, `pics`, `shape` |
| `components/activities/math/MathPic.tsx` | Draws one picture (emoji or SVG shape), `PicGroup` |
| `components/activities/math/CompareSymbol.tsx` | SVG `>` `<` `=` |
| `components/activities/math/PicCard.tsx` | Tappable card holding a picture group with correct / wrong state |
| `components/activities/math/useInstruction.ts` | Speaks a prompt when it changes |
| `components/activities/PictureChoiceActivity.tsx` | `picture_choice` |
| `components/activities/CompareActivity.tsx` | `compare` |
| `components/activities/NumberFillActivity.tsx` | `number_fill` |
| `components/activities/SortActivity.tsx` | `sort` |
| `components/activities/index.ts` (modify) | Registry |
| `scripts/content.test.mjs` (modify) | Applies validators to the catalog |
| `__tests__/math/*.test.ts(x)`, `__tests__/activities/*.test.tsx` | Tests |

---

### Task 1: Picture model, labels and `MathPic`

**Files:**
- Modify: `content/types.ts` (after `ArithmeticRound`)
- Create: `content/math/picLabel.ts`, `components/activities/math/MathPic.tsx`
- Test: `__tests__/math/picLabel.test.ts`, `__tests__/math/MathPic.test.tsx`

- [ ] **Step 1: Add the types** to `content/types.ts` after `ArithmeticRound`:

```ts
/** Named colours of math pictures; picLabel.ts maps them to hex and Arabic words. */
export type MathColor = "red" | "blue" | "green" | "yellow" | "orange" | "pink";
export type ShapeId = "circle" | "square" | "triangle" | "rectangle";
/** One math picture: an emoji or a drawn shape. `crossed` marks a taken away object. */
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
```

- [ ] **Step 2: Write the failing label test** `__tests__/math/picLabel.test.ts`:

```ts
import { groupLabel, picLabel } from "@/content/math/picLabel";

test("names shape, colour and size with the right gender", () => {
  expect(picLabel({ shape: "triangle", color: "red", size: "big" })).toBe("مُثَلَّثٌ أَحْمَرُ كَبِيرٌ");
  expect(picLabel({ shape: "circle", color: "blue", size: "small" })).toBe("دَائِرَةٌ زَرْقَاءُ صَغِيرَةٌ");
  expect(picLabel({ shape: "square", color: "green" })).toBe("مُرَبَّعٌ أَخْضَرُ");
});

test("names shading and crossing out", () => {
  expect(picLabel({ shape: "circle", color: "yellow", shaded: "half" })).toBe("دَائِرَةٌ صَفْرَاءُ، النِّصْفُ مُلَوَّنٌ");
  expect(picLabel({ emoji: "🍎", crossed: true })).toBe("🍎 مَشْطُوبٌ");
});

test("a group is its labels joined", () => {
  expect(groupLabel([{ emoji: "🍎" }, { emoji: "🍎" }])).toBe("🍎 🍎");
});
```

- [ ] **Step 3: Run it, expect FAIL** (`Cannot find module`): `cd artifacts/learn-app && npx jest __tests__/math/picLabel.test.ts`

- [ ] **Step 4: Implement** `content/math/picLabel.ts`:

```ts
import type { MathColor, MathPic, ShapeId } from "../types.ts";

/** Fill colour of each named math colour. */
export const MATH_COLORS: Record<MathColor, string> = {
  red: "#DC2626",
  blue: "#2563EB",
  green: "#16A34A",
  yellow: "#EAB308",
  orange: "#EA580C",
  pink: "#DB2777",
};

const SHAPES: Record<ShapeId, { word: string; feminine: boolean }> = {
  circle: { word: "دَائِرَةٌ", feminine: true },
  square: { word: "مُرَبَّعٌ", feminine: false },
  triangle: { word: "مُثَلَّثٌ", feminine: false },
  rectangle: { word: "مُسْتَطِيلٌ", feminine: false },
};

const COLOR_WORDS: Record<MathColor, [string, string]> = {
  red: ["أَحْمَرُ", "حَمْرَاءُ"],
  blue: ["أَزْرَقُ", "زَرْقَاءُ"],
  green: ["أَخْضَرُ", "خَضْرَاءُ"],
  yellow: ["أَصْفَرُ", "صَفْرَاءُ"],
  orange: ["بُرْتُقَالِيٌّ", "بُرْتُقَالِيَّةٌ"],
  pink: ["وَرْدِيٌّ", "وَرْدِيَّةٌ"],
};

const SIZE_WORDS = { big: ["كَبِيرٌ", "كَبِيرَةٌ"], small: ["صَغِيرٌ", "صَغِيرَةٌ"] } as const;
const SHADED = { half: "النِّصْفُ مُلَوَّنٌ", quarter: "الرُّبْعُ مُلَوَّنٌ" } as const;
const CROSSED = "مَشْطُوبٌ";

/** Spoken and accessibility label of one picture, e.g. "مُثَلَّثٌ أَحْمَرُ كَبِيرٌ". */
export function picLabel(pic: MathPic): string {
  if ("emoji" in pic) return pic.crossed ? `${pic.emoji} ${CROSSED}` : pic.emoji;
  const { word, feminine } = SHAPES[pic.shape];
  const g = feminine ? 1 : 0;
  const parts = [word, COLOR_WORDS[pic.color][g]];
  if (pic.size) parts.push(SIZE_WORDS[pic.size][g]);
  let label = parts.join(" ");
  if (pic.shaded) label += `، ${SHADED[pic.shaded]}`;
  if (pic.crossed) label += ` ${CROSSED}`;
  return label;
}

export function groupLabel(pics: MathPic[]): string {
  return pics.map(picLabel).join(" ");
}
```

- [ ] **Step 5: Run the test, expect PASS.**

- [ ] **Step 6: Write the failing component test** `__tests__/math/MathPic.test.tsx`:

```tsx
import { render, screen } from "@testing-library/react-native";
import React from "react";
import { MathPic, PicGroup } from "@/components/activities/math/MathPic";

test("a shape is an image labelled by its words", () => {
  render(<MathPic pic={{ shape: "square", color: "green", size: "big" }} />);
  expect(screen.getByLabelText("مُرَبَّعٌ أَخْضَرُ كَبِيرٌ")).toBeTruthy();
});

test("an emoji shows its character", () => {
  render(<MathPic pic={{ emoji: "🐟" }} />);
  expect(screen.getByText("🐟")).toBeTruthy();
});

test("a group renders every picture", () => {
  render(<PicGroup pics={[{ emoji: "🐟" }, { emoji: "🐟" }, { emoji: "🐟" }]} />);
  expect(screen.getAllByText("🐟")).toHaveLength(3);
});
```

- [ ] **Step 7: Run it, expect FAIL.**

- [ ] **Step 8: Implement** `components/activities/math/MathPic.tsx`:

```tsx
import React, { useId } from "react";
import { StyleSheet, Text, View } from "react-native";
import { Circle, ClipPath, Defs, G, Line, Polygon, Rect, Svg } from "react-native-svg";
import { MATH_COLORS, groupLabel, picLabel } from "@/content/math/picLabel";
import type { MathPic as Pic, ShapeId } from "@/content/types";
import { colors } from "@/theme/tokens";

const SIZES = { small: 36, normal: 52, big: 72 } as const;

function ShapePath({ shape, fill, stroke }: { shape: ShapeId; fill: string; stroke: string }) {
  const common = { fill, stroke, strokeWidth: 4 };
  switch (shape) {
    case "circle":
      return <Circle cx={50} cy={50} r={44} {...common} />;
    case "square":
      return <Rect x={8} y={8} width={84} height={84} {...common} />;
    case "triangle":
      return <Polygon points="50,6 94,92 6,92" {...common} />;
    case "rectangle":
      return <Rect x={4} y={26} width={92} height={48} {...common} />;
  }
}

/** One math picture: an emoji, or an SVG shape with colour, size, shading and crossing out. */
export function MathPic({ pic }: { pic: Pic }) {
  const clipId = useId().replace(/:/g, "");
  const size = SIZES[pic.size ?? "normal"];
  const label = picLabel(pic);
  return (
    <View
      accessible
      accessibilityRole="image"
      accessibilityLabel={label}
      style={{ width: size, height: size, alignItems: "center", justifyContent: "center" }}
    >
      {"emoji" in pic ? (
        <Text style={{ fontSize: size * 0.8 }}>{pic.emoji}</Text>
      ) : (
        <Svg width={size} height={size} viewBox="0 0 100 100">
          {pic.shaded ? (
            <>
              <Defs>
                <ClipPath id={clipId}>
                  <ShapePath shape={pic.shape} fill="#000" stroke="none" />
                </ClipPath>
              </Defs>
              <ShapePath shape={pic.shape} fill={colors.white} stroke={MATH_COLORS[pic.color]} />
              <G clipPath={`url(#${clipId})`}>
                {/* Half: the right half; quarter: the top right quarter (the book's RTL reading start). */}
                <Rect
                  x={50}
                  y={0}
                  width={50}
                  height={pic.shaded === "half" ? 100 : 50}
                  fill={MATH_COLORS[pic.color]}
                />
              </G>
              <ShapePath shape={pic.shape} fill="none" stroke={MATH_COLORS[pic.color]} />
            </>
          ) : (
            <ShapePath shape={pic.shape} fill={MATH_COLORS[pic.color]} stroke={colors.text} />
          )}
        </Svg>
      )}
      {pic.crossed ? (
        <Svg style={StyleSheet.absoluteFill} viewBox="0 0 100 100">
          <Line x1={10} y1={10} x2={90} y2={90} stroke={colors.danger} strokeWidth={10} strokeLinecap="round" />
        </Svg>
      ) : null}
    </View>
  );
}

/** Several pictures side by side, wrapping, read right to left. */
export function PicGroup({ pics }: { pics: Pic[] }) {
  return (
    <View accessible accessibilityLabel={groupLabel(pics)} style={styles.group}>
      {pics.map((pic, i) => (
        <MathPic key={i} pic={pic} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  group: {
    flexDirection: "row-reverse",
    flexWrap: "wrap",
    justifyContent: "center",
    alignItems: "center",
    gap: 6,
    maxWidth: 260,
  },
});
```

Check `colors.text`, `colors.white`, `colors.danger` exist in `theme/tokens.ts` (they are used by `ChoiceCard.tsx`). If `getByLabelText` cannot see the inner image inside an `accessible` group in the group test, that is fine: the group test uses `getAllByText`.

- [ ] **Step 9: Run both tests, expect PASS.** Then `pnpm typecheck` and `pnpm lint`.

- [ ] **Step 10: Commit**

```bash
git add content/types.ts content/math/picLabel.ts components/activities/math/MathPic.tsx __tests__/math
git commit --only content/types.ts content/math/picLabel.ts components/activities/math/MathPic.tsx __tests__/math -m "feat: math picture model with SVG shapes and spoken labels"
```

---

### Task 2: `useInstruction`

**Files:**
- Create: `components/activities/math/useInstruction.ts`
- Test: `__tests__/math/useInstruction.test.tsx`

- [ ] **Step 1: Failing test**

```tsx
import { act, renderHook } from "@testing-library/react-native";
import { useInstruction } from "@/components/activities/math/useInstruction";

const speech = jest.requireMock("expo-speech") as { speak: jest.Mock };

beforeEach(() => {
  jest.useFakeTimers();
  jest.clearAllMocks();
});
afterEach(() => jest.useRealTimers());

test("speaks a prompt once and again only when it changes", () => {
  const { rerender } = renderHook(({ p }) => useInstruction(p), { initialProps: { p: "أُحَوِّطُ الأَكْبَرَ" } });
  act(() => jest.advanceTimersByTime(400));
  expect(speech.speak).toHaveBeenCalledTimes(1);
  rerender({ p: "أُحَوِّطُ الأَكْبَرَ" });
  act(() => jest.advanceTimersByTime(400));
  expect(speech.speak).toHaveBeenCalledTimes(1);
  rerender({ p: "أُحَوِّطُ الأَصْغَرَ" });
  act(() => jest.advanceTimersByTime(400));
  expect(speech.speak).toHaveBeenCalledTimes(2);
  expect(speech.speak).toHaveBeenLastCalledWith("أُحَوِّطُ الأَصْغَرَ", expect.anything());
});
```

- [ ] **Step 2: Run, expect FAIL.**

- [ ] **Step 3: Implement**

```ts
import { useEffect } from "react";
import { speak } from "@/lib/speech";
import { PROMPT_DELAY_MS } from "../shared/useQuiz";

/**
 * Speaks the task when it first appears and again only when it changes between rounds:
 * the voice gives the task, the child does the maths by looking. A ListenButton replays it.
 */
export function useInstruction(prompt: string): void {
  useEffect(() => {
    const t = setTimeout(() => speak(prompt), PROMPT_DELAY_MS);
    return () => clearTimeout(t);
  }, [prompt]);
}
```

- [ ] **Step 4: Run, expect PASS.** `pnpm typecheck`, `pnpm lint`.

- [ ] **Step 5: Commit** `git commit --only components/activities/math/useInstruction.ts __tests__/math/useInstruction.test.tsx -m "feat: speak a math instruction only when it changes"` (after `git add` of both).

---

### Task 3: `picture_choice` slice

**Files:**
- Modify: `content/types.ts`, `components/activities/index.ts`, `__tests__/activities/index.test.ts`, `scripts/content.test.mjs`
- Create: `content/math/validate.ts`, `components/activities/math/PicCard.tsx`, `components/activities/PictureChoiceActivity.tsx`
- Test: `__tests__/math/validate.test.ts`, `__tests__/activities/PictureChoiceActivity.test.tsx`

- [ ] **Step 1: Types.** In `content/types.ts` after `MathPic`:

```ts
export type PictureChoiceRound = {
  /** The task, spoken and shown: the child cannot read yet. */
  prompt: string;
  /** Picture to compare against, shown above the choices ("same as this one"). */
  model?: MathPic;
  /** 2 to 4 choices; a choice may be a group of pictures. */
  choices: MathPic[][];
  correctIndex: number;
};
```

and in `LessonBody` after the `arithmetic` member: `| { type: "picture_choice"; rounds: PictureChoiceRound[] }`.

- [ ] **Step 2: Failing validator test** `__tests__/math/validate.test.ts`:

```ts
import { validatePictureChoice } from "@/content/math/validate";

const apple = { emoji: "🍎" };

test("a valid picture choice round has no problems", () => {
  expect(validatePictureChoice({ prompt: "أَيُّهَا أَكْثَرُ؟", choices: [[apple], [apple, apple]], correctIndex: 1 })).toEqual([]);
});

test("picture choice problems are reported", () => {
  expect(validatePictureChoice({ prompt: "", choices: [[apple]], correctIndex: 3 })).toEqual([
    "empty prompt",
    "needs 2 to 4 choices",
    "correctIndex out of range",
  ]);
  expect(validatePictureChoice({ prompt: "x", choices: [[apple], []], correctIndex: 0 })).toEqual(["empty choice"]);
});
```

- [ ] **Step 3: Run, expect FAIL.**

- [ ] **Step 4: Implement** `content/math/validate.ts`:

```ts
import type { PictureChoiceRound } from "../types.ts";

// Pure checks of math rounds, used by Jest and by scripts/content.test.mjs on the catalog.
// Each returns the problems found; [] means valid.

export function checkPrompt(prompt: string): string[] {
  return prompt.trim() ? [] : ["empty prompt"];
}

export function validatePictureChoice(round: PictureChoiceRound): string[] {
  const problems = checkPrompt(round.prompt);
  const n = round.choices.length;
  if (n < 2 || n > 4) problems.push("needs 2 to 4 choices");
  if (round.correctIndex < 0 || round.correctIndex >= n) problems.push("correctIndex out of range");
  if (round.choices.some((c) => c.length === 0)) problems.push("empty choice");
  return problems;
}
```

- [ ] **Step 5: Run, expect PASS.**

- [ ] **Step 6: Implement** `components/activities/math/PicCard.tsx`:

```tsx
import React from "react";
import { Animated, Pressable, StyleSheet, Text } from "react-native";
import { groupLabel } from "@/content/math/picLabel";
import type { MathPic } from "@/content/types";
import { colors, touchTarget } from "@/theme/tokens";
import type { ChoiceState } from "../shared/ChoiceCard";
import { PicGroup } from "./MathPic";

const ICON: Record<ChoiceState, string | null> = { idle: null, correct: "✅", wrong: "❌" };
const SPOKEN: Record<ChoiceState, string> = { idle: "", correct: "، صحيح", wrong: "، خطأ" };

type Props = {
  index: number;
  pics: MathPic[];
  state: ChoiceState;
  selected: boolean;
  locked: boolean;
  onPick: (index: number) => void;
  scale?: Animated.Value;
};

/** A tappable card holding one picture or a group, with the same feedback as ChoiceCard. */
export function PicCard({ index, pics, state, selected, locked, onPick, scale }: Props) {
  return (
    <Animated.View style={scale ? { transform: [{ scale }] } : undefined}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={groupLabel(pics) + SPOKEN[state]}
        accessibilityState={{ disabled: locked, selected }}
        disabled={locked}
        onPress={() => onPick(index)}
        style={[styles.card, stateStyles[state]]}
      >
        <PicGroup pics={pics} />
        {ICON[state] ? <Text style={styles.icon}>{ICON[state]}</Text> : null}
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: {
    minWidth: touchTarget * 2,
    minHeight: touchTarget * 2,
    borderRadius: 16,
    borderWidth: 3,
    padding: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  icon: { position: "absolute", top: -8, right: -8, fontSize: 18 },
});

const stateStyles = StyleSheet.create({
  idle: { backgroundColor: colors.surface, borderColor: colors.border },
  correct: { backgroundColor: colors.successSoft, borderColor: colors.success },
  wrong: { backgroundColor: colors.dangerSoft, borderColor: colors.danger },
});
```

- [ ] **Step 7: Failing activity test** `__tests__/activities/PictureChoiceActivity.test.tsx`:

```tsx
import { act, fireEvent, screen } from "@testing-library/react-native";
import React from "react";
import { PictureChoiceActivity } from "@/components/activities/PictureChoiceActivity";
import type { Lesson } from "@/content/types";
import { renderActivity } from "@/test-utils/activities";

const lesson: Extract<Lesson, { type: "picture_choice" }> = {
  id: "math-u1-1",
  number: 1,
  title: "أُصَنِّفُ",
  subtitle: "",
  emoji: "🔺",
  color: "#7C3AED",
  type: "picture_choice",
  rounds: [
    {
      prompt: "مَا الشَّكْلُ الْمُخْتَلِفُ؟",
      choices: [
        [{ shape: "circle", color: "red" }],
        [{ shape: "triangle", color: "red" }],
        [{ shape: "circle", color: "blue" }],
      ],
      correctIndex: 1,
    },
    {
      prompt: "مَا الشَّكْلُ الْمُخْتَلِفُ؟",
      model: { emoji: "🍎" },
      choices: [[{ emoji: "🍎" }], [{ emoji: "🍌" }]],
      correctIndex: 0,
    },
  ],
};

const speech = jest.requireMock("expo-speech") as { speak: jest.Mock };

beforeEach(() => {
  jest.useFakeTimers();
  jest.clearAllMocks();
});
afterEach(() => jest.useRealTimers());

test("speaks the task once, scores the first tap and completes", () => {
  const onComplete = jest.fn();
  renderActivity(
    <PictureChoiceActivity lesson={lesson} color="#7C3AED" attemptKey="x:1" onComplete={onComplete} />,
  );
  act(() => jest.advanceTimersByTime(400));
  expect(speech.speak).toHaveBeenCalledWith("مَا الشَّكْلُ الْمُخْتَلِفُ؟", expect.anything());
  fireEvent.press(screen.getByRole("button", { name: "مُثَلَّثٌ أَحْمَرُ" }));
  expect(screen.getByRole("button", { name: "دَائِرَةٌ زَرْقَاءُ" })).toBeDisabled();
  speech.speak.mockClear();
  act(() => jest.advanceTimersByTime(900));
  act(() => jest.advanceTimersByTime(400));
  // Same prompt in round 2: not spoken again.
  expect(speech.speak).not.toHaveBeenCalledWith("مَا الشَّكْلُ الْمُخْتَلِفُ؟", expect.anything());
  expect(screen.getByLabelText("🍎")).toBeTruthy();
  fireEvent.press(screen.getByRole("button", { name: "🍌" }));
  act(() => jest.advanceTimersByTime(900));
  expect(onComplete).toHaveBeenCalledWith({ correct: 1, total: 2 });
});
```

- [ ] **Step 8: Run, expect FAIL.**

- [ ] **Step 9: Implement** `components/activities/PictureChoiceActivity.tsx`:

```tsx
import React, { useCallback } from "react";
import { StyleSheet, View } from "react-native";
import { speak } from "@/lib/speech";
import { colors } from "@/theme/tokens";
import { MathPic } from "./math/MathPic";
import { PicCard } from "./math/PicCard";
import { useInstruction } from "./math/useInstruction";
import { ListenButton } from "./shared/ListenButton";
import { ProgressDots } from "./shared/ProgressDots";
import { PRAISE } from "./shared/strings";
import { act } from "./shared/styles";
import { ADVANCE_MS, choiceState, useBounce, useQuiz } from "./shared/useQuiz";
import { useShuffled } from "./shared/useShuffled";
import { withAttemptReset } from "./shared/withAttemptReset";
import type { ActivityProps } from "./types";

/** Tap the right picture: odd one out, same as the model, what comes next, the bigger group. */
function PictureChoice({ lesson, color, attemptKey, onComplete, onRoundResult }: ActivityProps<"picture_choice">) {
  const total = lesson.rounds.length;
  const quiz = useQuiz({ lesson, total, onComplete, onRoundResult, autoAdvanceMs: ADVANCE_MS });
  const { pick } = quiz;
  const round = lesson.rounds[quiz.roundIndex];
  const shuffled = useShuffled(round.choices, round.correctIndex, attemptKey, quiz.roundIndex);
  const { values, bounce } = useBounce(4);
  useInstruction(round.prompt);

  const handlePick = useCallback(
    (idx: number) => {
      const correct = idx === shuffled.correctIndex;
      if (!pick(idx, correct)) return;
      if (correct) {
        speak(PRAISE);
        bounce(idx, 1.15);
      }
    },
    [shuffled.correctIndex, pick, bounce],
  );

  return (
    <View style={act.container}>
      <ProgressDots count={total} current={quiz.roundIndex} color={color} />
      <ListenButton text={round.prompt} color={color} showText />
      {round.model ? (
        <View style={styles.model}>
          <MathPic pic={round.model} />
        </View>
      ) : null}
      <View style={[act.choicesRow, styles.rtl]}>
        {shuffled.items.map((pics, idx) => (
          <PicCard
            key={idx}
            index={idx}
            pics={pics}
            state={choiceState(idx, quiz.picked, shuffled.correctIndex)}
            selected={quiz.picked === idx}
            locked={quiz.locked}
            onPick={handlePick}
            scale={values[idx]}
          />
        ))}
      </View>
    </View>
  );
}

export const PictureChoiceActivity = withAttemptReset(PictureChoice, "PictureChoiceActivity");

const styles = StyleSheet.create({
  model: { padding: 10, borderRadius: 16, borderWidth: 3, borderStyle: "dashed", borderColor: colors.border },
  rtl: { flexDirection: "row-reverse" },
});
```

Before writing, open `components/activities/ArithmeticActivity.tsx` and confirm how existing activities apply `withAttemptReset` (wrapper at export vs. in `index.ts`); follow the same pattern. If they do not wrap, drop the wrapper here too.

- [ ] **Step 10: Register.** In `components/activities/index.ts` import `PictureChoiceActivity` and add `picture_choice: PictureChoiceActivity,` after `arithmetic`. In `__tests__/activities/index.test.ts` add `"picture_choice",` to the sorted list (between `naming` and `story`).

- [ ] **Step 11: Catalog rule.** In `scripts/content.test.mjs` add the import `import { validatePictureChoice } from "../content/math/validate.ts";` and after the arithmetic test:

```js
test("picture_choice rounds are valid", () => {
  for (const lesson of byType("picture_choice"))
    lesson.rounds.forEach((round, i) =>
      assert.deepEqual(validatePictureChoice(round), [], `${lesson.id} round ${i + 1}`),
    );
});
```

- [ ] **Step 12: Run** `npx jest __tests__/activities __tests__/math`, `pnpm test:data`, `pnpm typecheck`, `pnpm lint`. Expect all PASS.

- [ ] **Step 13: Commit** all files of this task with `git commit --only ... -m "feat: picture choice activity for math"`.

---

### Task 4: `compare` slice

**Files:**
- Modify: `content/types.ts`, `content/math/validate.ts`, `components/activities/index.ts`, `__tests__/activities/index.test.ts`, `scripts/content.test.mjs`, `__tests__/math/validate.test.ts`
- Create: `content/math/answers.ts`, `components/activities/math/CompareSymbol.tsx`, `components/activities/CompareActivity.tsx`
- Test: `__tests__/math/answers.test.ts`, `__tests__/activities/CompareActivity.test.tsx`

- [ ] **Step 1: Types** in `content/types.ts`:

```ts
/** One side of a comparison: a group of pictures or a number. */
export type CompareSide = { pics: MathPic[] } | { number: number };
/** `first` sits on the right and is read first; the answer says how it relates to `second`. */
export type CompareRound = {
  prompt: string;
  first: CompareSide;
  second: CompareSide;
  /** Word buttons (أَكْثَرُ / أَقَلُّ / يُسَاوِي, or أَكْبَرُ / أَصْغَرُ for numbers) or the symbols > < =. */
  mode: "words" | "symbols";
};
```

`LessonBody`: `| { type: "compare"; rounds: CompareRound[] }`.

- [ ] **Step 2: Failing tests.** `__tests__/math/answers.test.ts`:

```ts
import { compareAnswer, sideValue } from "@/content/math/answers";

test("a side is worth its number or its picture count", () => {
  expect(sideValue({ number: 7 })).toBe(7);
  expect(sideValue({ pics: [{ emoji: "🐟" }, { emoji: "🐟" }] })).toBe(2);
});

test("the answer says how first relates to second", () => {
  expect(compareAnswer({ number: 5 }, { number: 3 })).toBe("more");
  expect(compareAnswer({ number: 2 }, { pics: [{ emoji: "🐟" }, { emoji: "🐟" }, { emoji: "🐟" }] })).toBe("less");
  expect(compareAnswer({ number: 4 }, { number: 4 })).toBe("equal");
});
```

Append to `__tests__/math/validate.test.ts`:

```ts
import { validateCompare } from "@/content/math/validate";

test("compare sides must be non empty and within 0 to 10", () => {
  expect(validateCompare({ prompt: "x", first: { number: 3 }, second: { number: 10 }, mode: "symbols" })).toEqual([]);
  expect(validateCompare({ prompt: "x", first: { pics: [] }, second: { number: 11 }, mode: "words" })).toEqual([
    "empty group",
    "value outside 0 to 10",
  ]);
});
```

(Put the new import at the top of the file next to the existing one.)

- [ ] **Step 3: Run, expect FAIL.**

- [ ] **Step 4: Implement** `content/math/answers.ts`:

```ts
import type { CompareSide } from "../types.ts";

export type CompareAnswer = "more" | "less" | "equal";

export function sideValue(side: CompareSide): number {
  return "number" in side ? side.number : side.pics.length;
}

/** How `first` relates to `second`; derived, never stored in content. */
export function compareAnswer(first: CompareSide, second: CompareSide): CompareAnswer {
  const a = sideValue(first);
  const b = sideValue(second);
  return a > b ? "more" : a < b ? "less" : "equal";
}
```

Append to `content/math/validate.ts` (extend the type import with `CompareRound, CompareSide`):

```ts
function checkSide(side: CompareSide): string[] {
  if ("pics" in side) {
    if (side.pics.length === 0) return ["empty group"];
    return side.pics.length > 10 ? ["value outside 0 to 10"] : [];
  }
  return side.number < 0 || side.number > 10 ? ["value outside 0 to 10"] : [];
}

export function validateCompare(round: CompareRound): string[] {
  return [...checkPrompt(round.prompt), ...checkSide(round.first), ...checkSide(round.second)];
}
```

- [ ] **Step 5: Run, expect PASS.**

- [ ] **Step 6: Implement** `components/activities/math/CompareSymbol.tsx`:

```tsx
import React from "react";
import { Line, Polyline, Svg } from "react-native-svg";
import type { CompareAnswer } from "@/content/math/answers";

/**
 * The comparison sign drawn as SVG so bidi can never mirror it. `first` sits on the right,
 * so "more" opens towards the right (the bigger side), drawn like "<".
 */
export function CompareSymbol({ answer, color, size = 40 }: { answer: CompareAnswer; color: string; size?: number }) {
  const stroke = { stroke: color, strokeWidth: 10, strokeLinecap: "round" as const, strokeLinejoin: "round" as const, fill: "none" };
  return (
    <Svg width={size} height={size} viewBox="0 0 100 100">
      {answer === "equal" ? (
        <>
          <Line x1={15} y1={35} x2={85} y2={35} {...stroke} />
          <Line x1={15} y1={65} x2={85} y2={65} {...stroke} />
        </>
      ) : answer === "more" ? (
        <Polyline points="85,15 15,50 85,85" {...stroke} />
      ) : (
        <Polyline points="15,15 85,50 15,85" {...stroke} />
      )}
    </Svg>
  );
}
```

- [ ] **Step 7: Failing activity test** `__tests__/activities/CompareActivity.test.tsx`:

```tsx
import { act, fireEvent, screen } from "@testing-library/react-native";
import React from "react";
import { CompareActivity } from "@/components/activities/CompareActivity";
import type { Lesson } from "@/content/types";
import { renderActivity } from "@/test-utils/activities";

const fish = { emoji: "🐟" };
const lesson: Extract<Lesson, { type: "compare" }> = {
  id: "math-u2-1",
  number: 1,
  title: "أُقَارِنُ",
  subtitle: "",
  emoji: "⚖️",
  color: "#7C3AED",
  type: "compare",
  rounds: [
    { prompt: "أُقَارِنُ الْمَجْمُوعَتَيْنِ", first: { pics: [fish, fish, fish] }, second: { pics: [fish] }, mode: "words" },
    { prompt: "أَضَعُ الإِشَارَةَ", first: { number: 4 }, second: { number: 4 }, mode: "symbols" },
  ],
};

beforeEach(() => {
  jest.useFakeTimers();
  jest.clearAllMocks();
});
afterEach(() => jest.useRealTimers());

test("word buttons for groups, symbol buttons for numbers, first tap counts", () => {
  const onComplete = jest.fn();
  renderActivity(<CompareActivity lesson={lesson} color="#7C3AED" attemptKey="x:1" onComplete={onComplete} />);
  fireEvent.press(screen.getByRole("button", { name: "أَكْثَرُ" }));
  expect(screen.getByRole("button", { name: "أَقَلُّ" })).toBeDisabled();
  act(() => jest.advanceTimersByTime(900));
  expect(screen.getByText("٤", { exact: false })).toBeTruthy();
  fireEvent.press(screen.getByRole("button", { name: "أَكْبَرُ مِنْ" }));
  act(() => jest.advanceTimersByTime(900));
  expect(onComplete).toHaveBeenCalledWith({ correct: 1, total: 2 });
});
```

- [ ] **Step 8: Run, expect FAIL.**

- [ ] **Step 9: Implement** `components/activities/CompareActivity.tsx`:

```tsx
import React, { useCallback } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { compareAnswer, type CompareAnswer } from "@/content/math/answers";
import type { CompareSide } from "@/content/types";
import { toArabicDigits } from "@/lib/arabicNumbers";
import { speak } from "@/lib/speech";
import { colors, touchTarget } from "@/theme/tokens";
import { CompareSymbol } from "./math/CompareSymbol";
import { PicGroup } from "./math/MathPic";
import { useInstruction } from "./math/useInstruction";
import { ListenButton } from "./shared/ListenButton";
import { ProgressDots } from "./shared/ProgressDots";
import { PRAISE } from "./shared/strings";
import { act } from "./shared/styles";
import { ADVANCE_MS, choiceState, useQuiz } from "./shared/useQuiz";
import { withAttemptReset } from "./shared/withAttemptReset";
import type { ActivityProps } from "./types";

/** Buttons keep a fixed order, like the book, so the child learns where each answer lives. */
const ANSWERS: CompareAnswer[] = ["more", "less", "equal"];
const GROUP_WORDS: Record<CompareAnswer, string> = { more: "أَكْثَرُ", less: "أَقَلُّ", equal: "يُسَاوِي" };
const NUMBER_WORDS: Record<CompareAnswer, string> = { more: "أَكْبَرُ", less: "أَصْغَرُ", equal: "يُسَاوِي" };
const SYMBOL_WORDS: Record<CompareAnswer, string> = { more: "أَكْبَرُ مِنْ", less: "أَصْغَرُ مِنْ", equal: "يُسَاوِي" };

function Side({ side }: { side: CompareSide }) {
  return "number" in side ? (
    <Text style={styles.number}>{toArabicDigits(side.number)}</Text>
  ) : (
    <PicGroup pics={side.pics} />
  );
}

/** More, fewer or equal: two groups or numbers, the first on the right. */
function Compare({ lesson, color, onComplete, onRoundResult }: ActivityProps<"compare">) {
  const total = lesson.rounds.length;
  const quiz = useQuiz({ lesson, total, onComplete, onRoundResult, autoAdvanceMs: ADVANCE_MS });
  const { pick } = quiz;
  const round = lesson.rounds[quiz.roundIndex];
  const answer = compareAnswer(round.first, round.second);
  const correctIndex = ANSWERS.indexOf(answer);
  const words = round.mode === "symbols" ? SYMBOL_WORDS : "number" in round.first ? NUMBER_WORDS : GROUP_WORDS;
  useInstruction(round.prompt);

  const handlePick = useCallback(
    (idx: number) => {
      const correct = idx === correctIndex;
      if (!pick(idx, correct)) return;
      if (correct) speak(PRAISE);
    },
    [correctIndex, pick],
  );

  return (
    <View style={act.container}>
      <ProgressDots count={total} current={quiz.roundIndex} color={color} />
      <ListenButton text={round.prompt} color={color} showText />
      <View style={styles.sides}>
        <View style={styles.side}>
          <Side side={round.first} />
        </View>
        <View style={styles.gap}>
          {quiz.locked && round.mode === "symbols" ? <CompareSymbol answer={answer} color={colors.successText} /> : null}
        </View>
        <View style={styles.side}>
          <Side side={round.second} />
        </View>
      </View>
      <View style={styles.buttons}>
        {ANSWERS.map((a, idx) => {
          const state = choiceState(idx, quiz.picked, correctIndex);
          return (
            <Pressable
              key={a}
              accessibilityRole="button"
              accessibilityLabel={words[a]}
              accessibilityState={{ disabled: quiz.locked, selected: quiz.picked === idx }}
              disabled={quiz.locked}
              onPress={() => handlePick(idx)}
              style={[styles.button, stateStyles[state]]}
            >
              {round.mode === "symbols" ? (
                <CompareSymbol answer={a} color={colors.text} />
              ) : (
                <Text style={styles.word}>{words[a]}</Text>
              )}
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

export const CompareActivity = withAttemptReset(Compare, "CompareActivity");

const styles = StyleSheet.create({
  sides: { flexDirection: "row-reverse", alignItems: "center", justifyContent: "center", gap: 8, width: "100%" },
  side: {
    flex: 1,
    minHeight: 120,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 16,
    borderWidth: 2,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    padding: 8,
  },
  gap: { width: 44, alignItems: "center" },
  number: { fontSize: 56, fontWeight: "900", color: colors.text },
  buttons: { flexDirection: "row-reverse", gap: 12, justifyContent: "center", flexWrap: "wrap" },
  button: {
    minWidth: touchTarget * 2,
    minHeight: touchTarget * 1.5,
    borderRadius: 16,
    borderWidth: 3,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 12,
  },
  word: { fontSize: 22, fontWeight: "800", color: colors.text },
});

const stateStyles = StyleSheet.create({
  idle: { backgroundColor: colors.surface, borderColor: colors.border },
  correct: { backgroundColor: colors.successSoft, borderColor: colors.success },
  wrong: { backgroundColor: colors.dangerSoft, borderColor: colors.danger },
});
```

Note: the test expects round 2 (`4` vs `4`, symbols) answered with "أَكْبَرُ مِنْ" to be wrong, so the total is 1 of 2.

- [ ] **Step 10: Register** `compare: CompareActivity` in `index.ts`; add `"compare",` to the sorted list in `index.test.ts` (between `build_word` and `counting`).

- [ ] **Step 11: Catalog rule** in `scripts/content.test.mjs` (extend the validate import with `validateCompare`):

```js
test("compare rounds are valid", () => {
  for (const lesson of byType("compare"))
    lesson.rounds.forEach((round, i) => assert.deepEqual(validateCompare(round), [], `${lesson.id} round ${i + 1}`));
});
```

- [ ] **Step 12: Run** jest (`__tests__/activities __tests__/math`), `pnpm test:data`, `pnpm typecheck`, `pnpm lint`. PASS.

- [ ] **Step 13: Commit** `-m "feat: compare activity for math with drawn comparison signs"`.

---

### Task 5: `number_fill` slice

**Files:**
- Modify: `content/types.ts`, `content/math/answers.ts`, `content/math/validate.ts`, `components/activities/index.ts`, `__tests__/activities/index.test.ts`, `scripts/content.test.mjs`, `__tests__/math/answers.test.ts`, `__tests__/math/validate.test.ts`
- Create: `components/activities/NumberFillActivity.tsx`
- Test: `__tests__/activities/NumberFillActivity.test.tsx`

- [ ] **Step 1: Types**

```ts
export type FillCell = number | "+" | "-" | "=" | "?";
export type NumberFillRound = {
  prompt: string;
  /**
   * In reading order (right to left on screen), exactly one "?".
   * row and vertical: `a op b = c`; sequence: numbers with a constant step, e.g. [2, 3, "?", 5].
   */
  cells: FillCell[];
  layout: "row" | "vertical" | "sequence";
  options: number[];
  /** Optional picture story above the sentence. */
  pics?: MathPic[];
};
```

`LessonBody`: `| { type: "number_fill"; rounds: NumberFillRound[] }`.

- [ ] **Step 2: Failing tests.** Append to `__tests__/math/answers.test.ts` (extend import with `numberFillAnswer`):

```ts
test("number fill solves any one missing cell of a sum or difference", () => {
  expect(numberFillAnswer([2, "+", 3, "=", "?"])).toBe(5);
  expect(numberFillAnswer([2, "+", "?", "=", 5])).toBe(3);
  expect(numberFillAnswer(["?", "-", 2, "=", 4])).toBe(6);
  expect(numberFillAnswer([7, "-", "?", "=", 3])).toBe(4);
});

test("number fill continues a sequence", () => {
  expect(numberFillAnswer([2, 3, "?", 5])).toBe(4);
  expect(numberFillAnswer(["?", 8, 6])).toBe(10);
  expect(numberFillAnswer([1, 2, 3])).toBeNull();
});

test("an unsolvable sentence has no answer", () => {
  expect(numberFillAnswer([2, "+", "?", "=", "?"])).toBeNull();
  expect(numberFillAnswer([2, 4, "?", 9])).toBeNull();
});
```

Append to `__tests__/math/validate.test.ts` (extend import with `validateNumberFill`):

```ts
test("number fill needs a solvable sentence whose answer is an option", () => {
  expect(validateNumberFill({ prompt: "x", cells: [3, "+", "?", "=", 5], layout: "row", options: [1, 2, 3] })).toEqual([]);
  expect(validateNumberFill({ prompt: "x", cells: [3, "+", "?", "=", 5], layout: "row", options: [1, 3, 3] })).toEqual([
    "answer 2 not in options",
    "options not unique",
  ]);
  expect(validateNumberFill({ prompt: "x", cells: [3, "?", 5], layout: "row", options: [4] })).toEqual([
    "row and vertical need a op b = c",
  ]);
  expect(validateNumberFill({ prompt: "x", cells: [5, "-", 7, "=", "?"], layout: "vertical", options: [2] })).toEqual([
    "no answer or negative answer",
    "answer null not in options",
  ]);
});
```

- [ ] **Step 3: Run, expect FAIL.**

- [ ] **Step 4: Implement.** Append to `content/math/answers.ts` (extend import with `FillCell`):

```ts
/** The number hidden behind "?", or null when the sentence cannot be solved. */
export function numberFillAnswer(cells: FillCell[]): number | null {
  if (cells.filter((c) => c === "?").length !== 1) return null;
  if (cells.includes("=")) {
    const [a, op, b, eq, c] = cells;
    if (cells.length !== 5 || (op !== "+" && op !== "-") || eq !== "=") return null;
    const sign = op === "+" ? 1 : -1;
    if (c === "?" && typeof a === "number" && typeof b === "number") return a + sign * b;
    if (b === "?" && typeof a === "number" && typeof c === "number") return sign * (c - a);
    if (a === "?" && typeof b === "number" && typeof c === "number") return c - sign * b;
    return null;
  }
  if (cells.some((c) => c !== "?" && typeof c !== "number")) return null;
  const at = cells.indexOf("?");
  const known = cells.map((c, i) => [i, c] as const).filter((p): p is readonly [number, number] => typeof p[1] === "number");
  if (known.length < 2) return null;
  const [[i0, v0], [i1, v1]] = known;
  const step = (v1 - v0) / (i1 - i0);
  if (!Number.isInteger(step) || step === 0) return null;
  if (known.some(([i, v]) => v !== v0 + step * (i - i0))) return null;
  return v0 + step * (at - i0);
}
```

Append to `content/math/validate.ts` (import `numberFillAnswer` from `./answers.ts`, extend type import with `NumberFillRound`):

```ts
export function validateNumberFill(round: NumberFillRound): string[] {
  const problems = checkPrompt(round.prompt);
  if (round.layout !== "sequence" && (round.cells.length !== 5 || round.cells[3] !== "=")) {
    problems.push("row and vertical need a op b = c");
    return problems;
  }
  const answer = numberFillAnswer(round.cells);
  if (answer === null || answer < 0) problems.push("no answer or negative answer");
  const numbers = round.cells.filter((c): c is number => typeof c === "number");
  if (numbers.some((n) => n < 0)) problems.push("negative number");
  if (!round.options.includes(answer as number)) problems.push(`answer ${answer} not in options`);
  if (new Set(round.options).size !== round.options.length) problems.push("options not unique");
  return problems;
}
```

- [ ] **Step 5: Run, expect PASS.**

- [ ] **Step 6: Failing activity test** `__tests__/activities/NumberFillActivity.test.tsx`:

```tsx
import { act, fireEvent, screen } from "@testing-library/react-native";
import React from "react";
import { NumberFillActivity } from "@/components/activities/NumberFillActivity";
import type { Lesson } from "@/content/types";
import { renderActivity } from "@/test-utils/activities";

const lesson: Extract<Lesson, { type: "number_fill" }> = {
  id: "math-u3-1",
  number: 1,
  title: "أُكْمِلُ",
  subtitle: "",
  emoji: "➕",
  color: "#7C3AED",
  type: "number_fill",
  rounds: [
    { prompt: "أُكْمِلُ", cells: [2, "+", "?", "=", 5], layout: "row", options: [2, 3, 4] },
    { prompt: "أُكْمِلُ", cells: [6, "-", 2, "=", "?"], layout: "vertical", options: [3, 4, 8] },
    { prompt: "أُرَتِّبُ", cells: [1, 2, "?", 4], layout: "sequence", options: [3, 5, 6] },
  ],
};

const speech = jest.requireMock("expo-speech") as { speak: jest.Mock };

beforeEach(() => {
  jest.useFakeTimers();
  jest.clearAllMocks();
});
afterEach(() => jest.useRealTimers());

test("shows each layout with an empty box, never reads the sum aloud", () => {
  const onComplete = jest.fn();
  renderActivity(<NumberFillActivity lesson={lesson} color="#7C3AED" attemptKey="x:1" onComplete={onComplete} />);
  act(() => jest.advanceTimersByTime(400));
  expect(speech.speak.mock.calls.map((c) => c[0])).toEqual(["أُكْمِلُ"]);
  expect(screen.getByLabelText("مربع فارغ")).toBeTruthy();
  fireEvent.press(screen.getByRole("button", { name: "٣" }));
  act(() => jest.advanceTimersByTime(900));
  fireEvent.press(screen.getByRole("button", { name: "٨" }));
  expect(screen.getByRole("button", { name: "٤" })).toBeDisabled();
  act(() => jest.advanceTimersByTime(900));
  fireEvent.press(screen.getByRole("button", { name: "٣" }));
  act(() => jest.advanceTimersByTime(900));
  expect(onComplete).toHaveBeenCalledWith({ correct: 2, total: 3 });
});
```

- [ ] **Step 7: Run, expect FAIL.**

- [ ] **Step 8: Implement** `components/activities/NumberFillActivity.tsx`:

```tsx
import React, { useCallback, useMemo } from "react";
import { StyleSheet, Text, View } from "react-native";
import { numberFillAnswer } from "@/content/math/answers";
import type { FillCell } from "@/content/types";
import { toArabicDigits } from "@/lib/arabicNumbers";
import { speak } from "@/lib/speech";
import { colors } from "@/theme/tokens";
import { PicGroup } from "./math/MathPic";
import { useInstruction } from "./math/useInstruction";
import { ChoiceCard } from "./shared/ChoiceCard";
import { ListenButton } from "./shared/ListenButton";
import { ProgressDots } from "./shared/ProgressDots";
import { PRAISE } from "./shared/strings";
import { act } from "./shared/styles";
import { ADVANCE_MS, choiceState, useBounce, useQuiz } from "./shared/useQuiz";
import { useShuffled } from "./shared/useShuffled";
import { withAttemptReset } from "./shared/withAttemptReset";
import type { ActivityProps } from "./types";

const EMPTY_LABEL = "مربع فارغ";

/** One cell: a number, a sign, or the empty box (filled with the answer once the round locks). */
function Cell({ cell, filled }: { cell: FillCell; filled: number | null }) {
  if (cell === "?")
    return (
      <View accessible accessibilityLabel={filled === null ? EMPTY_LABEL : toArabicDigits(filled)} style={styles.box}>
        <Text style={styles.cell}>{filled === null ? "" : toArabicDigits(filled)}</Text>
      </View>
    );
  return <Text style={styles.cell}>{typeof cell === "number" ? toArabicDigits(cell) : cell}</Text>;
}

/** The missing number in a sum, a difference or a counting row. The child reads; only the task is spoken. */
function NumberFill({ lesson, color, attemptKey, onComplete, onRoundResult }: ActivityProps<"number_fill">) {
  const total = lesson.rounds.length;
  const quiz = useQuiz({ lesson, total, onComplete, onRoundResult, autoAdvanceMs: ADVANCE_MS });
  const { pick } = quiz;
  const round = lesson.rounds[quiz.roundIndex];
  const answer = numberFillAnswer(round.cells);
  const correct = round.options.indexOf(answer as number);
  const shuffled = useShuffled(round.options, correct, attemptKey, quiz.roundIndex);
  const labels = useMemo(() => shuffled.items.map(toArabicDigits), [shuffled.items]);
  const { values, bounce } = useBounce(Math.max(...lesson.rounds.map((r) => r.options.length)));
  const filled = quiz.locked ? answer : null;
  useInstruction(round.prompt);

  const handlePick = useCallback(
    (idx: number) => {
      const ok = idx === shuffled.correctIndex;
      if (!pick(idx, ok)) return;
      if (ok) {
        speak(PRAISE);
        bounce(idx, 1.2);
      }
    },
    [shuffled.correctIndex, pick, bounce],
  );

  const [a, op, b, , c] = round.cells;
  return (
    <View style={act.container}>
      <ProgressDots count={total} current={quiz.roundIndex} color={color} />
      <ListenButton text={round.prompt} color={color} showText />
      {round.pics ? <PicGroup pics={round.pics} /> : null}
      {round.layout === "vertical" ? (
        <View style={styles.vertical}>
          <Cell cell={a} filled={filled} />
          <View style={styles.row}>
            <Cell cell={b} filled={filled} />
            <Cell cell={op} filled={filled} />
          </View>
          <View style={styles.rule} />
          <Cell cell={c} filled={filled} />
        </View>
      ) : (
        <View style={styles.row}>
          {round.cells.map((cell, i) => (
            <Cell key={i} cell={cell} filled={filled} />
          ))}
        </View>
      )}
      <View style={[act.choicesRow, styles.rtl]}>
        {labels.map((label, idx) => (
          <ChoiceCard
            key={idx}
            index={idx}
            word={label}
            variant="number"
            state={choiceState(idx, quiz.picked, shuffled.correctIndex)}
            selected={quiz.picked === idx}
            locked={quiz.locked}
            onPick={handlePick}
            scale={values[idx]}
          />
        ))}
      </View>
    </View>
  );
}

export const NumberFillActivity = withAttemptReset(NumberFill, "NumberFillActivity");

const styles = StyleSheet.create({
  row: { flexDirection: "row-reverse", alignItems: "center", justifyContent: "center", gap: 12 },
  rtl: { flexDirection: "row-reverse" },
  vertical: { alignItems: "flex-start", gap: 4 },
  rule: { height: 4, alignSelf: "stretch", backgroundColor: colors.text, borderRadius: 2 },
  cell: { fontSize: 44, fontWeight: "900", color: colors.text, minWidth: 36, textAlign: "center" },
  box: {
    minWidth: 64,
    minHeight: 64,
    borderWidth: 3,
    borderStyle: "dashed",
    borderColor: colors.mutedStrong,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
});
```

Vertical layout note: the printed book right aligns the column, the operator on the left of the second number. In `row-reverse` the first child (`b`) is on the right, the operator on its left, matching the book.

- [ ] **Step 9: Register** `number_fill: NumberFillActivity`; add `"number_fill",` to the sorted list (between `naming` and `picture_choice`).

- [ ] **Step 10: Catalog rule** (extend import with `validateNumberFill`):

```js
test("number_fill rounds are valid", () => {
  for (const lesson of byType("number_fill"))
    lesson.rounds.forEach((round, i) => assert.deepEqual(validateNumberFill(round), [], `${lesson.id} round ${i + 1}`));
});
```

- [ ] **Step 11: Run** jest, `pnpm test:data`, `pnpm typecheck`, `pnpm lint`. PASS.

- [ ] **Step 12: Commit** `-m "feat: number fill activity for missing numbers, vertical sums and ordering"`.

---

### Task 6: `sort` slice

**Files:**
- Modify: `content/types.ts`, `content/math/validate.ts`, `components/activities/index.ts`, `__tests__/activities/index.test.ts`, `scripts/content.test.mjs`, `__tests__/math/validate.test.ts`
- Create: `components/activities/SortActivity.tsx`
- Test: `__tests__/activities/SortActivity.test.tsx`

- [ ] **Step 1: Types**

```ts
export type SortBox = { label: string; pic?: MathPic };
export type SortItem = { pic: MathPic; box: 0 | 1 };
```

`LessonBody`: `| { type: "sort"; prompt: string; boxes: [SortBox, SortBox]; items: SortItem[] }`.

- [ ] **Step 2: Failing validator test** (extend import with `validateSort`):

```ts
test("sort needs two used boxes and at least two items", () => {
  const big = { emoji: "⚽", size: "big" as const };
  const small = { emoji: "⚽", size: "small" as const };
  const boxes: [{ label: string }, { label: string }] = [{ label: "كَبِير" }, { label: "صَغِير" }];
  expect(validateSort({ prompt: "x", boxes, items: [{ pic: big, box: 0 }, { pic: small, box: 1 }] })).toEqual([]);
  expect(validateSort({ prompt: "x", boxes, items: [{ pic: big, box: 0 }] })).toEqual([
    "needs at least 2 items",
    "both boxes must be used",
  ]);
});
```

- [ ] **Step 3: Run, expect FAIL.**

- [ ] **Step 4: Implement** in `content/math/validate.ts` (extend type import with `SortBox, SortItem`):

```ts
export function validateSort(lesson: { prompt: string; boxes: [SortBox, SortBox]; items: SortItem[] }): string[] {
  const problems = checkPrompt(lesson.prompt);
  if (lesson.items.length < 2) problems.push("needs at least 2 items");
  if (!lesson.items.some((i) => i.box === 0) || !lesson.items.some((i) => i.box === 1))
    problems.push("both boxes must be used");
  if (lesson.boxes.some((b) => !b.label.trim())) problems.push("empty box label");
  return problems;
}
```

- [ ] **Step 5: Run, expect PASS.**

- [ ] **Step 6: Failing activity test** `__tests__/activities/SortActivity.test.tsx`:

```tsx
import { act, fireEvent, screen } from "@testing-library/react-native";
import React from "react";
import { SortActivity } from "@/components/activities/SortActivity";
import type { Lesson } from "@/content/types";
import { renderActivity } from "@/test-utils/activities";

const lesson: Extract<Lesson, { type: "sort" }> = {
  id: "math-u1-2",
  number: 2,
  title: "أُصَنِّفُ",
  subtitle: "",
  emoji: "🎒",
  color: "#7C3AED",
  type: "sort",
  prompt: "أَضَعُ كُلَّ شَيْءٍ فِي مَكَانِهِ",
  boxes: [{ label: "أَحْمَرُ", pic: { shape: "square", color: "red" } }, { label: "أَزْرَقُ", pic: { shape: "square", color: "blue" } }],
  items: [
    { pic: { shape: "circle", color: "red" }, box: 0 },
    { pic: { shape: "triangle", color: "blue" }, box: 1 },
  ],
};

beforeEach(() => {
  jest.useFakeTimers();
  jest.clearAllMocks();
});
afterEach(() => jest.useRealTimers());

test("tap an item then a box; a wrong box keeps the item and costs that item's point", () => {
  const onComplete = jest.fn();
  renderActivity(<SortActivity lesson={lesson} color="#7C3AED" attemptKey="x:1" onComplete={onComplete} />);
  fireEvent.press(screen.getByRole("button", { name: "دَائِرَةٌ حَمْرَاءُ" }));
  fireEvent.press(screen.getByRole("button", { name: "أَزْرَقُ" }));
  expect(screen.getByRole("button", { name: "دَائِرَةٌ حَمْرَاءُ" })).toBeTruthy();
  fireEvent.press(screen.getByRole("button", { name: "أَحْمَرُ" }));
  expect(screen.queryByRole("button", { name: "دَائِرَةٌ حَمْرَاءُ" })).toBeNull();
  expect(onComplete).not.toHaveBeenCalled();
  fireEvent.press(screen.getByRole("button", { name: "مُثَلَّثٌ أَزْرَقُ" }));
  fireEvent.press(screen.getByRole("button", { name: "أَزْرَقُ" }));
  act(() => jest.advanceTimersByTime(900));
  expect(onComplete).toHaveBeenCalledWith({ correct: 1, total: 2 });
});

test("tapping a box with nothing selected does nothing", () => {
  const onComplete = jest.fn();
  renderActivity(<SortActivity lesson={lesson} color="#7C3AED" attemptKey="x:1" onComplete={onComplete} />);
  fireEvent.press(screen.getByRole("button", { name: "أَحْمَرُ" }));
  expect(screen.getAllByRole("button", { name: /دَائِرَةٌ|مُثَلَّثٌ/ })).toHaveLength(2);
});
```

- [ ] **Step 7: Run, expect FAIL.**

- [ ] **Step 8: Implement** `components/activities/SortActivity.tsx`:

```tsx
import React, { useCallback, useEffect, useRef, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { picLabel } from "@/content/math/picLabel";
import * as haptics from "@/lib/haptics";
import { speak } from "@/lib/speech";
import { colors, touchTarget } from "@/theme/tokens";
import { MathPic } from "./math/MathPic";
import { useInstruction } from "./math/useInstruction";
import { ListenButton } from "./shared/ListenButton";
import { PRAISE } from "./shared/strings";
import { act } from "./shared/styles";
import { ADVANCE_MS } from "./shared/useQuiz";
import { useLatest } from "./shared/useLatest";
import { withAttemptReset } from "./shared/withAttemptReset";
import type { ActivityProps } from "./types";

/**
 * Tap an item, then the box it belongs in. A wrong box keeps the item in place; only an
 * item's first placement counts. The lesson ends when every item is in its box.
 */
function Sort({ lesson, color, onComplete }: ActivityProps<"sort">) {
  const [selected, setSelected] = useState<number | null>(null);
  const [placed, setPlaced] = useState<boolean[]>(() => lesson.items.map(() => false));
  const missed = useRef<Set<number>>(new Set());
  const callbacks = useLatest({ onComplete });
  useInstruction(lesson.prompt);

  const done = placed.every(Boolean);
  useEffect(() => {
    if (!done) return;
    speak(PRAISE);
    const total = lesson.items.length;
    const t = setTimeout(() => callbacks.current.onComplete({ correct: total - missed.current.size, total }), ADVANCE_MS);
    return () => clearTimeout(t);
  }, [done, lesson.items.length, callbacks]);

  const handleBox = useCallback(
    (box: 0 | 1) => {
      if (selected === null) return;
      if (lesson.items[selected].box !== box) {
        missed.current.add(selected);
        haptics.error();
        return;
      }
      haptics.success();
      setPlaced((p) => p.map((v, i) => v || i === selected));
      setSelected(null);
    },
    [selected, lesson.items],
  );

  return (
    <View style={act.container}>
      <ListenButton text={lesson.prompt} color={color} showText />
      <View style={styles.boxes}>
        {lesson.boxes.map((box, b) => (
          <Pressable
            key={b}
            accessibilityRole="button"
            accessibilityLabel={box.label}
            onPress={() => handleBox(b as 0 | 1)}
            style={[styles.box, selected !== null && { borderColor: color }]}
          >
            {box.pic ? <MathPic pic={box.pic} /> : null}
            <Text style={styles.boxLabel}>{box.label}</Text>
            <View style={styles.inBox}>
              {lesson.items.map((item, i) =>
                placed[i] && item.box === b ? <MathPic key={i} pic={{ ...item.pic, size: "small" }} /> : null,
              )}
            </View>
          </Pressable>
        ))}
      </View>
      <View style={styles.items}>
        {lesson.items.map((item, i) =>
          placed[i] ? null : (
            <Pressable
              key={i}
              accessibilityRole="button"
              accessibilityLabel={picLabel(item.pic)}
              accessibilityState={{ selected: selected === i }}
              onPress={() => {
                haptics.tap();
                setSelected(i);
              }}
              style={[styles.item, selected === i && { borderColor: color, backgroundColor: colors.successSoft }]}
            >
              <MathPic pic={item.pic} />
            </Pressable>
          ),
        )}
      </View>
    </View>
  );
}

export const SortActivity = withAttemptReset(Sort, "SortActivity");

const styles = StyleSheet.create({
  boxes: { flexDirection: "row-reverse", gap: 12, width: "100%" },
  box: {
    flex: 1,
    minHeight: 160,
    borderRadius: 20,
    borderWidth: 3,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    alignItems: "center",
    padding: 10,
    gap: 6,
  },
  boxLabel: { fontSize: 20, fontWeight: "800", color: colors.text },
  inBox: { flexDirection: "row-reverse", flexWrap: "wrap", justifyContent: "center", gap: 4 },
  items: { flexDirection: "row-reverse", flexWrap: "wrap", justifyContent: "center", gap: 12 },
  item: {
    minWidth: touchTarget * 1.5,
    minHeight: touchTarget * 1.5,
    borderRadius: 16,
    borderWidth: 3,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    alignItems: "center",
    justifyContent: "center",
  },
});
```

`useLatest` lives in `components/activities/shared/useLatest.ts` (used by `useQuiz`); check its export name before use. The picture `MathPic` with `size` override: emoji and shape pics both accept `size`, so the spread is type safe.

- [ ] **Step 9: Register** `sort: SortActivity`; add `"sort",` to the sorted list (between `picture_choice` and `story`).

- [ ] **Step 10: Catalog rule** (extend import with `validateSort`):

```js
test("sort lessons are valid", () => {
  for (const lesson of byType("sort")) assert.deepEqual(validateSort(lesson), [], lesson.id);
});
```

- [ ] **Step 11: Run** jest, `pnpm test:data`, `pnpm typecheck`, `pnpm lint`. PASS.

- [ ] **Step 12: Commit** `-m "feat: tap to sort activity for math"`.

---

### Task 7: Math lesson kit and id rule

**Files:**
- Create: `content/math/mathKit.ts`
- Modify: `scripts/content.test.mjs`
- Test: `__tests__/math/mathKit.test.ts`

- [ ] **Step 1: Failing test**

```ts
import { bookSection, numberMathLessons, pics, shape } from "@/content/math/mathKit";

test("lessons get math-u ids and positions", () => {
  const lessons = numberMathLessons(2, [
    { type: "compare", title: "أ", subtitle: "", emoji: "⚖️", color: "#7C3AED", rounds: [] },
    { type: "compare", title: "ب", subtitle: "", emoji: "⚖️", color: "#7C3AED", rounds: [] },
  ]);
  expect(lessons.map((l) => [l.id, l.number])).toEqual([
    ["math-u2-1", 1],
    ["math-u2-2", 2],
  ]);
});

test("section headings use the book lesson code in Eastern Arabic digits", () => {
  expect(bookSection(2, 1, "الأَعْدَادُ ١، ٢، ٣")).toBe("٢-١, الأَعْدَادُ ١، ٢، ٣");
});

test("picture builders", () => {
  expect(pics("🐟", 3)).toEqual([{ emoji: "🐟" }, { emoji: "🐟" }, { emoji: "🐟" }]);
  expect(shape("circle", "red", "big")).toEqual({ shape: "circle", color: "red", size: "big" });
});
```

- [ ] **Step 2: Run, expect FAIL.**

- [ ] **Step 3: Implement** `content/math/mathKit.ts`:

```ts
import type { Lesson, MathColor, MathPic, ShapeId } from "../types.ts";
import { SUBJECT_COLORS } from "../types.ts";

// Building blocks for the math units rebuilt from الرياضيات Part 1: each book lesson
// becomes a section of app lessons under the book's lesson code.

type DistributiveOmit<T, K extends PropertyKey> = T extends unknown ? Omit<T, K> : never;
/** A lesson before `numberMathLessons` gives it its id and position. */
export type MathLessonDraft = DistributiveOmit<Lesson, "id" | "number">;

export const MATH_COLOR = SUBJECT_COLORS.math;

const DIGITS = "٠١٢٣٤٥٦٧٨٩";
const eastern = (n: number) => String(n).replace(/\d/g, (d) => DIGITS[Number(d)]);

/** Ids `math-u{unit}-{n}`, numbered from 1 in order. */
export function numberMathLessons(unit: number, drafts: MathLessonDraft[]): Lesson[] {
  return drafts.map((d, i) => ({ ...d, id: `math-u${unit}-${i + 1}`, number: i + 1 }) as Lesson);
}

/** Section heading from the book lesson, e.g. "٢-١, الأَعْدَادُ ١، ٢، ٣". */
export function bookSection(unit: number, lesson: number, title: string): string {
  return `${eastern(unit)}-${eastern(lesson)}, ${title}`;
}

export function pics(emoji: string, count: number): MathPic[] {
  return Array.from({ length: count }, () => ({ emoji }));
}

export function shape(id: ShapeId, color: MathColor, size?: "small" | "big"): MathPic {
  return size ? { shape: id, color, size } : { shape: id, color };
}
```

(`content/` cannot import `lib/arabicNumbers.ts` if that file imports react-native; check it. If it is pure, import `toArabicDigits` from `../../lib/arabicNumbers.ts` instead of the local `eastern`.)

- [ ] **Step 4: Run, expect PASS.**

- [ ] **Step 5: Id rule** in `scripts/content.test.mjs`:

```js
test("math lessons rebuilt from the book use math-u ids", () => {
  for (const lesson of lessons.filter((l) => l.id.startsWith("math-")))
    assert.match(lesson.id, /^math-u\d+-\d+$/, lesson.id);
});
```

- [ ] **Step 6: Run** jest, `pnpm test:data`, `pnpm typecheck`, `pnpm lint`. PASS.

- [ ] **Step 7: Commit** `-m "feat: math lesson kit with book section headings"`.

---

### Task 8: Docs and full gate

**Files:**
- Modify: `README.md`, `APP_OVERVIEW.md`, `docs/superpowers/plans/PROGRESS.md`, `docs/superpowers/specs/2026-11-05-math-foundation-design.md`

- [ ] **Step 1:** Spec: apply the four "Spec refinements" listed at the top of this plan to the spec text.
- [ ] **Step 2:** `README.md`: in the Math Part 1 row add "Foundation for the textbook rebuild in place: picture choice, compare, number fill and sort activities (no lessons use them yet)". `APP_OVERVIEW.md`: list the four new lesson types wherever lesson types are listed (grep `build_word` to find the spots).
- [ ] **Step 3:** `PROGRESS.md` decision log: `- 2026-11-05: Math foundation (spec 2026-11-05-math-foundation-design.md): four generic math activity types, math-u ids, old math progress dropped, voice gives only the task.`
- [ ] **Step 4: Full gate** from the repo root: `pnpm typecheck && pnpm lint && pnpm test && pnpm test:data && pnpm test:e2e`. All PASS; e2e unchanged.
- [ ] **Step 5: Commit** `-m "docs: math foundation in README, overview and progress log"`.
