// End to end suite for the rebuilt routes: /, /grade/[gradeId], /book/[bookId], /unit/[unitId], /lesson/[lessonId].
// Runs with: pnpm test:e2e (expo export, then playwright test; playwright.config.ts serves dist/ on 8787).
// Every test starts from a fresh browser context; the page fixture fails a test on any console error.
import fs from "node:fs";
import { createRequire } from "node:module";

import {
  QUIZ_ROUNDS,
  answerRound,
  completeQuizLesson,
  earnedStars,
  expect,
  gotoAndWaitReady,
  readProgress,
  tapAllAndFinish,
  test,
  traceDiagonal,
  traceGuide,
} from "./helpers.mjs";

const BOOK_IDS = ["arabic-1", "arabic-2", "lughati-1", "math-1", "math-2", "science-1"];
const AVAILABLE_BOOK_IDS = ["arabic-1", "math-1"];

test.describe("navigation", () => {
  test("home shows grades 1 to 6, grades 2 to 6 as soon, zero stars and no streak", async ({
    page,
  }) => {
    await gotoAndWaitReady(page, "/");
    await expect(page.getByTestId("grade-1")).toContainText("الصف الأول");
    await expect(page.getByTestId("grade-1")).not.toContainText("قريباً");
    for (const n of [2, 3, 4, 5, 6]) {
      await expect(page.getByTestId(`grade-${n}`)).toContainText("قريباً");
      await expect(page.getByTestId(`grade-${n}`)).toHaveAttribute("aria-disabled", "true");
    }
    await expect(page.getByTestId("star-badge")).toContainText("٠");
    await expect(page.getByTestId("streak-badge")).toHaveCount(0);
  });

  test("grade 1 lists its books", async ({ page }) => {
    await gotoAndWaitReady(page, "/");
    await page.getByTestId("grade-1").click();
    await expect(page).toHaveURL(/\/grade\/1$/);
    for (const id of BOOK_IDS) await expect(page.getByTestId(`book-${id}`)).toBeVisible();
  });

  test("every available book card navigates to its book", async ({ page }) => {
    for (const id of AVAILABLE_BOOK_IDS) {
      await gotoAndWaitReady(page, "/grade/1");
      const card = page.getByTestId(`book-${id}`);
      await expect(card).not.toHaveAttribute("aria-disabled", "true");
      await card.click();
      await expect(page).toHaveURL(new RegExp(`/book/${id}$`));
      await expect(page.locator("[data-testid^='unit-']").first()).toBeVisible();
    }
  });

  test("an unavailable book card does not navigate", async ({ page }) => {
    await gotoAndWaitReady(page, "/grade/1");
    const unavailable = page.locator("[data-testid^='book-'][aria-disabled='true']");
    test.skip((await unavailable.count()) === 0, "every book in the catalog is available");
    await unavailable.first().click({ force: true });
    await page.waitForTimeout(500);
    await expect(page).toHaveURL(/\/grade\/1$/);
  });

  test("home → grade → book → unit → lesson by taps, and back returns to the unit", async ({
    page,
  }) => {
    await gotoAndWaitReady(page, "/");
    await page.getByTestId("grade-1").click();
    await page.getByTestId("book-arabic-1").click();
    await expect(page).toHaveURL(/\/book\/arabic-1$/);
    const unitCard = page.getByTestId("unit-a2");
    await expect(unitCard).toContainText("٠ / ٣١");
    await unitCard.click();
    await expect(page).toHaveURL(/\/unit\/a2$/);
    await page.getByTestId("lesson-row-u2-2").click();
    await expect(page).toHaveURL(/\/lesson\/u2-2$/);
    await expect(
      page.getByText("أَقْرَأُ الْمَقَاطِع").filter({ visible: true }).first(),
    ).toBeVisible();
    await expect(page.getByText("ابحث عن الحرف")).toBeVisible();
    await page.getByRole("button", { name: "رجوع" }).click();
    await expect(page).toHaveURL(/\/unit\/a2$/);
  });

  test("an unknown lesson id shows the not found card", async ({ page }) => {
    await page.goto("/lesson/nope");
    await expect(page.getByText("الدرس غير موجود")).toBeVisible();
  });
});

test.describe("scoring", () => {
  test("0 of 6 first taps correct gives 1 star", async ({ page }) => {
    expect(await completeQuizLesson(page, "u2-29", 0)).toBe(1);
    await expect.poll(async () => (await readProgress(page))?.lessons["u2-29"]?.stars).toBe(1);
  });

  test("6 of 6 first taps correct gives 3 stars and counts on the unit card", async ({ page }) => {
    expect(await completeQuizLesson(page, "u2-29", 6)).toBe(3);
    await expect.poll(async () => (await readProgress(page))?.totalStars).toBe(3);
    await gotoAndWaitReady(page, "/book/arabic-1");
    await expect(page.getByTestId("unit-a2")).toContainText("١ / ٣١");
    await gotoAndWaitReady(page, "/unit/a2");
    await expect(page.getByTestId("lesson-done-u2-29")).toBeVisible();
  });

  test("4 of 6 first taps correct gives 2 stars; a later tap does not change the score", async ({
    page,
  }) => {
    await gotoAndWaitReady(page, "/lesson/u2-29");
    const rounds = QUIZ_ROUNDS["u2-29"];
    for (let i = 0; i < rounds.length; i++) {
      if (i < 2) {
        await answerRound(page, rounds[i].wrong);
        // The round is locked after the first tap: the right answer is now disabled.
        await expect(page.getByRole("button", { name: `${rounds[i].right}، صحيح` })).toBeDisabled();
      } else {
        await answerRound(page, rounds[i].right);
      }
    }
    expect(await earnedStars(page)).toBe(2);
  });

  test("replaying a lesson with a worse score keeps the best stars", async ({ page }) => {
    expect(await completeQuizLesson(page, "u2-29", 6)).toBe(3);
    await page.getByTestId("repeat-lesson").click();
    await expect(page.getByText("سؤال ١ من ٦")).toBeVisible();
    expect(await completeQuizLesson(page, "u2-29", 0, { navigate: false })).toBe(1);
    await expect.poll(async () => (await readProgress(page))?.lessons["u2-29"]?.stars).toBe(3);
    await gotoAndWaitReady(page, "/");
    await expect(page.getByTestId("star-badge")).toContainText("٣");
  });

  test("shuffled options still complete when answered by text", async ({ page }) => {
    const firstRoundOrders = [];
    await gotoAndWaitReady(page, "/lesson/u2-29");
    for (let attempt = 0; attempt < 3; attempt++) {
      if (attempt > 0) await page.getByTestId("repeat-lesson").click();
      await expect(page.getByText("سؤال ١ من ٦")).toBeVisible();
      firstRoundOrders.push(
        await page.getByRole("button", { name: /^(رَ|دَ|تَ)$/, disabled: false }).allInnerTexts(),
      );
      expect(await completeQuizLesson(page, "u2-29", 6, { navigate: false })).toBe(3);
    }
    for (const order of firstRoundOrders)
      expect([...order].sort()).toEqual(["رَ", "دَ", "تَ"].sort());
  });

  test("the next lesson button replaces the lesson with the following one", async ({ page }) => {
    await completeQuizLesson(page, "u2-29", 6);
    await page.getByTestId("next-lesson").click();
    await expect(page).toHaveURL(/\/lesson\/u2-30$/);
    await expect(
      page.getByText("أَقْرَأُ الصَّوْتَ الأَوَّلَ").filter({ visible: true }).first(),
    ).toBeVisible();
  });
});

test.describe("activities", () => {
  test("trace: a tiny drag or a line off the letter is refused, tracing the letters completes", async ({
    page,
  }) => {
    await gotoAndWaitReady(page, "/lesson/u2-24");
    await traceDiagonal(page, { length: 5 });
    await page.getByTestId("trace-done").click();
    await expect(page.getByTestId("trace-error")).toHaveText("اِرسم الحرف بشكل أكبر 📏");
    expect(await page.evaluate(() => window.__spoken)).toContain("حاول مرة أخرى");

    await page.getByTestId("trace-clear").click();
    // A line across the pad is not the letter.
    await traceDiagonal(page);
    await page.getByTestId("trace-done").click();
    await expect(page.getByTestId("trace-error")).toHaveText("اُكتب فوق الحرف المرسوم ✏️");
    await page.getByTestId("trace-clear").click();

    for (const letter of ["د", "ـد"]) {
      await expect(page.getByTestId("trace-pad")).toHaveAttribute("aria-label", letter);
      await traceGuide(page, letter);
      await page.getByTestId("trace-done").click();
    }
    expect(await earnedStars(page)).toBe(3);
    await expect(page.getByTestId("next-lesson")).toBeVisible();
  });

  test("math counting lesson completes with 3 stars", async ({ page }) => {
    expect(await completeQuizLesson(page, "m1-1", 5)).toBe(3);
    await expect.poll(async () => (await readProgress(page))?.lessons["m1-1"]?.stars).toBe(3);
  });

  // Science is hidden behind "قريباً" on the grade screen, but its lessons still open by URL.
  test("science story and naming lessons complete", async ({ page }) => {
    await gotoAndWaitReady(page, "/lesson/s1-1");
    await tapAllAndFinish(page, [
      "هَٰذَا جِسْمِي",
      "أَرَى بِعَيْنِي",
      "أَسْمَعُ بِأُذُنِي",
      "أَشُمُّ بِأَنْفِي",
    ]);
    expect(await earnedStars(page)).toBe(3);

    await page.getByTestId("next-lesson").click();
    await expect(page).toHaveURL(/\/lesson\/s1-2$/);
    await expect(page.getByText("٦ كلمة متبقية")).toBeVisible();
    await tapAllAndFinish(page, ["عَيْن", "أُذُن", "أَنْف", "فَم", "يَد", "قَدَم"]);
    expect(await earnedStars(page)).toBe(3);
    await expect.poll(async () => (await readProgress(page))?.totalStars).toBe(6);
  });
});

test.describe("language", () => {
  test("English mode shows Math and Science while lesson text stays Arabic", async ({ page }) => {
    await gotoAndWaitReady(page, "/");
    await page.getByTestId("language-en").click();
    await expect(page.getByTestId("grade-1")).toContainText("Grade 1");
    await gotoAndWaitReady(page, "/grade/1");
    await expect(page.getByTestId("book-math-1")).toContainText("Math");
    await expect(page.getByTestId("book-science-1")).toContainText("Science");
    await page.reload();
    await expect(page.getByTestId("book-math-1")).toContainText("Math");

    await gotoAndWaitReady(page, "/lesson/u2-1");
    await expect(
      page.getByRole("button", { name: "مَامَا تُوصِلُنِي إِلَى الْمَدْرَسَةِ", exact: true }),
    ).toBeVisible();
    await expect(
      page.getByText("أَقْرَأُ الْقِصَّة").filter({ visible: true }).first(),
    ).toBeVisible();

    await gotoAndWaitReady(page, "/");
    await page.getByTestId("language-ar").click();
    await expect(page.getByTestId("grade-1")).toContainText("الصف الأول");
  });
});

test.describe("accessibility", () => {
  const require = createRequire(import.meta.url);
  let axePath = null;
  try {
    axePath = require.resolve("axe-core/axe.min.js");
  } catch {}

  test("axe: no serious or critical color contrast violations on home, grade, book, unit, lesson", async ({
    page,
  }) => {
    test.skip(!axePath, "axe-core not installed");
    const axeSource = fs.readFileSync(axePath, "utf8");
    const found = {};
    for (const path of ["/", "/grade/1", "/book/arabic-1", "/unit/a2", "/lesson/u2-29"]) {
      await gotoAndWaitReady(page, path);
      if (path.startsWith("/lesson/")) await expect(page.getByText("سؤال ١ من ٦")).toBeVisible();
      await page.addScriptTag({ content: axeSource });
      const violations = await page.evaluate(async () => {
        // axe's own matcher drops text it takes for an icon ligature, and its canvas check flags
        // shaped Arabic as one, so nearly all Arabic text would be skipped. Match visible,
        // enabled elements with a direct text child instead; the contrast check itself is unchanged.
        const { dom, forms } = window.axe.commons;
        window.axe.configure({
          rules: [
            {
              id: "color-contrast",
              matches: (node, virtualNode) =>
                [...node.childNodes].some((c) => c.nodeType === 3 && c.nodeValue.trim() !== "") &&
                !forms.isDisabled(virtualNode) &&
                dom.isVisibleOnScreen(node),
            },
          ],
        });
        const result = await window.axe.run(document, {
          runOnly: { type: "rule", values: ["color-contrast"] },
        });
        return {
          checked: [...result.passes, ...result.violations, ...result.incomplete].reduce(
            (s, r) => s + r.nodes.length,
            0,
          ),
          counts: ["passes", "violations", "incomplete"].map(
            (k) => `${k} ${result[k].reduce((s, r) => s + r.nodes.length, 0)}`,
          ),
          serious: result.violations
            .filter((v) => v.impact === "serious" || v.impact === "critical")
            .flatMap((v) =>
              v.nodes.map(
                (n) => `${v.id} (${v.impact}): ${n.target.join(" ")} ${n.failureSummary}`,
              ),
            ),
        };
      });
      expect(violations.checked, `axe checked text nodes on ${path}`).toBeGreaterThan(0);
      test.info().annotations.push({
        type: "axe color-contrast",
        description: `${path}: ${violations.counts.join(", ")}`,
      });
      if (violations.serious.length) found[path] = violations.serious;
    }
    expect(found).toEqual({});
  });
});
