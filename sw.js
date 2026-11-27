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
const VERSION = "bf7dd200b64f";
const FILES = [
  "/",
  "/_expo/static/js/web/+not-found-e257bd696771ec6ca896b675c8fde8b6.js",
  "/_expo/static/js/web/[bookId]-8c83fa3fc85f977934d0c31798ae1db8.js",
  "/_expo/static/js/web/[lessonId]-a78d56f30a1ff006727e88e83b5f912c.js",
  "/_expo/static/js/web/[unitId]-845f25692beca832ab002e4939e4c83c.js",
  "/_expo/static/js/web/__common-3a434e54857326bb19a652b12a05a7cd.js",
  "/_expo/static/js/web/__expo-metro-runtime-8c088df87a31e4e6accd81c554ec290d.js",
  "/_expo/static/js/web/_layout-021d3c950fc27818ad44ce414fcc59d7.js",
  "/_expo/static/js/web/album-4f889c56f49cac2bef4d83b3a6ffad81.js",
  "/_expo/static/js/web/entry-9f6cb65108c9c648e7a26b18562f8ffb.js",
  "/_expo/static/js/web/index-55a805ff0998d1830eebe63080e69f50.js",
  "/_expo/static/js/web/intro-868095e1bc6a996bf3d02b989b9432c8.js",
  "/_expo/static/js/web/parents-34c42c36d454385569ed313a1d01120e.js",
  "/_expo/static/js/web/profiles-c1c431142940451b6c88bf9b42f7ef40.js",
  "/_expo/static/js/web/review-f91a3d974b431b9671adfdc94354ea38.js",
  "/assets/__node_modules/expo-router/assets/arrow_down.017bc6ba3fc25503e5eb5e53826d48a8.png",
  "/assets/__node_modules/expo-router/assets/error.d1ea1496f9057eb392d5bbf3732a61b7.png",
  "/assets/__node_modules/expo-router/assets/file.19eeb73b9593a38f8e9f418337fc7d10.png",
  "/assets/__node_modules/expo-router/assets/forward.d8b800c443b8972542883e0b9de2bdc6.png",
  "/assets/__node_modules/expo-router/assets/pkg.ab19f4cbc543357183a20571f68380a3.png",
  "/assets/__node_modules/expo-router/assets/react-navigation/elements/back-icon-mask.0a328cd9c1afd0afe8e3b1ec5165b1b4.png",
  "/assets/__node_modules/expo-router/assets/react-navigation/elements/back-icon.35ba0eaec5a4f5ed12ca16fabeae451d.png",
  "/assets/__node_modules/expo-router/assets/react-navigation/elements/clear-icon.c94f6478e7ae0cdd9f15de1fcb9e5e55.png",
  "/assets/__node_modules/expo-router/assets/react-navigation/elements/clear-icon.c94f6478e7ae0cdd9f15de1fcb9e5e55@2x.png",
  "/assets/__node_modules/expo-router/assets/react-navigation/elements/clear-icon.c94f6478e7ae0cdd9f15de1fcb9e5e55@3x.png",
  "/assets/__node_modules/expo-router/assets/react-navigation/elements/clear-icon.c94f6478e7ae0cdd9f15de1fcb9e5e55@4x.png",
  "/assets/__node_modules/expo-router/assets/react-navigation/elements/close-icon.808e1b1b9b53114ec2838071a7e6daa7.png",
  "/assets/__node_modules/expo-router/assets/react-navigation/elements/close-icon.808e1b1b9b53114ec2838071a7e6daa7@2x.png",
  "/assets/__node_modules/expo-router/assets/react-navigation/elements/close-icon.808e1b1b9b53114ec2838071a7e6daa7@3x.png",
  "/assets/__node_modules/expo-router/assets/react-navigation/elements/close-icon.808e1b1b9b53114ec2838071a7e6daa7@4x.png",
  "/assets/__node_modules/expo-router/assets/react-navigation/elements/search-icon.286d67d3f74808a60a78d3ebf1a5fb57.png",
  "/assets/__node_modules/expo-router/assets/sitemap.412dd9275b6b48ad28f5e3d81bb1f626.png",
  "/assets/__node_modules/expo-router/assets/unmatched.20e71bdf79e3a97bf55fd9e164041578.png",
  "/favicon.ico",
  "/icons/icon-192.png",
  "/icons/icon-512.png",
  "/manifest.json"
];
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
