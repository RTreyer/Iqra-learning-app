/**
 * BackButton — prominent back button using an inline SVG arrow.
 * Avoids @expo/vector-icons font-loading issues on web.
 */

import * as Haptics from "expo-haptics";
import { router, type Href } from "expo-router";
import React from "react";
import { Pressable, StyleSheet } from "react-native";
import Svg, { Path } from "react-native-svg";
import { useLanguage } from "@/context/LanguageContext";

/** Goes back when there is history; otherwise (web deep link or refresh) replaces with the fallback. */
export function goBackOr(fallback: Href) {
  if (router.canGoBack()) router.back();
  else router.replace(fallback);
}

type Props = {
  /** Where to go when there is no history to go back to. */
  fallback: Href;
  onPress?: () => void;
};

export function BackButton({ fallback, onPress }: Props) {
  const { t, language } = useLanguage();
  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (onPress) {
      onPress();
    } else {
      goBackOr(fallback);
    }
  };

  return (
    <Pressable
      style={({ pressed }) => [styles.btn, pressed && styles.pressed]}
      onPress={handlePress}
      hitSlop={8}
      accessibilityLabel={t("رجوع")}
      accessibilityRole="button"
    >
      {/* Chevron-left drawn inline — no icon font required */}
      <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
        <Path
          d={language === "ar" ? "M9 18l6-6-6-6" : "M15 18l-6-6 6-6"}
          stroke="#1E293B"
          strokeWidth={2.5}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </Svg>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  btn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(255,255,255,0.92)",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.18,
    shadowRadius: 6,
    elevation: 5,
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.06)",
  },
  pressed: {
    opacity: 0.75,
    transform: [{ scale: 0.93 }],
  },
});
