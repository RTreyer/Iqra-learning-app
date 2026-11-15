/** A button that must be held down for a while: a young child does not press it by chance. */

import React, { useState } from "react";
import { Animated, Easing, Pressable, StyleSheet, View } from "react-native";

import { UiText } from "@/components/UiText";
import { Icon } from "@/components/world/Icon";
import { useLanguage } from "@/context/LanguageContext";
import { yemen } from "@/theme/tokens";

type Props = {
  text: string;
  holdMs: number;
  onOpen: () => void;
  testID: string;
};

export function HoldGate({ text, holdMs, onOpen, testID }: Props) {
  const { t } = useLanguage();
  const [fill] = useState(() => new Animated.Value(0));
  const start = () =>
    Animated.timing(fill, {
      toValue: 1,
      duration: holdMs,
      easing: Easing.linear,
      useNativeDriver: false,
    }).start();
  const cancel = () => {
    fill.stopAnimation();
    fill.setValue(0);
  };
  return (
    <View style={styles.gate}>
      <Icon name="lock" size={56} color={yemen.lockedInk} strokeWidth={1.8} />
      <UiText style={styles.gateText}>{text}</UiText>
      <Pressable
        testID={testID}
        accessibilityRole="button"
        accessibilityLabel={t("اضغط مطوّلاً")}
        delayLongPress={holdMs}
        onPressIn={start}
        onPressOut={cancel}
        onLongPress={onOpen}
        style={styles.gateButton}
      >
        <Animated.View
          style={[
            styles.gateFill,
            { width: fill.interpolate({ inputRange: [0, 1], outputRange: ["0%", "100%"] }) },
          ]}
        />
        <UiText style={styles.gateLabel}>اضغط مطوّلاً</UiText>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  gate: { alignItems: "center", justifyContent: "center", gap: 20, padding: 32 },
  gateText: { fontSize: 17, color: yemen.inkSoft, textAlign: "center", lineHeight: 26 },
  gateButton: {
    width: 240,
    height: 64,
    borderRadius: 32,
    backgroundColor: yemen.inkSoft,
    overflow: "hidden",
    alignItems: "center",
    justifyContent: "center",
  },
  gateFill: { position: "absolute", top: 0, bottom: 0, right: 0, backgroundColor: yemen.clay },
  gateLabel: { color: "#FFFFFF", fontSize: 19, fontWeight: "800" },
});
