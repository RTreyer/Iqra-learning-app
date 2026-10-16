import { Platform } from "react-native";
import { SUBJECT_COLORS, type Subject } from "@/content/types";

export type { Subject };

export const colors = {
  text: "#1E293B",
  muted: "#64748B",
  border: "#E2E8F0",
  surface: "#F8FAFC",
  success: "#059669",
  successSoft: "#D1FAE5",
  danger: "#EF4444",
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
