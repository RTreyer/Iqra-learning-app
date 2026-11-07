import { createContext, useContext, useEffect } from "react";

import type { DemoTarget } from "@/content/demos";

export type Point = { x: number; y: number };
export type Box = { x: number; y: number; width: number; height: number };

/** Something on screen the demo hand can find, point at and use. */
export type DemoEntry = {
  testID?: string;
  label?: string;
  /** Position in the window, or null when it cannot be measured. */
  measure: () => Promise<Box | null>;
  press?: () => void;
  /** Tracing pad only: a path over the guide in pad coordinates, and a way to draw it. */
  tracePath?: () => Point[] | null;
  draw?: (points: Point[], final: boolean) => void;
};

export type DemoRegistry = {
  register: (entry: DemoEntry) => () => void;
  find: (target: DemoTarget) => DemoEntry | undefined;
};

/** Set only around an activity that plays a demo; elsewhere nothing registers. */
export const DemoContext = createContext<DemoRegistry | null>(null);

export function createRegistry(): DemoRegistry {
  const entries = new Set<DemoEntry>();
  return {
    register: (entry) => {
      entries.add(entry);
      return () => {
        entries.delete(entry);
      };
    },
    find: (target) => {
      let found: DemoEntry | undefined;
      for (const entry of entries) {
        const hit =
          "testID" in target ? entry.testID === target.testID : entry.label === target.label;
        if (hit) found = entry;
      }
      return found;
    },
  };
}

/** Registers `entry` while inside a demo; `entry` should be memoised on what it reads. */
export function useDemoEntry(entry: DemoEntry | null): void {
  const registry = useContext(DemoContext);
  useEffect(() => {
    if (!registry || !entry) return;
    return registry.register(entry);
  }, [registry, entry]);
}

type Measurable = {
  measureInWindow?: (cb: (x: number, y: number, width: number, height: number) => void) => void;
};

const MEASURE_TIMEOUT_MS = 300;

/** measureInWindow as a promise that always settles (test renderers never call back). */
export function measureNode(node: Measurable | null): Promise<Box | null> {
  return new Promise((resolve) => {
    if (!node?.measureInWindow) return resolve(null);
    const timer = setTimeout(() => resolve(null), MEASURE_TIMEOUT_MS);
    try {
      node.measureInWindow((x, y, width, height) => {
        clearTimeout(timer);
        resolve(Number.isFinite(x) && Number.isFinite(y) ? { x, y, width, height } : null);
      });
    } catch {
      clearTimeout(timer);
      resolve(null);
    }
  });
}
