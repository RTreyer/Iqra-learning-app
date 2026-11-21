import React from "react";
import { Text, View } from "react-native";

import type { LessonType } from "@/content/types";
import { Icon, type IconName } from "./Icon";

/** One fixed picture per kind of activity, so the child learns what a stop means. */
type Picture = { icon: IconName } | { glyph: string } | { gap: [string, string] };

const PICTURE: Record<LessonType, Picture> = {
  story: { icon: "book" },
  naming: { icon: "speaker" },
  letter_pick: { glyph: "أ" },
  word_read: { icon: "eye" },
  listen_pick: { icon: "ear" },
  behavior: { icon: "heart" },
  matching: { icon: "link" },
  trace: { icon: "pencil" },
  build_word: { glyph: "بَا" },
  counting: { icon: "beads" },
  arithmetic: { icon: "ops" },
  picture_choice: { icon: "picture" },
  compare: { icon: "scale" },
  // Two numbers and the dashed box between them, as in the exercise itself (٢ ☐ ٤): abstract
  // cards with a question mark were not understood in the user test.
  number_fill: { gap: ["٢", "٤"] },
  sort: { icon: "baskets" },
};

export function lessonPicture(type: LessonType, color: string, size: number): React.ReactNode {
  const picture = PICTURE[type];
  if ("icon" in picture) return <Icon name={picture.icon} size={size} color={color} />;
  if ("gap" in picture) {
    const digit = {
      fontSize: size * 0.62,
      fontWeight: "900",
      color,
      lineHeight: size * 0.9,
    } as const;
    return (
      <View
        testID="picture-gap"
        style={{ flexDirection: "row-reverse", alignItems: "center", gap: size * 0.1 }}
      >
        <Text style={digit}>{picture.gap[0]}</Text>
        <View
          style={{
            width: size * 0.42,
            height: size * 0.56,
            borderWidth: Math.max(1.5, size * 0.07),
            borderStyle: "dashed",
            borderColor: color,
            borderRadius: size * 0.1,
          }}
        />
        <Text style={digit}>{picture.gap[1]}</Text>
      </View>
    );
  }
  return (
    <Text style={{ fontSize: size * 0.8, fontWeight: "900", color, lineHeight: size * 1.1 }}>
      {picture.glyph}
    </Text>
  );
}
