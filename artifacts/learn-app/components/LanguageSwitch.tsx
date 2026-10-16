import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useLanguage } from "@/context/LanguageContext";
import { colors, readableFill, touchTarget } from "@/theme/tokens";

export function LanguageSwitch() {
  const { language, setLanguage, storageError } = useLanguage();
  return (
    <View style={styles.wrapper}>
      <View style={styles.switch}>
        {(["ar", "en"] as const).map((option) => (
          <Pressable
            key={option}
            testID={`language-${option}`}
            accessibilityRole="button"
            accessibilityLabel={option === "ar" ? "العربية" : "English"}
            accessibilityState={{ selected: language === option }}
            onPress={() => setLanguage(option)}
            style={({ pressed }) => [
              styles.button,
              language === option && styles.active,
              pressed && { opacity: 0.75 },
            ]}
          >
            <Text style={[styles.label, language === option && styles.activeLabel]}>
              {option === "ar" ? "العربية" : "English"}
            </Text>
          </Pressable>
        ))}
      </View>
      {storageError ? (
        <Text role="alert" style={styles.error}>
          {language === "en"
            ? "Language changed, but couldn't be saved."
            : "تعذّر حفظ اللغة المختارة."}
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { alignItems: "center", marginBottom: 12, marginTop: 4 },
  switch: {
    flexDirection: "row",
    backgroundColor: "rgba(255,255,255,0.8)",
    borderRadius: 24,
    padding: 4,
  },
  button: {
    minHeight: touchTarget,
    minWidth: 90,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  active: { backgroundColor: readableFill(colors.star) },
  label: { color: "#78350F", fontSize: 15, fontWeight: "700" },
  activeLabel: { color: "#FFFFFF" },
  error: { color: "#9F1239", fontSize: 13, textAlign: "center", marginTop: 6 },
});
