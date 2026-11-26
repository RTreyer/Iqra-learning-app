/**
 * The header of the paths and lessons, as in the design: a round picture button that goes one
 * step up (a house to home, a map to the path), the picture of where the child is (tap it to
 * hear its name), and the stars. No text to read for the child; names are spoken and announced.
 * Under it, for the parents, the subject by name (SubjectLabel).
 */

import { type Href } from "expo-router";
import { useLine } from "@/components/Gloss";
import React from "react";
import { Pressable, StyleSheet, View } from "react-native";

import { goBackOr } from "@/components/BackButton";
import { StarBadge } from "@/components/StarBadge";
import type { Book } from "@/content";
import { useLanguage } from "@/context/LanguageContext";
import { useCompact } from "@/hooks/useCompact";
import * as haptics from "@/lib/haptics";
import { speak } from "@/lib/speech";
import { readableFill, touchTarget, yemen } from "@/theme/tokens";
import { Icon, type IconName } from "./Icon";
import { SubjectLabel } from "./SubjectLabel";

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
  /** The subject the screen belongs to, named under the header for the parents. */
  subject?: Book;
};

export function WorldHeader({ up, picture, name, detail, color, stars, end, subject }: Props) {
  const { t, language } = useLanguage();
  const line = useLine();
  // On a short screen the subject sits beside the picture instead of under it.
  const compact = useCompact();
  const direction = language === "en" ? "row" : "row-reverse";
  const subjectLabel = subject ? <SubjectLabel book={subject} testID="header-subject" /> : null;
  return (
    <View>
      <View style={[styles.row, compact && styles.rowCompact, { flexDirection: direction }]}>
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
        <View style={[styles.middle, { flexDirection: direction }]}>
          <Pressable
            testID="header-picture"
            accessibilityRole="button"
            accessibilityLabel={
              detail ? `${line(name)}${language === "en" ? ", " : "، "}${line(detail)}` : line(name)
            }
            onPress={() => {
              haptics.tap();
              speak(name);
            }}
            style={({ pressed }) => [
              styles.picture,
              compact && styles.pictureCompact,
              {
                backgroundColor: readableFill(color),
                boxShadow: `0 4px 0 ${readableFill(color, 9)}`,
              },
              pressed && styles.pressed,
            ]}
          >
            {picture}
          </Pressable>
          {compact ? subjectLabel : null}
        </View>
        {end ?? (stars !== undefined ? <StarBadge stars={stars} /> : <View style={styles.spacer} />)}
      </View>
      {subjectLabel && !compact ? <View style={styles.subject}>{subjectLabel}</View> : null}
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
  rowCompact: { paddingVertical: 4 },
  middle: { alignItems: "center", gap: 8, flexShrink: 1 },
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
  pictureCompact: { width: 52, height: 52, borderRadius: 16 },
  pressed: { opacity: 0.85, transform: [{ scale: 0.95 }] },
  spacer: { width: touchTarget },
  subject: { marginTop: 2, marginBottom: 8 },
});
