import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { test } from "node:test";
import { books } from "../content/index.ts";
import { traceGuides } from "../content/generated/traceGuides.ts";

test("every Arabic trace guide has a generated outline and mask", () => {
  for (const book of books)
    for (const unit of book.units)
      for (const lesson of unit.lessons)
        if (lesson.type === "trace")
          for (const { guide } of lesson.targets)
            if (/[\u0600-\u06FF]/.test(guide))
              assert.ok(traceGuides[guide], `${lesson.id}: ${guide}`);
});

test("content/generated/traceGuides.ts matches the generator (npm run guides)", () => {
  const run = spawnSync(process.execPath, ["scripts/build-trace-guides.mjs", "--check"], {
    encoding: "utf8",
  });
  assert.equal(run.status, 0, run.stderr);
});
