import { StyleSheet } from "react-native";
import { colors, touchTarget } from "@/theme/tokens";

/** Activity styles ported from the legacy unit lesson screens. */
export const act = StyleSheet.create({
  container: { flex: 1, alignItems: "center", paddingHorizontal: 20, paddingTop: 8, gap: 16 },
  instruction: { fontSize: 14, color: colors.mutedStrong, fontWeight: "600", textAlign: "center" },
  hint: { fontSize: 15, color: colors.mutedStrong, textAlign: "center", fontWeight: "500" },
  fullWidth: { width: "100%", gap: 10 },

  listenBtn: { borderRadius: 20, padding: 20, alignItems: "center", gap: 6, minWidth: 200, minHeight: touchTarget },
  listenEmoji: { fontSize: 36 },
  listenBtnText: { fontSize: 24, fontWeight: "900", color: colors.white, textAlign: "center" },
  listenHint: { fontSize: 13, color: colors.white, fontWeight: "600" },

  choicesRow: { flexDirection: "row", justifyContent: "center", gap: 10, flexWrap: "wrap", width: "100%" },
  wordChoicesCol: { width: "100%", gap: 12 },
  letterChoicesRow: { flexDirection: "row", justifyContent: "center", gap: 16, marginTop: 8 },
});
