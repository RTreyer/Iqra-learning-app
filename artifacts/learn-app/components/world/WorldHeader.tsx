/**
 * The header of the paths and lessons, as in the design: a round picture button that goes one
 * step up (a house to home, a map to the path), the picture of where the child is (tap it to
 * hear its name), and the stars. No text to read; names are spoken and announced.
 */

import { type Href } from "expo-router";
import React from "react";
import { Pressable, StyleSheet, View } from "react-native";

import { goBackOr } from "@/components/BackButton";
import { StarBadge } from "@/components/StarBadge";
import { useLanguage } from "@/context/LanguageContext";
import * as haptics from "@/lib/haptics";
import { speak } from "@/lib/speech";
import { readableFill, touchTarget, yemen } from "@/theme/tokens";
import { Icon, type IconName } from "./Icon";

type Props = {
  /** Where "up" leads, and the picture on the button. */
  up: { fallback: Href; icon: Extract<IconName, "home" | "map"> };
  /** The picture in the middle and the name it says (and announces). */
  picture: React.ReactNode;
  name: string;
  /** Extra words for screen readers, e.g. the progress. */
  detail?: string;
  color: string;
  /** Stars on the left; leave out where a help button stands instead. */
  stars?: number;
  end?: React.ReactNode;
};

export function WorldHeader({ up, picture, name, detail, color, stars, end }: Props) {
  const { t, language } = useLanguage();
  return (
    <View style={[styles.row, { flexDirection: language === "en" ? "row" : "row-reverse" }]}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={t("رجوع")}
        hitSlop={6}
        onPress={() => {
          haptics.tap();
          goBackOr(up.fallback);
        }}
        style={({ pressed }) => [styles.round, pressed && styles.pressed]}
      >
        <Icon name={up.icon} size={26} color={yemen.clay} />
      </Pressable>
      <Pressable
        testID="header-picture"
        accessibilityRole="button"
        accessibilityLabel={detail ? `${name}، ${detail}` : name}
        onPress={() => {
          haptics.tap();
          speak(name);
        }}
        style={({ pressed }) => [
          styles.picture,
          { backgroundColor: readableFill(color), boxShadow: `0 4px 0 ${readableFill(color, 9)}` },
          pressed && styles.pressed,
        ]}
      >
        {picture}
      </Pressable>
      {end ?? (stars !== undefined ? <StarBadge stars={stars} /> : <View style={styles.spacer} />)}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  round: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    boxShadow: `0 4px 0 ${yemen.sandShadow}`,
  },
  picture: {
    width: 60,
    height: 60,
    minHeight: touchTarget,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  pressed: { opacity: 0.85, transform: [{ scale: 0.95 }] },
  spacer: { width: touchTarget },
});
