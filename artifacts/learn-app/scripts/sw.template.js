/*
 * Iqra's service worker: keeps the whole app on the phone, so it opens and changes screens
 * without a connection. scripts/build-sw.mjs writes it to dist/sw.js after `expo export`,
 * filling in the version and the list of files of that build.
 *
 * - Install: store every file of the build in a cache named after the version. A file an
 *   older version already stored, or the browser already has (hashed files are immutable), is
 *   not downloaded again; the rest one or two at a time, so the child's first lesson keeps
 *   most of a slow line. Only the app shell must succeed; a file that fails is stored the
 *   first time the app asks for it.
 * - Activate: keep this version and the one before it (a tab still running the old build may
 *   ask for one of its screens later), delete older ones.
 * - Pages: always the stored app shell, so a reload works offline. A new build arrives in the
 *   background and is used from the next start.
 * - Files: from the cache, else from the network (and stored for next time).
 */
const VERSION = "__VERSION__";
const FILES = __FILES__;
const PREFIX = "iqra-";
const CACHE = PREFIX + VERSION;
const META = PREFIX + "meta";
const VERSIONS = "/__versions";
const SHELL = "/";

/** Hashed build files never change (netlify.toml: immutable), the rest must be checked. */
const hashed = (url) => url.startsWith("/_expo/") || url.startsWith("/assets/");

async function store(cache, url) {
  if (await cache.match(url)) return;
  const older = await caches.match(url);
  if (older && hashed(url)) return cache.put(url, older);
  const response = await fetch(new Request(url, { cache: hashed(url) ? "default" : "no-cache" }));
  if (!response.ok) throw new Error(`${url}: ${response.status}`);
  await cache.put(url, response);
}

async function install() {
  const cache = await caches.open(CACHE);
  await store(cache, SHELL);
  const queue = FILES.filter((url) => url !== SHELL);
  const worker = async () => {
    for (let url = queue.shift(); url; url = queue.shift()) await store(cache, url).catch(() => {});
  };
  await Promise.all([worker(), worker()]);
}

self.addEventListener("install", (event) => {
  event.waitUntil(install().then(() => self.skipWaiting()));
});

async function keepRecentVersions() {
  const meta = await caches.open(META);
  const stored = await meta.match(VERSIONS);
  const before = stored ? await stored.json() : [];
  const keep = [...before.filter((v) => v !== VERSION), VERSION].slice(-2);
  await meta.put(VERSIONS, new Response(JSON.stringify(keep)));
  for (const name of await caches.keys()) {
    if (name === META || !name.startsWith(PREFIX)) continue;
    if (!keep.includes(name.slice(PREFIX.length))) await caches.delete(name);
  }
}

self.addEventListener("activate", (event) => {
  event.waitUntil(keepRecentVersions().then(() => self.clients.claim()));
});

/** A page request cannot be answered with a redirected response; copy it into a plain one. */
function plain(response) {
  if (!response.redirected) return response;
  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers: response.headers,
  });
}

/** Hashed scripts and images are worth keeping; the app shell's fallback (HTML) is not. */
function storable(url, response) {
  if (!response.ok || response.type !== "basic") return false;
  if (!/\.[a-z0-9]+$/i.test(url.pathname)) return false;
  return !(response.headers.get("content-type") || "").includes("text/html");
}

self.addEventListener("fetch", (event) => {
  const request = event.request;
  if (request.method !== "GET") return;
  const url = new URL(request.url);
  if (url.origin !== self.location.origin || url.pathname === "/sw.js") return;

  if (request.mode === "navigate") {
    event.respondWith(
      (async () => {
        const shell = (await caches.match(SHELL, { cacheName: CACHE })) || (await caches.match(SHELL));
        if (shell) return plain(shell);
        // The browser dropped the caches (short of storage): store the shell again, so the
        // next start works offline (TECH-R2-05).
        const response = await fetch(request);
        if (response.ok && (response.headers.get("content-type") || "").includes("text/html")) {
          const copy = response.clone();
          event.waitUntil(caches.open(CACHE).then((cache) => cache.put(SHELL, copy)));
        }
        return response;
      })(),
    );
    return;
  }

  event.respondWith(
    (async () => {
      const hit = await caches.match(request);
      if (hit) return hit;
      const response = await fetch(request);
      if (storable(url, response)) {
        const copy = response.clone();
        event.waitUntil(caches.open(CACHE).then((cache) => cache.put(request, copy)));
      }
      return response;
    })(),
  );
});
