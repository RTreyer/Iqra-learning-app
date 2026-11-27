import { Platform } from "react-native";

/**
 * On the web, keeps the app on the phone: dist/sw.js (scripts/build-sw.mjs) stores every
 * screen, so the app opens and changes screens without a connection. Registered after the
 * page has loaded, so storing the rest never slows down the first start.
 */
export function registerServiceWorker() {
  if (Platform.OS !== "web" || __DEV__) return;
  if (typeof navigator === "undefined" || !("serviceWorker" in navigator)) return;
  // A few seconds after the page has loaded, so storing the rest does not compete with the
  // child's first taps on a slow line (TECH-R2-03).
  const register = () =>
    setTimeout(() => {
      navigator.serviceWorker.register("/sw.js").catch(() => {});
    }, REGISTER_DELAY_MS);
  if (document.readyState === "complete") register();
  else window.addEventListener("load", register, { once: true });
}

const REGISTER_DELAY_MS = 5000;

/**
 * Whether the server answers now. A phone with one bar says it is online while no data comes
 * through; reloading then lands on the browser's own error page (TECH-R2-01).
 */
export async function serverReachable(timeoutMs = 5000): Promise<boolean> {
  if (typeof fetch === "undefined") return false;
  const controller = typeof AbortController === "undefined" ? null : new AbortController();
  const timer = setTimeout(() => controller?.abort(), timeoutMs);
  try {
    const response = await fetch(`/manifest.json?probe=${Date.now()}`, {
      cache: "no-store",
      signal: controller?.signal,
    });
    return response.ok;
  } catch {
    return false;
  } finally {
    clearTimeout(timer);
  }
}

/** A screen's code could not be downloaded: no connection, or a file of an older build. */
export function isLoadError(error: Error): boolean {
  return (
    error.name === "AsyncRequireError" ||
    error.name === "ChunkLoadError" ||
    /Loading module .* failed|Failed to fetch dynamically imported module/i.test(error.message)
  );
}

const RELOADED_KEY = "@iqra_load_error_reload";
/** One automatic reload per minute at most, so a file that is really gone cannot loop. */
const RELOAD_GAP_MS = 60_000;

/**
 * Whether the app may reload by itself after a load error, and if so notes that it did.
 * `store` is sessionStorage on the web; without it the app never reloads by itself.
 */
export function claimAutoReload(store: Pick<Storage, "getItem" | "setItem"> | null, now = Date.now()) {
  if (!store) return false;
  try {
    const last = Number(store.getItem(RELOADED_KEY));
    if (last && now - last < RELOAD_GAP_MS) return false;
    store.setItem(RELOADED_KEY, String(now));
    return true;
  } catch {
    return false;
  }
}
