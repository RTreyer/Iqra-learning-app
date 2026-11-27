import { claimAutoReload, isLoadError, serverReachable } from "@/lib/serviceWorker";

function memoryStore() {
  const data = new Map<string, string>();
  return {
    getItem: (key: string) => data.get(key) ?? null,
    setItem: (key: string, value: string) => void data.set(key, value),
  };
}

test("a screen that did not download is a load error; other errors are not", () => {
  const asyncRequire = Object.assign(new Error("Loading module /_expo/[bookId]-1.js failed."), {
    name: "AsyncRequireError",
  });
  expect(isLoadError(asyncRequire)).toBe(true);
  expect(isLoadError(new Error("Loading module /x.js failed."))).toBe(true);
  expect(isLoadError(new TypeError("Failed to fetch dynamically imported module: /a.js"))).toBe(true);
  expect(isLoadError(new TypeError("undefined is not a function"))).toBe(false);
});

test("the app reloads by itself at most once a minute, and never without storage", () => {
  const store = memoryStore();
  expect(claimAutoReload(store, 1_000_000)).toBe(true);
  expect(claimAutoReload(store, 1_030_000)).toBe(false);
  expect(claimAutoReload(store, 1_061_000)).toBe(true);
  expect(claimAutoReload(null)).toBe(false);
  const broken = {
    getItem: () => {
      throw new Error("SecurityError");
    },
    setItem: () => {},
  };
  expect(claimAutoReload(broken)).toBe(false);
});

describe("serverReachable", () => {
  const realFetch = global.fetch;
  afterEach(() => {
    global.fetch = realFetch;
  });

  test("true when the server answers, false when it fails or errors (one bar, no data)", async () => {
    global.fetch = jest.fn(async () => ({ ok: true })) as unknown as typeof fetch;
    expect(await serverReachable()).toBe(true);
    global.fetch = jest.fn(async () => ({ ok: false })) as unknown as typeof fetch;
    expect(await serverReachable()).toBe(false);
    global.fetch = jest.fn(async () => {
      throw new TypeError("Failed to fetch");
    }) as unknown as typeof fetch;
    expect(await serverReachable()).toBe(false);
  });
});
