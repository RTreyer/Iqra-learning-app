// Shared fixtures and helpers for the end to end suite (see playwright.config.ts).
import { test as base, expect } from "@playwright/test";
import { decodeMask } from "../components/activities/trace/validate.ts";
import { TRACE_GRID, traceGuides } from "../content/generated/traceGuides.ts";

export { expect };

export const PROGRESS_KEY = "@kidlearn_progress_v1";
export const VOICE_HINT_KEY = "@iqra_voice_hint_shown";

/**
 * Answers per round, taken from content/. Options are shuffled per attempt, so rounds are
 * always answered by text. `wrong` is any option that is not the answer.
 */
export const QUIZ_ROUNDS = {
  // content/arabic/unit2.ts, letter_pick (تدريبات: syllables of the seven letters)
  "u2-29": [
    { right: "رَ", wrong: "دَ" },
    { right: "لَا", wrong: "نَا" },
    { right: "دَا", wrong: "مَا" },
    { right: "نَ", wrong: "تَ" },
    { right: "تَا", wrong: "بَا" },
    { right: "مَا", wrong: "لَا" },
  ],
  // content/math/unit1.ts, counting (choices shown as Eastern Arabic digits)
  "m1-1": [
    { right: "٢", wrong: "١" },
    { right: "٣", wrong: "٤" },
    { right: "١", wrong: "٣" },
    { right: "٣", wrong: "٢" },
    { right: "٢", wrong: "١" },
  ],
};

/** Runs before any app code: silent speech that finishes at once, and no voice hint banner. */
function prepareBrowser() {
  window.__spoken = [];
  const synth = window.speechSynthesis;
  if (synth) {
    // Headless Chromium has no voices; record what would be spoken and end each utterance
    // asynchronously, so lesson intros waiting on onDone continue without the 1500 ms fallback.
    synth.getVoices = () => [];
    synth.cancel = () => {};
    synth.speak = (u) => {
      window.__spoken.push(u && u.text);
      setTimeout(() => u && u.onend && u.onend(new Event("end")), 0);
    };
  }
  try {
    localStorage.setItem("@iqra_voice_hint_shown", "1");
  } catch {}
}

/** Page fixture: stubs speech and fails the test on any console error or uncaught page error. */
export const test = base.extend({
  page: async ({ page }, provide) => {
    const errors = [];
    page.on("console", (m) => {
      if (m.type() === "error") errors.push(m.text().slice(0, 300));
    });
    page.on("pageerror", (e) => errors.push(`pageerror: ${e.message.slice(0, 300)}`));
    await page.addInitScript(prepareBrowser);
    await provide(page);
    expect(errors, "console errors during the test").toEqual([]);
  },
});

/** Seeds localStorage once per tab (reloads keep what the app wrote since). Call before the first goto. */
export async function seedStorage(page, entries) {
  await page.addInitScript((seed) => {
    if (sessionStorage.getItem("__e2e_seeded")) return;
    sessionStorage.setItem("__e2e_seeded", "1");
    for (const [key, value] of Object.entries(seed)) localStorage.setItem(key, value);
  }, entries);
}

const READY = [
  [/^\/$/, (page) => page.getByTestId("grade-1")],
  [/^\/grade\//, (page) => page.getByTestId("book-arabic-1")],
  [/^\/book\//, (page) => page.locator("[data-testid^='unit-']").first()],
  [/^\/unit\//, (page) => page.locator("[data-testid^='lesson-row-']").first()],
  [
    /^\/review$/,
    (page) => page.locator("[data-testid='review-round'], [data-testid='review-empty']").first(),
  ],
];

/** Navigates and waits until the screen has rendered its main content. */
export async function gotoAndWaitReady(page, path) {
  await page.goto(path);
  const ready = READY.find(([re]) => re.test(path));
  if (ready) await expect(ready[1](page)).toBeVisible();
  else await expect(page.locator("#root")).not.toBeEmpty();
  await dismissVoiceHint(page);
}

/** Closes the voice hint banner if it is shown (normally suppressed by the stored flag). */
export async function dismissVoiceHint(page) {
  const close = page.getByRole("button", { name: "إغلاق / Dismiss" });
  if (await close.isVisible()) await close.click();
}

/** Taps the enabled choice whose label is exactly `text` (the round's first tap counts). */
export async function answerRound(page, text) {
  const choice = page.getByRole("button", { name: text, exact: true, disabled: false });
  await expect(choice).toHaveCount(1);
  await choice.click();
}

/** Earned stars shown on the completion card. */
export async function earnedStars(page) {
  await expect(page.getByTestId("lesson-complete")).toBeVisible();
  return page.getByTestId("star-earned").count();
}

/**
 * Plays a quiz lesson from QUIZ_ROUNDS: the first `correctCount` rounds right, the rest wrong.
 * Pass `{ navigate: false }` to play the attempt already on screen. Returns the stars shown.
 */
export async function completeQuizLesson(page, lessonId, correctCount, { navigate = true } = {}) {
  const rounds = QUIZ_ROUNDS[lessonId];
  if (!rounds) throw new Error(`no QUIZ_ROUNDS for ${lessonId}`);
  if (navigate) await gotoAndWaitReady(page, `/lesson/${lessonId}`);
  for (let i = 0; i < rounds.length; i++) {
    const { right, wrong } = rounds[i];
    await answerRound(page, i < correctCount ? right : wrong);
  }
  return earnedStars(page);
}

/** Taps every listed item (story lines or naming words), then the done button. */
export async function tapAllAndFinish(page, labels) {
  for (const label of labels) await page.getByRole("button", { name: label, exact: true }).click();
  await page.getByTestId("activity-done").click();
}

/** Drags across the trace pad: corner to corner, or only `length` px when given. */
export async function traceDiagonal(page, { length } = {}) {
  const pad = page.getByTestId("trace-pad");
  await expect(pad).toBeVisible();
  const box = await pad.boundingBox();
  const x0 = box.x + box.width * 0.15;
  const y0 = box.y + box.height * 0.15;
  const x1 = length ? x0 + length : box.x + box.width * 0.85;
  const y1 = length ? y0 : box.y + box.height * 0.85;
  await page.mouse.move(x0, y0);
  await page.mouse.down();
  await page.mouse.move(x1, y1, { steps: length ? 3 : 25 });
  await page.mouse.up();
}

/**
 * Traces a guide the way a careful child would: along every row of the letter's cells
 * (content/generated/traceGuides.ts), one mouse stroke per run of cells.
 */
export async function traceGuide(page, guide) {
  const pad = page.getByTestId("trace-pad");
  await expect(pad).toBeVisible();
  const box = await pad.boundingBox();
  const { cells, grid } = decodeMask(traceGuides[guide].mask, TRACE_GRID);
  const at = (row, col) => [
    box.x + ((col + 0.5) * box.width) / grid,
    box.y + ((row + 0.5) * box.height) / grid,
  ];
  for (let row = 0; row < grid; row++) {
    let start = -1;
    for (let col = 0; col <= grid; col++) {
      const on = col < grid && cells[row * grid + col];
      if (on && start < 0) start = col;
      if (!on && start >= 0) {
        await page.mouse.move(...at(row, start));
        await page.mouse.down();
        await page.mouse.move(...at(row, col - 1), { steps: Math.max(2, col - start) });
        await page.mouse.up();
        start = -1;
      }
    }
  }
}

/** The stored progress blob, or null before the first write. */
export async function readProgress(page) {
  return page.evaluate((key) => {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : null;
  }, PROGRESS_KEY);
}
