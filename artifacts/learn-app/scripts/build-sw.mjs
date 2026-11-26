// Writes dist/sw.js (the service worker, scripts/sw.template.js) for the web build in dist/:
// the list of files to keep on the phone and a version that changes with any of them.
// Runs after `expo export --platform web` (see package.json "build").
import { createHash } from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));

/** Files the app never asks for itself. index.html is kept as "/", the app shell. */
const SKIP = new Set(["sw.js", "index.html", "metadata.json"]);

function walk(dir, base = dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) return walk(full, base);
    return [path.relative(base, full).split(path.sep).join("/")];
  });
}

/** Builds the worker's source for the build in `dist`; returns it with its version and files. */
export function buildServiceWorker(dist) {
  const files = walk(dist)
    .filter((file) => !SKIP.has(file))
    .sort();
  if (!fs.existsSync(path.join(dist, "index.html"))) throw new Error(`no index.html in ${dist}`);
  const hash = createHash("sha256");
  for (const file of ["index.html", ...files]) {
    hash.update(file);
    hash.update(fs.readFileSync(path.join(dist, file)));
  }
  const version = hash.digest("hex").slice(0, 12);
  // Listed as the page asks for them: the URL parser keeps the brackets of [lessonId]-….js.
  const urls = ["/", ...files.map((file) => "/" + file)];
  const template = fs.readFileSync(path.join(here, "sw.template.js"), "utf8");
  const source = template
    .replace('"__VERSION__"', JSON.stringify(version))
    .replace("__FILES__", JSON.stringify(urls, null, 2));
  return { source, version, urls };
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const dist = path.resolve(process.argv[2] || path.join(here, "..", "dist"));
  const { source, version, urls } = buildServiceWorker(dist);
  fs.writeFileSync(path.join(dist, "sw.js"), source);
  console.log(`sw.js ${version}: ${urls.length} files`);
}
