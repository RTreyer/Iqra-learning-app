import { StyleSheet, type ViewStyle } from "react-native";
import { colors, touchTarget } from "@/theme/tokens";

export const PAD_MAX = 340;
export const PAD_FALLBACK = 300;
/** Space between the pad and the Clear and Done buttons. */
export const PAD_GAP = 12;
/** Height of the Clear and Done buttons until they have measured themselves. */
export const CONTROLS_FALLBACK = 62;

/** Web only: stop the browser from scrolling or selecting text while drawing. */
export const webPad = { touchAction: "none", userSelect: "none" } as unknown as ViewStyle;

/** Tracing styles ported from the legacy writing screen. */
export const trace = StyleSheet.create({
  container: { flex: 1, alignItems: "center", paddingHorizontal: 20, paddingTop: 8, gap: 12 },
  // Takes the room left on the screen; the pad fits itself and the buttons into it.
  measure: { width: "100%", flex: 1, alignItems: "center", gap: PAD_GAP },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 12 },
  label: { fontSize: 30, fontWeight: "800", textAlign: "center", color: colors.text },
  sentence: {
    fontSize: 24,
    fontWeight: "800",
    textAlign: "center",
    writingDirection: "rtl",
    color: colors.text,
    lineHeight: 40,
  },
  sentenceCurrent: { textDecorationLine: "underline", color: colors.text },
  sentenceLater: { color: colors.muted },
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
  errorOverlay: {
    position: "absolute",
    top: 8,
    left: 0,
    right: 0,
    alignItems: "center",
    zIndex: 1,
  },
  errorText: { fontSize: 15, fontWeight: "700", color: colors.white, textAlign: "center" },
  // No border on the pad itself: touches and drawings then share one box, so ink lies under
  // the finger. The border is drawn on top (padBorder).
  pad: {
    backgroundColor: "rgba(255,255,255,0.88)",
    borderRadius: 20,
    overflow: "hidden",
    alignItems: "center",
    justifyContent: "center",
  },
  padBorder: {
    position: "absolute",
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: "#C4B5FD",
  },
  padError: { backgroundColor: "rgba(254,242,242,0.90)" },
  padBorderError: { borderColor: colors.danger, borderWidth: 3 },
  padBorderPassed: { borderColor: colors.success, borderWidth: 3 },
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
});
