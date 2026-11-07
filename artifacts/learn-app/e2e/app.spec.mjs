// End to end suite for the routes: /, /book/[bookId], /unit/[unitId], /lesson/[lessonId], /album, /parents.
// Runs with: pnpm test:e2e (expo export, then playwright test; playwright.config.ts serves dist/ on 8787).
// Every test starts from a fresh browser context; the page fixture fails a test on any console error.
import fs from "node:fs";
import { createRequire } from "node:module";

import { mathBookUnit5 } from "../content/math/bookUnit5.ts";

import {
  DEMO_SEEN_KEY,
  PROGRESS_KEY,
  SETTINGS_KEY,
  QUIZ_ROUNDS,
  answerRound,
  completeMathLesson,
  completeQuizLesson,
  earnedStars,
  expect,
  gotoAndWaitReady,
  mathLesson,
  mathUnit1Lesson,
  openParents,
  pictureChoiceByName,
  readProgress,
  seedStorage,
  tapAllAndFinish,
  compareAnswerButton,
  numberFillAnswerButton,
  pictureChoiceAnswer,
  test,
  traceDiagonal,
  traceGuide,
} from "./helpers.mjs";

const AVAILABLE_BOOK_IDS = ["arabic-1", "math-1"];

test.describe("navigation", () => {
  test("home shows the play button and one island per available book, zero stars, no grades", async ({
    page,
  }) => {
    await gotoAndWaitReady(page, "/");
    await expect(page.getByTestId("continue-card")).toBeVisible();
    for (const id of AVAILABLE_BOOK_IDS) await expect(page.getByTestId(`book-${id}`)).toBeVisible();
    await expect(page.locator("[data-testid^='book-']")).toHaveCount(AVAILABLE_BOOK_IDS.length);
    await expect(page.locator("[data-testid^='grade-']")).toHaveCount(0);
    await expect(page.getByTestId("star-badge")).toContainText("٠");
  });

  test("every island navigates to its book", async ({ page }) => {
    for (const id of AVAILABLE_BOOK_IDS) {
      await gotoAndWaitReady(page, "/");
      await page.getByTestId(`book-${id}`).click();
      await expect(page).toHaveURL(new RegExp(`/book/${id}$`));
      await expect(page.locator("[data-testid^='unit-']").first()).toBeVisible();
    }
  });

  test("home → book → unit → lesson by taps, and back returns to the unit", async ({ page }) => {
    await gotoAndWaitReady(page, "/");
    await page.getByTestId("book-arabic-1").click();
    await expect(page).toHaveURL(/\/book\/arabic-1$/);
    const unitCard = page.getByTestId("unit-a2");
    await expect(unitCard).toHaveAttribute("aria-label", /٠ \/ ٣١/);
    await unitCard.click();
    await expect(page).toHaveURL(/\/unit\/a2$/);
    await page.getByTestId("lesson-row-u2-2").click();
    await expect(page).toHaveURL(/\/lesson\/u2-2$/);
    // The lesson is named by its picture (spoken, announced), the letter to find shows big.
    await expect(page.getByTestId("header-picture").filter({ visible: true })).toHaveAttribute(
      "aria-label",
      /أَقْرَأُ الْمَقَاطِع/,
    );
    await expect(page.getByTestId("letter-target")).toBeVisible();
    await page.getByRole("button", { name: "رجوع" }).click();
    await expect(page).toHaveURL(/\/unit\/a2$/);
  });

  test("the parents' corner opens only after holding the gate, and shows grade 1", async ({
    page,
  }) => {
    await gotoAndWaitReady(page, "/");
    await page.getByTestId("parents-button").click();
    await expect(page).toHaveURL(/\/parents$/);
    await page.getByTestId("parents-gate").click();
    await expect(page.getByTestId("parents-content")).toHaveCount(0);
    await openParents(page);
    await expect(page.getByTestId("grade-1")).toHaveAttribute("aria-label", "الصف الأول");
    for (const n of [2, 3, 4, 5, 6])
      await expect(page.getByTestId(`grade-${n}`)).toHaveAttribute("aria-label", /قريباً/);
  });

  test("the album opens the stickers the stars have earned and keeps the rest locked", async ({
    page,
  }) => {
    const at = new Date().toISOString();
    const lessons = Object.fromEntries(
      ["u1-1", "u1-2", "u1-3", "u1-4"].map((id) => [
        id,
        { completed: true, stars: 3, completedAt: at },
      ]),
    );
    await seedStorage(page, {
      [PROGRESS_KEY]: JSON.stringify({
        version: 2,
        lessons,
        items: {},
        activity: { days: [] },
        totalStars: 12,
      }),
    });
    await gotoAndWaitReady(page, "/");
    await page.getByTestId("album-button").click();
    await expect(page).toHaveURL(/\/album$/);
    await expect(page.getByTestId("sticker-qamariya")).toHaveAttribute(
      "aria-label",
      "الْقَمَرِيَّةُ",
    );
    await expect(page.getByTestId("sticker-house")).toHaveAttribute("aria-label", /النُّجُومَ/);
  });

  test("first play tells Hudhud's story; the chosen subject is where play continues, and an island switches it", async ({
    page,
  }) => {
    // Chapter 1 plays every picture through (about a minute).
    test.setTimeout(240_000);
    await seedStorage(page, { [SETTINGS_KEY]: JSON.stringify({ introSeen: false }) });
    await gotoAndWaitReady(page, "/");
    await expect(page.getByTestId("continue-card")).toHaveAttribute("aria-label", "قصة هدهد");
    await page.getByTestId("continue-card").click();
    await expect(page).toHaveURL(/\/intro$/);
    // The voice tells each scene and the story moves on by itself (speech ends at once here).
    await expect(page.getByTestId("intro-scene-choose")).toBeVisible({ timeout: 90000 });
    const told = await page.evaluate(() => window.__spoken);
    // Rasha's bowl: a message Hudhud cannot read yet.
    expect(told.some((line) => line.includes("لَا أَعْرِفُ الْقِرَاءَةَ"))).toBe(true);
    await page.getByTestId("choose-math-1").click();
    // The seed's thread begins, then its path opens.
    await expect(page).toHaveURL(/\/intro\?chapter=math$/);
    await expect(page).toHaveURL(/\/book\/math-1$/, { timeout: 30000 });

    await gotoAndWaitReady(page, "/");
    await expect(page.getByTestId("play-subject")).toHaveText("١");
    await page.getByTestId("continue-card").click();
    await expect(page).toHaveURL(/\/lesson\/math-u1-1$/);

    await gotoAndWaitReady(page, "/");
    await page.getByTestId("book-arabic-1").click();
    // The first time on Rasha's trail, Hudhud tells it; Skip opens the path at once.
    await expect(page).toHaveURL(/\/intro\?chapter=arabic$/);
    await page.getByTestId("intro-skip").click();
    await expect(page).toHaveURL(/\/book\/arabic-1$/);
    await gotoAndWaitReady(page, "/");
    await expect(page.getByTestId("play-subject")).toHaveText("أ");
    await page.getByTestId("continue-card").click();
    await expect(page).toHaveURL(/\/lesson\/u1-1$/);
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
    await expect(page.getByTestId("unit-a2")).toHaveAttribute("aria-label", /١ \/ ٣١/);
    await gotoAndWaitReady(page, "/unit/a2");
    await expect(page.getByTestId("lesson-done-u2-29")).toBeVisible();
  });

  test("4 of 6 first taps correct gives 2 stars; finding the answer after a miss does not change it", async ({
    page,
  }) => {
    await gotoAndWaitReady(page, "/lesson/u2-29");
    const rounds = QUIZ_ROUNDS["u2-29"];
    for (let i = 0; i < rounds.length; i++) {
      if (i < 2) {
        await answerRound(page, rounds[i].wrong);
        // The round stays open: the wrong option greys out, the answer is not shown yet.
        await expect(page.getByRole("button", { name: `${rounds[i].wrong}، خطأ` })).toBeDisabled();
        await expect(
          page.getByRole("button", { name: rounds[i].right, exact: true }),
        ).toBeEnabled();
        await expect(page.getByTestId("story-progress")).toHaveAttribute(
          "aria-valuenow",
          String(i + 1),
        );
        // Finding it now does not change the score.
        await answerRound(page, rounds[i].right);
      } else {
        await answerRound(page, rounds[i].right);
      }
    }
    expect(await earnedStars(page)).toBe(2);
  });

  test("replaying a lesson with a worse score keeps the best stars", async ({ page }) => {
    expect(await completeQuizLesson(page, "u2-29", 6)).toBe(3);
    await page.getByTestId("repeat-lesson").click();
    await expect(page.getByTestId("story-progress")).toHaveAttribute("aria-valuenow", "1");
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
      await expect(page.getByTestId("story-progress")).toHaveAttribute("aria-valuenow", "1");
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
    await expect(page.getByTestId("header-picture").filter({ visible: true })).toHaveAttribute(
      "aria-label",
      /أَقْرَأُ الصَّوْتَ الأَوَّلَ/,
    );
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
    expect(await completeQuizLesson(page, "math-u2-1", 6)).toBe(3);
    await expect.poll(async () => (await readProgress(page))?.lessons["math-u2-1"]?.stars).toBe(3);
  });

  // Each lesson below is the first math-u2 lesson of its type; the answers come from content/.
  const mathPaths = [
    [
      "ordered picture choice",
      () => mathLesson("picture_choice", (l) => l.rounds[0].ordered),
      pictureChoiceAnswer,
    ],
    ["compare", () => mathLesson("compare"), compareAnswerButton],
    ["number fill", () => mathLesson("number_fill"), numberFillAnswerButton],
    [
      "pattern",
      () => mathUnit1Lesson("picture_choice", (l) => l.rounds[0].pattern),
      pictureChoiceByName,
    ],
  ];
  for (const [name, find, tapFor] of mathPaths) {
    test(`math ${name} lesson completes with 3 stars`, async ({ page }) => {
      const lesson = find();
      expect(await completeMathLesson(page, lesson, tapFor(page))).toBe(3);
      await expect.poll(async () => (await readProgress(page))?.lessons[lesson.id]?.stars).toBe(3);
    });
  }

  // The first math-u5 sort lesson: tap each item, then its box (answers come from content/).
  test("math sort lesson completes with 3 stars", async ({ page }) => {
    const lesson = mathBookUnit5.lessons.find((l) => l.type === "sort");
    await gotoAndWaitReady(page, `/lesson/${lesson.id}`);
    for (const [i, item] of lesson.items.entries()) {
      await page.getByTestId(`sort-item-${i}`).click();
      await page.getByTestId(`sort-box-${item.box}`).click();
      await expect(page.getByTestId(`sort-item-${i}`)).toHaveCount(0);
    }
    expect(await earnedStars(page)).toBe(3);
    await expect.poll(async () => (await readProgress(page))?.lessons[lesson.id]?.stars).toBe(3);
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
    // Six words: six letters for the mail bag, none heard yet.
    await expect(page.getByTestId("story-progress")).toHaveAttribute("aria-valuemax", "6");
    await tapAllAndFinish(page, ["عَيْن", "أُذُن", "أَنْف", "فَم", "يَد", "قَدَم"]);
    expect(await earnedStars(page)).toBe(3);
    await expect.poll(async () => (await readProgress(page))?.totalStars).toBe(6);
  });
});

test.describe("worked example", () => {
  test("the first lesson of a type plays its example, which scores nothing; the lesson then counts", async ({
    page,
  }) => {
    await seedStorage(page, { [DEMO_SEEN_KEY]: "[]" });
    await page.goto("/lesson/u2-29");
    const demo = page.getByTestId("demo");
    await expect(demo).toBeVisible();
    await expect(demo).toContainText("مثال");
    // The hand answers the example: the voice praises it.
    await expect
      .poll(() => page.evaluate(() => window.__spoken), { timeout: 30_000 })
      .toContain("اَلْآنَ دَوْرُكَ!");
    await expect(demo).toBeHidden();
    await expect
      .poll(() => page.evaluate((k) => localStorage.getItem(k), DEMO_SEEN_KEY))
      .toBe(JSON.stringify(["letter_pick"]));
    // Nothing recorded: no stars, no review items from the example.
    const progress = await readProgress(page);
    expect(progress?.lessons ?? {}).toEqual({});
    expect(progress?.items ?? {}).toEqual({});
    // The real lesson: every round is still there and scores as usual.
    expect(await completeQuizLesson(page, "u2-29", 6, { navigate: false })).toBe(3);
    // Seen: the next letter_pick lesson starts at once.
    await page.reload();
    const firstRight = QUIZ_ROUNDS["u2-29"][0].right;
    await expect(page.getByRole("button", { name: firstRight, exact: true })).toBeVisible();
    await expect(page.getByTestId("demo")).toHaveCount(0);
  });

  test("Skip ends the example at once, and the help button plays it again", async ({ page }) => {
    await seedStorage(page, { [DEMO_SEEN_KEY]: "[]" });
    await page.goto("/lesson/u2-3");
    await page.getByTestId("demo-skip").click();
    await expect(page.getByTestId("demo")).toHaveCount(0);
    await expect(page.getByTestId("listen-button")).toBeVisible();
    await page.getByTestId("help-button").click();
    await expect(page.getByTestId("demo")).toBeVisible();
    await page.getByTestId("demo-skip").click();
    await expect(page.getByTestId("demo")).toHaveCount(0);
  });
});

test.describe("language", () => {
  test("English explains the app: Hudhud and titles in English, the reading stays Arabic with its meaning", async ({
    page,
  }) => {
    await openParents(page);
    await page.getByTestId("language-en").click();
    await expect(page.getByText("Parents' corner")).toBeVisible();
    await gotoAndWaitReady(page, "/");
    await expect(page.getByTestId("book-math-1")).toContainText("Math");
    await page.reload();
    await expect(page.getByTestId("book-math-1")).toContainText("Math");

    await gotoAndWaitReady(page, "/lesson/u2-1");
    await expect(
      page.getByRole("button", { name: "مَامَا تُوصِلُنِي إِلَى الْمَدْرَسَةِ", exact: true }),
    ).toBeVisible();
    await expect(page.getByTestId("header-picture").filter({ visible: true })).toHaveAttribute(
      "aria-label",
      /I read the story/,
    );
    await expect(page.getByText("Mama takes me to school")).toBeVisible();

    await openParents(page);
    await page.getByTestId("language-ar").click();
    await gotoAndWaitReady(page, "/");
    await expect(page.getByTestId("book-math-1")).toContainText("الرياضيات");
  });
});

test.describe("accessibility", () => {
  const require = createRequire(import.meta.url);
  let axePath = null;
  try {
    axePath = require.resolve("axe-core/axe.min.js");
  } catch {}

  test("axe: no serious or critical color contrast violations on home, book, unit, lesson, album, intro", async ({
    page,
  }) => {
    test.skip(!axePath, "axe-core not installed");
    const axeSource = fs.readFileSync(axePath, "utf8");
    const found = {};
    for (const path of ["/", "/book/arabic-1", "/unit/a2", "/lesson/u2-29", "/album", "/intro"]) {
      await gotoAndWaitReady(page, path);
      if (path.startsWith("/lesson/"))
        await expect(page.getByTestId("story-progress")).toHaveAttribute("aria-valuenow", "1");
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
