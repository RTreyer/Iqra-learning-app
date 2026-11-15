// Several children on one phone (docs/KINDERPROFILE.md): who learns today, separate progress,
// and the parents adding a child behind their PIN.
import { DEMO_IDS } from "../content/demos.ts";
import {
  DEMO_SEEN_KEY,
  PROFILES_KEY,
  PROGRESS_KEY,
  SETTINGS_KEY,
  completeQuizLesson,
  expect,
  openParents,
  seedStorage,
  test,
} from "./helpers.mjs";

const STORY_TOLD = JSON.stringify({ introSeen: true, chaptersSeen: ["arabic", "math", "a2"] });

/** Two children, both past Hudhud's story and the worked examples. */
async function seedTwoChildren(page) {
  await seedStorage(page, {
    [PROFILES_KEY]: JSON.stringify({
      version: 1,
      profiles: [
        { id: "main", name: "أمل", avatar: "camel", createdAt: "2026-11-15T00:00:00.000Z" },
        { id: "c2", name: "سالم", avatar: "ibex", createdAt: "2026-11-15T00:00:00.000Z" },
      ],
      activeId: "main",
      pin: null,
    }),
    [`${SETTINGS_KEY}:c2`]: STORY_TOLD,
    [`${DEMO_SEEN_KEY}:c2`]: JSON.stringify(DEMO_IDS),
  });
}

const stored = (page, key) =>
  page.evaluate((k) => JSON.parse(localStorage.getItem(k) ?? "null"), key);

test("with two children the app asks who learns, and each child keeps its own stars", async ({
  page,
}) => {
  await seedTwoChildren(page);
  await page.goto("/");
  await expect(page).toHaveURL(/\/profiles$/);
  await expect(page.getByTestId("profile-main")).toHaveAttribute("aria-label", "أمل");
  await page.getByTestId("profile-c2").click();
  await expect(page).toHaveURL(/\/$/);
  await expect(page.getByTestId("profile-button")).toHaveAttribute("aria-label", /سالم/);

  expect(await completeQuizLesson(page, "u2-29", 6)).toBe(3);
  expect((await stored(page, `${PROGRESS_KEY}:c2`)).lessons["u2-29"].stars).toBe(3);
  // The first child's progress stays empty.
  expect((await stored(page, PROGRESS_KEY))?.lessons ?? {}).toEqual({});

  // After a reload the app asks again who learns; the first child has no stars yet.
  await page.goto("/");
  await expect(page).toHaveURL(/\/profiles$/);
  await page.getByTestId("profile-main").click();
  await expect(page.getByTestId("profile-button")).toHaveAttribute("aria-label", /أمل/);
  await expect(page.getByTestId("star-badge")).toContainText("٠");
  // Switching back from home: the second child's stars are still there.
  await page.getByTestId("profile-button").click();
  await page.getByTestId("profile-c2").click();
  await expect(page.getByTestId("star-badge")).toContainText("٣");
});

test("parents add a child behind their PIN; the new child starts with Hudhud's story", async ({
  page,
}) => {
  await openParents(page);
  await page.getByTestId("child-add").click();
  await page.getByTestId("child-name").fill("نور");
  await page.getByTestId("choose-avatar-dhow").click();
  await page.getByTestId("child-add-save").click();
  await expect(page.getByTestId("children-card")).toContainText("نور");

  const profiles = await stored(page, PROFILES_KEY);
  expect(profiles.profiles.map((p) => p.avatar)).toEqual(["camel", "dhow"]);
  expect(JSON.stringify(profiles)).not.toContain("2580");

  await page.goto("/");
  await expect(page).toHaveURL(/\/profiles$/);
  await page.getByRole("button", { name: "نور" }).click();
  await expect(page).toHaveURL(/\/$/);
  // A child who has not heard the story is invited to it first.
  await expect(page.getByTestId("intro-button")).toHaveCount(0);
});
