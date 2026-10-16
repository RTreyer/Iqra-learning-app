// Baseline end-to-end suite captured before the rebuild. Runs with: node --test e2e/app.spec.mjs (needs playwright + a static server from e2e/serve.mjs on port 8787 serving dist/). Rewritten for the new routes in Task 6.3.
import { test, before, after } from "node:test";
import assert from "node:assert/strict";
import { chromium } from "playwright";
import fs from "node:fs";

const base = "http://localhost:8787";
let browser, ctx, page; const errors = [];

before(async () => {
  browser = await chromium.launch();
  ctx = await browser.newContext({ viewport: { width: 420, height: 860 } });
  page = await ctx.newPage();
  page.on("console", m => { if (m.type()==="error") errors.push(m.text().slice(0,160)); });
  page.on("pageerror", e => errors.push("PAGEERROR " + e.message.slice(0,160)));
});
after(async () => { console.log("CONSOLE ERRORS:", errors.length, errors.slice(0,5)); await browser.close(); });

const body = async () => (await page.innerText("body"));
const txt = (t) => page.getByText(t, { exact: false });
const go = async (p) => { await page.goto(base + p); await page.waitForTimeout(700); };
const shot = (n) => page.screenshot({ path: `shots/${n}.png` });

test("T01 home renders 6 grades and 0 stars", async () => {
  await go("/"); await page.waitForTimeout(1500);
  const b = await body();
  for (const g of ["الصف الأول","الصف الثاني","الصف الثالث","الصف الرابع","الصف الخامس","الصف السادس"]) assert.match(b, new RegExp(g));
  assert.match(b, /⭐\n0\n/);
});

test("T02 click-through navigation Home → Grade 1 → Book → Unit 2 → Lesson, back works", async () => {
  await txt("الصف الأول").first().click(); await page.waitForTimeout(600);
  assert.match(page.url(), /\/grade\/1$/);
  await txt("اللغة العربية — الجزء الأول").first().click(); await page.waitForTimeout(600);
  assert.match(page.url(), /\/book\/1\/arabic-1-part1$/);
  await txt("الوحدة الثانية").first().click(); await page.waitForTimeout(600);
  assert.match(page.url(), /\/unit\/2$/);
  await txt("أَعْرِفُ الْحُرُوف").first().click(); await page.waitForTimeout(800);
  assert.match(page.url(), /\/unit\/2\/u2-3$/);
  assert.match(await body(), /ابحث عن الحرف/);
  await page.goBack(); await page.waitForTimeout(500);
  assert.match(page.url(), /\/unit\/2$/);
});

async function playLetterPick(correct) {
  // rounds from data: correctIndex 0,1,0,2,0
  const idx = [0,1,0,2,0];
  for (let r = 0; r < 5; r++) {
    await page.waitForTimeout(300);
    // fallback: pick by visible letters under the choices row
    const row = page.locator("div").filter({ hasText: /^سؤال \d من 5$/ }).first().locator("xpath=following-sibling::div[1]");
    const btns = row.locator("[role=button], [tabindex='0']");
    const n = await btns.count(); assert.ok(n >= 3, "choice buttons visible: " + n);
    const want = correct ? idx[r] : (idx[r] + 1) % 3;
    await btns.nth(want).click();
    await page.waitForTimeout(1100);
  }
}

test("T03 letter_pick lesson: all correct → completion screen, 3 stars persisted", async () => {
  await go("/unit/2/u2-3"); await page.waitForTimeout(500);
  await playLetterPick(true);
  const b = await body();
  assert.match(b, /لقد أتممت هذا النشاط بنجاح/);
  await shot("T03-complete");
  await go("/"); assert.match(await body(), /⭐\n3\n/);
  await go("/book/1/arabic-1-part1"); assert.match(await body(), /الوحدة الثانية\n1 \/ 5/);
});

test("T04 wrong answers still award full 3 stars (score ignored)", async () => {
  await page.evaluate(() => localStorage.clear()); await go("/"); await page.waitForTimeout(500);
  assert.match(await body(), /⭐\n0\n/);
  await go("/unit/2/u2-3"); await playLetterPick(false);
  assert.match(await body(), /لقد أتممت هذا النشاط بنجاح/);
  await go("/"); const b = await body();
  const stars = b.match(/⭐\n(\d+)\n/)?.[1];
  console.log("   stars after 0/5 correct:", stars);
  assert.equal(stars, "3", "DESIGN FLAW: 0 correct answers still gives 3 stars");
});

test("T05 repeat completed lesson shows content again, stars do not double", async () => {
  await go("/unit/2/u2-3"); await page.waitForTimeout(500);
  assert.match(await body(), /ابحث عن الحرف/, "content shown, not completion screen");
  await playLetterPick(true);
  await txt("إعادة الدرس").first().click(); await page.waitForTimeout(500);
  assert.match(await body(), /سؤال 1 من 5/);
  await go("/"); assert.match(await body(), /⭐\n3\n/);
});

test("T06 story + naming lessons complete after tapping all items", async () => {
  await go("/unit/2/u2-1"); await page.waitForTimeout(500);
  assert.match(await body(), /4 جملة متبقية/);
  for (const line of ["هَذَا بَيْتُنَا الْجَمِيل","بَابُنَا أَبْيَض","عِنْدَنَا تُفَّاح","أَمَامَ الْبَيْتِ"]) await txt(line).first().click();
  await page.waitForTimeout(300);
  await txt("أَحْسَنْت! 🌟 تابع").first().click(); await page.waitForTimeout(500);
  assert.match(await body(), /لقد أتممت هذا النشاط بنجاح/);
  await go("/unit/2/u2-2"); await page.waitForTimeout(500);
  assert.match(await body(), /6 كلمة متبقية/);
  for (const w of ["بَيْت","بَاب","تُفَّاحَة","تِين","ثَعْلَب","ثَوْر"]) await txt(w).first().click();
  await page.waitForTimeout(300);
  await txt("أَحْسَنْت! 🌟 تابع").first().click(); await page.waitForTimeout(500);
  assert.match(await body(), /لقد أتممت هذا النشاط بنجاح/);
  await go("/"); assert.match(await body(), /⭐\n9\n/);
});

test("T07 word_read lesson shows score and 'next' flow", async () => {
  await go("/unit/2/u2-4"); await page.waitForTimeout(500);
  const answers = ["بَيْت","تِين","ثَعْلَب","بَاب","تُفَّاحَة"];
  for (let i = 0; i < 5; i++) {
    const col = page.locator("div").filter({ hasText: /^سؤال \d من 5 — اضغط للاستماع ثم اختر$/ }).first().locator("xpath=following-sibling::div[2]");
    await col.getByText(answers[i], { exact: true }).first().click(); await page.waitForTimeout(300);
    const b = await body();
    if (i < 4) { assert.match(b, /التالي ←/); await txt("التالي ←").first().click(); }
    else { assert.match(b, /أَحْسَنْت! 5\/5 🌟 تابع/); await txt("5/5").first().click(); }
    await page.waitForTimeout(400);
  }
  assert.match(await body(), /لقد أتممت هذا النشاط بنجاح/);
});

test("T08 unit 1 naming lesson (separate implementation) completes", async () => {
  await go("/unit1/u1-1"); await page.waitForTimeout(600);
  const b = await body(); const m = b.match(/(\d+) صورة متبقية/); assert.ok(m, "remaining counter shown");
  const n = Number(m[1]);
  const cards = page.locator("div").filter({ hasText: /صورة متبقية/ }).first().locator("[role=button], [tabindex='0']");
  const cnt = await cards.count(); console.log("   unit1 naming items:", n, "buttons found:", cnt);
  for (let i = 0; i < cnt; i++) { await cards.nth(i).click({ force: true }); await page.waitForTimeout(80); }
  await page.waitForTimeout(300);
  await txt("أَحْسَنْت! 🌟 تابع").first().click(); await page.waitForTimeout(500);
  assert.match(await body(), /النشاط التالي:/);
  await shot("T08-unit1-done");
});

test("T09 language switch: menus English, lesson content Arabic, persists reload", async () => {
  await go("/"); await page.getByRole("button", { name: "English" }).click(); await page.waitForTimeout(400);
  let b = await body(); assert.match(b, /Grade 1/); assert.match(b, /Choose your grade|Pick your grade|grade/i);
  await page.reload(); await page.waitForTimeout(1200); b = await body(); assert.match(b, /Grade 1/, "persisted");
  await go("/unit/2/u2-1"); b = await body();
  assert.match(b, /هَذَا بَيْتُنَا الْجَمِيل/, "story stays Arabic");
  const untranslated = ["جملة متبقية","اضغط على كل جملة لتسمعها","ابحث عن الحرف","سؤال 1 من"].filter(x => b.includes(x));
  console.log("   Arabic UI strings still shown in English mode (lesson u2-1):", JSON.stringify(untranslated));
  await shot("T09-english-lesson");
  await go("/"); await page.getByRole("button", { name: "العربية" }).click(); await page.waitForTimeout(300);
  assert.match(await body(), /الصف الأول/, "switched back to Arabic");
});

test("T10 empty modules: Part 2 reading and Math are 'available' but have 0 lessons", async () => {
  await go("/book/1/arabic-1-part2"); assert.match(await body(), /قِرَاءَة\n0 \/ 0/);
  await txt("قِرَاءَة").first().click(); await page.waitForTimeout(600);
  const b1 = await body(); assert.doesNotMatch(b1, /\d+\n[^\n]+\n[^\n]+\n‹/, "no lesson rows");
  await shot("T10-reading-empty");
  await go("/book/1/math-1-part1"); assert.match(await body(), /حِسَاب\n0 \/ 0/);
  await go("/math"); const b2 = await body(); assert.ok(b2.trim().split("\n").length <= 8, "math screen essentially empty");
});

test("T11 grades 2–6 show coming soon; unknown route shows 404 with home link", async () => {
  for (const g of [2,3,4,5,6]) { await go(`/grade/${g}`); assert.match(await body(), /قريباً!/, `grade ${g}`); }
  await go("/unit/9"); assert.match(await body(), /غير موجود|قريباً|الوحدة/);
  await go("/unit/2/nope"); assert.match(await body(), /الدرس غير موجود/);
  await go("/xyz"); assert.match(await body(), /الصفحة غير موجودة/);
  await txt("العودة إلى الرئيسية").click(); await page.waitForTimeout(500); assert.equal(new URL(page.url()).pathname, "/");
});

test("T12 orphan legacy /unit2 route is reachable and has different content than /unit/2", async () => {
  await go("/unit2"); const a = await body(); assert.match(a, /حَرْف ب/);
  await go("/unit/2"); const b = await body(); assert.match(b, /ب ت ث/);
  assert.notEqual(a, b);
});

test("T13 desktop viewport: app constrained to phone width, no horizontal scroll", async () => {
  const p2 = await (await browser.newContext({ viewport: { width: 1440, height: 900 } })).newPage();
  await p2.goto(base); await p2.waitForTimeout(1500);
  const w = await p2.evaluate(() => { const el = [...document.querySelectorAll("div")].find(d => getComputedStyle(d).maxWidth === "480px"); return { max: el ? el.getBoundingClientRect().width : null, scrollW: document.documentElement.scrollWidth, innerW: innerWidth }; });
  console.log("   desktop frame:", JSON.stringify(w));
  assert.equal(w.max, 480); assert.ok(w.scrollW <= w.innerW);
  await p2.screenshot({ path: "shots/T13-desktop.png" });
  const p3 = await (await browser.newContext({ viewport: { width: 320, height: 568 } })).newPage();
  await p3.goto(base); await p3.waitForTimeout(1500);
  const sw = await p3.evaluate(() => document.documentElement.scrollWidth); assert.ok(sw <= 320, "no horizontal overflow at 320px: " + sw);
  await p3.screenshot({ path: "shots/T13-small.png" });
});

test("T14 accessibility (axe-core) on home, book and lesson", async (t) => {
  const axePath = new URL("../node_modules/axe-core/axe.min.js", import.meta.url);
  if (!fs.existsSync(axePath)) { t.skip("axe-core not installed; run npm/pnpm install axe-core to enable this test"); return; }
  const axeSrc = fs.readFileSync(axePath, "utf8");
  const results = {};
  for (const [name, path] of [["home","/"],["book","/book/1/arabic-1-part1"],["lesson","/unit/2/u2-3"]]) {
    await go(path); await page.addScriptTag({ content: axeSrc });
    const r = await page.evaluate(async () => { const res = await window.axe.run(document, { runOnly: ["wcag2a","wcag2aa"] }); return res.violations.map(v => ({ id: v.id, impact: v.impact, nodes: v.nodes.length })); });
    results[name] = r;
  }
  console.log("   axe violations:", JSON.stringify(results, null, 1));
  fs.writeFileSync("axe.json", JSON.stringify(results, null, 2));
});

test("T15 performance: bundle size and load timing", async () => {
  const p = await (await browser.newContext({ viewport: { width: 420, height: 860 } })).newPage();
  const t0 = Date.now(); await p.goto(base, { waitUntil: "networkidle" }); await p.getByText("الصف الأول").waitFor();
  const timing = await p.evaluate(() => { const n = performance.getEntriesByType("navigation")[0]; const res = performance.getEntriesByType("resource"); return { domContentLoaded: Math.round(n.domContentLoadedEventEnd), loadEvent: Math.round(n.loadEventEnd), transferKB: Math.round(res.reduce((s,r)=>s+(r.transferSize||0),0)/1024), requests: res.length, externalHosts: [...new Set(res.map(r => new URL(r.name).host).filter(h => !h.startsWith("localhost")))] }; });
  console.log("   load:", JSON.stringify({ wallMs: Date.now()-t0, ...timing }));
});
