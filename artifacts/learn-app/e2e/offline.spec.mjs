// The web app on a weak line (agents' report TECH-01, TECH-03): a loading screen arrives with
// the page, and after the first visit every screen opens and reloads without a connection.
import { expect, gotoAndWaitReady, test, waitForOfflineCopy } from "./helpers.mjs";

test("the page itself shows a loading screen until the app has started", async ({ page, request }) => {
  const html = await (await request.get("/")).text();
  expect(html).toContain('<html lang="ar">');
  expect(html).toContain('id="boot"');
  expect(html).toContain("جَارٍ التَّحْمِيلُ");
  expect(html).toContain('rel="manifest"');
  await gotoAndWaitReady(page, "/");
  await expect(page.locator("#boot")).toHaveCount(0);
});

test("the service worker lists the build's files, and the headers allow it", async ({ request }) => {
  const sw = await request.get("/sw.js");
  expect(sw.ok()).toBe(true);
  expect(sw.headers()["content-security-policy"]).toContain("worker-src 'self'");
  const source = await sw.text();
  expect(source).toMatch(/const VERSION = "[0-9a-f]{12}"/);
  expect(source).toContain('"/_expo/static/js/web/entry-');
  const manifest = await (await request.get("/manifest.json")).json();
  expect(manifest.start_url).toBe("/");
  expect((await request.get(manifest.icons[0].src)).ok()).toBe(true);
});

test("after the first visit, screens not opened yet and reloads work offline", async ({
  page,
  context,
}) => {
  await gotoAndWaitReady(page, "/");
  await waitForOfflineCopy(page);
  await context.setOffline(true);

  // In the app: the book's screen was never downloaded before going offline.
  await page.getByTestId("book-arabic-1").click();
  await expect(page).toHaveURL(/\/book\/arabic-1$/);
  await expect(page.getByTestId("unit-a2")).toBeVisible();
  await page.getByTestId("unit-a2").click();
  await expect(page.locator("[data-testid^='lesson-row-']").first()).toBeVisible();

  // A reload, and opening a lesson from its address, both offline.
  await page.reload();
  await expect(page.locator("[data-testid^='lesson-row-']").first()).toBeVisible();
  await gotoAndWaitReady(page, "/lesson/u2-2");
  await expect(page.getByText("حدث خطأ")).toHaveCount(0);
  await expect(page.getByTestId("letter-target")).toBeVisible();
  await context.setOffline(false);
});
