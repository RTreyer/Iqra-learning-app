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
} as const;

export const subjects = SUBJECT_COLORS;

type Gradient = readonly [string, string, ...string[]];

/** Subject gradients: subject color at about 12 percent over white, fading to cream. */
export const gradients: Record<Subject | "home", Gradient> = {
  home: ["#FFFDE7", "#FFF0A0", "#FFDC70"],
  arabic: ["#E5ECFD", "#FFFBF0"],
  math: ["#EFE7FD", "#FFFBF0"],
  science: ["#E1F2ED", "#FFFBF0"],
};

/** Existing per screen gradients, kept until screens migrate (Task 4.4). */
export const legacyGradients = {
  reading: ["#E3F4FF", "#B8DFFF", "#8EC9FF"],
  math: ["#E3FFF2", "#B0F5D8", "#7FECC0"],
  writing: ["#EEE9FF", "#D8CFFF", "#C0B0FF"],
} as const;

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
