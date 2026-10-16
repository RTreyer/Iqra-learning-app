import { Platform } from "react-native";
import { SUBJECT_COLORS, type Subject } from "@/content/types";

export type { Subject };

export const colors = {
  text: "#1E293B",
  muted: "#64748B",
  /** Muted text that must stay readable (4.5:1) on the subject and home gradients. */
  mutedStrong: "#475569",
  border: "#E2E8F0",
  surface: "#F8FAFC",
  success: "#059669",
  /** Success as text or as a fill under white text (5.5:1 on white). */
  successText: "#047857",
  successSoft: "#D1FAE5",
  danger: "#EF4444",
  /** Danger as text on dangerSoft or as a fill under white text. */
  dangerText: "#B91C1C",
  dangerSoft: "#FEE2E2",
  star: "#F59E0B",
  starSoft: "#FEF3C7",
  cream: "#FFFBF0",
  white: "#FFFFFF",
  /** Translucent white behind small badges such as ProgressPill. */
  pill: "rgba(255,255,255,0.88)",
  shadow: "#000000",
  /** Light card outline and dimmed chevrons. */
  subtle: "#CBD5E1",
  /** Warm browns used on the yellow home gradient. */
  warmText: "#5C4A00",
  warmDeep: "#78350F",
  starText: "#92400E",
} as const;

/** "#RRGGBB" plus an alpha between 0 and 1 as an rgba() string. */
export function withAlpha(hex: string, alpha: number): string {
  if (__DEV__ && !/^#[0-9A-Fa-f]{6}$/.test(hex))
    throw new Error(`withAlpha expects #RRGGBB, got "${hex}"`);
  const value = hex.replace("#", "");
  const r = parseInt(value.slice(0, 2), 16);
  const g = parseInt(value.slice(2, 4), 16);
  const b = parseInt(value.slice(4, 6), 16);
  return `rgba(${r},${g},${b},${alpha})`;
}

export const subjects = SUBJECT_COLORS;

type Gradient = readonly [string, string, ...string[]];

/** Subject gradients: subject color at about 12 percent over white, fading to cream. */
export const gradients: Record<Subject | "home", Gradient> = {
  home: ["#FFFDE7", "#FFF0A0", "#FFDC70"],
  arabic: ["#E5ECFD", "#FFFBF0"],
  math: ["#EFE7FD", "#FFFBF0"],
  science: ["#E1F2ED", "#FFFBF0"],
};

export const radius = { sm: 12, md: 20, lg: 28 } as const;

export const spacing = { xs: 4, sm: 8, md: 16, lg: 24, xl: 32 } as const;

export const shadow = {
  card: Platform.select({
    android: { elevation: 3 },
    web: { boxShadow: "0 4px 12px rgba(0,0,0,0.12)" },
    default: {},
  }),
};

export const touchTarget = 48;

function channelLuminance(value: number): number {
  const v = value / 255;
  return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4;
}

/** WCAG contrast ratio of white text on a "#RRGGBB" fill. */
export function whiteContrast(hex: string): number {
  const [r, g, b] = [1, 3, 5].map((i) => channelLuminance(parseInt(hex.slice(i, i + 2), 16)));
  return 1.05 / (0.2126 * r + 0.7152 * g + 0.0722 * b + 0.05);
}

const readableCache = new Map<string, string>();

/**
 * Display helper: the fill itself when white text on it reaches `min`, otherwise the colour darkened in
 * small steps (RGB multiply keeps the hue) until it does. Memoised per input.
 */
export function readableFill(hex: string, min = 4.5): string {
  const key = `${hex}|${min}`;
  const cached = readableCache.get(key);
  if (cached) return cached;
  let channels = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16));
  let out = hex;
  for (let step = 0; whiteContrast(out) < min && step < 100; step++) {
    channels = channels.map((c) => Math.floor(c * 0.97));
    out = `#${channels
      .map((c) => c.toString(16).padStart(2, "0"))
      .join("")
      .toUpperCase()}`;
  }
  readableCache.set(key, out);
  return out;
}
