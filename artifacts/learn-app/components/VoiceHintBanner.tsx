import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { colors, radius, subjects } from "@/theme/tokens";

const AR_TEXT =
  "لَا يُوجَدُ صَوْتٌ عَرَبِيٌّ عَلَى هٰذَا الْجِهَاز. اطلُب مِن شَخْصٍ بَالِغٍ تَثْبِيت صَوْت عَرَبِيّ مِن إِعْدَادَات تَحْوِيل النَّصّ إِلَى كَلَام.";
const EN_TEXT =
  "No Arabic voice is installed. Ask an adult to install an Arabic voice in the device's text to speech settings.";

export function VoiceHintBanner({ onDismiss }: { onDismiss: () => void }) {
  const { top } = useSafeAreaInsets();
  return (
    <View style={[styles.card, { marginTop: top + 12 }]} accessibilityRole="alert">
      <View style={styles.texts}>
        <Text style={styles.ar}>{AR_TEXT}</Text>
        <Text style={styles.en}>{EN_TEXT}</Text>
      </View>
      <Pressable
        onPress={onDismiss}
        accessibilityRole="button"
        accessibilityLabel="Dismiss"
        hitSlop={8}
        style={({ pressed }) => [styles.button, pressed && styles.pressed]}
      >
        <Text style={styles.buttonText}>✕</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    margin: 12,
    padding: 14,
    borderRadius: radius.md,
    backgroundColor: colors.cream,
    borderWidth: 1,
    borderColor: subjects.arabic,
  },
  texts: { flex: 1, gap: 6 },
  ar: {
    fontSize: 17,
    lineHeight: 28,
    color: colors.text,
    textAlign: "right",
    writingDirection: "rtl",
  },
  en: { fontSize: 13, lineHeight: 18, color: colors.muted },
  button: {
    minWidth: 48,
    minHeight: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.star,
  },
  pressed: { opacity: 0.8 },
  buttonText: { fontSize: 18, fontWeight: "700", color: colors.white },
});
