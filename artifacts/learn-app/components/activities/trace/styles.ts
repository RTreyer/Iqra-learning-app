import { StyleSheet, type ViewStyle } from "react-native";
import { colors, touchTarget } from "@/theme/tokens";

export const PAD_MAX = 340;
export const PAD_FALLBACK = 300;

/** Web only: stop the browser from scrolling or selecting text while drawing. */
export const webPad = { touchAction: "none", userSelect: "none" } as unknown as ViewStyle;

/** Tracing styles ported from the legacy writing screen. */
export const trace = StyleSheet.create({
  container: { flex: 1, alignItems: "center", paddingHorizontal: 20, paddingTop: 8, gap: 12 },
  measure: { width: "100%", alignItems: "center", gap: 12 },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 12 },
  label: { fontSize: 30, fontWeight: "800", textAlign: "center", color: colors.text },
  emoji: { fontSize: 36 },
  errorBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: colors.dangerText,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    justifyContent: "center",
  },
  errorText: { fontSize: 15, fontWeight: "700", color: colors.white, textAlign: "center" },
  pad: {
    backgroundColor: "rgba(255,255,255,0.88)",
    borderRadius: 20,
    borderWidth: 2,
    borderColor: "#C4B5FD",
    overflow: "hidden",
    alignItems: "center",
    justifyContent: "center",
  },
  padError: {
    borderColor: colors.danger,
    borderWidth: 3,
    backgroundColor: "rgba(254,242,242,0.90)",
  },
  padPassed: { borderColor: colors.success, borderWidth: 3 },
  guide: { fontWeight: "800", opacity: 0.15, textAlign: "center" },
  controls: { flexDirection: "row", gap: 12, width: "100%", maxWidth: PAD_MAX },
  button: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 16,
    paddingVertical: 14,
    gap: 8,
    minHeight: touchTarget,
  },
  clear: { backgroundColor: "rgba(237,233,254,0.9)", borderWidth: 2, borderColor: "#C4B5FD" },
  clearText: { fontSize: 17, fontWeight: "700", color: "#7C3AED" },
  doneText: { fontSize: 17, fontWeight: "700", color: colors.white },
});
