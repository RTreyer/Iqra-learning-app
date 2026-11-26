import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { test } from "node:test";
import { buildServiceWorker } from "./build-sw.mjs";

function fakeBuild(files) {
  const dist = fs.mkdtempSync(path.join(os.tmpdir(), "iqra-sw-"));
  for (const [file, body] of Object.entries(files)) {
    fs.mkdirSync(path.dirname(path.join(dist, file)), { recursive: true });
    fs.writeFileSync(path.join(dist, file), body);
  }
  return dist;
}

const BUILD = {
  "index.html": "<div id=root></div>",
  "metadata.json": "{}",
  "favicon.ico": "ico",
  "_expo/static/js/web/entry-abc.js": "entry",
  "_expo/static/js/web/[lessonId]-def.js": "lesson",
};

test("the worker lists the app shell and every file of the build, as the page asks for them", () => {
  const { urls, source } = buildServiceWorker(fakeBuild(BUILD));
  assert.deepEqual(urls, [
    "/",
    "/_expo/static/js/web/[lessonId]-def.js",
    "/_expo/static/js/web/entry-abc.js",
    "/favicon.ico",
  ]);
  assert.ok(!source.includes("__FILES__") && !source.includes("__VERSION__"));
  assert.ok(source.includes('"/_expo/static/js/web/entry-abc.js"'));
  new Function(source); // the filled-in worker is valid JavaScript
});

test("the version changes with any file, and only then", () => {
  const a = buildServiceWorker(fakeBuild(BUILD)).version;
  assert.equal(buildServiceWorker(fakeBuild(BUILD)).version, a);
  assert.notEqual(buildServiceWorker(fakeBuild({ ...BUILD, "index.html": "<p>" })).version, a);
  assert.notEqual(buildServiceWorker(fakeBuild({ ...BUILD, "favicon.ico": "new" })).version, a);
  assert.match(a, /^[0-9a-f]{12}$/);
});

test("an old sw.js in the build is not listed", () => {
  const { urls } = buildServiceWorker(fakeBuild({ ...BUILD, "sw.js": "old" }));
  assert.ok(!urls.includes("/sw.js"));
});
