// Learning loop: continue card, Leitner review and streak across days, driven by page.clock.
import {
  completeQuizLesson,
  earnedStars,
  expect,
  gotoAndWaitReady,
  readProgress,
  tapAllAndFinish,
  test,
} from "./helpers.mjs";

// Local times (Node and the browser share the machine time zone), one calendar day apart.
const DAY_1 = new Date(2026, 2, 10, 10, 0, 0);
const DAY_2 = new Date(2026, 2, 11, 10, 0, 0);
const LETTERS = ["letter:ب", "letter:ت", "letter:ث"];

/** Target letter shown in the current review round. */
async function reviewTarget(page) {
  const round = page.getByTestId("review-round");
  return (
    await round.getByText("ابحث عن الحرف").locator("xpath=following-sibling::*[1]").innerText()
  ).trim();
}

test("fresh start: Continue points at Unit 1 lesson 1 and there is no Review card", async ({
  page,
}) => {
  await gotoAndWaitReady(page, "/");
  const card = page.getByTestId("continue-card");
  await expect(card).toContainText("تَابِعْ:");
  await expect(card).toContainText("أُسَمِّي الصُّوَر");
  await expect(page.getByTestId("review-card")).toHaveCount(0);
  await card.click();
  await expect(page).toHaveURL(/\/lesson\/u1-1$/);
});

test("missed letters come back tomorrow in today's review, and leave once answered", async ({
  page,
}) => {
  await page.clock.setFixedTime(DAY_1);
  // Rounds 4 and 5 (ب and ت seen a second time) are missed: 3 of 5 gives 2 stars.
  expect(await completeQuizLesson(page, "u2-3", 3)).toBe(2);
  await expect
    .poll(async () => Object.keys((await readProgress(page))?.items ?? {}).sort())
    .toEqual([...LETTERS].sort());
  const { items } = await readProgress(page);
  for (const id of LETTERS) expect(items[id].box, id).toBe(1);
  expect(items["letter:ب"].lapses).toBe(1);
  expect(items["letter:ت"].lapses).toBe(1);
  expect(items["letter:ث"].lapses).toBe(0);

  await gotoAndWaitReady(page, "/");
  await expect(page.getByTestId("review-card")).toHaveCount(0);

  await page.clock.setFixedTime(DAY_2);
  await page.reload();
  const reviewCard = page.getByTestId("review-card");
  await expect(reviewCard).toContainText("مُرَاجَعَة الْيَوْم");
  // lib/labels.ts itemsLabel(3, "ar")
  await expect(reviewCard).toContainText("3 عَنَاصِر");

  await reviewCard.click();
  await expect(page).toHaveURL(/\/review$/);
  for (let i = 0; i < LETTERS.length; i++) {
    // Wait for the next round: the previous one stays on screen, locked, during the advance delay.
    await expect(page.getByTestId("review-round")).toBeVisible();
    await expect(page.getByTestId("review-round").locator("[aria-disabled='true']")).toHaveCount(0);
    const target = await reviewTarget(page);
    const choice = page.getByRole("button", { name: target, exact: true, disabled: false });
    await choice.click();
  }
  const complete = page.getByTestId("review-complete");
  await expect(complete).toContainText("أَحْسَنْت! مُرَاجَعَة الْيَوْم مُكْتَمِلَة");
  await expect(complete).toContainText("3/3");
  await expect
    .poll(async () => {
      const p = await readProgress(page);
      return LETTERS.map((id) => p.items[id].box);
    })
    .toEqual([2, 2, 2]);

  await gotoAndWaitReady(page, "/");
  await page.reload();
  await expect(page.getByTestId("book-arabic-1")).toBeVisible();
  await expect(page.getByTestId("review-card")).toHaveCount(0);
});

test("streak badge shows 🔥 2 after lessons on two consecutive days", async ({ page }) => {
  await page.clock.setFixedTime(DAY_1);
  await gotoAndWaitReady(page, "/lesson/u2-1");
  await tapAllAndFinish(page, [
    "هَذَا بَيْتُنَا الْجَمِيل",
    "بَابُنَا أَبْيَض وَنَظِيف",
    "عِنْدَنَا تُفَّاح وَتِين لَذِيذ",
    "أَمَامَ الْبَيْتِ ثَعْلَبٌ صَغِير",
  ]);
  expect(await earnedStars(page)).toBe(3);
  await gotoAndWaitReady(page, "/");
  await expect(page.getByTestId("streak-badge")).toHaveCount(0);

  await page.clock.setFixedTime(DAY_2);
  await gotoAndWaitReady(page, "/lesson/u2-2");
  await tapAllAndFinish(page, ["بَيْت", "بَاب", "تُفَّاحَة", "تِين", "ثَعْلَب", "ثَوْر"]);
  expect(await earnedStars(page)).toBe(3);

  await page.reload();
  await gotoAndWaitReady(page, "/");
  const badge = page.getByTestId("streak-badge");
  await expect(badge).toHaveText("🔥 2");
  await expect(badge).toHaveAttribute("aria-label", "يَوْمَانِ مُتَتَالِيَانِ");
  expect((await readProgress(page)).activity.days).toEqual(["2026-03-10", "2026-03-11"]);
});
